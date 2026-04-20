import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations, getLocale } from 'next-intl/server'
import Link from 'next/link'
import { fromMinorUnits } from '@yalla/integrations'
import { ViewingCard } from '../viewing-card'
import { dateLocaleFromLocale } from '@/lib/country-config'

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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('hunterDashboard')

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function HunterPage() {
  const t = await getTranslations('hunterDashboard')
  const locale = await getLocale()
  const dateLocale = dateLocaleFromLocale(locale)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  let profile: any = null
  let brief: any = null
  let viewings: ViewingWithListing[] = []
  let offerCount = 0
  let agentCount = 0
  let matchCount = 0
  let earlyAccessListings: any[] = []
  try {
    const [
      profileResult,
      briefResult,
      viewingsResult,
      offersResult,
      agentsResult,
      matchesResult,
      earlyAccessResult,
    ] = await Promise.all([
      (supabase.from('users') as any)
        .select('full_name, email')
        .eq('id', userId)
        .maybeSingle(),

      (supabase.from('hunter_profiles') as any)
        .select('intent, search_status, timeline, brief_updated_at, readiness_score, early_access_tier, mortgage_verified, identity_verified, profile_complete')
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

      // Pre-market early access listings
      (supabase.from('listings') as any)
        .select('id, place_id, slug, short_id, title, title_en, city, postcode, intent, sale_price, rent_price, currency, bedrooms, size_sqm, created_at')
        .eq('pre_market_opt_in', true)
        .in('status', ['draft', 'active'])
        .order('created_at', { ascending: false })
        .limit(6),
    ])

    profile = profileResult.data
    brief = briefResult.data
    viewings = viewingsResult.data ?? []
    offerCount = offersResult.count ?? 0
    agentCount = agentsResult.count ?? 0
    matchCount = matchesResult.count ?? 0
    earlyAccessListings = earlyAccessResult.data ?? []
  } catch (err) {
    console.error('Failed to load hunter dashboard data:', err)
  }

  const pendingViewings = viewings.filter(v => v.status === 'pending').length
  const confirmedViewings = viewings.filter(v => v.status === 'confirmed').length
  const firstName = profile?.full_name?.split(' ')[0] ?? 'dort'

  const readinessScore = brief?.readiness_score ?? 0
  const earlyAccessTier = brief?.early_access_tier ?? 'none'
  const searchStatus = brief?.search_status ?? ''
  const isStuck = ['thinking_about_it', 'just_exploring', 'waiting_for_right_one'].includes(searchStatus)

  // Filter early access listings based on tier
  const visibleEarlyAccess = earlyAccessTier !== 'none' ? earlyAccessListings : []

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
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary mb-0.5">
          {t('hello', { name: firstName })}
        </h1>
        <p className="text-[0.875rem] text-text-secondary">{profile?.email}</p>
      </div>

      {/* Sub-nav tabs */}
      <div className="flex gap-6 border-b border-border-default -mt-2">
        <Link href="/hunter/info" className="text-sm font-semibold text-text-secondary hover:text-text-primary pb-3 transition-colors">
          Info
        </Link>
        <Link href="/hunter/overview" className="text-sm font-semibold text-text-primary pb-3 border-b-2 border-brand -mb-px">
          Dashboard
        </Link>
        <Link href="/hunter/passport" className="text-sm font-semibold text-text-secondary hover:text-text-primary pb-3 transition-colors">
          Passport
        </Link>
        <Link href="/hunter/inbox" className="text-sm font-semibold text-text-secondary hover:text-text-primary pb-3 transition-colors">
          Inbox
        </Link>
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
          <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-text-secondary">{t('newMatches')}</p>
          <p className={`text-4xl font-black tabular-nums leading-none mt-2 ${matchCount > 0 ? 'text-text-primary' : 'text-[#C5C8D0]'}`}>
            {matchCount}
          </p>
        </div>

        {/* Verbundene Makler */}
        <div className="bg-white rounded-2xl p-5 flex flex-col justify-between min-h-[120px]">
          <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-text-secondary">{t('agents')}</p>
          <p className="text-4xl font-black tabular-nums leading-none mt-2 text-text-primary">{agentCount}</p>
        </div>

        {/* Aktive Angebote */}
        <div className="bg-white rounded-2xl p-5 flex flex-col justify-between">
          <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-text-secondary">{t('offers')}</p>
          <p className="text-4xl font-black tabular-nums leading-none mt-2 text-text-primary">{offerCount}</p>
        </div>

        {/* Passport status */}
        <div className="col-span-2 lg:col-span-3 bg-white rounded-2xl p-5 flex items-center gap-4">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${passportDot}`} />
          <div>
            <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-text-secondary">{t('passportStatus')}</p>
            <p className="font-bold text-text-primary mt-0.5">{passportStatusLabel}</p>
          </div>
          <Link
            href="/hunter/passport"
            className="ml-auto text-[0.8125rem] font-semibold text-text-secondary hover:text-text-primary transition-colors whitespace-nowrap"
          >
            {t('editPassport')} →
          </Link>
        </div>
      </div>

      {/* Readiness score card */}
      {brief && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Score ring */}
          <div className="bg-[#0F1117] rounded-2xl p-6 flex items-center gap-5">
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                <circle cx="40" cy="40" r="34" fill="none"
                  stroke={readinessScore >= 70 ? '#4ADE80' : readinessScore >= 40 ? '#FBBF24' : 'rgba(255,255,255,0.25)'}
                  strokeWidth="5"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - readinessScore / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-black text-white">{readinessScore}</span>
              </div>
            </div>
            <div>
              <p className="text-[0.75rem] font-semibold uppercase tracking-wider text-white/40">{t('readiness')}</p>
              <p className="text-lg font-bold text-white mt-0.5">
                {readinessScore >= 70 ? t('readinessHigh') : readinessScore >= 40 ? t('readinessMedium') : t('readinessLow')}
              </p>
              {readinessScore < 70 && (
                <Link href="/hunter/passport" className="text-xs font-semibold text-brand hover:text-[#BF6840] transition-colors mt-1 inline-block">
                  {t('boostReadiness')} →
                </Link>
              )}
            </div>
          </div>

          {/* Early access tier */}
          <div className={`rounded-2xl p-6 flex flex-col justify-between min-h-[120px] ${
            earlyAccessTier === 'priority' ? 'bg-gradient-to-br from-[#0F1117] to-[#2A1A10] border border-brand/20'
            : earlyAccessTier === 'standard' ? 'bg-[#0F1117]'
            : 'bg-white'
          }`}>
            <p className={`text-[0.75rem] font-semibold uppercase tracking-wider ${
              earlyAccessTier !== 'none' ? 'text-white/40' : 'text-text-secondary'
            }`}>{t('earlyAccess')}</p>
            <div className="mt-2">
              {earlyAccessTier === 'priority' && (
                <p className="text-lg font-bold text-brand">{t('earlyAccessPriority')}</p>
              )}
              {earlyAccessTier === 'standard' && (
                <p className="text-lg font-bold text-[#60A5FA]">{t('earlyAccessStandard')}</p>
              )}
              {earlyAccessTier === 'none' && (
                <>
                  <p className="text-lg font-bold text-[#C5C8D0]">{t('earlyAccessLocked')}</p>
                  <Link href="/hunter/passport" className="text-xs font-semibold text-brand hover:text-[#BF6840] transition-colors mt-1 inline-block">
                    {t('unlockEarlyAccess')} →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Early access listings */}
      {visibleEarlyAccess.length > 0 && (
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-widest text-text-secondary mb-3">{t('earlyAccessListings')}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleEarlyAccess.slice(0, 6).map((listing: any) => {
              const price = listing.intent === 'sale' ? listing.sale_price : listing.rent_price
              const cur = listing.currency || 'GBP'
              const formatted = price
                ? new Intl.NumberFormat('en-GB', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(fromMinorUnits(price, cur))
                : null
              return (
                <Link
                  key={listing.id}
                  href={`/p/${listing.slug ?? listing.place_id}`}
                  className="bg-white rounded-2xl p-4 hover:-translate-y-0.5 hover:shadow-lg transition-all will-change-transform border border-border-default group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-brand/10 text-brand">
                      {earlyAccessTier === 'priority' ? t('earlyAccessPriorityBadge') : t('earlyAccessBadge')}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-text-primary group-hover:text-brand transition-colors truncate">
                    {locale === 'en' ? (listing.title_en ?? listing.title) : (listing.title ?? listing.title_en)}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">{listing.postcode} {listing.city}</p>
                  {formatted && (
                    <p className="font-bold text-text-primary mt-2">{formatted}</p>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Nudge for stuck/passive hunters */}
      {isStuck && (
        <div className="bg-gradient-to-r from-[#FFF7ED] to-[#FFF4EF] border border-brand/15 rounded-2xl p-6">
          <p className="font-bold text-text-primary mb-1">{t('nudgeTitle')}</p>
          <p className="text-sm text-text-secondary mb-4">{t('nudgeBody')}</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/hunter/passport" className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors">
              {t('nudgeUpdatePassport')}
            </Link>
            <Link href="/listings" className="inline-flex items-center gap-1.5 bg-white border border-border-default hover:border-brand/30 text-text-primary font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
              {t('nudgeBrowse')}
            </Link>
          </div>
        </div>
      )}

      {/* Quick-access module grid */}
      <div>
        <p className="text-[0.7rem] font-bold uppercase tracking-widest text-text-secondary mb-3">{t('modules')}</p>
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
            accentClass="bg-bg"
            accentLabel="AG"
            lightAccent
          />
          <ModuleCard
            href="/hunter/inbox"
            title={t('inbox')}
            subtitle={t('inboxDesc')}
            accentClass="bg-bg"
            accentLabel="IN"
            lightAccent
            badge={matchCount}
          />
          <ModuleCard
            href="/hunter/settings"
            title={t('settings')}
            subtitle={t('settingsDesc')}
            accentClass="bg-bg"
            accentLabel="ES"
            lightAccent
          />
        </div>
      </div>

      {/* Viewings section */}
      <div>
        <p className="text-[0.7rem] font-bold uppercase tracking-widest text-text-secondary mb-3">{t('viewingRequests')}</p>

        {viewings.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-text-secondary text-sm mb-5">{t('noViewingRequests')}</p>
            <Link
              href="/listings"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-text-primary font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
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
              const title = listing?.title_de ?? t('listingFallback')
              const location = listing ? `${listing.postcode} ${listing.city}` : ''
              const date = new Date(viewing.created_at).toLocaleDateString(dateLocale, {
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
                className="text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
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
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[0.65rem] font-black tracking-wider flex-shrink-0 ${accentClass} ${lightAccent ? 'text-text-secondary' : 'text-white'}`}>
        {accentLabel}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-[0.9375rem] text-text-primary group-hover:text-text-primary">{title}</p>
          {badge > 0 && (
            <span className="text-[0.6rem] font-black min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-red-500 text-white flex items-center justify-center">
              {badge}
            </span>
          )}
        </div>
        <p className="text-[0.8125rem] text-text-secondary mt-0.5 truncate">{subtitle}</p>
      </div>
      <svg className="w-4 h-4 text-[#C5C8D0] group-hover:text-text-primary flex-shrink-0 transition-colors" style={{ transition: 'color 0.15s cubic-bezier(0.16,1,0.3,1)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  )
}
