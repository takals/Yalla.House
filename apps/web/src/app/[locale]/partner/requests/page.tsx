import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import Link from 'next/link'
import { QuoteForm } from './quote-form'
// Tiny relative-time helper — avoids pulling in date-fns
function formatRelative(date: Date, locale: string): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const diffMs = date.getTime() - Date.now()
  const diffSec = Math.round(diffMs / 1000)
  const abs = Math.abs(diffSec)
  if (abs < 60) return rtf.format(diffSec, 'second')
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), 'minute')
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour')
  if (abs < 2592000) return rtf.format(Math.round(diffSec / 86400), 'day')
  if (abs < 31536000) return rtf.format(Math.round(diffSec / 2592000), 'month')
  return rtf.format(Math.round(diffSec / 31536000), 'year')
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

type CategoryColor = { bg: string; text: string; dot: string }
type StatusInfo = { label: string; bg: string; text: string }

const DEFAULT_CATEGORY_COLOR: CategoryColor = { bg: '#DBEAFE', text: '#1E40AF', dot: '#0284C7' }
const DEFAULT_STATUS_INFO: StatusInfo = { label: 'Unknown', bg: '#F3F4F6', text: '#374151' }

const categoryColors: Record<string, CategoryColor> = {
  photography: { bg: '#DBEAFE', text: '#1E40AF', dot: '#0284C7' },
  floorplan: { bg: '#DBEAFE', text: '#1E40AF', dot: '#0284C7' },
  epc: { bg: '#DCFCE7', text: '#166534', dot: '#16A34A' },
  survey: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  conveyancing: { bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626' },
  cleaning: { bg: '#F3F4F6', text: '#374151', dot: '#6B7280' },
  staging: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  drone: { bg: '#DBEAFE', text: '#1E40AF', dot: '#0284C7' },
}

const statusConfig: Record<string, StatusInfo> = {
  pending: { label: 'Open', bg: '#FFFBE0', text: '#7A5F00' },
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
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch service requests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const isLocaleDE = locale === 'de'
  const dateLocale = isLocaleDE ? 'de' : 'en-GB'

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Service Requests</h1>
        <p className="text-[#5E6278] text-sm">
          {isLocaleDE
            ? 'Verwalten Sie verfügbare Anfragen und Ihre aktiven Aufträge'
            : 'Manage available requests and your active jobs'
          }
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-surface rounded-lg p-4 border border-[#E2E4EB] text-center">
          <p className="text-2xl font-bold text-[#0284C7]">{available.length}</p>
          <p className="text-xs text-[#5E6278]">
            {isLocaleDE ? 'Verfügbar' : 'Available'}
          </p>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-[#E2E4EB] text-center">
          <p className="text-2xl font-bold text-[#FFD400]">{myActive.length}</p>
          <p className="text-xs text-[#5E6278]">
            {isLocaleDE ? 'Aktiv' : 'Active'}
          </p>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-[#E2E4EB] text-center">
          <p className="text-2xl font-bold text-[#16A34A]">{completed.length}</p>
          <p className="text-xs text-[#5E6278]">
            {isLocaleDE ? 'Abgeschlossen' : 'Completed'}
          </p>
        </div>
      </div>

      {/* Available Requests */}
      {available.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0284C7]" />
            {isLocaleDE ? 'Verfügbare Anfragen' : 'Available Requests'} ({available.length})
          </h2>
          <div className="space-y-3">
            {available.map((request) => {
              const colors: CategoryColor = categoryColors[request.category] ?? DEFAULT_CATEGORY_COLOR
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
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {request.category.charAt(0).toUpperCase() + request.category.slice(1)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{request.title}</p>
                        <p className="text-xs text-[#5E6278]">{address}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#999]">
                      {formatRelative(new Date(request.created_at), dateLocale)}
                    </span>
                  </div>

                  {request.description && (
                    <p className="text-xs text-[#5E6278] bg-[#F5F5F7] rounded-lg p-2 mb-3">
                      {request.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div>
                      <span className="text-[#5E6278] font-semibold">
                        {isLocaleDE ? 'Anfragender:' : 'Requester:'}
                      </span>{' '}
                      {requesterName}
                    </div>
                    <div>
                      <span className="text-[#5E6278] font-semibold">
                        {isLocaleDE ? 'Bevorzugtes Datum:' : 'Preferred Date:'}
                      </span>{' '}
                      {request.preferred_date
                        ? new Date(request.preferred_date).toLocaleDateString(
                            isLocaleDE ? 'de-DE' : 'en-GB'
                          )
                        : isLocaleDE
                          ? 'Flexibel'
                          : 'Flexible'}
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
            <span className="w-2 h-2 rounded-full bg-[#FFD400]" />
            {isLocaleDE ? 'Meine aktiven Anfragen' : 'My Active Requests'} ({myActive.length})
          </h2>
          <div className="space-y-3">
            {myActive.map((request) => {
              const statusInfo: StatusInfo = statusConfig[request.status] ?? DEFAULT_STATUS_INFO
              const colors: CategoryColor = categoryColors[request.category] ?? DEFAULT_CATEGORY_COLOR
              const address = request.listings
                ? `${request.listings.address_line1}, ${request.listings.city}`
                : request.title

              return (
                <div
                  key={request.id}
                  className="bg-surface rounded-xl border border-[#E2E4EB] p-5 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {request.category.charAt(0).toUpperCase() + request.category.slice(1)}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{request.title}</p>
                        <p className="text-xs text-[#5E6278]">{address}</p>
                      </div>
                    </div>
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: statusInfo.bg, color: statusInfo.text }}
                    >
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div>
                      <span className="text-[#5E6278] font-semibold">
                        {isLocaleDE ? 'Mein Angebot:' : 'My Quote:'}
                      </span>{' '}
                      {request.quoted_amount
                        ? `${request.currency || 'GBP'} ${(request.quoted_amount / 100).toLocaleString(
                            isLocaleDE ? 'de-DE' : 'en-GB'
                          )}`
                        : isLocaleDE
                          ? 'Ausstehend'
                          : 'Pending'}
                    </div>
                    <div>
                      <span className="text-[#5E6278] font-semibold">
                        {isLocaleDE ? 'Status seit:' : 'Updated:'}
                      </span>{' '}
                      {formatRelative(new Date(request.updated_at), dateLocale)}
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
                    className="inline-block px-4 py-2 bg-brand text-black text-sm font-bold rounded-lg hover:bg-[#E6C200] transition"
                  >
                    {isLocaleDE ? 'Details anzeigen' : 'View Details'} →
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
            {isLocaleDE ? 'Abgeschlossene Arbeiten' : 'Completed Jobs'} ({completed.length})
          </h2>
          <div className="space-y-2">
            {completed.map((request) => {
              const statusInfo: StatusInfo = statusConfig[request.status] ?? DEFAULT_STATUS_INFO
              const colors: CategoryColor = categoryColors[request.category] ?? DEFAULT_CATEGORY_COLOR

              return (
                <div
                  key={request.id}
                  className="bg-surface rounded-lg border border-[#E2E4EB] p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold capitalize">
                      {request.category} · {request.title}
                    </p>
                    <p className="text-xs text-[#5E6278]">
                      {request.rating && (
                        <>
                          ⭐ {request.rating}/5
                          {request.review && ` · "${request.review}"`}
                        </>
                      )}
                      {!request.rating && isLocaleDE && 'Noch nicht bewertet'}
                      {!request.rating && !isLocaleDE && 'Not yet rated'}
                    </p>
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: statusInfo.bg, color: statusInfo.text }}
                  >
                    {statusInfo.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {available.length === 0 && myActive.length === 0 && completed.length === 0 && (
        <div className="bg-surface rounded-xl p-12 text-center border border-[#E2E4EB]">
          <p className="text-[#5E6278] font-medium mb-2">
            {isLocaleDE ? 'Keine Service-Anfragen' : 'No service requests'}
          </p>
          <p className="text-xs text-[#999]">
            {isLocaleDE
              ? 'Verfügbare Anfragen erscheinen hier, wenn Verkäufer Services anfordern.'
              : 'Available requests will appear here when sellers request services.'}
          </p>
        </div>
      )}
    </div>
  )
}
