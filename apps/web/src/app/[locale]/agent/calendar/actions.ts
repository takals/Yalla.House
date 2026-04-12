'use server'

import { createClient } from '@/lib/supabase/server'
import { inngest } from '@/lib/inngest/client'

export async function addAvailabilitySlotAction(
  listingId: string,
  startsAt: string,
  endsAt: string
): Promise<{ success: true; slotId: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorised' }

  // Verify agent is assigned to this listing
  const { data: assignment } = await (supabase.from('listing_agent_assignments') as any)
    .select('id')
    .eq('agent_id', user.id)
    .eq('listing_id', listingId)
    .eq('status', 'active')
    .maybeSingle()

  if (!assignment) return { error: 'Not assigned to this listing' }

  // Get the listing owner_id for the slot
  const { data: listing } = await (supabase.from('listings') as any)
    .select('owner_id')
    .eq('id', listingId)
    .single()

  if (!listing) return { error: 'Listing not found' }

  // Validate times
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  if (end <= start) return { error: 'End time must be after start time' }
  if (start < new Date()) return { error: 'Cannot create slots in the past' }

  // Create the slot
  const { data: slot, error } = await (supabase.from('availability_slots') as any)
    .insert({
      listing_id: listingId,
      owner_id: listing.owner_id,
      starts_at: startsAt,
      ends_at: endsAt,
      timezone: 'Europe/London',
      is_booked: false,
    })
    .select('id')
    .single()

  if (error) {
    console.error('addAvailabilitySlotAction error:', error)
    return { error: 'Failed to create slot' }
  }

  return { success: true, slotId: slot.id }
}

export async function removeAvailabilitySlotAction(
  slotId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorised' }

  // Verify slot exists and isn't booked, and agent is assigned
  const { data: slot } = await (supabase.from('availability_slots') as any)
    .select('id, listing_id, is_booked')
    .eq('id', slotId)
    .single()

  if (!slot) return { error: 'Slot not found' }
  if (slot.is_booked) return { error: 'Cannot remove a booked slot' }

  // Check assignment
  const { data: assignment } = await (supabase.from('listing_agent_assignments') as any)
    .select('id')
    .eq('agent_id', user.id)
    .eq('listing_id', slot.listing_id)
    .eq('status', 'active')
    .maybeSingle()

  if (!assignment) return { error: 'Not assigned to this listing' }

  const { error } = await (supabase.from('availability_slots') as any)
    .delete()
    .eq('id', slotId)

  if (error) {
    console.error('removeAvailabilitySlotAction error:', error)
    return { error: 'Failed to remove slot' }
  }

  return { success: true }
}

export async function confirmViewingAction(
  viewingId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorised' }

  // Fetch viewing context for lifecycle events
  const { data: viewing } = await (supabase.from('viewings') as any)
    .select(`
      id, hunter_id, listing_id, scheduled_at,
      listing:listings!listing_id(owner_id, title_de, city)
    `)
    .eq('id', viewingId)
    .single()

  const { error } = await (supabase.from('viewings') as any)
    .update({ status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', viewingId)

  if (error) {
    console.error('confirmViewingAction error:', error)
    return { error: 'Failed to confirm viewing' }
  }

  // Trigger viewing lifecycle (reminders, check-in, etc.)
  if (viewing?.scheduled_at && viewing.listing) {
    const title = viewing.listing.title_de ?? viewing.listing_id
    inngest.send({
      name: 'viewing/confirmed',
      data: {
        viewingId,
        listingId: viewing.listing_id,
        hunterId: viewing.hunter_id,
        ownerId: viewing.listing.owner_id,
        agentId: user.id,
        scheduledAt: viewing.scheduled_at,
        listingTitle: title,
        listingCity: viewing.listing.city,
      },
    }).catch(e => console.error('inngest viewing/confirmed error:', e))
  }

  return { success: true }
}

export async function declineViewingAction(
  viewingId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorised' }

  const { error } = await (supabase.from('viewings') as any)
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', viewingId)

  if (error) {
    console.error('declineViewingAction error:', error)
    return { error: 'Failed to decline viewing' }
  }

  return { success: true }
}
