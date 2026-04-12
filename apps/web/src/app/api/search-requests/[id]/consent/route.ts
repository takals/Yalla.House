import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { inngest } from '@/lib/inngest/client'

/**
 * POST /api/search-requests/:id/consent
 * Store or update consent for agent outreach on a search request.
 * Triggers the agent matching pipeline when consent is granted.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: searchRequestId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Verify ownership
  const { data: search } = await (supabase as any)
    .from('search_requests')
    .select('id, hunter_id, status')
    .eq('id', searchRequestId)
    .single()

  if (!search || search.hunter_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json()
  const { agent_outreach, phone_allowed } = body

  if (typeof agent_outreach !== 'boolean') {
    return NextResponse.json({ error: 'agent_outreach must be a boolean' }, { status: 400 })
  }

  // Upsert consent (one per search request)
  const { data: consent, error } = await (supabase as any)
    .from('contact_consent')
    .upsert(
      {
        search_request_id: searchRequestId,
        agent_outreach,
        phone_allowed: phone_allowed ?? false,
        consented_at: new Date().toISOString(),
        revoked_at: agent_outreach ? null : new Date().toISOString(),
      },
      { onConflict: 'search_request_id' }
    )
    .select('id, agent_outreach, phone_allowed, consented_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If consent granted and search is active, trigger agent matching
  if (agent_outreach && search.status === 'active') {
    await inngest.send({
      name: 'search/consent.granted',
      data: {
        searchRequestId,
        hunterId: user.id,
      },
    })
  }

  // Log consent event
  await (supabase as any).from('hunter_consent_log').insert({
    hunter_id: user.id,
    event_type: agent_outreach ? 'brief_shared' : 'data_paused',
  })

  return NextResponse.json(consent, { status: 201 })
}
