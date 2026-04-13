'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PREVIEW_USER_ID } from '@/lib/preview-user'

type ActionResult = { success: true } | { error: string }

export async function muteSourceAction(sourceId: string, mute: boolean): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const { error } = await (supabase.from('agent_inbox_sources') as any)
    .update({ status: mute ? 'muted' : 'active' })
    .eq('id', sourceId)
    .eq('hunter_id', userId)

  if (error) return { error: 'Error updating source.' }
  revalidatePath('/hunter/inbox')
  return { success: true }
}

export async function updateMatchStatusAction(
  matchId: string,
  status: 'saved' | 'dismissed'
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const { error } = await (supabase.from('property_matches') as any)
    .update({ status })
    .eq('id', matchId)
    .eq('hunter_id', userId)

  if (error) return { error: 'Error updating.' }
  revalidatePath('/hunter/inbox')
  return { success: true }
}
