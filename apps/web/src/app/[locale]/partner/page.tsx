import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function PartnerDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const t = await getTranslations()
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Preview phase: no role gate. Render the partner dashboard for any visitor.

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

  // Fetch partner profile completeness
  const { data: partnerProfile } = await (supabase as any)
    .from('partner_profiles')
    .select('id, business_name, categories, service_area_radius')
    .eq('user_id', userId)
    .single()

  const profileComplete = !!(
    partnerProfile?.business_name &&
    partnerProfile?.categories &&
    partnerProfile?.service_area_radius
  )

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

      {/* Profile Alert */}
      {!profileComplete && (
        <div className="mb-6 p-4 bg-[#FEF3C7] border border-[#F59E0B] rounded-lg">
          <p className="text-sm font-semibold text-[#92400E] mb-2">
            {t('partnerDash.completeProfile')}
          </p>
          <p className="text-xs text-[#92400E] mb-3">
            {t('partnerDash.profileHelper')}
          </p>
          <Link
            href={`${locale === 'de' ? '' : '/en'}/partner/profile`}
            className="inline-block px-4 py-2 bg-[#F59E0B] text-white text-sm font-bold rounded-lg hover:bg-[#D97706] transition"
          >
            {t('partnerDash.updateProfile')} →
          </Link>
        </div>
      )}

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* View Requests */}
        <Link
          href={`${locale === 'de' ? '' : '/en'}/partner/requests`}
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
              {activeCount} {locale === 'de' ? 'aktiv' : 'active'}
            </span>
          </div>
        </Link>

        {/* Manage Profile */}
        <Link
          href={`${locale === 'de' ? '' : '/en'}/partner/profile`}
          className="bg-surface rounded-xl p-6 border border-border-default hover:shadow-md transition block"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold">
              {t('partnerDash.manageProfile')}
            </h3>
            <span className="text-2xl">→</span>
          </div>
          <p className="text-xs text-text-secondary">
            {t('partnerDash.manageProfileDesc')}
          </p>
          <div className="mt-4 pt-4 border-t border-border-default">
            <span
              className="text-sm font-bold"
              style={{
                color: profileComplete ? '#16A34A' : '#D4764E',
              }}
            >
              {profileComplete
                ? t('partnerDash.profileActive')
                : t('partnerDash.profileIncomplete')}
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
            href={`${locale === 'de' ? '' : '/en'}/partner/requests`}
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
              href={`${locale === 'de' ? '' : '/en'}/partner/profile`}
              className="inline-block px-4 py-2 bg-brand text-black text-sm font-bold rounded-lg hover:bg-brand-hover transition"
            >
              {t('partnerDash.createProfile')}
            </Link>
            <Link
              href={`${locale === 'de' ? '' : '/en'}/partner/requests`}
              className="inline-block px-4 py-2 border border-[#D8DBE5] text-text-secondary text-sm font-bold rounded-lg hover:bg-hover-bg transition"
            >
              {t('partnerDash.browseRequestsBtn')}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
