'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ActionResult = { success: true } | { error: string }

export async function saveAgentProfileAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert' }

  const parseArray = (key: string): string[] => {
    try {
      const raw = formData.get(key)
      if (!raw) return []
      return JSON.parse(raw as string) as string[]
    } catch {
      return []
    }
  }

  const profileData = {
    user_id: user.id,
    agency_name: (formData.get('agency_name') as string) || null,
    license_number: (formData.get('license_number') as string) || null,
    property_types: parseArray('property_types'),
    focus: (formData.get('focus') as string) || 'both',
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('agent_profiles') as any)
    .upsert(profileData, { onConflict: 'user_id' })

  if (error) {
    console.error('saveAgentProfileAction error:', error)
    return { error: 'Fehler beim Speichern. Bitte erneut versuchen.' }
  }

  // Ensure agent role exists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('user_roles') as any)
    .upsert({ user_id: user.id, role: 'agent', is_active: true }, { onConflict: 'user_id,role' })

  revalidatePath('/agent')
  revalidatePath('/agent/profile')
  return { success: true }
}
