'use server'

import { createClient } from '@/lib/supabase/server'

export async function addAvailabilitySlotAction(
  listingId: string,
  startsAt: string,
  endsAt: string
): Promise<{ success: true; slotId: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorised' }

  // Verify agent is assigned to this listing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assignment } = await (supabase.from('listing_agent_assignments') as any)
    .select('id')
    .eq('agent_id', user.id)
    .eq('listing_id', listingId)
    .eq('status', 'active')
    .maybeSingle()

  if (!assignment) return { error: 'Not assigned to this listing' }

  // Get the listing owner_id for the slot
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: slot } = await (supabase.from('availability_slots') as any)
    .select('id, listing_id, is_booked')
    .eq('id', slotId)
    .single()

  if (!slot) return { error: 'Slot not found' }
  if (slot.is_booked) return { error: 'Cannot remove a booked slot' }

  // Check assignment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assignment } = await (supabase.from('listing_agent_assignments') as any)
    .select('id')
    .eq('agent_id', user.id)
    .eq('listing_id', slot.listing_id)
    .eq('status', 'active')
    .maybeSingle()

  if (!assignment) return { error: 'Not assigned to this listing' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('viewings') as any)
    .update({ status: 'confirmed', updated_at: new Date().toISOString() })
    .eq('id', viewingId)

  if (error) {
    console.error('confirmViewingAction error:', error)
    return { error: 'Failed to confirm viewing' }
  }

  return { success: true }
}

export async function declineViewingAction(
  viewingId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorised' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('viewings') as any)
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', viewingId)

  if (error) {
    console.error('declineViewingAction error:', error)
    return { error: 'Failed to decline viewing' }
  }

  return { success: true }
}
