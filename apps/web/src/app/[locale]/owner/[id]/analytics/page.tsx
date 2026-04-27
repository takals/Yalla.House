import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { redirect } from 'next/navigation'
import { getTranslations, getLocale } from 'next-intl/server'
import Link from 'next/link'
import type { Metadata } from 'next'
import { dateLocaleFromLocale } from '@/lib/country-config'
import {
  ArrowLeft,
  Users,
  MousePointerClick,
  CalendarCheck,
  CalendarCheck2,
  UserPlus,
  UserCheck,
  Clock,
  MessageCircle,
  Mail,
  Smartphone,
  Globe,
  MoreHorizontal,
} from 'lucide-react'

interface Props {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('ownerAnalytics')
  return {
    title: `${t('title')} | Yalla.House`,
    robots: { index: false, follow: false },
  }
}

export default async function AnalyticsPage({ params }: Props) {
  const { id, locale } = await params
  const t = await getTranslations('ownerAnalytics')
  const dateLocale = dateLocaleFromLocale(locale)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Verify ownership
  const { data: listing } = await supabase
    .from('listings')
    .select('id, place_id, slug, status, created_at, title_de, title')
    .eq('id', id)
    .eq('owner_id', userId)
    .single()

  if (!listing) redirect('/owner')

  // Parallel fetch all analytics data
  const [
    { data: leads },
    { data: viewingsData },
    { data: agents },
  ] = await Promise.all([
    (supabase as any)
      .from('inbound_leads')
      .select('id, channel, source, reply_channel, link_clicked_at, created_at, status, contact_name')
      .eq('listing_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('viewings')
      .select('id, status, scheduled_at, created_at')
      .eq('listing_id', id)
      .order('created_at', { ascending: false }),
    (supabase as any)
      .from('listing_agent_assignments')
      .select('id, status, invited_at, accepted_at, revoked_at, created_at')
      .eq('listing_id', id)
      .order('created_at', { ascending: false }),
  ])

  const viewings = viewingsData ?? []

  const leadsList = (leads ?? []) as Array<{
    id: string; channel: string; source: string | null; reply_channel: string | null
    link_clicked_at: string | null; created_at: string | null; status: string; contact_name: string | null
  }>
  const agentsList = (agents ?? []) as Array<{
    id: string; status: string; invited_at: string; accepted_at: string | null
    revoked_at: string | null; created_at: string
  }>

  // ── Compute metrics ────────────────────────────────────────
  const totalLeads = leadsList.length
  const linkClicks = leadsList.filter(l => l.link_clicked_at).length

  const viewingsBooked = viewings.length
  const viewingsCompleted = viewings.filter((v: { status: string }) =>
    v.status === 'completed'
  ).length
  const viewingsConfirmed = viewings.filter((v: { status: string }) =>
    v.status === 'confirmed' || v.status === 'completed'
  ).length
  const viewingsCancelled = viewings.filter((v: { status: string }) =>
    v.status === 'cancelled'
  ).length

  const agentsInvited = agentsList.length
  const agentsAccepted = agentsList.filter(a => a.status === 'accepted' || a.accepted_at).length
  const agentsRevoked = agentsList.filter(a => a.status === 'revoked' || a.revoked_at).length

  // Lead source breakdown — use translation keys for display labels
  const sourceKeyMap: Record<string, string> = {
    whatsapp: 'sourceWhatsApp',
    sms: 'sourceSms',
    email: 'sourceEmail',
    web: 'sourceWebsite',
    other: 'sourceOther',
  }
  const sourceMap: Record<string, number> = {}
  for (const lead of leadsList) {
    const src = lead.reply_channel ?? lead.channel ?? 'other'
    const key = sourceKeyMap[src] ?? 'sourceOther'
    sourceMap[key] = (sourceMap[key] ?? 0) + 1
  }
  const sourceEntries = Object.entries(sourceMap).sort((a, b) => b[1] - a[1])
  const maxSourceCount = Math.max(...sourceEntries.map(([, c]) => c), 1)

  // Time on market
  const listedDate = listing.created_at ? new Date(listing.created_at) : new Date()
  const daysOnMarket = Math.max(1, Math.floor((Date.now() - listedDate.getTime()) / (1000 * 60 * 60 * 24)))

  // Recent activity (combined + sorted)
  type Activity = { type: 'lead' | 'viewing' | 'agent'; date: string; label: string }
  const activities: Activity[] = [
    ...leadsList.slice(0, 10).map(l => ({
      type: 'lead' as const,
      date: l.created_at ?? new Date().toISOString(),
      label: `${l.contact_name ?? t('activityLead', { channel: l.channel })}`,
    })),
    ...viewings.slice(0, 10).map((v: { status: string; created_at: string | null }) => ({
      type: 'viewing' as const,
      date: v.created_at ?? new Date().toISOString(),
      label: t('activityViewing', { status: v.status }),
    })),
    ...agentsList.slice(0, 10).map(a => ({
      type: 'agent' as const,
      date: a.created_at,
      label: t('activityAgent', { action: a.status }),
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8)

  const listingPath = listing.slug
    ? `/p/${listing.slug}`
    : `/p/${listing.place_id}`

  const SOURCE_ICONS: Record<string, typeof MessageCircle> = {
    sourceWhatsApp: MessageCircle,
    sourceSms: Smartphone,
    sourceEmail: Mail,
    sourceWebsite: Globe,
    sourceOther: MoreHorizontal,
  }

  const SOURCE_COLORS: Record<string, string> = {
    sourceWhatsApp: 'bg-green-500',
    sourceSms: 'bg-blue-500',
    sourceEmail: 'bg-purple-500',
    sourceWebsite: 'bg-brand',
    sourceOther: 'bg-gray-400',
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={listingPath}
          className="text-brand text-sm font-semibold mb-3 inline-flex items-center gap-1 hover:underline"
        >
          <ArrowLeft size={14} />
          {t('backToListing')}
        </Link>
        <h1 className="text-2xl font-bold mb-1">{t('title')}</h1>
        <p className="text-text-secondary text-sm">
          {locale === 'de' ? (listing.title_de ?? listing.title) : (listing.title ?? listing.title_de)} — {t('subtitle')}
        </p>
      </div>

      {/* ── KPI cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <KpiCard icon={<Users size={18} />} value={totalLeads} label={t('totalLeads')} />
        <KpiCard icon={<MousePointerClick size={18} />} value={linkClicks} label={t('linkClicks')} />
        <KpiCard icon={<CalendarCheck size={18} />} value={viewingsBooked} label={t('viewingsBooked')} />
        <KpiCard icon={<CalendarCheck2 size={18} />} value={viewingsCompleted} label={t('viewingsCompleted')} />
        <KpiCard icon={<UserPlus size={18} />} value={agentsInvited} label={t('agentsInvited')} />
        <KpiCard icon={<UserCheck size={18} />} value={agentsAccepted} label={t('agentsAccepted')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column: funnels + sources ──────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Lead Sources */}
          <div className="bg-surface rounded-card p-6 shadow-sm border border-border-default">
            <h2 className="text-sm font-bold mb-4">{t('leadSources')}</h2>
            {sourceEntries.length > 0 ? (
              <div className="space-y-3">
                {sourceEntries.map(([source, count]) => {
                  const Icon = SOURCE_ICONS[source] ?? MoreHorizontal
                  const barColor = SOURCE_COLORS[source] ?? 'bg-gray-400'
                  const pct = Math.round((count / maxSourceCount) * 100)
                  return (
                    <div key={source} className="flex items-center gap-3">
                      <div className="w-8 flex justify-center">
                        <Icon size={16} className="text-text-secondary" />
                      </div>
                      <span className="text-xs font-semibold text-text-primary w-20">{t(source)}</span>
                      <div className="flex-1 h-6 bg-bg rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-text-primary w-8 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-text-secondary">{t('noData')}</p>
            )}
          </div>

          {/* Viewings Funnel */}
          <div className="bg-surface rounded-card p-6 shadow-sm border border-border-default">
            <h2 className="text-sm font-bold mb-4">{t('viewingsFunnel')}</h2>
            {viewingsBooked > 0 ? (
              <div className="flex items-end gap-4">
                <FunnelBar value={viewingsBooked} label={t('funnelBooked')} max={viewingsBooked} color="bg-blue-400" />
                <FunnelBar value={viewingsConfirmed} label={t('funnelConfirmed')} max={viewingsBooked} color="bg-brand" />
                <FunnelBar value={viewingsCompleted} label={t('funnelCompleted')} max={viewingsBooked} color="bg-green-500" />
                <FunnelBar value={viewingsCancelled} label={t('funnelCancelled')} max={viewingsBooked} color="bg-red-400" />
              </div>
            ) : (
              <p className="text-xs text-text-secondary">{t('noData')}</p>
            )}
          </div>

          {/* Agent Performance */}
          <div className="bg-surface rounded-card p-6 shadow-sm border border-border-default">
            <h2 className="text-sm font-bold mb-4">{t('agentPerformance')}</h2>
            {agentsInvited > 0 ? (
              <div className="flex items-end gap-4">
                <FunnelBar value={agentsInvited} label={t('agentInvited')} max={agentsInvited} color="bg-blue-400" />
                <FunnelBar value={agentsAccepted} label={t('agentAccepted')} max={agentsInvited} color="bg-green-500" />
                <FunnelBar value={agentsRevoked} label={t('agentRevoked')} max={agentsInvited} color="bg-red-400" />
              </div>
            ) : (
              <p className="text-xs text-text-secondary">{t('noData')}</p>
            )}
          </div>
        </div>

        {/* ── Right column: timeline + time-on-market ─────────── */}
        <div className="space-y-6">
          {/* Time on market */}
          <div className="bg-surface rounded-card p-6 shadow-sm border border-border-default text-center">
            <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-3">
              <Clock size={22} className="text-brand" />
            </div>
            <p className="text-3xl font-extrabold text-text-primary">{daysOnMarket}</p>
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mt-1">
              {t('days')}
            </p>
            <p className="text-xs text-text-muted mt-2">
              {t('listedSince')} {listedDate.toLocaleDateString(dateLocale, {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Recent activity */}
          <div className="bg-surface rounded-card p-6 shadow-sm border border-border-default">
            <h2 className="text-sm font-bold mb-4">{t('recentActivity')}</h2>
            {activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((act, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      act.type === 'lead' ? 'bg-blue-500'
                        : act.type === 'viewing' ? 'bg-green-500'
                        : 'bg-brand'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-primary truncate">{act.label}</p>
                      <p className="text-[10px] text-text-muted">
                        {new Date(act.date).toLocaleDateString(dateLocale, {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs font-semibold text-text-secondary">{t('noActivity')}</p>
                <p className="text-[10px] text-text-muted mt-1">{t('noActivityDesc')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="bg-surface rounded-card p-4 shadow-sm border border-border-default text-center">
      <div className="text-brand mb-2 flex justify-center">{icon}</div>
      <p className="text-2xl font-extrabold text-text-primary">{value}</p>
      <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide mt-1">{label}</p>
    </div>
  )
}

function FunnelBar({ value, label, max, color }: { value: number; label: string; max: number; color: string }) {
  const heightPct = max > 0 ? Math.max(8, Math.round((value / max) * 100)) : 8
  return (
    <div className="flex-1 flex flex-col items-center">
      <p className="text-sm font-bold text-text-primary mb-1">{value}</p>
      <div className="w-full h-24 bg-bg rounded-lg flex items-end overflow-hidden">
        <div
          className={`w-full ${color} rounded-lg transition-all`}
          style={{ height: `${heightPct}%` }}
        />
      </div>
      <p className="text-[10px] font-semibold text-text-secondary mt-2 text-center">{label}</p>
    </div>
  )
}
