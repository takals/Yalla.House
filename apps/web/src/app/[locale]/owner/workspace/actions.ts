'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { countryFromLocale } from '@/lib/detect-country'
import { getCountryConfig } from '@/lib/country-config'

/**
 * One-click draft creation — creates a minimal listing in draft status
 * and returns the listing ID so the workspace can load it inline.
 */
export async function createDraftAction(locale: string): Promise<
  { id: string } | { error: string } | { authRequired: true }
> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  const resolvedCountry = countryFromLocale(locale)
  const config = getCountryConfig(resolvedCountry)
  const supabase = await createClient()

  // Ensure public.users row exists (FK required by listings)
  await (supabase.from('users') as any).upsert(
    { id: auth.userId, email: auth.email, language: locale, country_code: resolvedCountry },
    { onConflict: 'id', ignoreDuplicates: true }
  )

  const { data: newListing, error } = await (supabase.from('listings') as any).insert({
    owner_id: auth.userId,
    country_code: resolvedCountry,
    currency: config.currency,
    status: 'draft',
    intent: 'sale',
    property_type: 'house',
    address_line1: '',
    postcode: '',
    city: '',
    title_de: '',
    title: '',
    country_fields: {},
    portal_status: {},
  }).select('id').single()

  if (error) {
    console.error('Draft creation error:', error)
    return { error: error.message || 'Failed to create draft.' }
  }

  return { id: newListing.id }
}

/**
 * Auto-save a single field on the listing.
 */
export async function updateWorkspaceFieldAction(
  listingId: string,
  field: string,
  value: string | number | null,
): Promise<{ ok: true } | { error: string }> {
  const auth = await requireAuth()
  if (!auth.authenticated) return { error: 'Not authenticated' }

  const supabase = await createClient()

  // Verify ownership
  const { data: listing } = await (supabase.from('listings') as any)
    .select('id')
    .eq('id', listingId)
    .eq('owner_id', auth.userId)
    .single()

  if (!listing) return { error: 'Not found' }

  const { error } = await (supabase.from('listings') as any)
    .update({ [field]: value })
    .eq('id', listingId)

  if (error) return { error: error.message }
  return { ok: true }
}
