'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PREVIEW_USER_ID } from '@/lib/preview-user'

export async function updateUserProfileAction(data: {
  full_name?: string
  phone?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const { error } = await (supabase as any)
    .from('users')
    .update(data)
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/owner/settings')
  return { success: true }
}

export async function updateOwnerProfileAction(data: {
  company_name?: string
  tax_id?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Upsert — create profile if it doesn't exist
  const { error } = await (supabase as any)
    .from('owner_profiles')
    .upsert(
      { user_id: userId, ...data },
      { onConflict: 'user_id' }
    )

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/owner/settings')
  return { success: true }
}
