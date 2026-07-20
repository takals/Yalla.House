import { createClient, createServiceClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations } from 'next-intl/server'
import { AgentProfilePageClient } from './profile-page-client'
import { ClaimCard, type ClaimCandidate } from './claim-card'
import { VerificationPanel } from './verification-panel'
import { NewsletterToggle } from './newsletter-toggle'
import { isCompanyEmail, emailMatchesWebsite, registrableDomain } from '@/lib/email-domain'

export default async function AgentProfilePage() {
  const t = await getTranslations('agentProfile')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const { data: profile } = await (supabase.from('agent_profiles') as any)
    .select('agency_name, license_number, property_types, focus, verified_at, subscription_tier, website')
    .eq('user_id', userId)
    .maybeSingle()

  // Company-email verification: instant path when the account email is already
  // a business domain (magic-link signup proved inbox control) and — if a
  // website is on file — matches its domain.
  const accountEmail = user?.email ?? null
  const canInstant =
    !!user && !!profile && !profile.verified_at && isCompanyEmail(accountEmail) &&
    (!profile.website || !registrableDomain(profile.website) || emailMatchesWebsite(accountEmail, profile.website))

  // Newsletter opt-in state + latest verification attempt
  let newsletterOptIn = false
  let lastVerificationReason: string | null = null
  if (user) {
    const service = createServiceClient()
    const { data: u } = await (service.from('users') as any)
      .select('newsletter_opt_in').eq('id', user.id).maybeSingle()
    newsletterOptIn = !!u?.newsletter_opt_in
    if (profile && !profile.verified_at) {
      const { data: v } = await (service.from('agent_verifications') as any)
        .select('reason, status').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(1).maybeSingle()
      if (v && v.status !== 'approved') lastVerificationReason = v.reason ?? null
    }
  }

  // Claim flow: a signed-in agent with no profile whose email matches an
  // unclaimed scraped directory entry can claim it (email = proof of control).
  let claimCandidates: ClaimCandidate[] = []
  if (user?.email && !profile) {
    const emailPattern = user.email.trim().replace(/([%_\\])/g, '\\$1')
    const service = createServiceClient()
    const { data: matches } = await (service.from('agent_profiles') as any)
      .select('user_id, agency_name, raw_address, postcode, website')
      .ilike('email', emailPattern)
      .not('data_source', 'is', null)
      .is('claimed_at', null)
      .limit(5)
    claimCandidates = matches ?? []
  }

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
    <>
      {claimCandidates.length > 0 && <ClaimCard candidates={claimCandidates} />}
      {user && profile && !profile.verified_at && (
        <VerificationPanel canInstant={canInstant} accountEmail={accountEmail} lastReason={lastVerificationReason} />
      )}
      {user && <NewsletterToggle initial={newsletterOptIn} />}
      <AgentProfilePageClient
        userId={userId}
        profile={profile}
        translations={intakeTranslations}
        pageTitle={t('pageTitle')}
        pageDescription={t('pageDescription')}
      />
    </>
  )
}
