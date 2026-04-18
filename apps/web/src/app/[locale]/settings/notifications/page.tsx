import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { redirect } from 'next/navigation'
import { NotificationPreferencesForm } from './preferences-form'

const defaultPrefs = {
  emailEnabled: true,
  smsEnabled: true,
  whatsappEnabled: true,
  phoneNumber: null as string | null,
  phoneVerified: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
}

export default async function NotificationPreferencesPage() {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    redirect('/login')
  }

  const supabase = await createClient()
  const { data: row } = await (supabase.from('notification_preferences') as unknown as {
    select: (cols: string) => { eq: (col: string, val: string) => { single: () => Promise<{ data: Record<string, unknown> | null }> } }
  })
    .select('*')
    .eq('user_id', auth.userId)
    .single()

  const prefs = row
    ? {
        emailEnabled: (row.email_enabled as boolean) ?? defaultPrefs.emailEnabled,
        smsEnabled: (row.sms_enabled as boolean) ?? defaultPrefs.smsEnabled,
        whatsappEnabled: (row.whatsapp_enabled as boolean) ?? defaultPrefs.whatsappEnabled,
        phoneNumber: (row.phone_number as string | null) ?? defaultPrefs.phoneNumber,
        phoneVerified: (row.phone_verified as boolean) ?? defaultPrefs.phoneVerified,
        quietHoursStart: (row.quiet_hours_start as string | null) ?? defaultPrefs.quietHoursStart,
        quietHoursEnd: (row.quiet_hours_end as string | null) ?? defaultPrefs.quietHoursEnd,
      }
    : defaultPrefs

  const t = await getTranslations('notificationPreferences')

  const labels: Record<string, string> = {
    title: t('title'),
    channelSettingsTitle: t('channelSettingsTitle'),
    emailToggle: t('emailToggle'),
    emailDesc: t('emailDesc'),
    smsToggle: t('smsToggle'),
    smsDesc: t('smsDesc'),
    whatsappToggle: t('whatsappToggle'),
    whatsappDesc: t('whatsappDesc'),
    phoneTitle: t('phoneTitle'),
    phoneVerified: t('phoneVerified'),
    phoneChange: t('phoneChange'),
    phonePlaceholder: t('phonePlaceholder'),
    sendCode: t('sendCode'),
    verifyCode: t('verifyCode'),
    codePlaceholder: t('codePlaceholder'),
    codeHint: t('codeHint'),
    quietHoursTitle: t('quietHoursTitle'),
    quietHoursDesc: t('quietHoursDesc'),
    quietHoursNote: t('quietHoursNote'),
    quietHoursFrom: t('quietHoursFrom'),
    quietHoursTo: t('quietHoursTo'),
    save: t('save'),
    saved: t('saved'),
    saving: t('saving'),
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{labels.title}</h1>
      <NotificationPreferencesForm initialPrefs={prefs} labels={labels} />
    </div>
  )
}
