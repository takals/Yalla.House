import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import Link from 'next/link'
import { QuoteForm } from './quote-form'
import { Star } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { dateLocaleFromLocale } from '@/lib/country-config'

function formatRelativeTime(date: Date, locale: string): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.round(diffMs / 1000)
  const abs = Math.abs(diffSec)
  const rtf = new Intl.RelativeTimeFormat(locale === 'de' ? 'de' : 'en', { numeric: 'auto' })
  if (abs < 60) return rtf.format(-diffSec, 'second')
  if (abs < 3600) return rtf.format(-Math.round(diffSec / 60), 'minute')
  if (abs < 86400) return rtf.format(-Math.round(diffSec / 3600), 'hour')
  if (abs < 2592000) return rtf.format(-Math.round(diffSec / 86400), 'day')
  if (abs < 31536000) return rtf.format(-Math.round(diffSec / 2592000), 'month')
  return rtf.format(-Math.round(diffSec / 31536000), 'year')
}

interface ServiceRequest {
  id: string
  requester_id: string
  category: string
  title: string
  description: string | null
  preferred_date: string | null
  status: 'pending' | 'quoted' | 'accepted' | 'in_progress' | 'completed' | 'cancelled'
  partner_id: string | null
  quoted_amount: number | null
  currency: string | null
  rating: number | null
  review: string | null
  created_at: string
  updated_at: string
  listings: {
    address_line1: string | null
    city: string | null
    postcode: string | null
  } | null
  requester: {
    id: string
    full_name: string | null
  } | null
}

