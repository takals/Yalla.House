import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/hunter/inbox
 * Aggregated inbox across all active searches for the authenticated hunter.
 * Returns agent replies grouped by priority tier.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // 1. Get all active search request IDs for this hunter
  const { data: searches } = await (supabase as any)
    .from('search_requests')
    .select('id, intent, areas, status')
    .eq('hunter_id', user.id)
    .in('status', ['active', 'paused'])

  if (!searches || searches.length === 0) {
    return NextResponse.json({
      searches: [],
      topMatches: [],
      otherReplies: [],
      lowRelevance: [],
      stats: { totalSearches: 0, agentsContacted: 0, repliesReceived: 0, topMatchCount: 0 },
    })
  }

  const searchIds = searches.map((s: { id: string }) => s.id)

  // 2. Get all matches for these searches
  const { data: matches } = await (supabase as any)
    .from('agent_matches')
    .select('id, search_request_id, agent_id, match_score, status')
    .in('search_request_id', searchIds)

  const matchIds = (matches ?? []).map((m: { id: string }) => m.id)

  // 3. Get all responses
  const { data: responses } = await (supabase as any)
    .from('agent_responses')
    .select(`
      id, message, properties, relevance_score, priority_tier, hunter_action, created_at,
      agent_match:agent_matches!agent_responses_agent_match_id_fkey(
        id, agent_id, match_score, search_request_id,
        agent:users!agent_matches_agent_id_fkey(full_name, avatar_url),
        agent_profile:agent_profiles!agent_matches_agent_id_fkey(agency_name)
      )
    `)
    .in('agent_match_id', matchIds)
    .is('hunter_action', null) // exclude dismissed/blocked
    .order('relevance_score', { ascending: false, nullsFirst: false })

  const allResponses = responses ?? []

  const topMatches = allResponses.filter(
    (r: { priority_tier: string }) => r.priority_tier === 'top_match'
  )
  const otherReplies = allResponses.filter(
    (r: { priority_tier: string }) => r.priority_tier === 'other'
  )
  const lowRelevance = allResponses.filter(
    (r: { priority_tier: string }) =>
      r.priority_tier === 'low_relevance' || r.priority_tier === 'spam'
  )

  // 4. Compute stats
  const agentsContacted = (matches ?? []).filter(
    (m: { status: string }) => m.status !== 'pending'
  ).length
  const repliesReceived = (matches ?? []).filter(
    (m: { status: string }) => m.status === 'responded'
  ).length

  return NextResponse.json({
    searches,
    topMatches,
    otherReplies,
    lowRelevance,
    stats: {
      totalSearches: searches.length,
      agentsContacted,
      repliesReceived,
      topMatchCount: topMatches.length,
    },
  })
}
