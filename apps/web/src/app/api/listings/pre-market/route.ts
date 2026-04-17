import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/listings/pre-market
 * Toggle pre_market_opt_in for a listing owned by the authenticated user.
 *
 * Body: { listingId: string, enabled: boolean }
 * Returns: { success: true, pre_market_opt_in: boolean }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: { listingId: string; enabled: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { listingId, enabled } = body

  if (!listingId || typeof enabled !== 'boolean') {
    return NextResponse.json(
      { error: 'listingId (string) and enabled (boolean) are required' },
      { status: 400 }
    )
  }

  // Verify ownership
  const { data: listing, error: fetchErr } = await (supabase as any)
    .from('listings')
    .select('id, owner_id')
    .eq('id', listingId)
    .single()

  if (fetchErr || !listing || listing.owner_id !== user.id) {
    return NextResponse.json({ error: 'Listing not found or not owned by you' }, { status: 404 })
  }

  // Update pre_market_opt_in
  const { error: updateErr } = await (supabase as any)
    .from('listings')
    .update({ pre_market_opt_in: enabled })
    .eq('id', listingId)

  if (updateErr) {
    return NextResponse.json(
      { error: `Failed to update: ${updateErr.message ?? 'unknown'}` },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, pre_market_opt_in: enabled })
}
