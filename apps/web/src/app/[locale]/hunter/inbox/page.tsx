import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import Link from 'next/link'
import { MatchFeed } from './match-feed'

interface Source {
  id: string
  source_name: string
  alias_email: string
  status: string
  last_received_at: string | null
  listings_count: number
}

interface RawMatch {
  id: string
  address: string
  price: number | null
  currency: string
  bedrooms: number | null
  bathrooms: number | null
  tenure: string | null
  match_score: number
  match_breakdown: Record<string, boolean>
  status: string
  received_at: string
  source: { source_name: string } | null
}

export default async function InboxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Derive alias from email prefix
  const aliasEmail = user?.email
    ? `${user.email.split('@')[0]}@yalla.house`
    : 'ihr-name@yalla.house'

  const [sourcesResult, matchesResult] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('agent_inbox_sources') as any)
      .select('id, source_name, alias_email, status, last_received_at, listings_count')
      .eq('hunter_id', userId)
      .order('created_at', { ascending: false }),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('property_matches') as any)
      .select(`
        id, address, price, currency, bedrooms, bathrooms, tenure,
        match_score, match_breakdown, status, received_at,
        source:agent_inbox_sources!source_id(source_name)
      `)
      .eq('hunter_id', userId)
      .in('status', ['new', 'saved'])
      .order('match_score', { ascending: false })
      .limit(100),
  ])

  const sources: Source[] = sourcesResult.data ?? []
  const matches = (matchesResult.data ?? []).map((m: RawMatch) => ({
    ...m,
    source_name: m.source?.source_name ?? 'Unbekannte Quelle',
  }))

  const bestMatches = matches.filter((m: RawMatch & { source_name: string }) => m.match_score >= 80)
  const possibleMatches = matches.filter((m: RawMatch & { source_name: string }) => m.match_score >= 40 && m.match_score < 80)

  return (
    <div className="max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Makler-Posteingang</h1>
          <p className="text-[#5E6278] text-sm">
            Passende Objekte aus Makler-Newslettern — gefiltert nach deinem Brief.
          </p>
        </div>

        {/* Alias address card */}
        <div className="bg-surface rounded-card p-5 mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-[#5E6278] uppercase tracking-wide mb-1">
              Deine Yalla.House Posteingang-Adresse
            </p>
            <p className="font-bold text-lg">{aliasEmail}</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-800 border border-green-200 flex-shrink-0">
            Aktiv
          </span>
        </div>

        {/* Sources */}
        {sources.length > 0 && (
          <div className="bg-surface rounded-card p-5 mb-6">
            <h3 className="font-semibold mb-4">Verbundene Quellen ({sources.length})</h3>
            <div className="space-y-3">
              {sources.map((src) => (
                <div key={src.id} className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{src.source_name}</p>
                    <p className="text-xs text-[#999]">
                      {src.alias_email}
                      {src.last_received_at && ` · Letzte E-Mail: ${new Date(src.last_received_at).toLocaleDateString('de-DE')}`}
                      {` · ${src.listings_count} Objekte`}
                    </p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    src.status === 'active'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  }`}>
                    {src.status === 'active' ? 'Aktiv' : 'Stummgeschaltet'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Match feed */}
        {matches.length === 0 ? (
          <div className="bg-surface rounded-card p-12 text-center">
            <p className="text-[#5E6278] mb-2 font-medium">Noch keine Treffer</p>
            <p className="text-sm text-[#999]">
              Sobald ein Makler seinen Newsletter an deine Yalla.House-Adresse sendet, erscheinen passende Objekte hier.
            </p>
            <Link
              href="/hunter/agents"
              className="inline-block mt-5 text-sm font-semibold text-[#0F1117] hover:underline"
            >
              Makler verbinden →
            </Link>
          </div>
        ) : (
          <MatchFeed bestMatches={bestMatches} possibleMatches={possibleMatches} />
        )}

    </div>
  )
}
