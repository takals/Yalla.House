import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { inngest } from '@/lib/inngest/client'

/**
 * POST /api/agent/respond/:matchId
 * Agent submits a reply to a search brief. One reply per match.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Verify the match belongs to this agent and is in 'sent' status
  const { data: match } = await (supabase as any)
    .from('agent_matches')
    .select('id, agent_id, status, search_request_id')
    .eq('id', matchId)
    .single()

  if (!match || match.agent_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (match.status !== 'sent') {
    return NextResponse.json(
      { error: `Cannot respond to a match with status '${match.status}'` },
      { status: 409 }
    )
  }

  const body = await request.json()
  const { message, properties } = body

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ error: 'message is required' }, { status: 400 })
  }

  // Check for phone number in message text if consent disallows it
  const { data: consent } = await (supabase as any)
    .from('contact_consent')
    .select('phone_allowed')
    .eq('search_request_id', match.search_request_id)
    .single()

  let sanitisedMessage = message.trim()

  // Auto-redact phone numbers if phone_allowed is false
  if (!consent?.phone_allowed) {
    sanitisedMessage = sanitisedMessage.replace(
      /(\+?\d[\d\s\-().]{7,}\d)/g,
      '[phone redacted — hunter has not enabled phone contact]'
    )
  }

  // Insert the response
  const { data: response, error } = await (supabase as any)
    .from('agent_responses')
    .insert({
      agent_match_id: matchId,
      message: sanitisedMessage,
      properties: Array.isArray(properties) ? properties : [],
    })
    .select('id, created_at')
    .single()

  if (error) {
    // UNIQUE constraint → agent already responded
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'You have already responded to this search brief' },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Trigger scoring
  await inngest.send({
    name: 'search/response.received',
    data: {
      agentMatchId: matchId,
      agentResponseId: response.id,
    },
  })

  return NextResponse.json(response, { status: 201 })
}
