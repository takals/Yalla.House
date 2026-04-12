'use server'

import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'

export async function submitProposalAction(
  listingId: string,
  data: { tier: string; message: string }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Verify listing exists and is active
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from('listing_agent_assignments')
    .select('id')
    .eq('listing_id', listingId)
    .eq('agent_id', userId)
    .maybeSingle()

  if (existing) {
    return { error: 'You have already submitted a proposal for this property.' }
  }

  // Validate tier
  const validTiers = ['advisory', 'assisted', 'managed']
  if (!validTiers.includes(data.tier)) {
    return { error: 'Invalid collaboration tier.' }
  }

  // Create the assignment record (status: invited = proposal pending)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('listing_agent_assignments')
    .insert({
      listing_id: listingId,
      agent_id: userId,
      owner_id: listing.owner_id,
      tier: data.tier,
      status: 'invited',
      notes: data.message,
      // Default permissions based on tier
      can_edit_listing: data.tier === 'managed',
      can_manage_viewings: data.tier !== 'advisory',
      can_negotiate: data.tier === 'managed',
      can_message_buyers: data.tier !== 'advisory',
    })

  if (error) {
    console.error('Failed to create assignment:', error)
    return { error: 'Failed to submit proposal. Please try again.' }
  }

  return { success: true }
}
