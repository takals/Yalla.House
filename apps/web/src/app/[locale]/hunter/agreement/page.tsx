import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { AgreementPage } from '@/components/agreement-page'
import { checkAgreementStatus } from '@/lib/agreements'
import { getAgreementVersion, AGREEMENT_SECTIONS } from '@/lib/agreement-config'
import { countryFromLocale } from '@/lib/detect-country'

export default async function HunterAgreementRoute() {
  const locale = await getLocale()
  const countryCode = countryFromLocale(locale)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/hunter/agreement')
  }

  const existing = await checkAgreementStatus(user.id, 'hunter_tos')

  const countryName = new Intl.DisplayNames([locale], { type: 'region' }).of(countryCode) ?? countryCode

  return (
    <AgreementPage
      agreementType="hunter_tos"
      namespace="hunterAgreement"
      sections={AGREEMENT_SECTIONS.hunter_tos}
      version={getAgreementVersion('hunter_tos')}
      locale={locale}
      countryCode={countryCode}
      countryName={countryName}
      signedAt={existing?.signed_at}
      signedName={existing?.signatory_name}
    />
  )
}
