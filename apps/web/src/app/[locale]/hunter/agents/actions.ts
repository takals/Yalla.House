'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

type ActionResult = { success: true } | { error: string } | { authRequired: true }

export async function updateAssignmentStatusAction(
  assignmentId: string,
  status: 'active' | 'paused' | 'invited' | 'ignored' | 'disconnected'
): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  const supabase = await createClient()
  const { error } = await (supabase.from('agent_hunter_assignments') as any)
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', assignmentId)
    .eq('hunter_id', auth.userId)

  if (error) return { error: 'Error updating.' }

  if (status === 'disconnected') {
    const { data: assignment } = await (supabase.from('agent_hunter_assignments') as any)
      .select('agent_id')
      .eq('id', assignmentId)
      .single()

    await (supabase.from('hunter_consent_log') as any)
      .insert({ hunter_id: auth.userId, agent_id: assignment?.agent_id ?? null, event_type: 'agent_disconnected' })
  }

  revalidatePath('/hunter/agents')
  return { success: true }
}

export async function sendBriefAction(agentId: string): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  const supabase = await createClient()
  // Upsert assignment
  const { error } = await (supabase.from('agent_hunter_assignments') as any)
    .upsert(
      { hunter_id: auth.userId, agent_id: agentId, status: 'invited', initiated_by: 'hunter', updated_at: new Date().toISOString() },
      { onConflict: 'hunter_id,agent_id' }
    )

  if (error) return { error: 'Error sending brief.' }

  // Log consent event
  await (supabase.from('hunter_consent_log') as any)
    .insert({ hunter_id: auth.userId, agent_id: agentId, event_type: 'brief_shared' })

  revalidatePath('/hunter/agents')
  return { success: true }
}
