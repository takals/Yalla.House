import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { AgreementPage } from '@/components/agreement-page'
import {
  checkAgreementStatus,
  getAgreementVersion,
  AGREEMENT_SECTIONS,
} from '@/lib/agreements'
import { countryFromLocale } from '@/lib/detect-country'
import { getCountryConfig } from '@/lib/country-config'

export default async function AgentAgreementRoute() {
  const locale = await getLocale()
  const countryCode = countryFromLocale(locale)
  const config = getCountryConfig(countryCode)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Check if already signed via the universal agreements table
  const existing = await checkAgreementStatus(userId, 'agent_partner')

  if (existing && user) {
    redirect('/agent')
  }

  // Fetch agency name for display
  const { data: profile } = await (supabase as any)
    .from('agent_profiles')
    .select('agency_name')
    .eq('user_id', userId)
    .maybeSingle()

  // Country name for governing law clause
  const countryName = new Intl.DisplayNames([locale], { type: 'region' }).of(countryCode) ?? countryCode

  return (
    <AgreementPage
      agreementType="agent_partner"
      namespace="agentAgreement"
      sections={AGREEMENT_SECTIONS.agent_partner}
      version={getAgreementVersion('agent_partner')}
      locale={locale}
      countryCode={countryCode}
      countryName={countryName}
      signedAt={existing?.signed_at}
      signedName={existing?.signatory_name}
      extraLabel={profile?.agency_name ? config.legal_entity : undefined}
      extraValue={profile?.agency_name ?? undefined}
    />
  )
}
