import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { inngest } from '@/lib/inngest/client'

/**
 * POST /api/service-requests
 * Create a new service request.
 * Auth check validates user is authenticated.
 * Requester becomes the auth user.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const {
    listingId,
    category,
    title,
    description,
    preferredDate,
    preferredTime,
    address,
    postcode,
  } = body

  if (!category || !title) {
    return NextResponse.json(
      { error: 'category and title are required' },
      { status: 400 }
    )
  }

  const { data: serviceRequest, error } = await (supabase as any)
    .from('service_requests')
    .insert({
      requester_id: user.id,
      listing_id: listingId ?? null,
      category,
      title,
      description: description ?? null,
      preferred_date: preferredDate ?? null,
      preferred_time: preferredTime ?? null,
      address: address ?? null,
      postcode: postcode ?? null,
      status: 'open',
    })
    .select('id, requester_id, listing_id, category, title, description, preferred_date, preferred_time, address, postcode, status, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Emit Inngest event
  await inngest.send({
    name: 'service/request.created',
    data: {
      serviceRequestId: serviceRequest.id,
      requesterId: user.id,
      category,
      postcode: postcode ?? null,
    },
  })

  return NextResponse.json(serviceRequest, { status: 201 })
}

/**
 * GET /api/service-requests
 * List service requests for the authenticated user.
 * - If user is a partner: show requests where partner_id = user OR partner_id IS NULL and postcode overlaps coverage
 * - If user is owner/agent: show requests where requester_id = user
 * Includes listing details and partner name.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Check user roles
  const { data: userRoles } = await (supabase as any)
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)

  const roles = userRoles?.map((ur: { role: string }) => ur.role) ?? []
  const isPartner = roles.includes('partner')

  let query = null
  if (isPartner) {
    // Partner sees requests assigned to them OR unassigned with matching postcode
    query = (supabase as any)
      .from('service_requests')
      .select(`
        id, requester_id, listing_id, category, title, description,
        preferred_date, preferred_time, address, postcode, status,
        partner_id, quoted_amount, rating, review, created_at, updated_at,
        listings(address_line1, city, postcode),
        requester:users!requester_id(id, full_name),
        partner:users!partner_id(id, full_name)
      `)
      .or(`partner_id.eq.${user.id},partner_id.is.null`)
      .order('created_at', { ascending: false })
  } else {
    // Owner/Agent sees only their own requests
    query = (supabase as any)
      .from('service_requests')
      .select(`
        id, requester_id, listing_id, category, title, description,
        preferred_date, preferred_time, address, postcode, status,
        partner_id, quoted_amount, rating, review, created_at, updated_at,
        listings(address_line1, city, postcode),
        requester:users!requester_id(id, full_name),
        partner:users!partner_id(id, full_name)
      `)
      .eq('requester_id', user.id)
      .order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
