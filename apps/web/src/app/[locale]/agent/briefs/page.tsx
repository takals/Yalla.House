import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function AgentBriefsPage() {
  const t = await getTranslations('agentBriefs')
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
        <h1 className="text-2xl font-bold mb-1">Search Briefs</h1>
        <p className="text-[#5E6278] text-sm">
          Home-Hunters looking for properties in your area. Reply to connect.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface rounded-lg p-4 border border-[#E2E4EB] text-center">
          <p className="text-2xl font-bold">{briefs.length}</p>
          <p className="text-xs text-[#5E6278]">Total briefs</p>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-[#E2E4EB] text-center">
          <p className="text-2xl font-bold text-brand">{pending.length}</p>
          <p className="text-xs text-[#5E6278]">Awaiting reply</p>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-[#E2E4EB] text-center">
          <p className="text-2xl font-bold text-[#166534]">{responded.length}</p>
          <p className="text-xs text-[#5E6278]">Replied</p>
        </div>
      </div>

      {/* Pending briefs */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand" />
            Awaiting Your Reply ({pending.length})
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
                      Match {m.match_score}%
                    </span>
                    <span className="text-xs text-[#5E6278] capitalize">{m.search.intent}</span>
                  </div>
                  <span className="text-xs text-[#999]">
                    Expires {new Date(m.expires_at).toLocaleDateString('en-GB')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <span className="text-xs text-[#5E6278] font-semibold">Area:</span>{' '}
                    {Array.isArray(m.search.areas)
                      ? m.search.areas.map(a => a.name).filter(Boolean).join(', ')
                      : '—'}
                  </div>
                  <div>
                    <span className="text-xs text-[#5E6278] font-semibold">Budget:</span>{' '}
                    {m.search.budget_min || m.search.budget_max
                      ? `${m.search.currency} ${m.search.budget_min ? (m.search.budget_min / 100).toLocaleString() : '—'}–${m.search.budget_max ? (m.search.budget_max / 100).toLocaleString() : '—'}`
                      : 'Flexible'}
                  </div>
                  <div>
                    <span className="text-xs text-[#5E6278] font-semibold">Type:</span>{' '}
                    {m.search.property_types?.join(', ') || 'Any'}
                  </div>
                  <div>
                    <span className="text-xs text-[#5E6278] font-semibold">Beds:</span>{' '}
                    {m.search.bedrooms_min ?? '—'}–{m.search.bedrooms_max ?? '—'}
                  </div>
                  <div>
                    <span className="text-xs text-[#5E6278] font-semibold">Timeline:</span>{' '}
                    <span className="capitalize">{m.search.timeline?.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                {m.search.notes && (
                  <p className="text-xs text-[#5E6278] bg-[#F5F5F7] rounded-lg p-2 mb-3">
                    <span className="font-semibold">Notes:</span> {m.search.notes}
                  </p>
                )}

                <Link
                  href={`/agent/briefs/${m.id}`}
                  className="inline-block px-4 py-2 bg-brand text-black text-sm font-bold rounded-lg hover:bg-brand-hover transition"
                >
                  Reply to Brief →
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
            Replied ({responded.length})
          </h2>
          <div className="space-y-2">
            {responded.map((m: {
              id: string
              match_score: number
              search: { intent: string; areas: { name?: string }[] }
              response: { id: string; relevance_score: number | null; priority_tier: string | null }[]
            }) => (
              <div key={m.id} className="bg-surface rounded-lg border border-[#E2E4EB] p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold capitalize">
                    {m.search.intent} ·{' '}
                    {Array.isArray(m.search.areas) ? m.search.areas.map(a => a.name).filter(Boolean).join(', ') : '—'}
                  </p>
                  <p className="text-xs text-[#5E6278]">
                    Match {m.match_score}%
                    {m.response?.[0]?.relevance_score !== undefined && (
                      <> · Relevance {m.response[0].relevance_score}%</>
                    )}
                    {m.response?.[0]?.priority_tier && (
                      <> · {m.response[0].priority_tier.replace(/_/g, ' ')}</>
                    )}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                  Replied
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {briefs.length === 0 && (
        <div className="bg-surface rounded-xl p-12 text-center border border-[#E2E4EB]">
          <p className="text-[#5E6278] font-medium mb-2">No search briefs yet</p>
          <p className="text-xs text-[#999]">
            When Home-Hunters in your area create a search and enable agent outreach,
            their brief will appear here.
          </p>
        </div>
      )}
    </div>
  )
}
