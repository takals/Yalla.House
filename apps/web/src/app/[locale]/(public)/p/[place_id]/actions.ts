'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { sendNewViewingRequestEmail } from '@/lib/resend'
import { sendViewingRequestWhatsApp } from '@/lib/whatsapp'

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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: slot } = await (service.from('availability_slots') as any)
    .select('id, listing_id, starts_at, is_booked')
    .eq('id', slotId)
    .single()

  if (!slot) return { error: 'Slot not found' }
  if (slot.listing_id !== listingId) return { error: 'Slot does not belong to this listing' }
  if (slot.is_booked) return { error: 'This slot has already been booked' }

  // Create viewing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (service.from('availability_slots') as any)
    .update({ is_booked: true, viewing_id: viewing.id })
    .eq('id', slotId)

  // Notify owner (fire-and-forget)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: listingData } = await (service.from('listings') as any)
      .select('title_de, city, owner_id')
      .eq('id', listingId)
      .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: hunterData } = await (service.from('users') as any)
      .select('full_name, email, phone')
      .eq('id', user.id)
      .single()

    if (listingData?.owner_id && hunterData?.email) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export async function requestViewingAction(
  listingId: string,
  payload: ViewingPayload
): Promise<{ success: true } | { error: string }> {
  if (!payload.name?.trim()) return { error: 'Name ist erforderlich.' }
  if (!payload.email?.trim() || !payload.email.includes('@')) {
    return { error: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.' }
  }

  const service = createServiceClient()

  // Look up existing user by email
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      return { error: 'Anfrage konnte nicht gesendet werden. Bitte erneut versuchen.' }
    }

    // Insert public user record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: userInsertError } = await (service.from('users') as any).insert({
      id: authData.user.id,
      email: payload.email.trim().toLowerCase(),
      full_name: payload.name.trim(),
    })

    if (userInsertError) {
      console.error('requestViewingAction users insert error:', userInsertError)
      return { error: 'Anfrage konnte nicht gesendet werden. Bitte erneut versuchen.' }
    }

    userId = authData.user.id
  }

  // Insert viewing record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: viewingError } = await (service.from('viewings') as any).insert({
    listing_id: listingId,
    hunter_id: userId,
    status: 'pending',
    type: 'in_person',
    hunter_notes: payload.message?.trim() || null,
  })

  if (viewingError) {
    console.error('requestViewingAction viewings insert error:', viewingError)
    return { error: 'Anfrage konnte nicht gesendet werden. Bitte erneut versuchen.' }
  }

  // Notify owner — fire-and-forget, never blocks the response
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: listingData } = await (service.from('listings') as any)
      .select('title_de, city, owner_id')
      .eq('id', listingId)
      .single() as { data: { title_de: string | null; city: string; owner_id: string } | null }

    if (listingData?.owner_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
