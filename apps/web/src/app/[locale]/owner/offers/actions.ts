'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export async function updateOfferStatusAction(
  offerId: string,
  newStatus: 'accepted' | 'declined'
) {
  const auth = await requireAuth()
  if (!auth.authenticated) return { error: 'auth_required' }

  const supabase = await createClient()

  // Verify the offer belongs to one of the user's listings
  const { data: offer } = await (supabase.from('offers') as any)
    .select('id, listing_id, status')
    .eq('id', offerId)
    .maybeSingle()

  if (!offer) return { error: 'not_found' }

  const { data: listing } = await (supabase.from('listings') as any)
    .select('id, owner_id')
    .eq('id', offer.listing_id)
    .eq('owner_id', auth.userId)
    .maybeSingle()

  if (!listing) return { error: 'forbidden' }

  // Only allow status change from submitted or under_review
  if (!['submitted', 'under_review'].includes(offer.status)) {
    return { error: 'invalid_status' }
  }

  const { error } = await (supabase.from('offers') as any)
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', offerId)

  if (error) return { error: error.message }

  // If accepted, update listing status to under_offer
  if (newStatus === 'accepted') {
    await (supabase.from('listings') as any)
      .update({ status: 'under_offer' })
      .eq('id', offer.listing_id)
  }

  revalidatePath('/owner/offers')
  return { success: true }
}
