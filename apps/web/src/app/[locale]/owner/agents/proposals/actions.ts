'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export async function acceptProposalAction(assignmentId: string) {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  const supabase = await createClient()
  // Verify ownership and update status
  const { error } = await (supabase as any)
    .from('listing_agent_assignments')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', assignmentId)
    .eq('owner_id', auth.userId)
    .eq('status', 'invited')

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/owner/agents/proposals')
  return { success: true }
}

export async function declineProposalAction(assignmentId: string) {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from('listing_agent_assignments')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
    })
    .eq('id', assignmentId)
    .eq('owner_id', auth.userId)
    .eq('status', 'invited')

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/owner/agents/proposals')
  return { success: true }
}
