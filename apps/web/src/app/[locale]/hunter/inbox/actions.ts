'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ActionResult = { success: true } | { error: string }

export async function muteSourceAction(sourceId: string, mute: boolean): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert' }

  const { error } = await (supabase.from('agent_inbox_sources') as any)
    .update({ status: mute ? 'muted' : 'active' })
    .eq('id', sourceId)
    .eq('hunter_id', user.id)

  if (error) return { error: 'Fehler beim Aktualisieren der Quelle.' }
  revalidatePath('/hunter/inbox')
  return { success: true }
}

export async function updateMatchStatusAction(
  matchId: string,
  status: 'saved' | 'dismissed'
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert' }

  const { error } = await (supabase.from('property_matches') as any)
    .update({ status })
    .eq('id', matchId)
    .eq('hunter_id', user.id)

  if (error) return { error: 'Fehler beim Aktualisieren.' }
  revalidatePath('/hunter/inbox')
  return { success: true }
}
