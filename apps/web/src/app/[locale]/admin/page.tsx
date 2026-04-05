import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Entwurf', active: 'Aktiv', paused: 'Pausiert',
  under_offer: 'Angebot', sold: 'Verkauft', let: 'Vermietet', archived: 'Archiviert',
}
const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  under_offer: 'bg-blue-100 text-blue-700',
  sold: 'bg-purple-100 text-purple-700',
  let: 'bg-purple-100 text-purple-700',
  archived: 'bg-gray-100 text-gray-400',
}
const VIEWING_LABELS: Record<string, string> = {
  pending: 'Ausstehend', confirmed: 'Bestätigt',
  cancelled: 'Abgebrochen', completed: 'Abgeschlossen', no_show: 'Nicht erschienen',
}
const VIEWING_STYLES: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-800',
  confirmed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  completed: 'bg-blue-50 text-blue-700',
  no_show: 'bg-red-50 text-red-600',
}

export default async function AdminPage() {
  // Auth check
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?next=/admin')

  // Admin role check
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: roleRow } = await (supabase.from('user_roles') as any)
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .eq('is_active', true)
    .maybeSingle()

  if (!roleRow) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-surface rounded-card p-10 text-center max-w-sm">
          <p className="text-2xl mb-2">🔒</p>
          <p className="font-bold mb-1">Kein Zugriff</p>
          <p className="text-sm text-[#5E6278]">Dieser Bereich ist nur für Administratoren.</p>
        </div>
      </div>
    )
  }

  // Use service client to bypass RLS for admin queries
  const service = createServiceClient()

  // Fetch all stats in parallel
  const [
    listingsCount,
    activeListingsCount,
    usersCount,
    viewingsCount,
    pendingViewingsCount,
    paidBillingCount,
    recentListings,
    recentViewings,
    recentUsers,
  ] = await Promise.all([
    service.from('listings').select('id', { count: 'exact', head: true }),
    service.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    service.from('users').select('id', { count: 'exact', head: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (service.from('viewings') as any).select('id', { count: 'exact', head: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (service.from('viewings') as any).select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (service.from('billing_records') as any).select('id', { count: 'exact', head: true }).eq('status', 'paid'),

    // Recent listings
    service
      .from('listings')
      .select('id, place_id, title_de, city, status, created_at, owner_id')
      .order('created_at', { ascending: false })
      .limit(10),

    // Recent viewings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (service.from('viewings') as any)
      .select(`
        id, status, created_at,
        hunter:users!hunter_id(full_name, email),
        listing:listings!listing_id(title_de, city, place_id)
      `)
      .order('created_at', { ascending: false })
      .limit(10),

    // Recent users
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (service.from('users') as any)
      .select('id, full_name, email, created_at, country_code')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const stats = [
    { label: 'Inserate gesamt', value: listingsCount.count ?? 0, sub: `${activeListingsCount.count ?? 0} aktiv` },
    { label: 'Nutzer', value: usersCount.count ?? 0, sub: 'registriert' },
    { label: 'Besichtigungen', value: (viewingsCount as any).count ?? 0, sub: `${(pendingViewingsCount as any).count ?? 0} ausstehend` },
    { label: 'Bezahlte Tarife', value: (paidBillingCount as any).count ?? 0, sub: 'Abschlüsse' },
  ]

  return (
    <div className="max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin</h1>
            <p className="text-sm text-[#5E6278] mt-0.5">Yalla.House Plattformübersicht</p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 bg-brand rounded-full">Admin</span>
        </div>


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
            <h2 className="text-base font-bold mb-4">Neueste Inserate</h2>
            <div className="bg-surface rounded-card divide-y divide-[#E2E4EB]">
              {(recentListings.data ?? []).length === 0 && (
                <p className="px-5 py-4 text-sm text-[#5E6278]">Keine Inserate.</p>
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
            <h2 className="text-base font-bold mb-4">Neueste Besichtigungen</h2>
            <div className="bg-surface rounded-card divide-y divide-[#E2E4EB]">
              {(recentViewings.data ?? []).length === 0 && (
                <p className="px-5 py-4 text-sm text-[#5E6278]">Keine Besichtigungen.</p>
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
            <h2 className="text-base font-bold mb-4">Neueste Nutzer</h2>
            <div className="bg-surface rounded-card divide-y divide-[#E2E4EB]">
              {((recentUsers as any).data ?? []).length === 0 && (
                <p className="px-5 py-4 text-sm text-[#5E6278]">Keine Nutzer.</p>
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
