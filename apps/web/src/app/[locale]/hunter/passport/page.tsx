import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations } from 'next-intl/server'
import { PassportPageClient } from './passport-page-client'

export default async function PassportPage() {
  const t = await getTranslations('hunterPassport')
  const ti = await getTranslations('intake')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const [profileResult, userResult] = await Promise.all([
    (supabase.from('hunter_profiles') as any)
      .select('intent, budget_min, budget_max, target_areas, property_types, min_bedrooms, must_haves, dealbreakers, finance_status, timeline')
      .eq('user_id', userId)
      .maybeSingle(),
    (supabase.from('users') as any)
      .select('full_name')
      .eq('id', userId)
      .maybeSingle(),
  ])

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
    opt_buy: 'Buy',
    opt_rent: 'Rent',
    opt_east_london: 'East London',
    opt_north_london: 'North London',
    opt_south_east_london: 'South East London',
    opt_zone_2: 'Zone 2',
    opt_zone_3: 'Zone 3',
    opt_west_london: 'West London',
    opt_south_west_london: 'South West London',
    opt_flat: 'Flat',
    opt_terraced: 'Terraced',
    opt_semi_detached: 'Semi-detached',
    opt_detached: 'Detached',
    opt_new_build: 'New build',
    opt_period: 'Period',
    opt_studio: 'Studio',
    opt_1br: '1 bed',
    opt_2br: '2 beds',
    opt_3br: '3 beds',
    opt_4plus: '4+ beds',
    opt_balcony: 'Balcony',
    opt_near_station: 'Near station',
    opt_garden: 'Garden',
    opt_parking: 'Parking',
    opt_ev_charging: 'EV charging',
    opt_period_features: 'Period features',
    opt_open_plan: 'Open plan',
    opt_guest_wc: 'Guest WC',
    opt_storage: 'Storage',
    opt_quiet_street: 'Quiet street',
    opt_no_auctions: 'No auctions',
    opt_no_retirement: 'No retirement homes',
    opt_no_ground_floor: 'No ground floor',
    opt_no_top_floor_no_lift: 'No top floor without lift',
    opt_no_shared_ownership: 'No shared ownership',
    opt_no_ex_social: 'No ex-social',
    opt_no_estate_only: 'No estate-agency only',
    opt_not_specified: 'Not specified',
    opt_mortgage_pending: 'Mortgage in progress',
    opt_mortgage_approved: 'Mortgage in principle',
    opt_cash: 'Cash buyer',
    opt_asap: 'As soon as possible',
    opt_3m: '3 months',
    opt_6m: '3–6 months',
    opt_1y: '1 year',
    opt_flexible: 'Flexible',
  }

  return (
    <PassportPageClient
      userId={userId}
      profile={profileResult.data}
      userName={userResult.data?.full_name ?? null}
      translations={intakeTranslations}
    />
  )
}
