'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

type ActionResult = { success: true } | { error: string } | { authRequired: true }

export async function saveAgentProfileAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  const parseArray = (key: string): string[] => {
    try {
      const raw = formData.get(key)
      if (!raw) return []
      return JSON.parse(raw as string) as string[]
    } catch {
      return []
    }
  }

  const supabase = await createClient()

  const profileData = {
    user_id: auth.userId,
    agency_name: (formData.get('agency_name') as string) || null,
    license_number: (formData.get('license_number') as string) || null,
    property_types: parseArray('property_types'),
    focus: (formData.get('focus') as string) || 'both',
  }

  const { error } = await (supabase.from('agent_profiles') as any)
    .upsert(profileData, { onConflict: 'user_id' })

  if (error) {
    console.error('saveAgentProfileAction error:', error)
    return { error: 'Error saving. Please try again.' }
  }

  // Ensure agent role exists
  await (supabase.from('user_roles') as any)
    .upsert({ user_id: auth.userId, role: 'agent', is_active: true }, { onConflict: 'user_id,role' })

  revalidatePath('/agent')
  revalidatePath('/agent/profile')
  return { success: true }
}
