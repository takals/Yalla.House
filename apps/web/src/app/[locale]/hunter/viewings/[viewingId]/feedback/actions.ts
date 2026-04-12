'use server'

import { createClient } from '@/lib/supabase/server'
import { inngest } from '@/lib/inngest/client'

export async function checkinAction(
  viewingId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorised' }

  // Verify this viewing belongs to the hunter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: viewing } = await (supabase.from('viewings') as any)
    .select('id, hunter_id, status, listing_id')
    .eq('id', viewingId)
    .eq('hunter_id', user.id)
    .single()

  if (!viewing) return { error: 'Viewing not found' }
  if (viewing.status !== 'confirmed') return { error: 'Viewing is not confirmed' }

  // Update status to indicate hunter has arrived
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('viewings') as any)
    .update({
      checked_in_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', viewingId)

  if (error) {
    console.error('checkinAction error:', error)
    return { error: 'Failed to check in' }
  }

  return { success: true }
}

export async function submitFeedbackAction(
  viewingId: string,
  rating: number,
  notes: string,
  interested: boolean
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authorised' }

  // Verify ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: viewing } = await (supabase.from('viewings') as any)
    .select(`
      id, hunter_id, listing_id,
      listing:listings!listing_id(owner_id, title_de, agent_id)
    `)
    .eq('id', viewingId)
    .eq('hunter_id', user.id)
    .single()

  if (!viewing) return { error: 'Viewing not found' }

  // Update viewing with feedback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('viewings') as any)
    .update({
      status: 'completed',
      hunter_rating: rating,
      hunter_feedback: notes,
      hunter_interested: interested,
      updated_at: new Date().toISOString(),
    })
    .eq('id', viewingId)

  if (error) {
    console.error('submitFeedbackAction error:', error)
    return { error: 'Failed to submit feedback' }
  }

  // Trigger viewing completed lifecycle
  if (viewing.listing) {
    inngest.send({
      name: 'viewing/completed',
      data: {
        viewingId,
        hunterId: user.id,
        ownerId: viewing.listing.owner_id,
        agentId: viewing.listing.agent_id ?? null,
        listingId: viewing.listing_id,
        listingTitle: viewing.listing.title_de ?? viewing.listing_id,
      },
    }).catch(e => console.error('inngest viewing/completed error:', e))
  }

  return { success: true }
}
