import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/agent/listings
 *
 * Returns all listings the authenticated agent has access to (via assignments).
 * Requires a signed Partner Agreement.
 *
 * Query params:
 *   status=active (default) | all | under_offer
 *   page=1
 *   per_page=25
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 }
    )
  }

  // Verify Partner Agreement
  const { data: agentProfile } = await (supabase as any)
    .from('agent_profiles')
    .select('user_id, partner_agreement_signed_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!agentProfile?.partner_agreement_signed_at) {
    return NextResponse.json(
      {
        error: 'Partner Agreement required.',
        action: 'sign_agreement',
        url: '/agent/agreement',
      },
      { status: 403 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const statusFilter = searchParams.get('status') ?? 'active'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get('per_page') ?? '25', 10)))
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  // Fetch assignments with listing data
  let query = (supabase as any)
    .from('listing_agent_assignments')
    .select(`
      id, tier, status, created_at,
      listing:listings!listing_agent_assignments_listing_id_fkey(
        id, place_id, title, title_de, city, postcode, country, intent,
        sale_price, rent_price, currency, property_type,
        size_sqm, bedrooms, bathrooms, status
      )
    `, { count: 'exact' })
    .eq('agent_id', user.id)
    .in('status', ['accepted', 'active', 'invited'])
    .order('created_at', { ascending: false })
    .range(from, to)

  if (statusFilter !== 'all') {
    query = query.eq('listing.status', statusFilter === 'under_offer' ? 'under_offer' : 'active')
  }

  const { data: assignments, count, error } = await query

  if (error) {
    console.error('Failed to fetch agent listings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch listings.' },
      { status: 500 }
    )
  }

  const listings = (assignments ?? []).filter((a: any) => a.listing).map((a: any) => ({
    assignment_id: a.id,
    assignment_tier: a.tier,
    assignment_status: a.status,
    assigned_at: a.created_at,
    listing: {
      id: a.listing.id,
      reference: a.listing.place_id ?? a.listing.id,
      title: a.listing.title,
      title_de: a.listing.title_de,
      city: a.listing.city,
      postcode: a.listing.postcode,
      country: a.listing.country,
      intent: a.listing.intent,
      property_type: a.listing.property_type,
      sale_price: a.listing.sale_price ? a.listing.sale_price / 100 : null,
      rent_price: a.listing.rent_price ? a.listing.rent_price / 100 : null,
      currency: a.listing.currency,
      size_sqm: a.listing.size_sqm,
      bedrooms: a.listing.bedrooms,
      bathrooms: a.listing.bathrooms,
      status: a.listing.status,
      detail_url: `/api/agent/listings/${a.listing.id}`,
    },
  }))

  return NextResponse.json({
    data: listings,
    meta: {
      source: 'yalla.house',
      api_version: '1.0',
      page,
      per_page: perPage,
      total: count ?? 0,
      fetched_at: new Date().toISOString(),
    },
  })
}
