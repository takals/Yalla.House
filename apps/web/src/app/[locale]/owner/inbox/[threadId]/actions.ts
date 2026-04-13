'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PREVIEW_USER_ID } from '@/lib/preview-user'

export async function sendReplyAction(threadId: string, body: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  if (!body.trim()) {
    return { error: 'Message cannot be empty' }
  }

  // Insert message
  const { error: msgError } = await (supabase as any)
    .from('messages')
    .insert({
      thread_id: threadId,
      sender_id: userId,
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
