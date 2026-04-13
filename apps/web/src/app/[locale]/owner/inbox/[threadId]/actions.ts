'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export async function sendReplyAction(threadId: string, body: string) {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  if (!body.trim()) {
    return { error: 'Message cannot be empty' }
  }

  const supabase = await createClient()
  // Insert message
  const { error: msgError } = await (supabase as any)
    .from('messages')
    .insert({
      thread_id: threadId,
      sender_id: auth.userId,
      body: body.trim(),
      attachments: [],
      channel: 'in_app',
    })

  if (msgError) {
    return { error: msgError.message }
  }

  // Update thread last_message_at
  await (supabase as any)
    .from('message_threads')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', threadId)

  revalidatePath(`/owner/inbox/${threadId}`)
  return { success: true }
}
