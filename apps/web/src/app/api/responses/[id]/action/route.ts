import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PATCH /api/responses/:id/action
 * Promote, dismiss, or block an agent response.
 * When blocking, also creates a blocked_agents record.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: responseId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const { action } = body

  if (!['promoted', 'dismissed', 'blocked'].includes(action)) {
    return NextResponse.json(
      { error: 'action must be promoted, dismissed, or blocked' },
      { status: 400 }
    )
  }

  // Fetch the response + verify ownership through the chain
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: response } = await (supabase as any)
    .from('agent_responses')
    .select(`
      id, agent_match_id,
      agent_match:agent_matches!agent_responses_agent_match_id_fkey(
        agent_id, search_request_id,
        search:search_requests!agent_matches_search_request_id_fkey(hunter_id)
      )
    `)
    .eq('id', responseId)
    .single()

  if (!response || response.agent_match?.search?.hunter_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Update the response action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('agent_responses')
    .update({ hunter_action: action })
    .eq('id', responseId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If blocking, add to blocked_agents
  if (action === 'blocked' && response.agent_match?.agent_id) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('blocked_agents').upsert(
      {
        hunter_id: user.id,
        agent_id: response.agent_match.agent_id,
        reason: body.reason ?? 'Blocked from inbox',
      },
      { onConflict: 'hunter_id,agent_id', ignoreDuplicates: true }
    )
  }

  return NextResponse.json({ id: responseId, hunter_action: action })
}
