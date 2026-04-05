'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'

export interface EditPayload {
  property_type: string
  intent: string
  address_line1: string
  address_line2: string
  postcode: string
  city: string
  region: string
  size_sqm: string
  rooms: string
  bedrooms: string
  bathrooms: string
  floor: string
  total_floors: string
  construction_year: string
  energy_class: string
  title_de: string
  description_de: string
  sale_price: string
  price_qualifier: string
  rent_price: string
  nebenkosten: string
  kaution: string
}

export async function updateListingAction(
  id: string,
  payload: EditPayload
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert' }

  // Verify ownership server-side
  const { data: existing } = await (supabase as any)
    .from('listings')
    .select('owner_id')
    .eq('id', id)
    .single()

  if (!existing || existing.owner_id !== user.id) {
    return { error: 'Nicht autorisiert' }
  }

  const toMinorUnits = (val: string): number | null => {
    const n = parseFloat(val)
    return isNaN(n) || n <= 0 ? null : Math.round(n * 100)
  }

  const toInt = (val: string): number | null => {
    const n = parseInt(val, 10)
    return isNaN(n) ? null : n
  }

  const toFloat = (val: string): number | null => {
    const n = parseFloat(val)
    return isNaN(n) ? null : n
  }

  const isFlat =
    payload.property_type === 'flat' || payload.property_type === 'apartment'

  const countryFields: Record<string, unknown> = {}
  if (payload.rooms) countryFields['rooms'] = parseFloat(payload.rooms)
  if (payload.energy_class) countryFields['energy_class'] = payload.energy_class

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('listings') as any)
    .update({
      intent: payload.intent as 'sale' | 'rent' | 'both',
      property_type: payload.property_type as
        | 'house' | 'flat' | 'apartment' | 'villa'
        | 'commercial' | 'land' | 'other',
      address_line1: payload.address_line1,
      address_line2: payload.address_line2 || null,
      postcode: payload.postcode,
      city: payload.city,
      region: payload.region || null,
      title_de: payload.title_de,
      title: payload.title_de,
      description_de: payload.description_de || null,
      size_sqm: toFloat(payload.size_sqm),
      bedrooms: toInt(payload.bedrooms),
      bathrooms: toInt(payload.bathrooms),
      floor: isFlat ? toInt(payload.floor) : null,
      total_floors: isFlat ? toInt(payload.total_floors) : null,
      construction_year: toInt(payload.construction_year),
      sale_price: toMinorUnits(payload.sale_price),
      rent_price: toMinorUnits(payload.rent_price),
      price_qualifier: (payload.price_qualifier as 'fixed_price' | 'vb' | null) || null,
      nebenkosten: toMinorUnits(payload.nebenkosten),
      kaution: toMinorUnits(payload.kaution),
      country_fields: countryFields,
    })
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) {
    console.error('Listing update error:', error)
    return { error: 'Fehler beim Speichern. Bitte versuchen Sie es erneut.' }
  }

  return { success: true }
}

// ── Photo actions ─────────────────────────────────────────────────────────────

export async function savePhotoAction(
  listingId: string,
  url: string,
  sortOrder: number
): Promise<{ success: true; id: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert' }

  // Verify ownership
  const { data: listing } = await (supabase as any)
    .from('listings')
    .select('owner_id')
    .eq('id', listingId)
    .single()
  if (!listing || listing.owner_id !== user.id) return { error: 'Nicht autorisiert' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('listing_media') as any).insert({
    listing_id: listingId,
    type: 'photo',
    url,
    sort_order: sortOrder,
    is_primary: false,
  }).select('id').single()

  if (error) {
    console.error('savePhotoAction error:', error)
    return { error: 'Foto konnte nicht gespeichert werden.' }
  }

  return { success: true, id: data.id }
}

export async function deletePhotoAction(
  mediaId: string,
  storagePath: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert' }

  // Verify ownership via listing_media → listing
  const { data: media } = await (supabase as any)
    .from('listing_media')
    .select('listing_id, listings!inner(owner_id)')
    .eq('id', mediaId)
    .single()

  const ownerCheck = (media?.listings as unknown as { owner_id: string } | null)
  if (!media || ownerCheck?.owner_id !== user.id) return { error: 'Nicht autorisiert' }

  // Delete from storage using service client (bypasses RLS)
  const serviceClient = createServiceClient()
  await serviceClient.storage.from('listing-photos').remove([storagePath])

  // Delete DB row
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('listing_media') as any)
    .delete()
    .eq('id', mediaId)

  if (error) {
    console.error('deletePhotoAction error:', error)
    return { error: 'Foto konnte nicht gelöscht werden.' }
  }

  return { success: true }
}

export async function setPrimaryPhotoAction(
  mediaId: string,
  listingId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert' }

  // Verify ownership
  const { data: listing } = await (supabase as any)
    .from('listings')
    .select('owner_id')
    .eq('id', listingId)
    .single()
  if (!listing || listing.owner_id !== user.id) return { error: 'Nicht autorisiert' }

  // Clear all primary flags for this listing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('listing_media') as any)
    .update({ is_primary: false })
    .eq('listing_id', listingId)

  // Set the selected one as primary
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('listing_media') as any)
    .update({ is_primary: true })
    .eq('id', mediaId)

  if (error) {
    console.error('setPrimaryPhotoAction error:', error)
    return { error: 'Titelbild konnte nicht gesetzt werden.' }
  }

  return { success: true }
}

// ── Status action ─────────────────────────────────────────────────────────────

const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft:       ['active'],
  active:      ['paused', 'sold', 'let', 'archived'],
  paused:      ['active', 'archived'],
  under_offer: ['active', 'sold', 'let'],
}

export async function changeStatusAction(
  id: string,
  newStatus: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert' }

  const { data: existing } = await (supabase as any)
    .from('listings')
    .select('owner_id, status')
    .eq('id', id)
    .single()

  if (!existing || existing.owner_id !== user.id) return { error: 'Nicht autorisiert' }

  const allowed = STATUS_TRANSITIONS[existing.status] ?? []
  if (!allowed.includes(newStatus)) return { error: 'Ungültige Statusänderung' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('listings') as any)
    .update({ status: newStatus })
    .eq('id', id)

  if (error) {
    console.error('changeStatusAction error:', error)
    return { error: 'Fehler beim Aktualisieren des Status.' }
  }

  return { success: true }
}

// ── Portal actions ─────────────────────────────────────────────────────────────

export async function submitToPortalAction(
  listingId: string,
  portalId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert' }

  // Verify ownership
  const { data: listing } = await (supabase as any)
    .from('listings')
    .select('owner_id')
    .eq('id', listingId)
    .single()
  if (!listing || listing.owner_id !== user.id) return { error: 'Nicht autorisiert' }

  // Upsert portal status to queued
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: upsertError } = await (supabase.from('listing_portal_status') as any)
    .upsert(
      { listing_id: listingId, portal_id: portalId, status: 'queued', error_message: null },
      { onConflict: 'listing_id,portal_id' }
    )

  if (upsertError) {
    console.error('submitToPortalAction upsert error:', upsertError)
    return { error: 'Fehler beim Einreichen. Bitte erneut versuchen.' }
  }

  // Fire Inngest event
  try {
    const { inngest } = await import('@/lib/inngest/client')
    await inngest.send({
      name: 'feed/export.requested',
      data: { listingId, portalId },
    })
  } catch (err) {
    console.error('submitToPortalAction inngest.send error:', err)
    // Don't fail the action — the queued status is persisted
  }

  return { success: true }
}
