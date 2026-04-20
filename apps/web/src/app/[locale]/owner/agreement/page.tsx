import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { AgreementPage } from '@/components/agreement-page'
import { checkAgreementStatus } from '@/lib/agreements'
import { getAgreementVersion, AGREEMENT_SECTIONS } from '@/lib/agreement-config'
import { countryFromLocale } from '@/lib/detect-country'

export default async function OwnerAgreementRoute() {
  const locale = await getLocale()
  const countryCode = countryFromLocale(locale)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/owner/agreement')
  }

  const existing = await checkAgreementStatus(user.id, 'owner_tos')

  const countryName = new Intl.DisplayNames([locale], { type: 'region' }).of(countryCode) ?? countryCode

  return (
    <AgreementPage
      agreementType="owner_tos"
      namespace="ownerAgreement"
      sections={AGREEMENT_SECTIONS.owner_tos}
      version={getAgreementVersion('owner_tos')}
      locale={locale}
      countryCode={countryCode}
      countryName={countryName}
      signedAt={existing?.signed_at}
      signedName={existing?.signatory_name}
    />
  )
}
