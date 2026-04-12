import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/service-requests/:id/quote
 * Partner submits a quote for a service request.
 * Sets partner_id, quoted_amount, and status='quoted'.
 * Creates a notification for the requester.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: requestId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const { amount, currency, message } = body

  if (!amount || amount <= 0) {
    return NextResponse.json(
      { error: 'amount is required and must be positive' },
      { status: 400 }
    )
  }

  // Fetch the service request
  const { data: serviceRequest } = await (supabase as any)
    .from('service_requests')
    .select('id, requester_id, partner_id, status')
    .eq('id', requestId)
    .single()

  if (!serviceRequest) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Only allow quoting if no partner assigned yet or user is already the partner
  if (
    serviceRequest.partner_id &&
    serviceRequest.partner_id !== user.id
  ) {
    return NextResponse.json(
      { error: 'This request already has a partner assigned' },
      { status: 409 }
    )
  }

  // Update the service request with quote
  const { data: updated, error } = await (supabase as any)
    .from('service_requests')
    .update({
      partner_id: user.id,
      quoted_amount: amount,
      currency: currency ?? 'GBP',
      status: 'quoted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .select('id, partner_id, quoted_amount, currency, status, updated_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Create a notification for the requester
  await (supabase as any).from('notifications').insert({
    user_id: serviceRequest.requester_id,
    type: 'service_quote_received',
    title: 'Quote received for your service request',
    message: message ?? `A service partner has quoted £${amount} for your request.`,
    related_id: requestId,
    read_at: null,
  })

  return NextResponse.json(updated, { status: 201 })
}
