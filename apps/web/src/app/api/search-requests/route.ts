import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/search-requests
 * Create a new search request. Also creates hunter_profile if first time.
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const body = await request.json()
  const {
    intent, areas, radius_km, budget_min, budget_max, currency,
    property_types, bedrooms_min, bedrooms_max, timeline, notes, languages,
  } = body

  if (!intent || !areas) {
    return NextResponse.json({ error: 'intent and areas are required' }, { status: 400 })
  }

  // Ensure hunter_profile exists (idempotent upsert)
  await (supabase as any).from('hunter_profiles').upsert(
    {
      user_id: user.id,
      intent: intent === 'buy' ? 'buy' : 'rent',
      budget_min: budget_min ?? null,
      budget_max: budget_max ?? null,
      currency: currency ?? 'GBP',
      target_areas: areas,
      property_types: property_types ?? [],
      timeline: timeline ?? 'flexible',
    },
    { onConflict: 'user_id', ignoreDuplicates: true }
  )

  // Ensure hunter role
  await (supabase as any).from('user_roles').upsert(
    { user_id: user.id, role: 'hunter' },
    { onConflict: 'user_id,role', ignoreDuplicates: true }
  )

  // Create the search request
  const { data: searchRequest, error } = await (supabase as any)
    .from('search_requests')
    .insert({
      hunter_id: user.id,
      intent,
      areas,
      radius_km: radius_km ?? 5,
      budget_min: budget_min ?? null,
      budget_max: budget_max ?? null,
      currency: currency ?? 'GBP',
      property_types: property_types ?? [],
      bedrooms_min: bedrooms_min ?? null,
      bedrooms_max: bedrooms_max ?? null,
      timeline: timeline ?? 'flexible',
      notes: notes ?? null,
      languages: languages ?? ['en'],
      status: 'active',
    })
    .select('id, status, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(searchRequest, { status: 201 })
}

/**
 * GET /api/search-requests
 * List the authenticated hunter's search requests.
 */
export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { data, error } = await (supabase as any)
    .from('search_requests')
    .select(`
      id, intent, areas, radius_km, budget_min, budget_max, currency,
      property_types, bedrooms_min, bedrooms_max, timeline, notes, languages,
      status, created_at, updated_at,
      contact_consent(agent_outreach, phone_allowed, consented_at, revoked_at)
    `)
    .eq('hunter_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
