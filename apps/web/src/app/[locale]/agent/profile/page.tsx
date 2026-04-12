import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations } from 'next-intl/server'
import { AgentProfilePageClient } from './profile-page-client'

export default async function AgentProfilePage() {
  const t = await getTranslations('agentProfile')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const { data: profile } = await (supabase.from('agent_profiles') as any)
    .select('agency_name, license_number, property_types, focus, verified_at, subscription_tier')
    .eq('user_id', userId)
    .maybeSingle()

  // Intake translations
  const intakeTranslations = {
    greeting: t('intakeGreeting'),
    placeholder: t('intakePlaceholder'),
    send: t('intakeSend'),
    reviewTitle: t('intakeReviewTitle'),
    reviewEditBtn: t('intakeReviewEditBtn'),
    submitBtn: t('intakeSubmitBtn'),
    errorMsg: t('intakeErrorMsg'),
    q_agency_name: t('q_agency_name'),
    err_agency_name: t('err_agency_name'),
    hint_agency_name: t('hint_agency_name'),
    q_license_number: t('q_license_number'),
    err_license_number: t('err_license_number'),
    hint_license_number: t('hint_license_number'),
    q_property_types: t('q_property_types'),
    opt_flat: t('opt_flat'),
    opt_terraced: t('opt_terraced'),
    opt_semi_detached: t('opt_semi_detached'),
    opt_detached: t('opt_detached'),
    opt_new_build: t('opt_new_build'),
    opt_commercial: t('opt_commercial'),
    q_focus: t('q_focus'),
    opt_sale: t('opt_sale'),
    opt_rent: t('opt_rent'),
    opt_both: t('opt_both'),
    q_coverage_areas: t('q_coverage_areas'),
    err_coverage_areas: t('err_coverage_areas'),
    hint_coverage_areas: t('hint_coverage_areas'),
    q_years_experience: t('q_years_experience'),
    err_years_experience: t('err_years_experience'),
    hint_years_experience: t('hint_years_experience'),
    q_team_size: t('q_team_size'),
    err_team_size: t('err_team_size'),
    hint_team_size: t('hint_team_size'),
    q_selling_points: t('q_selling_points'),
    err_selling_points: t('err_selling_points'),
    hint_selling_points: t('hint_selling_points'),
  }

  return (
    <AgentProfilePageClient
      userId={userId}
      profile={profile}
      translations={intakeTranslations}
      pageTitle={t('pageTitle')}
      pageDescription={t('pageDescription')}
    />
  )
}
