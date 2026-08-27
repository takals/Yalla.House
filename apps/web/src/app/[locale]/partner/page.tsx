import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { CoveragePanel } from './coverage-panel'

export default async function PartnerDashboardPage() {
  const t = await getTranslations()
  const locale = await getLocale()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // Guests see the dashboard with its empty state. The Provider Agreement is
  // asked for when they quote on their first job, not when they look around.
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch active requests count
  const { data: activeRequests } = await (supabase as any)
    .from('service_requests')
    .select('id')
    .eq('partner_id', userId)
    .in('status', ['pending', 'quoted', 'accepted', 'in_progress'])

  const activeCount = activeRequests?.length ?? 0

  // Fetch completed requests count
  const { data: completedRequests } = await (supabase as any)
    .from('service_requests')
    .select('id, rating')
    .eq('partner_id', userId)
    .eq('status', 'completed')

  const completedCount = completedRequests?.length ?? 0
  const averageRating =
    completedCount > 0
      ? (
          completedRequests!.reduce((sum: number, r: { rating: number | null }) => sum + (r.rating || 0), 0) /
          completedRequests!.length
        ).toFixed(1)
      : null

  // Fetch the partner's routing profile.
  //
  // This query used to select id, business_name, categories and
  // service_area_radius — none of which exist on partner_profiles. It errored
  // every time, so profileComplete was always false, so every provider saw
  // "Complete your profile" pointing at /partner/profile, which was a 404.
  // These are the real columns, and they are the two that decide whether a
  // provider is matched to a job.
  const [{ data: partnerProfile }, { data: rawCategories }] = await Promise.all([
    (supabase as any)
      .from('partner_profiles')
      .select('service_types, coverage_areas, verified_at')
      .eq('user_id', userId)
      .maybeSingle(),
    (supabase as any)
      .from('service_categories')
      .select('slug, name_en, name_de')
      .order('sort_order'),
  ])

  const serviceTypes: string[] = Array.isArray(partnerProfile?.service_types)
    ? partnerProfile.service_types
    : []

  // Stored as [{ postcode_prefixes: [...] }] — the shape the router reads.
  const coverageAreas = Array.isArray(partnerProfile?.coverage_areas)
    ? partnerProfile.coverage_areas
    : []
  const postcodePrefixes: string[] = coverageAreas
    .flatMap((area: { postcode_prefixes?: string[] }) => area?.postcode_prefixes ?? [])

  const profileComplete = serviceTypes.length > 0 && postcodePrefixes.length > 0

  const categoryOptions = ((rawCategories ?? []) as { slug: string; name_en: string; name_de: string }[])
    .map(c => ({ slug: c.slug, label: locale === 'de' ? c.name_de : c.name_en }))

  const coverageLabels: Record<string, string> = {
    coverageTitle: t('partnerDash.coverageTitle'),
    coverageHint: t('partnerDash.coverageHint'),
    categoriesLabel: t('partnerDash.categoriesLabel'),
    postcodesLabel: t('partnerDash.postcodesLabel'),
    postcodesHint: t('partnerDash.postcodesHint'),
    postcodesPlaceholder: t('partnerDash.postcodesPlaceholder'),
    save: t('partnerDash.saveCoverage'),
    saving: t('partnerDash.savingCoverage'),
    saved: t('partnerDash.savedCoverage'),
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">
          {t('partnerDash.pageTitle')}
        </h1>
        <p className="text-text-secondary text-sm">
          {t('partnerDash.pageSubtitle')}
        </p>
      </div>

      {/* Profile Alert — points at the panel below, not a page that never existed */}
      {!profileComplete && (
        <div className="mb-6 p-4 bg-[#FEF3C7] border border-[#F59E0B] rounded-lg">
          <p className="text-sm font-semibold text-[#92400E] mb-1">
            {t('partnerDash.completeProfile')}
          </p>
          <p className="text-xs text-[#92400E]">
            {t('partnerDash.profileHelper')}
          </p>
        </div>
      )}

      {/* Services + coverage, edited in place */}
      <CoveragePanel
        categories={categoryOptions}
        initialSelected={serviceTypes}
        initialPostcodes={postcodePrefixes.join(', ')}
        labels={coverageLabels}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Active Requests */}
        <div className="bg-surface rounded-lg p-5 border border-border-default text-center">
          <p className="text-3xl font-bold text-brand">{activeCount}</p>
          <p className="text-xs text-text-secondary mt-1">
            {t('partnerDash.activeRequests')}
          </p>
        </div>

        {/* Completed Jobs */}
        <div className="bg-surface rounded-lg p-5 border border-border-default text-center">
          <p className="text-3xl font-bold text-[#16A34A]">{completedCount}</p>
          <p className="text-xs text-text-secondary mt-1">
            {t('partnerDash.completed')}
          </p>
        </div>

        {/* Average Rating */}
        <div className="bg-surface rounded-lg p-5 border border-border-default text-center">
          <p className="text-3xl font-bold">
            {averageRating ? `${averageRating}` : '—'}
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {t('partnerDash.avgRating')}
          </p>
        </div>

        {/* Profile Status */}
        <div className="bg-surface rounded-lg p-5 border border-border-default text-center">
          <p className="text-3xl font-bold">
            <span
              className="inline-block w-4 h-4 rounded-full"
              style={{
                backgroundColor: profileComplete ? '#16A34A' : '#D4764E',
              }}
            />
          </p>
          <p className="text-xs text-text-secondary mt-1">
            {profileComplete
              ? t('partnerDash.profileActive')
              : t('partnerDash.profileIncomplete')}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        {/* View Requests */}
        <Link
          href="/partner/requests"
          className="bg-surface rounded-xl p-6 border border-border-default hover:shadow-md transition block"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold">
              {t('partnerDash.serviceRequests')}
            </h3>
            <span className="text-2xl">→</span>
          </div>
          <p className="text-xs text-text-secondary">
            {t('partnerDash.browseRequests')}
          </p>
          <div className="mt-4 pt-4 border-t border-border-default">
            <span className="text-sm font-bold text-brand">
              {activeCount} {t('partnerDash.active')}
            </span>
          </div>
        </Link>

      </div>

      {/* Recent Activity */}
      {activeCount > 0 && (
        <div className="bg-surface rounded-xl border border-border-default p-6">
          <h2 className="text-lg font-bold mb-4">
            {t('partnerDash.recentActivity')}
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            {t('partnerDash.activeRequestsMsg')}
          </p>
          <Link
            href="/partner/requests"
            className="inline-block px-4 py-2 bg-brand text-black text-sm font-bold rounded-lg hover:bg-brand-hover transition"
          >
            {t('partnerDash.viewRequests')} →
          </Link>
        </div>
      )}

      {/* Empty State */}
      {activeCount === 0 && completedCount === 0 && (
        <div className="bg-surface rounded-xl border border-border-default p-12 text-center">
          <p className="text-text-secondary font-medium mb-2">
            {t('partnerDash.welcomePartner')}
          </p>
          <p className="text-xs text-text-muted mb-4">
            {t('partnerDash.getStarted')}
          </p>
          <div className="flex gap-2 justify-center">
            <Link
              href="/partner/requests"
              className="inline-block px-4 py-2 bg-brand text-white text-sm font-bold rounded-lg hover:bg-brand-hover transition"
            >
              {t('partnerDash.browseRequestsBtn')}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
