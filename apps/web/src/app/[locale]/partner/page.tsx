import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import Link from 'next/link'

export default async function PartnerDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Preview phase: no role gate. Render the partner dashboard for any visitor.

  // Fetch active requests count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: activeRequests } = await (supabase as any)
    .from('service_requests')
    .select('id')
    .eq('partner_id', userId)
    .in('status', ['pending', 'quoted', 'accepted', 'in_progress'])

  const activeCount = activeRequests?.length ?? 0

  // Fetch completed requests count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const isLocaleDE = locale === 'de'

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">
          {isLocaleDE ? 'Partner Dashboard' : 'Partner Dashboard'}
        </h1>
        <p className="text-[#5E6278] text-sm">
          {isLocaleDE
            ? 'Überblick über Ihre Aktivität und Anfragen'
            : 'Overview of your activity and requests'
          }
        </p>
      </div>

      {/* Profile Alert */}
      {!profileComplete && (
        <div className="mb-6 p-4 bg-[#FEF3C7] border border-[#F59E0B] rounded-lg">
          <p className="text-sm font-semibold text-[#92400E] mb-2">
            {isLocaleDE ? 'Vollständigen Sie Ihr Profil' : 'Complete Your Profile'}
          </p>
          <p className="text-xs text-[#92400E] mb-3">
            {isLocaleDE
              ? 'Ein vollständiges Profil hilft Ihnen, mehr Anfragen zu erhalten.'
              : 'A complete profile helps you receive more service requests.'}
          </p>
          <Link
            href={`${isLocaleDE ? '' : '/en'}/partner/profile`}
            className="inline-block px-4 py-2 bg-[#F59E0B] text-white text-sm font-bold rounded-lg hover:bg-[#D97706] transition"
          >
            {isLocaleDE ? 'Profil aktualisieren' : 'Update Profile'} →
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Active Requests */}
        <div className="bg-surface rounded-lg p-5 border border-[#E2E4EB] text-center">
          <p className="text-3xl font-bold text-[#FFD400]">{activeCount}</p>
          <p className="text-xs text-[#5E6278] mt-1">
            {isLocaleDE ? 'Aktive Anfragen' : 'Active Requests'}
          </p>
        </div>

        {/* Completed Jobs */}
        <div className="bg-surface rounded-lg p-5 border border-[#E2E4EB] text-center">
          <p className="text-3xl font-bold text-[#16A34A]">{completedCount}</p>
          <p className="text-xs text-[#5E6278] mt-1">
            {isLocaleDE ? 'Abgeschlossen' : 'Completed'}
          </p>
        </div>

        {/* Average Rating */}
        <div className="bg-surface rounded-lg p-5 border border-[#E2E4EB] text-center">
          <p className="text-3xl font-bold">
            {averageRating ? `${averageRating}` : '—'}
          </p>
          <p className="text-xs text-[#5E6278] mt-1">
            {isLocaleDE ? 'Bewertung' : 'Avg Rating'}
          </p>
        </div>

        {/* Profile Status */}
        <div className="bg-surface rounded-lg p-5 border border-[#E2E4EB] text-center">
          <p className="text-3xl font-bold">
            <span
              className="inline-block w-4 h-4 rounded-full"
              style={{
                backgroundColor: profileComplete ? '#16A34A' : '#FFD400',
              }}
            />
          </p>
          <p className="text-xs text-[#5E6278] mt-1">
            {isLocaleDE
              ? profileComplete
                ? 'Profil aktiv'
                : 'Unvollständig'
              : profileComplete
                ? 'Active'
                : 'Incomplete'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* View Requests */}
        <Link
          href={`${isLocaleDE ? '' : '/en'}/partner/requests`}
          className="bg-surface rounded-xl p-6 border border-[#E2E4EB] hover:shadow-md transition block"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold">
              {isLocaleDE ? 'Service-Anfragen' : 'Service Requests'}
            </h3>
            <span className="text-2xl">→</span>
          </div>
          <p className="text-xs text-[#5E6278]">
            {isLocaleDE
              ? 'Verfügbare Anfragen durchsuchen und Angebote einreichen'
              : 'Browse available requests and submit quotes'}
          </p>
          <div className="mt-4 pt-4 border-t border-[#E2E4EB]">
            <span className="text-sm font-bold text-[#FFD400]">
              {activeCount} {isLocaleDE ? 'aktiv' : 'active'}
            </span>
          </div>
        </Link>

        {/* Manage Profile */}
        <Link
          href={`${isLocaleDE ? '' : '/en'}/partner/profile`}
          className="bg-surface rounded-xl p-6 border border-[#E2E4EB] hover:shadow-md transition block"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold">
              {isLocaleDE ? 'Mein Profil' : 'My Profile'}
            </h3>
            <span className="text-2xl">→</span>
          </div>
          <p className="text-xs text-[#5E6278]">
            {isLocaleDE
              ? 'Geschäftsinformationen und Leistungen verwalten'
              : 'Manage business info and services'}
          </p>
          <div className="mt-4 pt-4 border-t border-[#E2E4EB]">
            <span
              className="text-sm font-bold"
              style={{
                color: profileComplete ? '#16A34A' : '#FFD400',
              }}
            >
              {profileComplete
                ? isLocaleDE
                  ? 'Aktiv'
                  : 'Active'
                : isLocaleDE
                  ? 'Unvollständig'
                  : 'Incomplete'}
            </span>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      {activeCount > 0 && (
        <div className="bg-surface rounded-xl border border-[#E2E4EB] p-6">
          <h2 className="text-lg font-bold mb-4">
            {isLocaleDE ? 'Aktuelle Aktivität' : 'Recent Activity'}
          </h2>
          <p className="text-sm text-[#5E6278] mb-4">
            {isLocaleDE
              ? 'Sie haben aktive Anfragen. Gehen Sie zu Service-Anfragen, um auf neue Möglichkeiten zu reagieren.'
              : 'You have active requests. Go to Service Requests to respond to new opportunities.'}
          </p>
          <Link
            href={`${isLocaleDE ? '' : '/en'}/partner/requests`}
            className="inline-block px-4 py-2 bg-brand text-black text-sm font-bold rounded-lg hover:bg-[#E6C200] transition"
          >
            {isLocaleDE ? 'Anfragen ansehen' : 'View Requests'} →
          </Link>
        </div>
      )}

      {/* Empty State */}
      {activeCount === 0 && completedCount === 0 && (
        <div className="bg-surface rounded-xl border border-[#E2E4EB] p-12 text-center">
          <p className="text-[#5E6278] font-medium mb-2">
            {isLocaleDE ? 'Willkommen bei Yalla Partners' : 'Welcome to Yalla Partners'}
          </p>
          <p className="text-xs text-[#999] mb-4">
            {isLocaleDE
              ? 'Beginnen Sie mit der Vervollständigung Ihres Profils und schauen Sie sich verfügbare Service-Anfragen an.'
              : 'Get started by completing your profile and browsing available service requests.'}
          </p>
          <div className="flex gap-2 justify-center">
            <Link
              href={`${isLocaleDE ? '' : '/en'}/partner/profile`}
              className="inline-block px-4 py-2 bg-brand text-black text-sm font-bold rounded-lg hover:bg-[#E6C200] transition"
            >
              {isLocaleDE ? 'Profil erstellen' : 'Create Profile'}
            </Link>
            <Link
              href={`${isLocaleDE ? '' : '/en'}/partner/requests`}
              className="inline-block px-4 py-2 border border-[#D8DBE5] text-[#5E6278] text-sm font-bold rounded-lg hover:bg-[#F5F5F7] transition"
            >
              {isLocaleDE ? 'Anfragen durchsuchen' : 'Browse Requests'}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
