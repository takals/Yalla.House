'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PREVIEW_USER_ID } from '@/lib/preview-user'

type ActionResult = { success: true } | { error: string }

export async function updateAssignmentStatusAction(
  assignmentId: string,
  status: 'active' | 'paused' | 'invited' | 'ignored' | 'disconnected'
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const { error } = await (supabase.from('agent_hunter_assignments') as any)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', assignmentId)
    .eq('hunter_id', userId)

  if (error) return { error: 'Error updating.' }

  if (status === 'disconnected') {
    const { data: assignment } = await (supabase.from('agent_hunter_assignments') as any)
      .select('agent_id')
      .eq('id', assignmentId)
      .single()

    await (supabase.from('hunter_consent_log') as any)
      .insert({ hunter_id: userId, agent_id: assignment?.agent_id ?? null, event_type: 'agent_disconnected' })
  }

  revalidatePath('/hunter/agents')
  return { success: true }
}

export async function sendBriefAction(agentId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Upsert assignment
  const { error } = await (supabase.from('agent_hunter_assignments') as any)
    .upsert(
      { hunter_id: userId, agent_id: agentId, status: 'invited', initiated_by: 'hunter', updated_at: new Date().toISOString() },
      { onConflict: 'hunter_id,agent_id' }
    )

  if (error) return { error: 'Error sending brief.' }

  // Log consent event
  await (supabase.from('hunter_consent_log') as any)
    .insert({ hunter_id: userId, agent_id: agentId, event_type: 'brief_shared' })

  revalidatePath('/hunter/agents')
  return { success: true }
}