const categoryColors: Record<string, { bg: string; text: string; dot: string }> = {
  photography: { bg: '#DBEAFE', text: '#1E40AF', dot: '#0284C7' },
  floorplan: { bg: '#DBEAFE', text: '#1E40AF', dot: '#0284C7' },
  epc: { bg: '#DCFCE7', text: '#166534', dot: '#16A34A' },
  survey: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  conveyancing: { bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' },
  cleaning: { bg: '#F3F4F6', text: '#374151', dot: '#6B7280' },
  staging: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  drone: { bg: '#DBEAFE', text: '#1E40AF', dot: '#0284C7' },
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Open', bg: '#FFF5EE', text: '#8B4513' },
  quoted: { label: 'Quoted', bg: '#DBEAFE', text: '#1E40AF' },
  accepted: { label: 'Accepted', bg: '#DCFCE7', text: '#166534' },
  in_progress: { label: 'In Progress', bg: '#FEF3C7', text: '#92400E' },
  completed: { label: 'Completed', bg: '#F3F4F6', text: '#374151' },
  cancelled: { label: 'Cancelled', bg: '#F3F4F6', text: '#6B7280' },
}

export default async function PartnerRequestsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('partner')
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch service requests
  const { data: requests } = await (supabase as any)
    .from('service_requests')
    .select(`
      id, requester_id, category, title, description,
      preferred_date, status, partner_id, quoted_amount, currency,
      rating, review, created_at, updated_at,
      listings(address_line1, city, postcode),
      requester:users!requester_id(id, full_name)
    `)
    .or(`partner_id.eq.${userId},partner_id.is.null`)
    .order('created_at', { ascending: false })

  const allRequests = (requests ?? []) as ServiceRequest[]

  // Group requests
  const available = allRequests.filter(r => r.partner_id === null)
  const myActive = allRequests.filter(
    r => r.partner_id === userId && ['pending', 'quoted', 'accepted', 'in_progress'].includes(r.status)
  )
  const completed = allRequests.filter(
    r => r.partner_id === userId && ['completed', 'cancelled'].includes(r.status)
  ).slice(0, 10)

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">{t('pageTitle')}</h1>
        <p className="text-text-secondary text-sm">
          {t('pageDescription')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-surface rounded-lg p-4 border border-border-default text-center">
          <p className="text-2xl font-bold text-[#0284C7]">{available.length}</p>
          <p className="text-xs text-text-secondary">{t('statAvailable')}</p>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-border-default text-center">
          <p className="text-2xl font-bold text-brand">{myActive.length}</p>
          <p className="text-xs text-text-secondary">{t('statActive')}</p>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-border-default text-center">
          <p className="text-2xl font-bold text-[#16A34A]">{completed.length}</p>
          <p className="text-xs text-text-secondary">{t('statCompleted')}</p>
        </div>
      </div>

      {/* Available Requests */}
      {available.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
            {t('sectionAvailable')} ({available.length})
          </h2>
          <div className="space-y-3">
            {available.map((request) => {
              const colors = categoryColors[request.category] || categoryColors.photography
              const address = request.listings
                ? `${request.listings.address_line1}, ${request.listings.city}, ${request.listings.postcode}`
                : request.title
              const requesterName = request.requester?.full_name || 'Unknown'

              return (
                <div
                  key={request.id}
                  className="bg-surface rounded-xl border-2 border-[#0284C7]/40 p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: colors?.bg || '#DBEAFE', color: colors?.text || '#1E40AF' }}
                      >
                        {request.category.charAt(0).toUpperCase() + request.category.slice(1)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{request.title}</p>
                        <p className="text-xs text-text-secondary">{address}</p>
                      </div>
                    </div>
                    <span className="text-xs text-text-muted">
                      {formatRelativeTime(new Date(request.created_at), locale)}
                    </span>
                  </div>

                  {request.description && (
                    <p className="text-xs text-text-secondary bg-hover-bg rounded-lg p-2 mb-3">
                      {request.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div>
                      <span className="text-text-secondary font-semibold">
                        {t('labelRequester')}
                      </span>{' '}
                      {requesterName}
                    </div>
                    <div>
                      <span className="text-text-secondary font-semibold">
                        {t('labelPreferredDate')}
                      </span>{' '}
                      {request.preferred_date
                        ? new Date(request.preferred_date).toLocaleDateString(
                            dateLocaleFromLocale(locale)
                          )
                        : t('labelFlexible')}
                    </div>
                  </div>

                  <QuoteForm requestId={request.id} category={request.category} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* My Active Requests */}
      {myActive.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand" />
            {t('sectionMyActive')} ({myActive.length})
          </h2>
          <div className="space-y-3">
            {myActive.map((request) => {
              const statusInfo = statusConfig[request.status] || statusConfig.pending
              const colors = categoryColors[request.category] || categoryColors.photography
              const address = request.listings
                ? `${request.listings.address_line1}, ${request.listings.city}`
                : request.title

              return (
                <div
                  key={request.id}
                  className="bg-surface rounded-xl border border-border-default p-5 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: colors?.bg || '#DBEAFE', color: colors?.text || '#1E40AF' }}
                      >
                        {request.category.charAt(0).toUpperCase() + request.category.slice(1)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{request.title}</p>
                        <p className="text-xs text-text-secondary">{address}</p>
                      </div>
                    </div>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: statusInfo?.bg || '#F3F4F6', color: statusInfo?.text || '#374151' }}
                    >
                      {statusInfo?.label || 'Unknown'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div>
                      <span className="text-text-secondary font-semibold">
                        {t('labelMyQuote')}
                      </span>{' '}
                      {request.quoted_amount
                        ? `${request.currency || 'EUR'} ${(request.quoted_amount / 100).toLocaleString(
                            dateLocaleFromLocale(locale)
                          )}`
                        : t('labelPending')}
                    </div>
                    <div>
                      <span className="text-text-secondary font-semibold">
                        {t('labelUpdated')}
                      </span>{' '}
                      {formatRelativeTime(new Date(request.updated_at), locale)}
                    </div>
                  </div>

                  {/* Progress indicator */}
                  <div className="flex gap-1 mb-3">
                    {['pending', 'quoted', 'accepted', 'in_progress'].map((step) => (
                      <div
                        key={step}
                        className="h-1 flex-1 rounded-full"
                        style={{
                          backgroundColor:
                            ['pending', 'quoted', 'accepted', 'in_progress'].indexOf(step) <=
                            ['pending', 'quoted', 'accepted', 'in_progress'].indexOf(request.status)
                              ? '#16A34A'
                              : '#E2E4EB',
                        }}
                      />
                    ))}
                  </div>

                  <Link
                    href={`/partner/requests/${request.id}`}
                    className="inline-block px-4 py-2 bg-brand text-black text-sm font-bold rounded-lg hover:bg-brand-hover transition"
                  >
                    {t('btnViewDetails')} →
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Completed Requests */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            {t('sectionCompleted')} ({completed.length})
          </h2>
          <div className="space-y-2">
            {completed.map((request) => {
              const statusInfo = statusConfig[request.status] || statusConfig.pending
              const colors = categoryColors[request.category] || categoryColors.photography

              return (
                <div
                  key={request.id}
                  className="bg-surface rounded-lg border border-border-default p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold capitalize">
                      {request.category} · {request.title}
                    </p>
                    <p className="text-xs text-text-secondary flex items-center gap-2">
                      {request.rating && (
                        <>
                          <div className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-400" fill="currentColor" />
                            <span>{request.rating}/5</span>
                          </div>
                          {request.review && ` · "${request.review}"`}
                        </>
                      )}
                      {!request.rating && t('labelNotYetRated')}
                    </p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: statusInfo?.bg || '#F3F4F6', color: statusInfo?.text || '#374151' }}
                  >
                    {statusInfo?.label || 'Unknown'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {available.length === 0 && myActive.length === 0 && completed.length === 0 && (
        <div className="bg-surface rounded-xl p-12 text-center border border-border-default">
          <p className="text-text-secondary font-medium mb-2">
            {t('emptyTitle')}
          </p>
          <p className="text-xs text-text-muted">
            {t('emptyDescription')}
          </p>
        </div>
      )}
    </div>
  )
}
