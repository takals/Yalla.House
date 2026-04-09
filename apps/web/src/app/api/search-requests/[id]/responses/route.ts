import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/search-requests/:id/responses
 * List agent responses for a search request, sorted by relevance_score DESC.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: searchRequestId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Verify ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: search } = await (supabase as any)
    .from('search_requests')
    .select('id, hunter_id')
    .eq('id', searchRequestId)
    .single()

  if (!search || search.hunter_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Fetch responses via agent_matches join
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('agent_responses')
    .select(`
      id, message, properties, relevance_score, priority_tier, hunter_action, created_at,
      agent_match:agent_matches!agent_responses_agent_match_id_fkey(
        id, agent_id, match_score,
        agent:users!agent_matches_agent_id_fkey(full_name, avatar_url),
        agent_profile:agent_profiles!agent_matches_agent_id_fkey(agency_name)
      )
    `)
    .in('agent_match_id', (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('agent_matches')
        .select('id')
        .eq('search_request_id', searchRequestId)
    ).data?.map((m: { id: string }) => m.id) ?? [])
    .order('relevance_score', { ascending: false, nullsFirst: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Group by priority tier
  const topMatches = (data ?? []).filter(
    (r: { priority_tier: string }) => r.priority_tier === 'top_match'
  )
  const otherReplies = (data ?? []).filter(
    (r: { priority_tier: string }) => r.priority_tier === 'other'
  )
  const lowRelevance = (data ?? []).filter(
    (r: { priority_tier: string }) => r.priority_tier === 'low_relevance' || r.priority_tier === 'spam'
  )

  return NextResponse.json({
    topMatches,
    otherReplies,
    lowRelevance,
    total: (data ?? []).length,
  })
}
