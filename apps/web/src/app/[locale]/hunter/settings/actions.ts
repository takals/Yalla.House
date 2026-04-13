'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PREVIEW_USER_ID } from '@/lib/preview-user'

type ActionResult = { success: true } | { error: string }

export async function updateProfileAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const { error } = await (supabase.from('users') as any)
    .update({
      full_name: formData.get('full_name') as string || null,
      phone: formData.get('phone') as string || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) return { error: 'Error saving profile.' }
  revalidatePath('/hunter/settings')
  return { success: true }
}

export async function pauseAllSharingAction(pause: boolean): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const newStatus = pause ? 'paused' : 'active'

  const { error } = await (supabase.from('agent_hunter_assignments') as any)
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('hunter_id', userId)
    .in('status', pause ? ['active'] : ['paused'])

  if (error) return { error: 'Error updating.' }

  await (supabase.from('hunter_consent_log') as any)
    .insert({ hunter_id: userId, event_type: pause ? 'data_paused' : 'data_resumed' })

  revalidatePath('/hunter/settings')
  return { success: true }
}

export async function disconnectAgentAction(assignmentId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const { data: assignment } = await (supabase.from('agent_hunter_assignments') as any)
    .select('agent_id')
    .eq('id', assignmentId)
    .eq('hunter_id', userId)
    .single()

  const { error } = await (supabase.from('agent_hunter_assignments') as any)
    .update({ status: 'disconnected', updated_at: new Date().toISOString() })
    .eq('id', assignmentId)
    .eq('hunter_id', userId)

  if (error) return { error: 'Error disconnecting.' }

  await (supabase.from('hunter_consent_log') as any)
    .insert({ hunter_id: userId, agent_id: assignment?.agent_id ?? null, event_type: 'agent_disconnected' })

  revalidatePath('/hunter/settings')
  return { success: true }
}

export async function deleteAgentDataAction(assignmentId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const { data: assignment } = await (supabase.from('agent_hunter_assignments') as any)
    .select('agent_id')
    .eq('id', assignmentId)
    .eq('hunter_id', userId)
    .single()

  await (supabase.from('agent_hunter_assignments') as any)
    .delete()
    .eq('id', assignmentId)
    .eq('hunter_id', userId)

  await (supabase.from('hunter_consent_log') as any)
    .insert({ hunter_id: userId, agent_id: assignment?.agent_id ?? null, event_type: 'data_deleted' })

  revalidatePath('/hunter/settings')
  return { success: true }
}

// Full account deletion is handled by support — return an informational error
export async function deleteAllDataAction(): Promise<ActionResult> {
  return {
    error: 'Um alle Daten zu löschen, wende dich bitte an support@yalla.house. Wir bearbeiten deinen Antrag innerhalb von 30 Tagen gemäß DSGVO.'
  }
}
