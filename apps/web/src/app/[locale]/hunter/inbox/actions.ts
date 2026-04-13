'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

type ActionResult = { success: true } | { error: string } | { authRequired: true }

export async function muteSourceAction(sourceId: string, mute: boolean): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  const supabase = await createClient()
  const { error } = await (supabase.from('agent_inbox_sources') as any)
    .update({ status: mute ? 'muted' : 'active' })
    .eq('id', sourceId)
    .eq('hunter_id', auth.userId)

  if (error) return { error: 'Error updating source.' }
  revalidatePath('/hunter/inbox')
  return { success: true }
}

export async function updateMatchStatusAction(
  matchId: string,
  status: 'saved' | 'dismissed'
): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  const supabase = await createClient()
  const { error } = await (supabase.from('property_matches') as any)
    .update({ status })
    .eq('id', matchId)
    .eq('hunter_id', auth.userId)

  if (error) return { error: 'Error updating.' }
  revalidatePath('/hunter/inbox')
  return { success: true }
}
