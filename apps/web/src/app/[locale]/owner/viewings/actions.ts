'use server'

import { createClient } from '@/lib/supabase/server'
import { sendViewingConfirmedEmail, sendViewingDeclinedEmail } from '@/lib/resend'
import { sendViewingConfirmedWhatsApp, sendViewingDeclinedWhatsApp } from '@/lib/whatsapp'
import { inngest } from '@/lib/inngest/client'
import { PREVIEW_USER_ID } from '@/lib/preview-user'

interface ViewingWithContext {
  hunter_id: string
  listing_id: string
  scheduled_at: string | null
  hunter: { email: string; full_name: string | null; phone: string | null } | null
  listing: { owner_id: string; title_de: string | null; city: string; agent_id: string | null } | null
}

async function verifyViewingOwnership(viewingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const { data: viewing } = await (supabase as any)
    .from('viewings')
    .select(`
      hunter_id, listing_id, scheduled_at,
      hunter:users!hunter_id(email, full_name, phone),
      listing:listings!listing_id(owner_id, title_de, city, agent_id)
    `)
    .eq('id', viewingId)
    .single() as { data: ViewingWithContext | null }

  const ownerCheck = viewing?.listing
  if (!viewing || ownerCheck?.owner_id !== userId) {
    return { error: 'Not authorized' as const, supabase: null, user: null, viewing: null }
  }

  return { error: null, supabase, user, viewing }
}

export async function confirmViewingAction(
  viewingId: string
): Promise<{ success: true } | { error: string }> {
  const { error: authError, supabase, user, viewing } = await verifyViewingOwnership(viewingId)
  if (authError || !supabase || !user) return { error: authError ?? 'Not authorized' }

  const { error } = await (supabase.from('viewings') as any)
    .update({ status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', viewingId)

  if (error) {
    console.error('confirmViewingAction error:', error)
    return { error: 'Error confirming. Please try again.' }
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

    // Trigger viewing lifecycle (reminders, check-in, etc.)
    if (viewing.scheduled_at) {
      inngest.send({
        name: 'viewing/confirmed',
        data: {
          viewingId,
          listingId: viewing.listing_id,
          hunterId: viewing.hunter_id,
          ownerId: user!.id,
          agentId: viewing.listing.agent_id ?? null,
          scheduledAt: viewing.scheduled_at,
          listingTitle: title,
          listingCity: viewing.listing.city,
        },
      }).catch(e => console.error('inngest viewing/confirmed error:', e))
    }
  }

  return { success: true }
}

// ── Owner Availability Slot Management ────────────────────────

export async function addOwnerSlotAction(
  listingId: string,
  startsAt: string,
  endsAt: string
): Promise<{ success: true; slotId: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Verify owner owns this listing
  const { data: listing } = await (supabase.from('listings') as any)
    .select('id, owner_id')
    .eq('id', listingId)
    .eq('owner_id', userId)
    .single()

  if (!listing) return { error: 'Listing not found' }

  // Validate times
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  if (end <= start) return { error: 'End time must be after start time' }
  if (start < new Date()) return { error: 'Cannot create slots in the past' }

  // Check daily limit (max 8 slots per listing per day)
  const dayStart = new Date(start)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(start)
  dayEnd.setHours(23, 59, 59, 999)

  const { count } = await (supabase.from('availability_slots') as any)
    .select('id', { count: 'exact', head: true })
    .eq('listing_id', listingId)
    .gte('starts_at', dayStart.toISOString())
    .lte('starts_at', dayEnd.toISOString())

  if ((count ?? 0) >= 8) return { error: 'Maximum number of slots per day reached (8)' }

  // Create the slot
  const { data: slot, error } = await (supabase.from('availability_slots') as any)
    .insert({
      listing_id: listingId,
      owner_id: userId,
      starts_at: startsAt,
      ends_at: endsAt,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London',
      is_booked: false,
    })
    .select('id')
    .single()

  if (error) {
    console.error('addOwnerSlotAction error:', error)
    return { error: 'Failed to create slot' }
  }

  return { success: true, slotId: slot.id }
}

export async function removeOwnerSlotAction(
  slotId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const { data: slot } = await (supabase.from('availability_slots') as any)
    .select('id, owner_id, is_booked')
    .eq('id', slotId)
    .single()

  if (!slot) return { error: 'Slot not found' }
  if (slot.owner_id !== userId) return { error: 'Not authorized' }
  if (slot.is_booked) return { error: 'Cannot remove a booked slot' }

  const { error } = await (supabase.from('availability_slots') as any)
    .delete()
    .eq('id', slotId)

  if (error) {
    console.error('removeOwnerSlotAction error:', error)
    return { error: 'Error deleting slot' }
  }

  return { success: true }
}

export async function declineViewingAction(
  viewingId: string
): Promise<{ success: true } | { error: string }> {
  const { error: authError, supabase, viewing } = await verifyViewingOwnership(viewingId)
  if (authError || !supabase) return { error: authError ?? 'Not authorized' }

  const { error } = await (supabase.from('viewings') as any)
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', viewingId)

  if (error) {
    console.error('declineViewingAction error:', error)
    return { error: 'Error declining. Please try again.' }
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
