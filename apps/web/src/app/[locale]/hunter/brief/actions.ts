'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface BriefState {
  success?: boolean
  error?: string
}

export async function saveBriefAction(
  _prevState: BriefState,
  formData: FormData
): Promise<BriefState> {
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

  const budgetMinRaw = formData.get('budget_min')
  const budgetMaxRaw = formData.get('budget_max')
  const minBedroomsRaw = formData.get('min_bedrooms')

  const profileData = {
    user_id: user.id,
    intent: (formData.get('intent') as string) || null,
    budget_min: budgetMinRaw ? parseInt(budgetMinRaw as string) * 100 : null, // convert £ to pence
    budget_max: budgetMaxRaw ? parseInt(budgetMaxRaw as string) * 100 : null,
    target_areas: parseArray('target_areas'),
    property_types: parseArray('property_types'),
    min_bedrooms: minBedroomsRaw ? parseInt(minBedroomsRaw as string) : null,
    must_haves: parseArray('must_haves'),
    dealbreakers: parseArray('dealbreakers'),
    finance_status: (formData.get('finance_status') as string) || null,
    timeline: (formData.get('timeline') as string) || null,
    agent_assistance_consented: true,
    brief_updated_at: new Date().toISOString(),
  }

  // Upsert hunter_profiles
  const { error: profileError } = await (supabase.from('hunter_profiles') as any)
    .upsert(profileData, { onConflict: 'user_id' })

  if (profileError) {
    console.error('saveBriefAction error:', profileError)
    return { error: 'Fehler beim Speichern. Bitte erneut versuchen.' }
  }

  // Ensure hunter role exists
  await (supabase.from('user_roles') as any)
    .upsert({ user_id: user.id, role: 'hunter', is_active: true }, { onConflict: 'user_id,role' })

  revalidatePath('/hunter')
  return { success: true }
}
