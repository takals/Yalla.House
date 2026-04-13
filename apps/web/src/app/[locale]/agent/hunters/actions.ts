'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

type ActionResult = { success: true } | { error: string } | { authRequired: true }

export async function requestAccessAction(hunterUserId: string): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  const supabase = await createClient()
  const { error } = await (supabase.from('agent_hunter_assignments') as any)
    .upsert(
      {
        agent_id: auth.userId,
        hunter_id: hunterUserId,
        status: 'invited',
        initiated_by: 'agent',
        data_scope: 'brief_only',
      },
      { onConflict: 'hunter_id,agent_id' }
    )

  if (error) return { error: 'Error sending request.' }

  await (supabase.from('hunter_consent_log') as any)
    .insert({ hunter_id: hunterUserId, agent_id: auth.userId, event_type: 'brief_shared' })

  revalidatePath('/agent/hunters')
  return { success: true }
}

export async function disconnectHunterAction(assignmentId: string): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  const supabase = await createClient()
  const { error } = await (supabase.from('agent_hunter_assignments') as any)
    .update({ status: 'disconnected', updated_at: new Date().toISOString() })
    .eq('id', assignmentId)
    .eq('agent_id', auth.userId)

  if (error) return { error: 'Error disconnecting.' }

  revalidatePath('/agent/hunters')
  revalidatePath('/agent')
  return { success: true }
}
