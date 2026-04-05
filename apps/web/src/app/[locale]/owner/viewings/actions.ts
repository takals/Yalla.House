'use server'

import { createClient } from '@/lib/supabase/server'
import { sendViewingConfirmedEmail, sendViewingDeclinedEmail } from '@/lib/resend'
import { sendViewingConfirmedWhatsApp, sendViewingDeclinedWhatsApp } from '@/lib/whatsapp'

interface ViewingWithContext {
  hunter_id: string
  listing_id: string
  hunter: { email: string; full_name: string | null; phone: string | null } | null
  listing: { owner_id: string; title_de: string | null; city: string } | null
}

async function verifyViewingOwnership(viewingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert' as const, supabase: null, user: null, viewing: null }

  const { data: viewing } = await (supabase as any)
    .from('viewings')
    .select(`
      hunter_id, listing_id,
      hunter:users!hunter_id(email, full_name, phone),
      listing:listings!listing_id(owner_id, title_de, city)
    `)
    .eq('id', viewingId)
    .single() as { data: ViewingWithContext | null }

  const ownerCheck = viewing?.listing
  if (!viewing || ownerCheck?.owner_id !== user.id) {
    return { error: 'Nicht autorisiert' as const, supabase: null, user: null, viewing: null }
  }

  return { error: null, supabase, user, viewing }
}

export async function confirmViewingAction(
  viewingId: string
): Promise<{ success: true } | { error: string }> {
  const { error: authError, supabase, viewing } = await verifyViewingOwnership(viewingId)
  if (authError || !supabase) return { error: authError ?? 'Nicht autorisiert' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('viewings') as any)
    .update({ status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', viewingId)

  if (error) {
    console.error('confirmViewingAction error:', error)
    return { error: 'Fehler beim Bestätigen. Bitte erneut versuchen.' }
  }

  // Notify buyer — fire-and-forget
  if (viewing?.hunter?.email && viewing.listing) {
    const title = viewing.listing.title_de ?? viewing.listing_id
    sendViewingConfirmedEmail({
      buyerEmail: viewing.hunter.email,
      buyerName: viewing.hunter.full_name,
      listingTitle: title,
      listingCity: viewing.listing.city,
    }).catch(e => console.error('buyer confirmed email error:', e))

    if (viewing.hunter.phone) {
      sendViewingConfirmedWhatsApp({
        buyerPhone: viewing.hunter.phone,
        buyerName: viewing.hunter.full_name,
        listingTitle: title,
      }).catch(e => console.error('buyer confirmed whatsapp error:', e))
    }
  }

  return { success: true }
}

export async function declineViewingAction(
  viewingId: string
): Promise<{ success: true } | { error: string }> {
  const { error: authError, supabase, viewing } = await verifyViewingOwnership(viewingId)
  if (authError || !supabase) return { error: authError ?? 'Nicht autorisiert' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('viewings') as any)
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', viewingId)

  if (error) {
    console.error('declineViewingAction error:', error)
    return { error: 'Fehler beim Ablehnen. Bitte erneut versuchen.' }
  }

  // Notify buyer — fire-and-forget
  if (viewing?.hunter?.email && viewing.listing) {
    const title = viewing.listing.title_de ?? viewing.listing_id
    sendViewingDeclinedEmail({
      buyerEmail: viewing.hunter.email,
      buyerName: viewing.hunter.full_name,
      listingTitle: title,
    }).catch(e => console.error('buyer declined email error:', e))

    if (viewing.hunter.phone) {
      sendViewingDeclinedWhatsApp({
        buyerPhone: viewing.hunter.phone,
        buyerName: viewing.hunter.full_name,
        listingTitle: title,
      }).catch(e => console.error('buyer declined whatsapp error:', e))
    }
  }

  return { success: true }
}
