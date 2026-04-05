'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { sendNewViewingRequestEmail } from '@/lib/resend'
import { sendViewingRequestWhatsApp } from '@/lib/whatsapp'

interface ViewingPayload {
  name: string
  email: string
  phone?: string
  message?: string
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
