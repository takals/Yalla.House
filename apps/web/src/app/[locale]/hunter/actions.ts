'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'

export async function cancelViewingAction(
  viewingId: string
): Promise<{ success: true } | { error: string } | { authRequired: true }> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  const supabase = await createClient()
  // Verify the viewing belongs to this hunter
  const { data: viewing } = await (supabase.from('viewings') as any)
    .select('id, status, hunter_id')
    .eq('id', viewingId)
    .eq('hunter_id', auth.userId)
    .single()

  if (!viewing) return { error: 'Viewing request not found.' }
  if (viewing.status === 'cancelled') return { error: 'Viewing request already cancelled.' }
  if (['completed', 'no_show'].includes(viewing.status)) {
    return { error: 'This viewing request cannot be cancelled.' }
  }

  const { error } = await (supabase.from('viewings') as any)
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', viewingId)

  if (error) {
    console.error('cancelViewingAction error:', error)
    return { error: 'Error cancelling. Please try again.' }
  }

  return { success: true }
}
