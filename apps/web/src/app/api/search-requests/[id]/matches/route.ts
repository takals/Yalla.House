import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/search-requests/:id/matches
 * List matched agents and their status for a search request.
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

  // Fetch matches with agent info
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('agent_matches')
    .select(`
      id, match_score, score_breakdown, status, sent_at, expires_at, created_at,
      agent:users!agent_matches_agent_id_fkey(full_name, avatar_url),
      agent_profile:agent_profiles!agent_matches_agent_id_fkey(agency_name, coverage_areas, languages)
    `)
    .eq('search_request_id', searchRequestId)
    .order('match_score', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
