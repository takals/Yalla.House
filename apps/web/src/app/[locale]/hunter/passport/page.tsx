import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations } from 'next-intl/server'
import { getCountryConfig } from '@/lib/country-config'
import { countryFromLocale } from '@/lib/detect-country'
import { PassportPageClient } from './passport-page-client'

export default async function PassportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('hunterPassport')
  const ti = await getTranslations('intake')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Resolve country from locale via central config
  const countryCode = countryFromLocale(locale)
  const countryConfig = getCountryConfig(countryCode)

  const [profileResult, userResult, agentsResult] = await Promise.all([
    (supabase.from('hunter_profiles') as any)
      .select('intent, search_status, budget_min, budget_max, target_areas, property_types, min_bedrooms, must_haves, dealbreakers, finance_status, timeline, mortgage_verified, identity_verified, profile_complete, renter_ready, readiness_score, early_access_tier')
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
    q_search_status: ti('hunterPassport.searchStatusQ'),
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
    opt_actively_searching: t('opt_actively_searching'),
    opt_thinking_about_it: t('opt_thinking_about_it'),
    opt_just_exploring: t('opt_just_exploring'),
    opt_need_to_sell_first: t('opt_need_to_sell_first'),
    opt_waiting_for_right_one: t('opt_waiting_for_right_one'),
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
    badge_identity: t('badgeIdentity'),
    badge_profile: t('badgeProfile'),
    badge_renter: t('badgeRenter'),
    badge_verify: t('badgeVerify'),
    badge_complete: t('badgeComplete'),
    // Readiness & early access
    readiness_title: t('readinessTitle'),
    readiness_boost_hint: t('readinessBoostHint'),
    early_access_none: t('earlyAccessNone'),
    early_access_standard: t('earlyAccessStandard'),
    early_access_priority: t('earlyAccessPriority'),
    early_access_badge: t('earlyAccessBadge'),
    early_access_priority_badge: t('earlyAccessPriorityBadge'),
    early_access_explainer: t('earlyAccessExplainer'),
    early_access_priority_explainer: t('earlyAccessPriorityExplainer'),
    // Search status labels
    label_search_status: t('labelSearchStatus'),
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
      readinessScore={profileData?.readiness_score as number ?? 0}
      earlyAccessTier={(profileData?.early_access_tier as string) ?? 'none'}
    />
  )
}
