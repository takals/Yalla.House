'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { emitReferralMilestone } from '@/lib/referrals'
import { countryFromLocale } from '@/lib/detect-country'
import { getCountryConfig } from '@/lib/country-config'

/** The handful of fields a guest can fill in before they have an account. */
export interface DraftBasics {
  intent?: 'sale' | 'rent'
  propertyType?: string
  addressLine1?: string
  city?: string
  postcode?: string
  bedrooms?: number | null
  /** Major units as typed (e.g. 450000) — converted to minor units on insert. */
  price?: number | null
}

const ALLOWED_PROPERTY_TYPES = new Set([
  'house', 'flat', 'apartment', 'villa', 'commercial', 'land', 'other',
])

/**
 * One-click draft creation — creates a listing in draft status and returns the
 * listing ID so the workspace can load it inline.
 *
 * `basics` carries whatever a guest typed before signing in, so their work
 * survives the magic-link round trip instead of landing on an empty form.
 */
export async function createDraftAction(locale: string, basics?: DraftBasics): Promise<
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

  const intent = basics?.intent === 'rent' ? 'rent' : 'sale'
  const propertyType = basics?.propertyType && ALLOWED_PROPERTY_TYPES.has(basics.propertyType)
    ? basics.propertyType
    : 'house'

  // Prices are typed in major units and stored in minor units.
  const priceMinor = typeof basics?.price === 'number' && basics.price > 0
    ? Math.round(basics.price * 100)
    : null

  const bedrooms = typeof basics?.bedrooms === 'number' && basics.bedrooms >= 0
    ? Math.round(basics.bedrooms)
    : null

  const { data: newListing, error } = await (supabase.from('listings') as any).insert({
    owner_id: auth.userId,
    country_code: resolvedCountry,
    currency: config.currency,
    status: 'draft',
    intent,
    property_type: propertyType,
    address_line1: basics?.addressLine1?.trim().slice(0, 200) ?? '',
    postcode: basics?.postcode?.trim().slice(0, 20) ?? '',
    city: basics?.city?.trim().slice(0, 100) ?? '',
    bedrooms,
    sale_price: intent === 'sale' ? priceMinor : null,
    rent_price: intent === 'rent' ? priceMinor : null,
    title_de: '',
    title: '',
    country_fields: {},
    portal_status: {},
  }).select('id').single()

  if (error) {
    console.error('Draft creation error:', error)
    return { error: error.message || 'Failed to create draft.' }
  }

  await emitReferralMilestone(auth.userId, 'LISTING_DRAFT')

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

// ── Photo actions ────────────────────────────────────────────────────────

export async function saveWorkspacePhotoAction(
  listingId: string,
  url: string,
  sortOrder: number,
  isPrimary: boolean = false,
): Promise<{ success: true; id: string } | { error: string } | { authRequired: true }> {
  const auth = await requireAuth()
  if (!auth.authenticated) return { authRequired: true }

  const supabase = await createClient()
  const { data: listing } = await (supabase as any)
    .from('listings')
    .select('owner_id')
    .eq('id', listingId)
    .single()
  if (!listing || listing.owner_id !== auth.userId) return { error: 'Not authorized' }

  // If setting as primary, clear existing primary flags first
  if (isPrimary) {
    await (supabase.from('listing_media') as any)
      .update({ is_primary: false })
      .eq('listing_id', listingId)
      .eq('type', 'photo')
  }

  const { data, error } = await (supabase.from('listing_media') as any).insert({
    listing_id: listingId,
    type: 'photo',
    url,
    sort_order: sortOrder,
    is_primary: isPrimary,
  }).select('id').single()

  if (error) {
    console.error('saveWorkspacePhotoAction error:', error)
    return { error: 'Failed to save photo.' }
  }

  return { success: true, id: data.id }
}

export async function deleteWorkspaceMediaAction(
  mediaId: string,
  storagePath: string,
): Promise<{ success: true } | { error: string } | { authRequired: true }> {
  const auth = await requireAuth()
  if (!auth.authenticated) return { authRequired: true }

  const supabase = await createClient()
  const { data: media } = await (supabase as any)
    .from('listing_media')
    .select('listing_id, listings!inner(owner_id)')
    .eq('id', mediaId)
    .single()

  const ownerCheck = (media?.listings as unknown as { owner_id: string } | null)
  if (!media || ownerCheck?.owner_id !== auth.userId) return { error: 'Not authorized' }

  // Delete from storage using service client (bypasses RLS)
  const serviceClient = createServiceClient()
  await serviceClient.storage.from('listing-photos').remove([storagePath])

  const { error } = await (supabase.from('listing_media') as any)
    .delete()
    .eq('id', mediaId)

  if (error) {
    console.error('deleteWorkspaceMediaAction error:', error)
    return { error: 'Failed to delete.' }
  }

  return { success: true }
}

export async function setWorkspacePrimaryAction(
  mediaId: string,
  listingId: string,
): Promise<{ success: true } | { error: string } | { authRequired: true }> {
  const auth = await requireAuth()
  if (!auth.authenticated) return { authRequired: true }

  const supabase = await createClient()
  const { data: listing } = await (supabase as any)
    .from('listings')
    .select('owner_id')
    .eq('id', listingId)
    .single()
  if (!listing || listing.owner_id !== auth.userId) return { error: 'Not authorized' }

  await (supabase.from('listing_media') as any)
    .update({ is_primary: false })
    .eq('listing_id', listingId)

  const { error } = await (supabase.from('listing_media') as any)
    .update({ is_primary: true })
    .eq('id', mediaId)

  if (error) return { error: 'Failed to set primary.' }
  return { success: true }
}

// ── Document upload action ───────────────────────────────────────────────

export async function saveWorkspaceDocumentAction(
  listingId: string,
  url: string,
  docType: 'floorplan' | 'energy_cert' | 'document',
): Promise<{ success: true; id: string } | { error: string } | { authRequired: true }> {
  const auth = await requireAuth()
  if (!auth.authenticated) return { authRequired: true }

  const supabase = await createClient()
  const { data: listing } = await (supabase as any)
    .from('listings')
    .select('owner_id')
    .eq('id', listingId)
    .single()
  if (!listing || listing.owner_id !== auth.userId) return { error: 'Not authorized' }

  // Remove existing document of same type (replace pattern)
  await (supabase.from('listing_media') as any)
    .delete()
    .eq('listing_id', listingId)
    .eq('type', docType)

  const { data, error } = await (supabase.from('listing_media') as any).insert({
    listing_id: listingId,
    type: docType,
    url,
    sort_order: 0,
    is_primary: false,
  }).select('id').single()

  if (error) {
    console.error('saveWorkspaceDocumentAction error:', error)
    return { error: 'Failed to save document.' }
  }

  return { success: true, id: data.id }
}
