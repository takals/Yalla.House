'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'

export async function submitProposalAction(
  listingId: string,
  data: {
    feeType: 'flat' | 'percentage' | 'none'
    feeAmount: number | null
    feeCurrency: string
    serviceOverview: string
  }
) {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  if (data.feeType !== 'none' && (!data.feeAmount || data.feeAmount <= 0)) {
    return { error: 'Please enter a valid fee amount.' }
  }
  if (!data.serviceOverview.trim()) {
    return { error: 'Please describe your service offering.' }
  }

  const supabase = await createClient()

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
    .eq('agent_id', auth.userId)
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
      agent_id: auth.userId,
      owner_id: listing.owner_id,
      tier: 'managed',
      status: 'invited',
      notes: data.serviceOverview,
      fee_type: data.feeType,
      fee_amount: data.feeAmount,
      fee_currency: data.feeCurrency,
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
