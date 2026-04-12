'use server'

import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'

export async function submitProposalAction(
  listingId: string,
  data: { commission: string; serviceOverview: string }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  if (!data.commission.trim()) {
    return { error: 'Please enter your commission quote.' }
  }
  if (!data.serviceOverview.trim()) {
    return { error: 'Please describe your service offering.' }
  }

  // Verify listing exists and is active
  const { data: listing } = await (supabase as any)
    .from('listings')
    .select('id, owner_id, status')
    .eq('id', listingId)
    .in('status', ['active', 'under_offer'])
    .single()

  if (!listing) {
    return { error: 'Listing not found or no longer available.' }
  }

  // Check agent hasn't already submitted
  const { data: existing } = await (supabase as any)
    .from('listing_agent_assignments')
    .select('id')
    .eq('listing_id', listingId)
    .eq('agent_id', userId)
    .maybeSingle()

  if (existing) {
    return { error: 'You have already submitted a proposal for this property.' }
  }

  // Create the assignment record
  // Agents always get full-service (managed) — the proposal is about their commission + service pitch
  const { error } = await (supabase as any)
    .from('listing_agent_assignments')
    .insert({
      listing_id: listingId,
      agent_id: userId,
      owner_id: listing.owner_id,
      tier: 'managed',
      status: 'invited',
      notes: `Commission: ${data.commission}\n\nService overview:\n${data.serviceOverview}`,
      fee_type: 'quoted',
      // Full-service permissions by default
      can_edit_listing: true,
      can_manage_viewings: true,
      can_negotiate: true,
      can_message_buyers: true,
    })

  if (error) {
    console.error('Failed to create assignment:', error)
    return { error: 'Failed to submit proposal. Please try again.' }
  }

  return { success: true }
}
