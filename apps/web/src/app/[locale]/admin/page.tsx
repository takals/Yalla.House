import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Lock, Zap } from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  under_offer: 'bg-blue-100 text-blue-700',
  sold: 'bg-purple-100 text-purple-700',
  let: 'bg-purple-100 text-purple-700',
  archived: 'bg-gray-100 text-gray-400',
}
const VIEWING_STYLES: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-800',
  confirmed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  completed: 'bg-blue-50 text-blue-700',
  no_show: 'bg-red-50 text-red-600',
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isEnglish = locale === 'en'

  return {
    title: isEnglish ? 'Admin Dashboard | Yalla.House' : 'Admin-Dashboard | Yalla.House',
    description: isEnglish
      ? 'Manage the Yalla platform and monitor system activity.'
      : 'Verwalten Sie die Yalla-Plattform und überwachen Sie das System.',
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function AdminPage() {
  const t = await getTranslations()

  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Admin role check
  const { data: roleRow } = await (supabase.from('user_roles') as any)
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .eq('is_active', true)
    .maybeSingle()

  if (!roleRow) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-surface rounded-card p-10 text-center max-w-sm">
          <Lock size={32} className="mx-auto mb-2 text-[#5E6278]" />
          <p className="font-bold mb-1">{t('admin.noAccess')}</p>
          <p className="text-sm text-[#5E6278]">{t('admin.noAccessMessage')}</p>
        </div>
      </div>
    )
  }

  // Use service client to bypass RLS for admin queries
  const service = createServiceClient()

  // Fetch all stats in parallel
  let listingsCount: any = { count: 0 }
  let activeListingsCount: any = { count: 0 }
  let usersCount: any = { count: 0 }
  let viewingsCount: any = { count: 0 }
  let pendingViewingsCount: any = { count: 0 }
  let paidBillingCount: any = { count: 0 }
  let recentListings: any = { data: [] }
  let recentViewings: any = { data: [] }
  let recentUsers: any = { data: [] }
  try {
    const results = await Promise.all([
      service.from('listings').select('id', { count: 'exact', head: true }),
      service.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      service.from('users').select('id', { count: 'exact', head: true }),
      (service.from('viewings') as any).select('id', { count: 'exact', head: true }),
      (service.from('viewings') as any).select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      (service.from('billing_records') as any).select('id', { count: 'exact', head: true }).eq('status', 'paid'),

      // Recent listings
      service
        .from('listings')
        .select('id, place_id, title_de, city, status, created_at, owner_id')
        .order('created_at', { ascending: false })
        .limit(10),

      // Recent viewings
      (service.from('viewings') as any)
        .select(`
          id, status, created_at,
          hunter:users!hunter_id(full_name, email),
          listing:listings!listing_id(title_de, city, place_id)
        `)
        .order('created_at', { ascending: false })
        .limit(10),

      // Recent users
      (service.from('users') as any)
        .select('id, full_name, email, created_at, country_code')
        .order('created_at', { ascending: false })
        .limit(8),
    ])
    listingsCount = results[0]
    activeListingsCount = results[1]
    usersCount = results[2]
    viewingsCount = results[3]
    pendingViewingsCount = results[4]
    paidBillingCount = results[5]
    recentListings = results[6]
    recentViewings = results[7]
    recentUsers = results[8]
  } catch (err) {
    console.error('Failed to load admin dashboard data:', err)
  }

  // Build status labels using translations
  const STATUS_LABELS: Record<string, string> = {
    draft: t('statusLabels.draft'),
    active: t('statusLabels.active'),
    paused: t('statusLabels.paused'),
    under_offer: t('statusLabels.underOffer'),
    sold: t('statusLabels.sold'),
    let: t('statusLabels.let'),
    archived: t('statusLabels.archived'),
  }

  // Build viewing labels using translations
  const VIEWING_LABELS: Record<string, string> = {
    pending: t('viewingLabels.pending'),
    confirmed: t('viewingLabels.confirmed'),
    cancelled: t('viewingLabels.cancelled'),
    completed: t('viewingLabels.completed'),
    no_show: t('viewingLabels.noShow'),
  }

  const stats = [
    { label: t('admin.totalListings'), value: listingsCount.count ?? 0, sub: `${activeListingsCount.count ?? 0} ${t('admin.active')}` },
    { label: t('admin.users'), value: usersCount.count ?? 0, sub: t('admin.registered') },
    { label: t('admin.viewings'), value: (viewingsCount as any).count ?? 0, sub: `${(pendingViewingsCount as any).count ?? 0} ${t('admin.pending')}` },
    { label: t('admin.paidTariffs'), value: (paidBillingCount as any).count ?? 0, sub: t('admin.completions') },
  ]

  return (
    <div className="max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">{t('admin.pageTitle')}</h1>
            <p className="text-sm text-[#5E6278] mt-0.5">{t('admin.pageSubtitle')}</p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 bg-brand rounded-full">{t('admin.pageTitle')}</span>
        </div>


        {/* Smart Booking Shortcut CTA */}
        <Link
          href="/admin/booking"
          className="block bg-[#0F1117] rounded-2xl p-5 mb-8 hover:shadow-lg transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#D4764E] flex items-center justify-center">
                <Zap size={22} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-base">Smart Booking Shortcut</p>
                <p className="text-white/50 text-sm">Search property, send link — one click</p>
              </div>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-[#D4764E] text-white rounded-full group-hover:bg-[#BF6840] transition-colors">
              Open
            </span>
          </div>
        </Link>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map(stat => (
            <div key={stat.label} className="bg-surface rounded-card p-5">
              <p className="text-3xl font-bold">{stat.value}</p>
              <p className="text-sm font-semibold mt-1">{stat.label}</p>
              <p className="text-xs text-[#999] mt-0.5">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">

          {/* Recent listings */}
          <section>
            <h2 className="text-base font-bold mb-4">{t('admin.recentListings')}</h2>
            <div className="bg-surface rounded-card divide-y divide-[#E2E4EB]">
              {(recentListings.data ?? []).length === 0 && (
                <p className="px-5 py-4 text-sm text-[#5E6278]">{t('admin.noListings')}</p>
              )}
              {(recentListings.data ?? []).map((l: any) => (
                <div key={l.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/owner/${l.id}`}
                      className="text-sm font-semibold hover:underline truncate block"
                    >
                      {l.title_de ?? l.place_id}
                    </Link>
                    <p className="text-xs text-[#5E6278]">{l.city}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${STATUS_STYLES[l.status] ?? STATUS_STYLES['draft']}`}>
                    {STATUS_LABELS[l.status] ?? l.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent viewings */}
          <section>
            <h2 className="text-base font-bold mb-4">{t('admin.recentViewings')}</h2>
            <div className="bg-surface rounded-card divide-y divide-[#E2E4EB]">
              {(recentViewings.data ?? []).length === 0 && (
                <p className="px-5 py-4 text-sm text-[#5E6278]">{t('admin.noViewings')}</p>
              )}
              {((recentViewings as any).data ?? []).map((v: any) => (
                <div key={v.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {v.hunter?.full_name ?? v.hunter?.email ?? '—'}
                    </p>
                    <p className="text-xs text-[#5E6278] truncate">
                      {v.listing?.title_de ?? v.listing?.city ?? '—'}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${VIEWING_STYLES[v.status] ?? VIEWING_STYLES['pending']}`}>
                    {VIEWING_LABELS[v.status] ?? v.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Recent users */}
          <section className="lg:col-span-2">
            <h2 className="text-base font-bold mb-4">{t('admin.recentUsers')}</h2>
            <div className="bg-surface rounded-card divide-y divide-[#E2E4EB]">
              {((recentUsers as any).data ?? []).length === 0 && (
                <p className="px-5 py-4 text-sm text-[#5E6278]">{t('admin.noUsers')}</p>
              )}
              {((recentUsers as any).data ?? []).map((u: any) => (
                <div key={u.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{u.full_name ?? '—'}</p>
                    <p className="text-xs text-[#5E6278]">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-[#999]">
                      {new Date(u.created_at).toLocaleDateString('de-DE')}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {u.country_code ?? 'DE'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
    </div>
  )
}
