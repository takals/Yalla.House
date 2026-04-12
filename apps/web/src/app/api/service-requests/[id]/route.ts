import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { inngest } from '@/lib/inngest/client'

/**
 * GET /api/service-requests/:id
 * Fetch a single service request with full details.
 * Auth check: user must be requester, partner, or listing owner.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: requestId } = await params
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Fetch the service request with all related data
  const { data: serviceRequest } = await (supabase as any)
    .from('service_requests')
    .select(`
      id, requester_id, listing_id, category, title, description,
      preferred_date, preferred_time, address, postcode, status,
      partner_id, quoted_amount, rating, review, deliverables,
      final_amount, created_at, updated_at,
      listings(id, address_line1, city, postcode, owner_id),
      requester:users!requester_id(id, full_name),
      partner:users!partner_id(id, full_name)
    `)
    .eq('id', requestId)
    .single()

  if (!serviceRequest) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Verify access: user must be requester, partner, or listing owner
  const isRequester = serviceRequest.requester_id === user.id
  const isPartner = serviceRequest.partner_id === user.id
  const isListingOwner = serviceRequest.listings?.owner_id === user.id

  if (!isRequester && !isPartner && !isListingOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json(serviceRequest)
}

/**
 * PATCH /api/service-requests/:id
 * Update a service request based on user role.
 *
 * Partner can:
 * - Submit quote (quoted_amount, status='quoted')
 * - Accept request (status='accepted')
 * - Mark in_progress (status='in_progress')
 * - Mark complete (status='completed', deliverables, final_amount)
 *
 * Requester can:
 * - Accept quote (status='accepted')
 * - Cancel (status='cancelled')
 * - Rate (rating, review only if status='completed')
 */
export async function PATCH(
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

  // Fetch current service request
  const { data: serviceRequest } = await (supabase as any)
    .from('service_requests')
    .select('id, requester_id, partner_id, status')
    .eq('id', requestId)
    .single()

  if (!serviceRequest) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const isRequester = serviceRequest.requester_id === user.id
  const isPartner = serviceRequest.partner_id === user.id

  // Partner actions
  if (isPartner || (!serviceRequest.partner_id && user)) {
    const { quoted_amount, deliverables, final_amount, status } = body

    if (status === 'quoted' || (quoted_amount !== undefined && !status)) {
      // Partner submitting a quote
      if (!quoted_amount) {
        return NextResponse.json(
          { error: 'quoted_amount is required to submit a quote' },
          { status: 400 }
        )
      }

      const { data: updated, error } = await (supabase as any)
        .from('service_requests')
        .update({
          partner_id: user.id,
          quoted_amount,
          status: 'quoted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select('id, status, quoted_amount, updated_at')
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(updated)
    }

    if (status === 'in_progress') {
      // Partner marks request in progress
      const { data: updated, error } = await (supabase as any)
        .from('service_requests')
        .update({
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select('id, status, updated_at')
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(updated)
    }

    if (status === 'completed') {
      // Partner marks request completed
      if (!deliverables || !final_amount) {
        return NextResponse.json(
          { error: 'deliverables and final_amount are required to complete' },
          { status: 400 }
        )
      }

      const { data: updated, error } = await (supabase as any)
        .from('service_requests')
        .update({
          status: 'completed',
          deliverables,
          final_amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select('id, status, deliverables, final_amount, updated_at')
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Emit completion event
      await inngest.send({
        name: 'service/request.completed',
        data: {
          serviceRequestId: requestId,
          partnerId: user.id,
          finalAmount: final_amount,
        },
      })

      return NextResponse.json(updated)
    }
  }

  // Requester actions
  if (isRequester) {
    const { status, rating, review } = body

    if (status === 'accepted') {
      // Requester accepting a quote
      if (serviceRequest.status !== 'quoted') {
        return NextResponse.json(
          { error: 'Can only accept a quoted request' },
          { status: 409 }
        )
      }

      const { data: updated, error } = await (supabase as any)
        .from('service_requests')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select('id, status, updated_at')
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(updated)
    }

    if (status === 'cancelled') {
      // Requester cancelling a request
      const { data: updated, error } = await (supabase as any)
        .from('service_requests')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select('id, status, updated_at')
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(updated)
    }

    if (rating !== undefined || review !== undefined) {
      // Requester rating a completed request
      if (serviceRequest.status !== 'completed') {
        return NextResponse.json(
          { error: 'Can only rate a completed request' },
          { status: 409 }
        )
      }

      const { data: updated, error } = await (supabase as any)
        .from('service_requests')
        .update({
          rating: rating ?? null,
          review: review ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .select('id, rating, review, updated_at')
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(updated)
    }
  }

  return NextResponse.json(
    { error: 'Unauthorized action for this user role' },
    { status: 403 }
  )
}
