'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { sendNewViewingRequestEmail } from '@/lib/resend'
import { sendViewingRequestWhatsApp } from '@/lib/whatsapp'

// ── Inline field update (owner editing from listing page) ────────────────────

const ALLOWED_INLINE_FIELDS = new Set([
  'title_de', 'title', 'description_de', 'description',
  'sale_price', 'rent_price', 'bedrooms', 'bathrooms',
  'size_sqm', 'floor', 'construction_year',
])

export async function updateListingFieldAction(
  listingId: string,
  field: string,
  value: string
): Promise<{ success: true } | { error: string } | { authRequired: true }> {
  const auth = await requireAuth()
  if (!auth.authenticated) return { authRequired: true }

  if (!ALLOWED_INLINE_FIELDS.has(field)) return { error: 'Field not editable' }

  const supabase = await createClient()

  // Verify ownership
  const { data: listing } = await (supabase as any)
    .from('listings')
    .select('owner_id')
    .eq('id', listingId)
    .single()

  if (!listing || listing.owner_id !== auth.userId) return { error: 'Not authorized' }

  // Convert value based on field type
  let dbValue: unknown = value
  if (['sale_price', 'rent_price'].includes(field)) {
    const n = parseFloat(value)
    dbValue = isNaN(n) || n <= 0 ? null : Math.round(n * 100) // store in minor units
  } else if (['bedrooms', 'bathrooms', 'floor', 'construction_year'].includes(field)) {
    const n = parseInt(value, 10)
    dbValue = isNaN(n) ? null : n
  } else if (field === 'size_sqm') {
    const n = parseFloat(value)
    dbValue = isNaN(n) ? null : n
  }

  // For title fields, sync both title and title_de
  const update: Record<string, unknown> = { [field]: dbValue }
  if (field === 'title_de') update['title'] = dbValue
  if (field === 'title') update['title_de'] = dbValue

  const { error } = await (supabase.from('listings') as any)
    .update(update)
    .eq('id', listingId)
    .eq('owner_id', auth.userId)

  if (error) {
    console.error('updateListingFieldAction error:', error)
    return { error: 'Failed to save' }
  }

  return { success: true }
}

// ── Upload photo from listing page ───────────────────────────────────────────

export async function uploadPhotoAction(
  listingId: string,
  url: string,
  sortOrder: number
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

  const { data, error } = await (supabase.from('listing_media') as any).insert({
    listing_id: listingId,
    type: 'photo',
    url,
    sort_order: sortOrder,
    is_primary: false,
  }).select('id').single()

  if (error) {
    console.error('uploadPhotoAction error:', error)
    return { error: 'Failed to save photo' }
  }

  return { success: true, id: data.id }
}

// ── Upload document (floor plan / EPC) from listing page ────────────────────

export async function uploadDocumentAction(
  listingId: string,
  url: string,
  type: 'floor_plan' | 'epc'
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

  const { data, error } = await (supabase.from('listing_media') as any).insert({
    listing_id: listingId,
    type,
    url,
    sort_order: 0,
    is_primary: false,
  }).select('id').single()

  if (error) {
    console.error('uploadDocumentAction error:', error)
    return { error: 'Failed to save document' }
  }

  return { success: true, id: data.id }
}

export async function checkAuthAction(): Promise<{
  authenticated: boolean
  userName: string | null
  userEmail: string | null
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { authenticated: false, userName: null, userEmail: null }
  }

  const { data: profile } = await (supabase.from('users') as any)
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  return {
    authenticated: true,
    userName: profile?.full_name ?? null,
    userEmail: user.email ?? null,
  }
}

interface ViewingPayload {
  name: string
  email: string
  phone?: string
  message?: string
}

export async function fetchAvailableSlotsAction(
  listingId: string
): Promise<{ slots: Array<{ id: string; starts_at: string; ends_at: string }> }> {
  const { createServiceClient: svc } = await import('@/lib/supabase/server')
  const service = svc()

  const { data } = await (service.from('availability_slots') as any)
    .select('id, starts_at, ends_at')
    .eq('listing_id', listingId)
    .eq('is_booked', false)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(50)

  return { slots: data ?? [] }
}

