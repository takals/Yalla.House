import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { inngest } from '@/lib/inngest/client'

/**
 * POST /api/assignments
 * Owner invites an agent to a listing.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const { listingId, agentId, tier, notes } = body

  if (!listingId || !agentId || !tier) {
    return NextResponse.json(
      { error: 'listingId, agentId, and tier are required' },
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

  // Verify agent exists
  const { data: agent } = await (supabase as any)
    .from('users')
    .select('id, full_name, email')
    .eq('id', agentId)
    .single()

  if (!agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
  }

  // Insert assignment with status='invited'
  const { data: assignment, error } = await (supabase as any)
    .from('listing_agent_assignments')
    .insert({
      listing_id: listingId,
      owner_id: user.id,
      agent_id: agentId,
      tier,
      notes: notes ?? null,
      status: 'invited',
    })
    .select(
      'id, listing_id, owner_id, agent_id, tier, notes, status, created_at'
    )
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Emit Inngest event
  await inngest.send({
    name: 'assignment/agent.invited',
    data: {
      assignmentId: assignment.id,
      listingId: assignment.listing_id,
      ownerId: assignment.owner_id,
      agentId: assignment.agent_id,
      tier: assignment.tier,
    },
  })

  return NextResponse.json(assignment, { status: 201 })
}

/**
 * GET /api/assignments
 * List assignments for the current user (as owner or agent).
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Query assignments where user is owner or agent
  const { data, error } = await (supabase as any)
    .from('listing_agent_assignments')
    .select(`
      id,
      listing_id,
      owner_id,
      agent_id,
      tier,
      notes,
      status,
      created_at,
      updated_at,
      listings(id, address_line1, city, postcode, status),
      owner:users!owner_id(id, full_name, email),
      agent:users!agent_id(id, full_name, email)
    `)
    .or(`owner_id.eq.${user.id},agent_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
