import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ViewingCard } from './viewing-card'

interface ViewingWithListing {
  id: string
  status: string
  hunter_notes: string | null
  created_at: string
  listing: {
    title_de: string | null
    city: string
    postcode: string
    place_id: string
  } | null
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isEnglish = locale === 'en'

  return {
    title: isEnglish ? 'Home Hunter Dashboard | Yalla.House' : 'Suchenden-Dashboard | Yalla.House',
    description: isEnglish
      ? 'Find your next home. Browse available properties and view new listings.'
      : 'Finden Sie Ihr nächstes Zuhause. Durchsuchen Sie verfügbare Immobilien und sehen Sie neue Angebote.',
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function HunterPage() {
  const t = await getTranslations('hunterDash')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const [
    profileResult,
    briefResult,
    viewingsResult,
    offersResult,
    agentsResult,
    matchesResult,
  ] = await Promise.all([
    (supabase.from('users') as any)
      .select('full_name, email')
      .eq('id', userId)
      .maybeSingle(),

    (supabase.from('hunter_profiles') as any)
      .select('intent, timeline, brief_updated_at')
      .eq('user_id', userId)
      .maybeSingle(),

    (supabase.from('viewings') as any)
      .select(`
        id, status, hunter_notes, created_at,
        listing:listings!listing_id(title_de, city, postcode, place_id)
      `)
      .eq('hunter_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),

    (supabase.from('offers') as any)
      .select('id', { count: 'exact', head: true })
      .eq('hunter_id', userId)
      .in('status', ['submitted', 'under_review']),

    (supabase.from('agent_hunter_assignments') as any)
      .select('id', { count: 'exact', head: true })
      .eq('hunter_id', userId)
      .eq('status', 'active'),

    (supabase.from('property_matches') as any)
      .select('id', { count: 'exact', head: true })
      .eq('hunter_id', userId)
      .eq('status', 'new'),
  ])

  const profile = profileResult.data
  const brief = briefResult.data
  const viewings: ViewingWithListing[] = viewingsResult.data ?? []
  const offerCount: number = offersResult.count ?? 0
  const agentCount: number = agentsResult.count ?? 0
  const matchCount: number = matchesResult.count ?? 0

  const pendingViewings = viewings.filter(v => v.status === 'pending').length
  const confirmedViewings = viewings.filter(v => v.status === 'confirmed').length
  const firstName = profile?.full_name?.split(' ')[0] ?? 'dort'

  const passportStatusLabel = brief
    ? brief.brief_updated_at ? t('active') : t('draft')
    : t('notCreated')
  const passportDot = brief
    ? brief.brief_updated_at ? 'bg-emerald-400' : 'bg-amber-400'
    : 'bg-white/20'

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1117] mb-0.5">
          {t('hello', { name: firstName })}
        </h1>
        <p className="text-[0.875rem] text-[#5E6278]">{profile?.email}</p>
      </div>

      {/* Bento stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

        {/* Besichtigungen — wide card */}
        <div className="col-span-2 bg-[#0F1117] rounded-2xl p-6 flex flex-col justify-between min-h-[120px]">
          <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-white/40">{t('viewings')}</p>
          <div className="flex items-end gap-3 mt-2">
            <p className="text-5xl font-black tabular-nums text-white leading-none">
              {pendingViewings + confirmedViewings}
            </p>
            {confirmedViewings > 0 && (
              <span className="mb-1 text-[0.75rem] font-semibold text-emerald-400">
                {t('confirmed', { count: confirmedViewings })}
              </span>
            )}
          </div>
        </div>

        {/* Neue Treffer */}
        <div className={`bg-white rounded-2xl p-5 flex flex-col justify-between min-h-[120px] ${matchCount > 0 ? 'ring-2 ring-brand' : ''}`}>
          <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-[#5E6278]">{t('newMatches')}</p>
          <p className={`text-4xl font-black tabular-nums leading-none mt-2 ${matchCount > 0 ? 'text-[#0F1117]' : 'text-[#C5C8D0]'}`}>
            {matchCount}
          </p>
        </div>

        {/* Verbundene Makler */}
        <div className="bg-white rounded-2xl p-5 flex flex-col justify-between min-h-[120px]">
          <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-[#5E6278]">{t('agents')}</p>
          <p className="text-4xl font-black tabular-nums leading-none mt-2 text-[#0F1117]">{agentCount}</p>
        </div>

        {/* Aktive Angebote */}
        <div className="bg-white rounded-2xl p-5 flex flex-col justify-between">
          <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-[#5E6278]">{t('offers')}</p>
          <p className="text-4xl font-black tabular-nums leading-none mt-2 text-[#0F1117]">{offerCount}</p>
        </div>

        {/* Passport status */}
        <div className="col-span-2 lg:col-span-3 bg-white rounded-2xl p-5 flex items-center gap-4">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${passportDot}`} />
          <div>
            <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-[#5E6278]">{t('passportStatus')}</p>
            <p className="font-bold text-[#0F1117] mt-0.5">{passportStatusLabel}</p>
          </div>
          <Link
            href="/hunter/passport"
            className="ml-auto text-[0.8125rem] font-semibold text-[#5E6278] hover:text-[#0F1117] transition-colors whitespace-nowrap"
          >
            {t('editPassport')} →
          </Link>
        </div>
      </div>

      {/* Quick-access module grid */}
      <div>
        <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[#5E6278] mb-3">{t('modules')}</p>
        <div className="grid sm:grid-cols-2 gap-3">

          <ModuleCard
            href="/hunter/passport"
            title={t('homePassport')}
            subtitle={t('homePassportDesc')}
            accentClass="bg-[#0F1117]"
            accentLabel="ID"
          />
          <ModuleCard
            href="/hunter/agents"
            title={t('agentManager')}
            subtitle={t('agentManagerDesc')}
            accentClass="bg-[#EDEEF2]"
            accentLabel="AG"
            lightAccent
          />
          <ModuleCard
            href="/hunter/inbox"
            title={t('inbox')}
            subtitle={t('inboxDesc')}
            accentClass="bg-[#EDEEF2]"
            accentLabel="IN"
            lightAccent
            badge={matchCount}
          />
          <ModuleCard
            href="/hunter/settings"
            title={t('settings')}
            subtitle={t('settingsDesc')}
            accentClass="bg-[#EDEEF2]"
            accentLabel="ES"
            lightAccent
          />
        </div>
      </div>

      {/* Viewings section */}
      <div>
        <p className="text-[0.7rem] font-bold uppercase tracking-widest text-[#5E6278] mb-3">{t('viewingRequests')}</p>

        {viewings.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-[#5E6278] text-sm mb-5">{t('noViewingRequests')}</p>
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-[#0F1117] font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
              style={{ transition: 'background 0.15s cubic-bezier(0.16,1,0.3,1)' }}
            >
              {t('browseListings')}
            </Link>
          </div>
        )}

        {viewings.length > 0 && (
          <div className="grid gap-3">
            {viewings.map(viewing => {
              const listing = viewing.listing
              const title = listing?.title_de ?? 'Inserat'
              const location = listing ? `${listing.postcode} ${listing.city}` : ''
              const date = new Date(viewing.created_at).toLocaleDateString('de-DE', {
                day: '2-digit', month: 'long', year: 'numeric',
              })
              return (
                <ViewingCard
                  key={viewing.id}
                  id={viewing.id}
                  initialStatus={viewing.status}
                  title={title}
                  location={location}
                  placeId={listing?.place_id ?? null}
                  hunterNotes={viewing.hunter_notes}
                  date={date}
                />
              )
            })}
            <div className="text-center pt-2">
              <Link
                href="/listings"
                className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] transition-colors"
              >
                {t('moreListings')} →
              </Link>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

function ModuleCard({
  href, title, subtitle, accentClass, accentLabel, lightAccent = false, badge = 0,
}: {
  href: string
  title: string
  subtitle: string
  accentClass: string
  accentLabel: string
  lightAccent?: boolean
  badge?: number
}) {
  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl p-5 flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.09)]"
      style={{ transition: 'transform 0.2s cubic-bezier(0.16,1,0.3,1), box-shadow 0.2s cubic-bezier(0.16,1,0.3,1)' }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[0.65rem] font-black tracking-wider flex-shrink-0 ${accentClass} ${lightAccent ? 'text-[#5E6278]' : 'text-white'}`}>
        {accentLabel}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-[0.9375rem] text-[#0F1117] group-hover:text-[#0F1117]">{title}</p>
          {badge > 0 && (
            <span className="text-[0.6rem] font-black min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-red-500 text-white flex items-center justify-center">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[0.8125rem] text-[#5E6278] mt-0.5 truncate">{subtitle}</p>
      </div>
      <svg className="w-4 h-4 text-[#C5C8D0] group-hover:text-[#0F1117] flex-shrink-0 transition-colors" style={{ transition: 'color 0.15s cubic-bezier(0.16,1,0.3,1)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