export async function bookSlotAction(
  listingId: string,
  slotId: string,
  notes?: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Please sign in to book a viewing' }

  const service = createServiceClient()

  // Verify slot exists, belongs to this listing, and is not booked
  const { data: slot } = await (service.from('availability_slots') as any)
    .select('id, listing_id, starts_at, is_booked')
    .eq('id', slotId)
    .single()

  if (!slot) return { error: 'Slot not found' }
  if (slot.listing_id !== listingId) return { error: 'Slot does not belong to this listing' }
  if (slot.is_booked) return { error: 'This slot has already been booked' }

  // Create viewing
  const { data: viewing, error: viewingError } = await (service.from('viewings') as any)
    .insert({
      listing_id: listingId,
      hunter_id: user.id,
      slot_id: slotId,
      scheduled_at: slot.starts_at,
      status: 'pending',
      type: 'in_person',
      hunter_notes: notes?.trim() || null,
    })
    .select('id')
    .single()

  if (viewingError || !viewing) {
    console.error('bookSlotAction viewing insert error:', viewingError)
    return { error: 'Failed to book viewing' }
  }

  // Mark slot as booked
  await (service.from('availability_slots') as any)
    .update({ is_booked: true, viewing_id: viewing.id })
    .eq('id', slotId)

  // Notify owner (fire-and-forget)
  try {
    const { data: listingData } = await (service.from('listings') as any)
      .select('title_de, city, owner_id')
      .eq('id', listingId)
      .single()

    const { data: hunterData } = await (service.from('users') as any)
      .select('full_name, email, phone')
      .eq('id', user.id)
      .single()

    if (listingData?.owner_id && hunterData?.email) {
      const { data: ownerData } = await (service.from('users') as any)
        .select('email, full_name, phone')
        .eq('id', listingData.owner_id)
        .single()

      if (ownerData?.email) {
        sendNewViewingRequestEmail({
          ownerEmail: ownerData.email,
          ownerName: ownerData.full_name,
          listingTitle: listingData.title_de ?? listingId,
          listingCity: listingData.city,
          buyerName: hunterData.full_name ?? hunterData.email,
          buyerEmail: hunterData.email,
          buyerPhone: hunterData.phone,
          buyerMessage: notes?.trim() || null,
        }).catch(e => console.error('slot booking owner email error:', e))
      }
    }
  } catch (e) {
    console.error('bookSlotAction notify error:', e)
  }

  return { success: true }
}

export async function getSlotByIdAction(
  slotId: string
): Promise<{ slot: { id: string; starts_at: string; ends_at: string } | null }> {
  const { createServiceClient: svc } = await import('@/lib/supabase/server')
  const service = svc()

  const { data } = await (service.from('availability_slots') as any)
    .select('id, starts_at, ends_at')
    .eq('id', slotId)
    .eq('is_booked', false)
    .single()

  return { slot: data ?? null }
}

export async function requestViewingAction(
  listingId: string,
  payload: ViewingPayload,
  locale?: string
): Promise<{ success: true } | { error: string }> {
  const { getTranslations } = await import('next-intl/server')
  const t = await getTranslations({ locale: locale ?? 'de', namespace: 'listingPage' })

  if (!payload.name?.trim()) return { error: t('errorNameRequired') }
  if (!payload.email?.trim() || !payload.email.includes('@')) {
    return { error: t('errorInvalidEmail') }
  }

  const service = createServiceClient()

  // Look up existing user by email
  const { data: existing } = await (service.from('users') as any)
    .select('id')
    .eq('email', payload.email.trim().toLowerCase())
    .maybeSingle() as { data: { id: string } | null }

  let userId: string

  if (existing) {
    userId = existing.id
  } else {
    // Create auth user (email confirmed, no password — magic link later)
    const { data: authData, error: authError } = await service.auth.admin.createUser({
      email: payload.email.trim().toLowerCase(),
      email_confirm: true,
    })

    if (authError || !authData.user) {
      console.error('requestViewingAction auth.admin.createUser error:', authError)
      return { error: t('errorRequestFailed') }
    }

    // Insert public user record
    const { error: userInsertError } = await (service.from('users') as any).insert({
      id: authData.user.id,
      email: payload.email.trim().toLowerCase(),
      full_name: payload.name.trim(),
    })

    if (userInsertError) {
      console.error('requestViewingAction users insert error:', userInsertError)
      return { error: t('errorRequestFailed') }
    }

    userId = authData.user.id
  }

  // Insert viewing record
  const { error: viewingError } = await (service.from('viewings') as any).insert({
    listing_id: listingId,
    hunter_id: userId,
    status: 'pending',
    type: 'in_person',
    hunter_notes: payload.message?.trim() || null,
  })

  if (viewingError) {
    console.error('requestViewingAction viewings insert error:', viewingError)
    return { error: t('errorRequestFailed') }
  }

  // Notify owner — fire-and-forget, never blocks the response
  try {
    const { data: listingData } = await (service.from('listings') as any)
      .select('title_de, city, owner_id')
      .eq('id', listingId)
      .single() as { data: { title_de: string | null; city: string; owner_id: string } | null }

    if (listingData?.owner_id) {
      const { data: ownerData } = await (service.from('users') as any)
        .select('email, full_name, phone')
        .eq('id', listingData.owner_id)
        .single() as { data: { email: string; full_name: string | null; phone: string | null } | null }

      if (ownerData?.email) {
        const title = listingData.title_de ?? listingId
        sendNewViewingRequestEmail({
          ownerEmail: ownerData.email,
          ownerName: ownerData.full_name,
          listingTitle: title,
          listingCity: listingData.city,
          buyerName: payload.name.trim(),
          buyerEmail: payload.email.trim().toLowerCase(),
          buyerPhone: payload.phone?.trim() || null,
          buyerMessage: payload.message?.trim() || null,
        }).catch(e => console.error('owner email error:', e))

        if (ownerData.phone) {
          sendViewingRequestWhatsApp({
            ownerPhone: ownerData.phone,
            ownerName: ownerData.full_name,
            listingTitle: title,
            buyerName: payload.name.trim(),
            buyerPhone: payload.phone?.trim() || null,
          }).catch(e => console.error('owner whatsapp error:', e))
        }
      }
    }
  } catch (e) {
    console.error('requestViewingAction notify error:', e)
  }

  return { success: true }
}
