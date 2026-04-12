import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import Link from 'next/link'
import { CalendarCheck, MessageCircle, Home, TrendingUp, ArrowUp, ArrowRight, Plus, type LucideIcon } from 'lucide-react'
import { fromMinorUnits } from '@yalla/integrations'
import { getTranslations } from 'next-intl/server'
import type { Database } from '@/types/database'

type Listing = Database['public']['Tables']['listings']['Row']
type Viewing = Database['public']['Tables']['viewings']['Row']
type MessageThread = Database['public']['Tables']['message_threads']['Row']

interface Props {
  searchParams: Promise<{ billing?: string }>
}

export default async function OwnerDashboard({ searchParams }: Props) {
  const { billing } = await searchParams
  const t = await getTranslations('ownerDash')
  const ts = await getTranslations('statusLabels')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch listings first to get IDs for related queries
  const { data: listingsData } = await supabase
    .from('listings')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  const listings: Listing[] = listingsData ?? []
  const listingIds = listings.map(l => l.id)

  // Parallel fetch: viewings, offers, messages, billing
  const [viewingsResult, offersResult, threadsResult, billingResult] = await Promise.all([
    // Viewings for this owner's listings
    listingIds.length > 0
      ? supabase
          .from('viewings')
          .select('*')
          .in('listing_id', listingIds)
          .in('status', ['pending', 'confirmed'])
          .order('scheduled_at', { ascending: true })
          .limit(5)
      : Promise.resolve({ data: null as Viewing[] | null, count: null }),

    // Offers count
    listingIds.length > 0
      ? supabase
          .from('offers')
          .select('*', { count: 'exact', head: true })
          .in('listing_id', listingIds)
      : Promise.resolve({ data: null, count: 0 }),

    // Messages — use message_threads linked to this owner's listings
    listingIds.length > 0
      ? supabase
          .from('message_threads')
          .select('*')
          .in('listing_id', listingIds)
          .order('created_at', { ascending: false })
          .limit(10)
      : Promise.resolve({ data: null as MessageThread[] | null, count: null }),

    // Billing status
    supabase
      .from('billing_records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'paid'),
  ])

  const viewings: Viewing[] = (viewingsResult.data ?? []).filter(v => v.scheduled_at !== null)
  const offersCount = offersResult.count ?? 0
  const threads: MessageThread[] = threadsResult.data ?? []
  const hasPaidPlan = (billingResult.count ?? 0) > 0

  // Calculate stats
  const activeListingsCount = listings.filter(l => l.status === 'active').length
  const enquiriesCount = threads.length
  const viewingsCount = viewings.length
  const viewingsThisWeek = viewings.filter(v => {
    if (!v.scheduled_at) return false
    const viewDate = new Date(v.scheduled_at)
    const now = new Date()
    const daysUntil = Math.ceil((viewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntil <= 7 && daysUntil >= 0
  }).length

  return (
    <div className="max-w-7xl">
      {/* Success banner */}
      {billing === 'success' && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-xl px-5 py-4 text-sm font-medium">
          {t('billingSuccess')}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-[#0F1117]">{t('pageTitle')}</h1>
        <Link
          href="/owner/new"
          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-[#0F1117] font-bold px-5 py-2.5 rounded-lg transition-colors will-change-transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          {t('newListing')}
        </Link>
      </div>

      {/* Sub-nav tabs */}
      <div className="flex gap-6 mb-8 border-b border-[#E2E4EB]">
        <Link
          href="/owner"
          className="text-sm font-semibold text-[#0F1117] pb-3 border-b-2 border-brand -mb-px"
        >
          {t('pageTitle')}
        </Link>
        <Link
          href="/owner/listings"
          className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors"
        >
          {t('tabListings')}
        </Link>
        <Link
          href="/owner/inbox"
          className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors"
        >
          {t('tabInquiries')}
        </Link>
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label={t('statActiveListings')}
          value={activeListingsCount}
          sub={t('statWithOffers', { count: offersCount })}
          icon={Home}
        />
        <StatCard
          label={t('statTotalInquiries')}
          value={enquiriesCount}
          trendIcon={enquiriesCount > 1 ? TrendingUp : ArrowRight}
          trend={enquiriesCount > 0 ? t('statThisWeek') : ''}
          icon={MessageCircle}
        />
        <StatCard
          label={t('statViewings')}
          value={viewingsCount}
          sub={t('statThisWeekCount', { count: viewingsThisWeek })}
          icon={CalendarCheck}
        />
        <StatCard
          label={t('statOffersReceived')}
          value={offersCount}
          trendIcon={ArrowUp}
          trend={offersCount > 0 ? t('statNewOffers', { count: offersCount }) : ''}
          icon={TrendingUp}
          highlight={offersCount > 0}
        />
      </div>

      {/* Main content grid: listings table (2/3) + right sidebar (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Listings Table */}
        <div className="lg:col-span-2">
          <SectionCard title={t('sectionMyListings')}>
            {listings.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[#5E6278] mb-4">{t('noListings')}</p>
                <Link
                  href="/owner/new"
                  className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-[#0F1117] font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('createFirstListing')}
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E2E4EB]">
                      <th className="text-left py-3 px-4 font-semibold text-[#5E6278]">{t('tableProperty')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#5E6278]">{t('tableStatus')}</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#5E6278]">{t('tablePrice')}</th>
                      <th className="text-center py-3 px-4 font-semibold text-[#5E6278]">{t('tableInquiries')}</th>
                      <th className="text-center py-3 px-4 font-semibold text-[#5E6278]">{t('tableViewings')}</th>
                      <th className="text-center py-3 px-4 font-semibold text-[#5E6278]">{t('tableOffers')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listings.slice(0, 10).map(listing => {
                      const listingViewings = viewings.filter(v => v.listing_id === listing.id).length
                      const listingMessages = threads.filter(m => m.listing_id === listing.id).length
                      const listingOffers = 0 // Would be filtered from offersResult if needed
                      const price = listing.intent === 'sale' ? listing.sale_price : listing.rent_price
                      const currency = listing.currency || 'EUR'

                      return (
                        <tr key={listing.id} className="border-b border-[#E2E4EB] hover:bg-[#FAFBFC]">
                          <td className="py-3 px-4">
                            <Link href={`/owner/${listing.id}`} className="hover:opacity-75 transition-opacity">
                              <p className="font-semibold text-[#0F1117]">
                                {listing.title_de ?? listing.title ?? listing.place_id}
                              </p>
                              <p className="text-xs text-[#5E6278]">
                                {listing.postcode} {listing.city}
                              </p>
                            </Link>
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={listing.status} t={ts} />
                          </td>
                          <td className="py-3 px-4 text-[#0F1117]">
                            {price ? (
                              <>
                                {new Intl.NumberFormat('de-DE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(fromMinorUnits(price, currency))}
                                {listing.intent === 'rent' && '/Mo'}
                              </>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-3 px-4 text-center text-[#0F1117] font-medium">{listingMessages}</td>
                          <td className="py-3 px-4 text-center text-[#0F1117] font-medium">{listingViewings}</td>
                          <td className="py-3 px-4 text-center text-[#0F1117] font-medium">{listingOffers}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right: Upcoming Viewings + Latest Messages */}
        <div className="space-y-6">
          {/* Upcoming Viewings */}
          <SectionCard
            title={t('sectionUpcomingViewings')}
            action={{ label: t('actionOpenCalendar'), href: '/owner/viewings' }}
          >
            {viewings.length === 0 ? (
              <p className="text-[#5E6278] py-6">{t('noUpcomingViewings')}</p>
            ) : (
              <div className="space-y-3">
                {viewings.slice(0, 3).map(viewing => (
                  <ViewingItem key={viewing.id} viewing={viewing} t={t} />
                ))}
              </div>
            )}
          </SectionCard>

          {/* Latest Messages */}
          <SectionCard
            title={t('sectionLatestMessages')}
            action={{ label: t('actionViewAll'), href: '/owner/inbox' }}
          >
            {threads.length === 0 ? (
              <p className="text-[#5E6278] py-6">{t('noMessages')}</p>
            ) : (
              <div className="space-y-3">
                {threads.slice(0, 3).map(thread => {
                  const threadDate = new Date(thread.created_at)
                  const dateStr = threadDate.toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })

                  return (
                    <div key={thread.id} className="flex gap-3 py-2">
                      <div className="w-8 h-8 rounded-full bg-[#D9DCE4] flex items-center justify-center text-[#5E6278] flex-shrink-0">
                        <MessageCircle className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#0F1117]">
                          {thread.subject ?? t('newInquiry')}
                        </p>
                        <p className="text-xs text-[#999] truncate">{dateStr}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  )
}

// ========== Components ==========

interface StatCardProps {
  label: string
  value: number
  sub?: string
  trend?: string
  trendIcon?: LucideIcon
  icon?: LucideIcon
  highlight?: boolean
}

function StatCard({ label, value, sub, trend, trendIcon: TrendIcon, icon: Icon, highlight }: StatCardProps) {
  return (
    <div className={`bg-surface rounded-card p-5 border border-[#E2E4EB] ${highlight ? 'ring-2 ring-brand ring-opacity-30' : ''}`}>
      <p className="text-xs font-semibold text-[#5E6278] uppercase tracking-wider mb-3">{label}</p>
      <div className="flex items-baseline justify-between">
        <p className={`text-3xl font-bold ${highlight ? 'text-brand' : 'text-[#0F1117]'}`}>{value}</p>
        {Icon && <Icon className="w-5 h-5 text-[#D9DCE4]" />}
      </div>
      {sub && <p className="text-xs text-[#5E6278] mt-2">{sub}</p>}
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          {TrendIcon && <TrendIcon className="w-3 h-3 text-brand" />}
          <p className="text-xs text-brand font-semibold">{trend}</p>
        </div>
      )}
    </div>
  )
}

interface SectionCardProps {
  title: string
  action?: { label: string; href: string }
  children: React.ReactNode
}

function SectionCard({ title, action, children }: SectionCardProps) {
  return (
    <div className="bg-surface rounded-card border border-[#E2E4EB] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E2E4EB] flex items-center justify-between">
        <h3 className="font-bold text-[#0F1117]">{title}</h3>
        {action && (
          <Link
            href={action.href}
            className="text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
          >
            {action.label} →
          </Link>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

function ViewingItem({ viewing, t }: { viewing: Viewing; t: any }) {
  const scheduledDate = new Date(viewing.scheduled_at!)
  const now = new Date()
  const daysUntil = Math.ceil((scheduledDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  let badge = ''
  if (daysUntil === 0) badge = t('badgeToday')
  else if (daysUntil === 1) badge = t('badgeTomorrow')
  else if (daysUntil > 1 && daysUntil <= 7) badge = t('badgeInDays', { count: daysUntil })
  else badge = scheduledDate.toLocaleDateString('de-DE')

  const timeStr = scheduledDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="flex items-center gap-3 p-3 bg-[#FAFBFC] rounded-lg border border-[#E2E4EB]">
      <CalendarCheck className="w-4 h-4 text-[#5E6278] flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[#0F1117]">{t('viewingInterested')}</p>
        <p className="text-xs text-[#5E6278]">
          {timeStr}
        </p>
      </div>
      <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700 flex-shrink-0 whitespace-nowrap">
        {badge}
      </span>
    </div>
  )
}

function StatusBadge({ status, t }: { status: string; t: any }) {
  const styles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    under_offer: 'bg-blue-100 text-blue-700',
    sold: 'bg-purple-100 text-purple-700',
    let: 'bg-purple-100 text-purple-700',
    archived: 'bg-gray-100 text-gray-400',
  }

  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
        styles[status] ?? styles['draft']
      }`}
    >
      {t(status) ?? status}
    </span>
  )
}
