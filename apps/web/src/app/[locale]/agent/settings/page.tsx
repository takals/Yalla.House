import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations } from 'next-intl/server'
import { AgentSettingsClient } from './settings-client'

export default async function AgentSettingsPage() {
  const t = await getTranslations('agentSettings')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const [profileResult, agentProfileResult] = await Promise.all([
    (supabase.from('users') as any)
      .select('full_name, email, phone')
      .eq('id', userId)
      .single(),
    (supabase.from('agent_profiles') as any)
      .select('agency_name, office_address')
      .eq('user_id', userId)
      .maybeSingle(),
  ])

  const profile = profileResult.data ?? { full_name: null, email: user?.email ?? '', phone: null }
  const agentProfile = agentProfileResult.data ?? { agency_name: null, office_address: null }

  const labels: Record<string, string> = {
    profile: t('profile'),
    fullName: t('fullName'),
    email: t('email'),
    phone: t('phone'),
    saveChanges: t('saveChanges'),
    saving: t('saving'),
    profileSaved: t('profileSaved'),
    agencyName: t('agencyName'),
    agencyAddress: t('agencyAddress'),
    dangerZone: t('dangerZone'),
    deleteAccount: t('deleteAccount'),
    deleteAccountDesc: t('deleteAccountDesc'),
    delete: t('delete'),
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">{t('title')}</h1>
        <p className="text-text-secondary text-sm">{t('subtitle')}</p>
      </div>

      <AgentSettingsClient
        profile={profile}
        agentProfile={agentProfile}
        labels={labels}
      />
    </div>
  )
}
