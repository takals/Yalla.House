import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations, getLocale } from 'next-intl/server'
import Link from 'next/link'

export default async function AgentBriefsPage() {
  const t = await getTranslations('agentBriefs')
  const locale = await getLocale()
  const dateLocale = locale === 'de' ? 'de-DE' : 'en-GB'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch all matches assigned to this agent
  const { data: matches } = await (supabase as any)
    .from('agent_matches')
    .select(`
      id, match_score, score_breakdown, status, sent_at, expires_at, created_at,
      search:search_requests!agent_matches_search_request_id_fkey(
        id, intent, areas, radius_km, budget_min, budget_max, currency,
        property_types, bedrooms_min, bedrooms_max, timeline, notes, languages
      ),
      response:agent_responses(id, relevance_score, priority_tier)
    `)
    .eq('agent_id', userId)
    .in('status', ['sent', 'responded'])
    .order('created_at', { ascending: false })

  const briefs = matches ?? []
  const pending = briefs.filter((m: { status: string }) => m.status === 'sent')
  const responded = briefs.filter((m: { status: string }) => m.status === 'responded')

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">{t('pageTitle')}</h1>
        <p className="text-text-secondary text-sm">
          {t('pageSubtitle')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface rounded-lg p-4 border border-border-default text-center">
          <p className="text-2xl font-bold">{briefs.length}</p>
          <p className="text-xs text-text-secondary">{t('totalBriefs')}</p>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-border-default text-center">
          <p className="text-2xl font-bold text-brand">{pending.length}</p>
          <p className="text-xs text-text-secondary">{t('awaitingReply')}</p>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-border-default text-center">
          <p className="text-2xl font-bold text-[#166534]">{responded.length}</p>
          <p className="text-xs text-text-secondary">{t('replied')}</p>
        </div>
      </div>

      {/* Pending briefs */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand" />
            {t('awaitingYourReply', { count: pending.length })}
          </h2>
          <div className="space-y-3">
            {pending.map((m: {
              id: string
              match_score: number
              sent_at: string
              expires_at: string
              search: {
                intent: string
                areas: { name?: string }[]
                budget_min: number | null
                budget_max: number | null
                currency: string
                property_types: string[]
                bedrooms_min: number | null
                bedrooms_max: number | null
                timeline: string
                notes: string | null
              }
            }) => (
              <div key={m.id} className="bg-surface rounded-xl border-2 border-brand/40 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-solid-bg text-brand-badge-text border border-brand/30">
                      {t('match', { score: m.match_score })}
                    </span>
                    <span className="text-xs text-text-secondary capitalize">{m.search.intent}</span>
                  </div>
                  <span className="text-xs text-[#999]">
                    {t('expires', { date: new Date(m.expires_at).toLocaleDateString(dateLocale) })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <span className="text-xs text-text-secondary font-semibold">{t('labelArea')}</span>{' '}
                    {Array.isArray(m.search.areas)
                      ? m.search.areas.map(a => a.name).filter(Boolean).join(', ')
                      : '—'}
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary font-semibold">{t('labelBudget')}</span>{' '}
                    {m.search.budget_min || m.search.budget_max
                      ? `${m.search.currency} ${m.search.budget_min ? (m.search.budget_min / 100).toLocaleString() : '—'}–${m.search.budget_max ? (m.search.budget_max / 100).toLocaleString() : '—'}`
                      : t('budgetFlexible')}
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary font-semibold">{t('labelType')}</span>{' '}
                    {m.search.property_types?.join(', ') || t('typeAny')}
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary font-semibold">{t('labelBeds')}</span>{' '}
                    {m.search.bedrooms_min ?? '—'}–{m.search.bedrooms_max ?? '—'}
                  </div>
                  <div>
                    <span className="text-xs text-text-secondary font-semibold">{t('labelTimeline')}</span>{' '}
                    <span className="capitalize">{m.search.timeline?.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                {m.search.notes && (
                  <p className="text-xs text-text-secondary bg-hover-bg rounded-lg p-2 mb-3">
                    <span className="font-semibold">{t('labelNotes')}</span> {m.search.notes}
                  </p>
                )}

                <Link
                  href={`/agent/briefs/${m.id}`}
                  className="inline-block px-4 py-2 bg-brand text-black text-sm font-bold rounded-lg hover:bg-brand-hover transition"
                >
                  {t('replyToBrief')}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Responded briefs */}
      {responded.length > 0 && (
        <div>
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            {t('repliedCount', { count: responded.length })}
          </h2>
          <div className="space-y-2">
            {responded.map((m: {
              id: string
              match_score: number
              search: { intent: string; areas: { name?: string }[] }
              response: { id: string; relevance_score: number | null; priority_tier: string | null }[]
            }) => (
              <div key={m.id} className="bg-surface rounded-lg border border-border-default p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold capitalize">
                    {m.search.intent} ·{' '}
                    {Array.isArray(m.search.areas) ? m.search.areas.map(a => a.name).filter(Boolean).join(', ') : '—'}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {t('match', { score: m.match_score })}
                    {m.response?.[0]?.relevance_score !== undefined && (
                      <> · {t('relevance', { score: m.response[0].relevance_score })}</>
                    )}
                    {m.response?.[0]?.priority_tier && (
                      <> · {m.response[0].priority_tier.replace(/_/g, ' ')}</>
                    )}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                  {t('replied')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {briefs.length === 0 && (
        <div className="bg-surface rounded-xl p-12 text-center border border-border-default">
          <p className="text-text-secondary font-medium mb-2">{t('emptyTitle')}</p>
          <p className="text-xs text-[#999]">
            {t('emptyDescription')}
          </p>
        </div>
      )}
    </div>
  )
}
