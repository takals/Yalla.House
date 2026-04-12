'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ActionResult = { success: true } | { error: string }

export async function updateProfileAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert' }

  const { error } = await (supabase.from('users') as any)
    .update({
      full_name: formData.get('full_name') as string || null,
      phone: formData.get('phone') as string || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: 'Fehler beim Speichern des Profils.' }
  revalidatePath('/hunter/settings')
  return { success: true }
}

export async function pauseAllSharingAction(pause: boolean): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert' }

  const newStatus = pause ? 'paused' : 'active'

  const { error } = await (supabase.from('agent_hunter_assignments') as any)
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('hunter_id', user.id)
    .in('status', pause ? ['active'] : ['paused'])

  if (error) return { error: 'Fehler beim Aktualisieren.' }

  await (supabase.from('hunter_consent_log') as any)
    .insert({ hunter_id: user.id, event_type: pause ? 'data_paused' : 'data_resumed' })

  revalidatePath('/hunter/settings')
  return { success: true }
}

export async function disconnectAgentAction(assignmentId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert' }

  const { data: assignment } = await (supabase.from('agent_hunter_assignments') as any)
    .select('agent_id')
    .eq('id', assignmentId)
    .eq('hunter_id', user.id)
    .single()

  const { error } = await (supabase.from('agent_hunter_assignments') as any)
    .update({ status: 'disconnected', updated_at: new Date().toISOString() })
    .eq('id', assignmentId)
    .eq('hunter_id', user.id)

  if (error) return { error: 'Fehler beim Trennen.' }

  await (supabase.from('hunter_consent_log') as any)
    .insert({ hunter_id: user.id, agent_id: assignment?.agent_id ?? null, event_type: 'agent_disconnected' })

  revalidatePath('/hunter/settings')
  return { success: true }
}

export async function deleteAgentDataAction(assignmentId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert' }

  const { data: assignment } = await (supabase.from('agent_hunter_assignments') as any)
    .select('agent_id')
    .eq('id', assignmentId)
    .eq('hunter_id', user.id)
    .single()

  await (supabase.from('agent_hunter_assignments') as any)
    .delete()
    .eq('id', assignmentId)
    .eq('hunter_id', user.id)

  await (supabase.from('hunter_consent_log') as any)
    .insert({ hunter_id: user.id, agent_id: assignment?.agent_id ?? null, event_type: 'data_deleted' })

  revalidatePath('/hunter/settings')
  return { success: true }
}

// Full account deletion is handled by support — return an informational error
export async function deleteAllDataAction(): Promise<ActionResult> {
  return {
    error: 'Um alle Daten zu löschen, wende dich bitte an support@yalla.house. Wir bearbeiten deinen Antrag innerhalb von 30 Tagen gemäß DSGVO.'
  }
}
