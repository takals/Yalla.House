'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function acceptProposalAction(assignmentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership and update status
  const { error } = await (supabase as any)
    .from('listing_agent_assignments')
    .update({
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', assignmentId)
    .eq('owner_id', user.id)
    .eq('status', 'invited')

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/owner/agents/proposals')
  return { success: true }
}

export async function declineProposalAction(assignmentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await (supabase as any)
    .from('listing_agent_assignments')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
    })
    .eq('id', assignmentId)
    .eq('owner_id', user.id)
    .eq('status', 'invited')

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/owner/agents/proposals')
  return { success: true }
}
