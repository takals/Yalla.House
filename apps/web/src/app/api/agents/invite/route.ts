import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/agents/invite
 * Owner creates invite records for agents found via search (agent_profiles).
 * These agents may not have Yalla accounts yet.
 *
 * Body: { listingId?, agentProfileIds, tier, notes? }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ authRequired: true }, { status: 401 })
  }

  const body = await request.json()
  const { listingId, agentProfileIds, tier, notes } = body

  if (!Array.isArray(agentProfileIds) || agentProfileIds.length === 0) {
    return NextResponse.json(
      { error: 'agentProfileIds (non-empty array) is required' },
      { status: 400 }
    )
  }

  const validTiers = ['advisory', 'assisted', 'managed']
  const selectedTier = validTiers.includes(tier) ? tier : 'advisory'

  // If listingId provided, verify caller owns it
  if (listingId) {
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
  }

  // Verify all agent profiles exist
  const { data: profiles } = await (supabase as any)
    .from('agent_profiles')
    .select('user_id, agency_name, email')
    .in('user_id', agentProfileIds)

  if (!profiles || profiles.length === 0) {
    return NextResponse.json(
      { error: 'No valid agent profiles found' },
      { status: 404 }
    )
  }

  const validIds = new Set((profiles as Array<{ user_id: string }>).map(p => p.user_id))

  // Build invite records (skip duplicates via ON CONFLICT)
  const inviteRows = agentProfileIds
    .filter((id: string) => validIds.has(id))
    .map((agentProfileId: string) => ({
      listing_id: listingId ?? null,
      owner_id: user.id,
      agent_profile_id: agentProfileId,
      tier: selectedTier,
      notes: notes ?? null,
      status: 'draft',
    }))

  const { data: invites, error: insertError } = await (supabase as any)
    .from('agent_invites')
    .upsert(inviteRows, { onConflict: 'listing_id,agent_profile_id', ignoreDuplicates: true })
    .select('id, listing_id, owner_id, agent_profile_id, tier, status, created_at, invite_token')

  if (insertError) {
    console.error('Failed to create agent invites:', insertError)
    return NextResponse.json(
      { error: insertError.message },
      { status: 500 }
    )
  }

  return NextResponse.json(
    {
      invites: invites ?? [],
      created: (invites ?? []).length,
      skippedDuplicates: inviteRows.length - (invites ?? []).length,
    },
    { status: 201 }
  )
}

/**
 * GET /api/agents/invite?listing_id=xxx
 * Fetch owner's invites for a listing (or all if no listing_id).
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ authRequired: true }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const listingId = searchParams.get('listing_id')

  let query = (supabase as any)
    .from('agent_invites')
    .select(`
      id, listing_id, agent_profile_id, tier, notes, status,
      created_at, sent_at, responded_at, invite_token,
      agent_profiles!inner(agency_name, email, phone, postcode)
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (listingId) {
    query = query.eq('listing_id', listingId)
  }

  const { data: invites, error } = await query.limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ invites: invites ?? [] })
}
