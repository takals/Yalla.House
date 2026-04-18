import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations, getLocale } from 'next-intl/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { ArrowLeft } from 'lucide-react'
import { ResponseForm } from './response-form'
import { dateLocaleFromLocale } from '@/lib/country-config'

export default async function RespondToBriefPage({
  params,
}: {
  params: Promise<{ matchId: string }>
}) {
  const t = await getTranslations('agentBriefs')
  const locale = await getLocale()
  const dateLocale = dateLocaleFromLocale(locale)
  const { matchId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch the match with search details
  const { data: match } = await (supabase as any)
    .from('agent_matches')
    .select(`
      id, match_score, score_breakdown, status, sent_at, expires_at,
      search:search_requests!agent_matches_search_request_id_fkey(
        id, intent, areas, radius_km, budget_min, budget_max, currency,
        property_types, bedrooms_min, bedrooms_max, timeline, notes, languages
      )
    `)
    .eq('id', matchId)
    .eq('agent_id', userId)
    .single()

  if (!match || match.status !== 'sent') {
    redirect('/agent/briefs')
  }

  const search = match.search

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <a href="/agent/briefs" className="text-sm text-text-secondary hover:text-text-primary transition mb-2 inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Back to briefs
        </a>
        <h1 className="text-2xl font-bold mb-1">Reply to Search Brief</h1>
        <p className="text-text-secondary text-sm">
          Share relevant property suggestions with this Home-Hunter.
        </p>
      </div>

      {/* Brief summary */}
      <div className="bg-surface rounded-2xl p-5 border border-border-default mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-solid-bg text-brand-badge-text border border-brand/30">
            Match {match.match_score}%
          </span>
          <span className="text-xs text-text-secondary capitalize">{search.intent}</span>
          <span className="text-xs text-text-muted ml-auto">
            Expires {new Date(match.expires_at).toLocaleDateString(dateLocale)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-text-secondary font-semibold mb-0.5">Target Area</p>
            <p>{Array.isArray(search.areas) ? search.areas.map((a: { name?: string }) => a.name).filter(Boolean).join(', ') : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary font-semibold mb-0.5">Budget Range</p>
            <p>
              {search.budget_min || search.budget_max
                ? `${search.currency} ${search.budget_min ? (search.budget_min / 100).toLocaleString() : '—'}–${search.budget_max ? (search.budget_max / 100).toLocaleString() : '—'}`
                : 'Flexible'}
            </p>
          </div>
          <div>
            <p className="text-xs text-text-secondary font-semibold mb-0.5">Property Type</p>
            <p className="capitalize">{search.property_types?.join(', ') || 'Any'}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary font-semibold mb-0.5">Bedrooms</p>
            <p>{search.bedrooms_min ?? '—'} – {search.bedrooms_max ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary font-semibold mb-0.5">Timeline</p>
            <p className="capitalize">{search.timeline?.replace(/_/g, ' ')}</p>
          </div>
          <div>
            <p className="text-xs text-text-secondary font-semibold mb-0.5">Languages</p>
            <p className="uppercase">{search.languages?.join(', ') || '—'}</p>
          </div>
        </div>

        {search.notes && (
          <div className="mt-3 bg-hover-bg rounded-lg p-3">
            <p className="text-xs text-text-secondary font-semibold mb-0.5">Preferences / Notes</p>
            <p className="text-sm">{search.notes}</p>
          </div>
        )}
      </div>

      {/* Response form */}
      <ResponseForm matchId={matchId} />
    </div>
  )
}
