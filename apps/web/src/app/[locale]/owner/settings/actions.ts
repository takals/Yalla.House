'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export async function updateUserProfileAction(data: {
  full_name?: string
  phone?: string
}) {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from('users')
    .update(data)
    .eq('id', auth.userId)

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
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  const supabase = await createClient()
  // Upsert — create profile if it doesn't exist
  const { error } = await (supabase as any)
    .from('owner_profiles')
    .upsert(
      { user_id: auth.userId, ...data },
      { onConflict: 'user_id' }
    )

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/owner/settings')
  return { success: true }
}
