import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { AgreementPage } from '@/components/agreement-page'
import {
  checkAgreementStatus,
  getAgreementVersion,
  AGREEMENT_SECTIONS,
} from '@/lib/agreements'
import { countryFromLocale } from '@/lib/detect-country'

export default async function PartnerAgreementRoute() {
  const locale = await getLocale()
  const countryCode = countryFromLocale(locale)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/partner/agreement')
  }

  const existing = await checkAgreementStatus(user.id, 'provider_agreement')

  const countryName = new Intl.DisplayNames([locale], { type: 'region' }).of(countryCode) ?? countryCode

  return (
    <AgreementPage
      agreementType="provider_agreement"
      namespace="providerAgreement"
      sections={AGREEMENT_SECTIONS.provider_agreement}
      version={getAgreementVersion('provider_agreement')}
      locale={locale}
      countryCode={countryCode}
      countryName={countryName}
      signedAt={existing?.signed_at}
      signedName={existing?.signatory_name}
    />
  )
}
