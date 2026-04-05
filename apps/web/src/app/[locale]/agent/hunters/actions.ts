'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ActionResult = { success: true } | { error: string }

export async function requestAccessAction(hunterUserId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('agent_hunter_assignments') as any)
    .upsert(
      {
        agent_id: user.id,
        hunter_id: hunterUserId,
        status: 'invited',
        initiated_by: 'agent',
        data_scope: 'brief_only',
      },
      { onConflict: 'hunter_id,agent_id' }
    )

  if (error) return { error: 'Fehler beim Senden der Anfrage.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('hunter_consent_log') as any)
    .insert({ hunter_id: hunterUserId, agent_id: user.id, event_type: 'brief_shared' })

  revalidatePath('/agent/hunters')
  return { success: true }
}

export async function disconnectHunterAction(assignmentId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('agent_hunter_assignments') as any)
    .update({ status: 'disconnected', updated_at: new Date().toISOString() })
    .eq('id', assignmentId)
    .eq('agent_id', user.id)

  if (error) return { error: 'Fehler beim Trennen.' }

  revalidatePath('/agent/hunters')
  revalidatePath('/agent')
  return { success: true }
}
