import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { inngest } from '@/lib/inngest/client'

/**
 * POST /api/owner-briefs/send
 * Owner sends briefs to multiple agents.
 *
 * Body: { listingId, agentIds, tier, notes }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const { listingId, agentIds, tier, notes } = body

  if (!listingId || !Array.isArray(agentIds) || agentIds.length === 0 || !tier) {
    return NextResponse.json(
      { error: 'listingId, agentIds (non-empty array), and tier are required' },
      { status: 400 }
    )
  }

  // Verify caller owns the listing
  const { data: listing } = await (supabase as any)
    .from('listings')
    .select('id, owner_id')
    .eq('id', listingId)
    .single()

  if (!listing || listing.owner_id !== user.id) {
    return NextResponse.json(
      { error: 'You do not own this listing' },
      { status: 403 }
    )
  }

  // Verify all agents exist
  const { data: agents } = await (supabase as any)
    .from('users')
    .select('id')
    .in('id', agentIds)

  if (!agents || agents.length !== agentIds.length) {
    return NextResponse.json(
      { error: 'One or more agents do not exist' },
      { status: 404 }
    )
  }

  // Determine permissions based on tier
  const permissions: Record<string, Record<string, boolean>> = {
    advisory: {
      can_edit_listing: false,
      can_manage_viewings: false,
      can_negotiate: false,
      can_message_buyers: false,
    },
    assisted: {
      can_edit_listing: false,
      can_manage_viewings: true,
      can_negotiate: false,
      can_message_buyers: false,
    },
    managed: {
      can_edit_listing: true,
      can_manage_viewings: true,
      can_negotiate: true,
      can_message_buyers: true,
    },
  }

  const tierPermissions = permissions[tier as string] || permissions.advisory
  if (!tierPermissions) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
  }

  // Insert assignments and collect created records
  const createdAssignments = []

  try {
    const { data: assignments, error: insertError } = await (supabase as any)
      .from('listing_agent_assignments')
      .insert(
        agentIds.map(agentId => ({
          listing_id: listingId,
          owner_id: user.id,
          agent_id: agentId,
          tier,
          notes: notes ?? null,
          status: 'invited',
          can_edit_listing: tierPermissions.can_edit_listing,
          can_manage_viewings: tierPermissions.can_manage_viewings,
          can_negotiate: tierPermissions.can_negotiate,
          can_message_buyers: tierPermissions.can_message_buyers,
        }))
      )
      .select('id, listing_id, owner_id, agent_id, tier, notes, status, created_at')

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    if (assignments && Array.isArray(assignments)) {
      createdAssignments.push(...assignments)
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create assignments' },
      { status: 500 }
    )
  }

  // Update listing: set brief_sent_at and brief_agent_count
  try {
    await (supabase as any)
      .from('listings')
      .update({
        brief_sent_at: new Date().toISOString(),
        brief_agent_count: agentIds.length,
      })
      .eq('id', listingId)
  } catch (err) {
    // Log but don't fail the response
    console.error('Failed to update listing timestamps:', err)
  }

  // Emit Inngest events for each assignment
  const events = createdAssignments.map(assignment => ({
    name: 'assignment/agent.invited',
    data: {
      assignmentId: assignment.id,
      listingId: assignment.listing_id,
      ownerId: assignment.owner_id,
      agentId: assignment.agent_id,
      tier: assignment.tier,
    },
  }))

  // Check if enough agents were selected. If fewer than required, trigger auto-invite
  const minimumRequired = 5
  let autoInviteTriggered = false

  if (agentIds.length < minimumRequired) {
    try {
      // Fetch listing details for the invite event
      const { data: listingDetails } = await (supabase as any)
        .from('listings')
        .select('postcode, city, property_type, bedrooms, sale_price')
        .eq('id', listingId)
        .single()

      if (listingDetails?.postcode) {
        events.push({
          name: 'brief/agents.insufficient',
          data: {
            listingId,
            ownerId: user.id,
            postcode: listingDetails.postcode,
            city: listingDetails.city ?? '',
            registeredAgentCount: agentIds.length,
            minimumRequired,
          } as any,
        })
        autoInviteTriggered = true
      }
    } catch (err) {
      console.error('Failed to prepare auto-invite event:', err)
    }
  }

  try {
    await inngest.send(events)
  } catch (err) {
    console.error('Failed to emit Inngest events:', err)
  }

  return NextResponse.json(
    { assignments: createdAssignments, autoInviteTriggered },
    { status: 201 }
  )
}
