import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/agent/listings/[id]
 *
 * Returns structured listing data for CRM integration.
 * Agent must have a signed Partner Agreement (verified via agent_profiles.partner_agreement_signed_at).
 * Returns property data WITHOUT owner personal details.
 *
 * Query params:
 *   format=json (default) | csv
 *   fields=all (default) | basic | extended
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401 }
    )
  }

  // Verify agent has signed Partner Agreement
  const { data: agentProfile } = await (supabase as any)
    .from('agent_profiles')
    .select('user_id, partner_agreement_signed_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!agentProfile) {
    return NextResponse.json(
      { error: 'Agent profile not found. Please complete your agent profile first.' },
      { status: 403 }
    )
  }

  if (!agentProfile.partner_agreement_signed_at) {
    return NextResponse.json(
      {
        error: 'Partner Agreement required.',
        action: 'sign_agreement',
        url: '/agent/agreement',
      },
      { status: 403 }
    )
  }

  // Fetch listing — no owner fields
  const { data: listing } = await (supabase as any)
    .from('listings')
    .select(`
      id, place_id, title, title_de, description, description_de,
      city, postcode, country, street, house_number,
      intent, property_type,
      sale_price, rent_price, currency,
      size_sqm, bedrooms, bathrooms, floor, construction_year,
      energy_rating, parking, garden, balcony,
      status, created_at, updated_at,
      listing_media ( id, url, thumb_url, caption, caption_de, sort_order, is_primary, type )
    `)
    .eq('id', id)
    .in('status', ['active', 'under_offer'])
    .single()

  if (!listing) {
    return NextResponse.json(
      { error: 'Listing not found or no longer active.' },
      { status: 404 }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const format = searchParams.get('format') ?? 'json'
  const fields = searchParams.get('fields') ?? 'all'

  // Structure for CRM import (maps to common CRM fields)
  const crmData = buildCrmPayload(listing, fields)

  if (format === 'csv') {
    const csv = toCsv(crmData)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="yalla-listing-${listing.place_id ?? id}.csv"`,
      },
    })
  }

  return NextResponse.json({
    data: crmData,
    meta: {
      source: 'yalla.house',
      listing_id: listing.id,
      place_id: listing.place_id,
      fetched_at: new Date().toISOString(),
      api_version: '1.0',
    },
  })
}

function buildCrmPayload(listing: any, fields: string) {
  const basic = {
    reference: listing.place_id ?? listing.id,
    title: listing.title,
    title_de: listing.title_de,
    status: listing.status,
    intent: listing.intent,
    property_type: listing.property_type,
    address: {
      street: listing.street,
      house_number: listing.house_number,
      postcode: listing.postcode,
      city: listing.city,
      country: listing.country,
    },
    pricing: {
      sale_price: listing.sale_price ? listing.sale_price / 100 : null,
      rent_price: listing.rent_price ? listing.rent_price / 100 : null,
      currency: listing.currency,
    },
  }

  if (fields === 'basic') return basic

  const extended = {
    ...basic,
    details: {
      size_sqm: listing.size_sqm,
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      floor: listing.floor,
      construction_year: listing.construction_year,
      energy_rating: listing.energy_rating,
      parking: listing.parking,
      garden: listing.garden,
      balcony: listing.balcony,
    },
    description: listing.description,
    description_de: listing.description_de,
    dates: {
      created_at: listing.created_at,
      updated_at: listing.updated_at,
    },
  }

  if (fields === 'extended') return extended

  // 'all' — include media
  return {
    ...extended,
    media: (listing.listing_media ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((m: any) => ({
        url: m.url,
        thumb_url: m.thumb_url,
        caption: m.caption,
        type: m.type,
        is_primary: m.is_primary,
      })),
  }
}

function toCsv(data: any): string {
  // Flatten to a single row for CSV export
  const flat: Record<string, string> = {
    reference: data.reference ?? '',
    title: data.title ?? '',
    status: data.status ?? '',
    intent: data.intent ?? '',
    property_type: data.property_type ?? '',
    street: data.address?.street ?? '',
    house_number: data.address?.house_number ?? '',
    postcode: data.address?.postcode ?? '',
    city: data.address?.city ?? '',
    country: data.address?.country ?? '',
    sale_price: data.pricing?.sale_price?.toString() ?? '',
    rent_price: data.pricing?.rent_price?.toString() ?? '',
    currency: data.pricing?.currency ?? '',
    size_sqm: data.details?.size_sqm?.toString() ?? '',
    bedrooms: data.details?.bedrooms?.toString() ?? '',
    bathrooms: data.details?.bathrooms?.toString() ?? '',
    floor: data.details?.floor?.toString() ?? '',
    construction_year: data.details?.construction_year?.toString() ?? '',
    energy_rating: data.details?.energy_rating ?? '',
    parking: data.details?.parking?.toString() ?? '',
    garden: data.details?.garden?.toString() ?? '',
    balcony: data.details?.balcony?.toString() ?? '',
    description: data.description ?? '',
  }

  const headers = Object.keys(flat)
  const values = headers.map(h => `"${(flat[h] ?? '').replace(/"/g, '""')}"`)
  return headers.join(',') + '\n' + values.join(',')
}
