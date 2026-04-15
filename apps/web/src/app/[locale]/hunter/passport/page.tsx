import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations } from 'next-intl/server'
import { getCountryConfig } from '@/lib/country-config'
import { PassportPageClient } from './passport-page-client'

export default async function PassportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('hunterPassport')
  const ti = await getTranslations('intake')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Resolve country from locale
  const countryCode = locale === 'de' ? 'DE' : 'GB'
  const countryConfig = getCountryConfig(countryCode)

  const [profileResult, userResult, agentsResult] = await Promise.all([
    (supabase.from('hunter_profiles') as any)
      .select('intent, budget_min, budget_max, target_areas, property_types, min_bedrooms, must_haves, dealbreakers, finance_status, timeline, mortgage_verified, identity_verified, profile_complete, renter_ready')
      .eq('user_id', userId)
      .maybeSingle(),
    (supabase.from('users') as any)
      .select('full_name')
      .eq('id', userId)
      .maybeSingle(),
    // Fetch a few real agents for the sample matches section
    (supabase.from('agent_profiles') as any)
      .select('agency_name, postcode, focus, service_types, raw_address')
      .eq('data_source', 'propertymark')
      .not('postcode', 'is', null)
      .not('agency_name', 'is', null)
      .limit(6),
  ])

  const profileData = profileResult.data

  // Build readiness from DB columns (default false if null)
  const readiness = {
    mortgage_verified: !!profileData?.mortgage_verified,
    identity_verified: !!profileData?.identity_verified,
    profile_complete: !!profileData?.profile_complete,
    renter_ready: !!profileData?.renter_ready,
  }

  // Prepare translations dict for client component
  const intakeTranslations: Record<string, string> = {
    greeting: ti('hunterPassport.greeting'),
    placeholder: ti('placeholder'),
    send: ti('send'),
    reviewTitle: ti('reviewTitle'),
    reviewEditBtn: ti('reviewEdit'),
    submitBtn: ti('submit'),
    errorMsg: ti('errorGeneric'),
    modeChat: ti('modeChat'),
    modeClassic: ti('modeClassic'),
    voiceStart: ti('voiceStart'),
    voiceStop: ti('voiceStop'),
    voiceNotSupported: ti('voiceNotSupported'),
    // Questions
    q_intent: ti('hunterPassport.intentQ'),
    q_target_areas: ti('hunterPassport.areasQ'),
    q_budget_min: ti('hunterPassport.budgetMinQ'),
    q_budget_max: ti('hunterPassport.budgetMaxQ'),
    q_property_types: ti('hunterPassport.propertyTypesQ'),
    q_min_bedrooms: ti('hunterPassport.bedroomsQ'),
    q_must_haves: ti('hunterPassport.mustHavesQ'),
    q_dealbreakers: ti('hunterPassport.dealbreakersQ'),
    q_finance_status: ti('hunterPassport.financeQ'),
    q_timeline: ti('hunterPassport.timelineQ'),
    // Option labels
    opt_buy: t('opt_buy'),
    opt_rent: t('opt_rent'),
    // Dynamic area labels — pulled from country config regions
    ...Object.fromEntries(
      countryConfig.regions.map(r => [`opt_area_${r.prefix.toLowerCase()}`, r.label])
    ),
    opt_flat: t('opt_flat'),
    opt_terraced: t('opt_terraced'),
    opt_semi_detached: t('opt_semi_detached'),
    opt_detached: t('opt_detached'),
    opt_new_build: t('opt_new_build'),
    opt_period: t('opt_period'),
    opt_studio: t('opt_studio'),
    opt_1br: t('opt_1br'),
    opt_2br: t('opt_2br'),
    opt_3br: t('opt_3br'),
    opt_4plus: t('opt_4plus'),
    opt_balcony: t('opt_balcony'),
    opt_near_station: t('opt_near_station'),
    opt_garden: t('opt_garden'),
    opt_parking: t('opt_parking'),
    opt_ev_charging: t('opt_ev_charging'),
    opt_period_features: t('opt_period_features'),
    opt_open_plan: t('opt_open_plan'),
    opt_guest_wc: t('opt_guest_wc'),
    opt_storage: t('opt_storage'),
    opt_quiet_street: t('opt_quiet_street'),
    opt_no_auctions: t('opt_no_auctions'),
    opt_no_retirement: t('opt_no_retirement'),
    opt_no_ground_floor: t('opt_no_ground_floor'),
    opt_no_top_floor_no_lift: t('opt_no_top_floor_no_lift'),
    opt_no_shared_ownership: t('opt_no_shared_ownership'),
    opt_no_ex_social: t('opt_no_ex_social'),
    opt_no_estate_only: t('opt_no_estate_only'),
    opt_not_specified: t('opt_not_specified'),
    opt_mortgage_pending: t('opt_mortgage_pending'),
    opt_mortgage_approved: t('opt_mortgage_approved'),
    opt_cash: t('opt_cash'),
    opt_asap: t('opt_asap'),
    opt_3m: t('opt_3m'),
    opt_6m: t('opt_6m'),
    opt_1y: t('opt_1y'),
    opt_flexible: t('opt_flexible'),
    // Readiness badge labels
    badge_mortgage: t('opt_mortgage_approved'),
    badge_identity: locale === 'de' ? 'Identität verifiziert' : 'Identity Verified',
    badge_profile: locale === 'de' ? 'Profil vollständig' : 'Profile Complete',
    badge_renter: locale === 'de' ? 'Mieter-bereit' : 'Renter Ready',
    badge_verify: locale === 'de' ? 'Verifizieren' : 'Verify',
    badge_complete: locale === 'de' ? 'Vervollständigen' : 'Complete',
  }

  // Format real agents for sample matches
  const sampleAgents = (agentsResult.data ?? []).map((a: { agency_name: string; postcode: string; focus: string; service_types: string[]; raw_address: string }) => ({
    name: a.agency_name,
    postcode: a.postcode,
    focus: a.focus,
    services: Array.isArray(a.service_types) ? a.service_types.slice(0, 2).join(', ') : 'Sales',
    address: a.raw_address,
  }))

  return (
    <PassportPageClient
      userId={userId}
      profile={profileData}
      userName={userResult.data?.full_name ?? null}
      translations={intakeTranslations}
      sampleAgents={sampleAgents}
      countryCode={countryCode}
      locale={locale}
      currency={countryConfig.currency}
      regions={countryConfig.regions}
      readiness={readiness}
    />
  )
}
