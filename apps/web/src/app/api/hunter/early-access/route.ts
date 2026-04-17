import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/hunter/early-access
 * Returns pre-market listings available to the authenticated hunter based on their early_access_tier.
 *
 * - tier 'none' → empty list
 * - tier 'standard' → listings created in last 72h with pre_market_opt_in = true
 * - tier 'priority' → listings created in last 7 days with pre_market_opt_in = true (longer window)
 *
 * Returns: { listings: Array<{ id, place_id, slug, short_id, title, city, postcode, ... }>, tier }
 */
export async function GET(_request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Fetch hunter profile to determine tier
  const { data: profile } = await (supabase as any)
    .from('hunter_profiles')
    .select('early_access_tier, target_areas, property_types, budget_min, budget_max, intent')
    .eq('user_id', user.id)
    .maybeSingle()

  const tier = profile?.early_access_tier ?? 'none'

  if (tier === 'none') {
    return NextResponse.json({ listings: [], tier })
  }

  // Priority hunters get a 7-day window; standard get 72 hours
  const hoursWindow = tier === 'priority' ? 168 : 72
  const cutoff = new Date(Date.now() - hoursWindow * 60 * 60 * 1000).toISOString()

  // Fetch pre-market listings
  let query = (supabase as any)
    .from('listings')
    .select('id, place_id, slug, short_id, title, title_en, city, postcode, intent, sale_price, rent_price, currency, bedrooms, size_sqm, status, created_at')
    .eq('pre_market_opt_in', true)
    .gte('created_at', cutoff)
    .in('status', ['draft', 'active']) // pre-market can include drafts that owners are still preparing
    .order('created_at', { ascending: false })
    .limit(20)

  // Optional: filter by hunter's intent if set
  if (profile?.intent && profile.intent !== 'both') {
    const listingIntent = profile.intent === 'buy' ? 'sale' : 'rent'
    query = query.eq('intent', listingIntent)
  }

  const { data: listings, error: listErr } = await query

  if (listErr) {
    return NextResponse.json(
      { error: `Failed to fetch: ${listErr.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({
    listings: listings ?? [],
    tier,
    window_hours: hoursWindow,
  })
}
