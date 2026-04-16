import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { AgreementForm } from './agreement-form'

export default async function PartnerAgreementPage() {
  const t = await getTranslations('partnerAgreement')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Check if already signed
  const { data: profile } = await (supabase as any)
    .from('agent_profiles')
    .select('partner_agreement_signed_at, partner_agreement_version, agency_name')
    .eq('user_id', userId)
    .maybeSingle()

  if (profile?.partner_agreement_signed_at) {
    redirect('/agent')
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">{t('title')}</h1>
        <p className="text-text-secondary text-sm">{t('subtitle')}</p>
      </div>

      {/* Agreement content */}
      <div className="bg-surface rounded-2xl border border-border-default overflow-hidden mb-6">
        {/* Section 1: Data Handling */}
        <div className="p-6 border-b border-border-default">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-xs font-bold text-text-primary">1</div>
            <h2 className="text-base font-bold">{t('section1Title')}</h2>
          </div>
          <div className="text-sm text-text-secondary space-y-2">
            <p>{t('section1Point1')}</p>
            <p>{t('section1Point2')}</p>
            <p>{t('section1Point3')}</p>
          </div>
        </div>

        {/* Section 2: Portal Pre-authorisation */}
        <div className="p-6 border-b border-border-default">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-xs font-bold text-text-primary">2</div>
            <h2 className="text-base font-bold">{t('section2Title')}</h2>
          </div>
          <div className="text-sm text-text-secondary space-y-2">
            <p>{t('section2Point1')}</p>
            <p>{t('section2Point2')}</p>
            <p>{t('section2Point3')}</p>
          </div>
        </div>

        {/* Section 3: Platform Rules */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-xs font-bold text-text-primary">3</div>
            <h2 className="text-base font-bold">{t('section3Title')}</h2>
          </div>
          <div className="text-sm text-text-secondary space-y-2">
            <p>{t('section3Point1')}</p>
            <p>{t('section3Point2')}</p>
            <p>{t('section3Point3')}</p>
          </div>
        </div>
      </div>

      {/* Version notice */}
      <p className="text-xs text-[#999] mb-4">{t('versionNotice')}</p>

      {/* Signing form */}
      <AgreementForm agencyName={profile?.agency_name ?? ''} />
    </div>
  )
}
