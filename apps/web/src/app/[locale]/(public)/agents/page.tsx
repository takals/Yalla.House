import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { MapPin, Shield, Home, Building2, TreePine, Hammer, Users } from 'lucide-react'
import { AgentSearch } from './agent-search'

interface SearchParams {
  postcode?: string
}

interface Agent {
  user_id: string
  agency_name: string | null
  focus: string | null
  verified_at: string | null
  coverage_areas: any
  property_types: string[] | null
}

const LONDON_AREAS = [
  { prefix: 'E', label: 'East London', range: 'E1–E20' },
  { prefix: 'N', label: 'North London', range: 'N1–N22' },
  { prefix: 'SE', label: 'South East London', range: 'SE1–SE28' },
  { prefix: 'SW', label: 'South West London', range: 'SW1–SW20' },
  { prefix: 'W', label: 'West London', range: 'W1–W14' },
  { prefix: 'NW', label: 'North West London', range: 'NW1–NW11' },
  { prefix: 'EC', label: 'Central London', range: 'EC, WC' },
]

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()
  const t = await getTranslations('agentDiscovery')
  const { postcode } = searchParams

  let agents: Agent[] = []
  let searchedPostcode: string | null = null

  if (postcode) {
    searchedPostcode = postcode.toUpperCase()

    // Fetch agents with coverage matching this postcode
    const { data } = await supabase
      .from('agent_profiles')
      .select(`
        user_id,
        agency_name,
        focus,
        verified_at,
        coverage_areas,
        property_types,
        users (
          id,
          email,
          full_name
        )
      `)
      .not('verified_at', 'is', null)
      .limit(500)

    if (data) {
      // Filter agents whose coverage includes this postcode
      agents = (data as any[])
        .filter((agent) => {
          const areas = agent.coverage_areas || []
          return areas.some((area: any) => {
            const prefixes = area.postcode_prefixes || []
            return prefixes.some((p: string) =>
              searchedPostcode?.startsWith(p.toUpperCase())
            )
          })
        })
        .sort((a, b) => {
          // Verified first, then by agency name
          if (a.verified_at && !b.verified_at) return -1
          if (!a.verified_at && b.verified_at) return 1
          return (a.agency_name || '').localeCompare(b.agency_name || '')
        })
    }
  }

  const focusLabel = (focus: string | null) => {
    switch (focus) {
      case 'sale':
        return t('focusSale')
      case 'rent':
        return t('focusRent')
      case 'both':
        return t('focusBoth')
      default:
        return t('focusBoth')
    }
  }

  const propertyTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      residential: <Home size={16} className="text-brand" />,
      commercial: <Building2 size={16} className="text-brand" />,
      land: <TreePine size={16} className="text-brand" />,
      new_build: <Hammer size={16} className="text-brand" />,
      multi_unit: <Users size={16} className="text-brand" />,
    }
    return icons[type] || <Home size={16} className="text-brand" />
  }

  return (
    <main className="bg-page-dark min-h-screen">
      {/* ── HERO ────────────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-display text-white mb-6">
            {t('title')}
          </h1>
          <p className="text-lede text-text-on-dark-secondary max-w-2xl mx-auto mb-12">
            {t('subtitle')}
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <AgentSearch currentPostcode={searchedPostcode || undefined} />
          </div>
        </div>
      </section>

      {/* ── SEARCH RESULTS ─────────────────────────────────────────────────────── */}
      {searchedPostcode && (
        <section className="pb-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-12">
              <h2 className="text-title-1 text-white mb-2">
                {agents.length > 0
                  ? `${agents.length} ${agents.length === 1 ? 'Agent' : 'Agents'} in ${searchedPostcode}`
                  : t('noAgentsFound')
                }
              </h2>
              {agents.length === 0 && (
                <p className="text-text-on-dark-secondary">
                  {t('noAgentsDesc')}
                </p>
              )}
            </div>

            {agents.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.map((agent) => (
                  <div
                    key={agent.user_id}
                    className="bg-surface-dark rounded-card-dark border border-white/[0.08] overflow-hidden hover:border-white/[0.12] transition-colors group"
                  >
                    {/* Header with verified badge */}
                    <div className="p-6 border-b border-white/[0.08]">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-bold text-white text-base leading-tight">
                            {agent.agency_name || 'Unnamed Agency'}
                          </h3>
                        </div>
                        {agent.verified_at && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-brand/10 rounded-full flex-shrink-0">
                            <Shield size={14} className="text-brand" />
                            <span className="text-xs font-semibold text-brand">
                              {t('verifiedBadge')}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-text-on-dark-muted">
                        {agent.focus ? focusLabel(agent.focus) : t('focusBoth')}
                      </p>
                    </div>

                    {/* Body */}
                    <div className="p-6 space-y-4">
                      {/* Coverage areas */}
                      {agent.coverage_areas && agent.coverage_areas.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-text-on-dark-muted uppercase tracking-widest mb-2">
                            {t('coverageLabel')}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {agent.coverage_areas.slice(0, 3).map((area: any, idx: number) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-brand/10 rounded-full text-xs text-text-on-dark-secondary font-medium"
                              >
                                <MapPin size={12} />
                                {area.region || 'London'}
                              </span>
                            ))}
                            {agent.coverage_areas.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 text-xs text-text-on-dark-muted">
                                +{agent.coverage_areas.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Property types */}
                      {agent.property_types && agent.property_types.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-text-on-dark-muted uppercase tracking-widest mb-2">
                            Properties
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {agent.property_types.map((type: string) => (
                              <div
                                key={type}
                                className="w-6 h-6 rounded-md bg-brand/10 flex items-center justify-center"
                                title={type.replace('_', ' ')}
                              >
                                {propertyTypeIcon(type)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="px-6 py-4 border-t border-white/[0.08]">
                      <Link
                        href="/auth/login"
                        className="block w-full text-center py-2.5 bg-brand hover:bg-brand-hover text-white font-semibold rounded-lg transition-[background-color] duration-300 text-sm"
                      >
                        {t('sendBrief')}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── BROWSE BY AREA ─────────────────────────────────────────────────────── */}
      {!searchedPostcode && (
        <section className="pb-24 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-title-1 text-white mb-3">
                {t('browseByArea')}
              </h2>
              <p className="text-text-on-dark-secondary max-w-xl mx-auto">
                Select your area to see available agents
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {LONDON_AREAS.map((area) => (
                <Link
                  key={area.prefix}
                  href={`/agents?postcode=${area.prefix}`}
                  className="group"
                >
                  <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-8 hover:border-brand/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center group-hover:bg-brand/20 transition-colors">
                        <MapPin size={20} className="text-brand" />
                      </div>
                    </div>
                    <h3 className="font-bold text-white text-lg mb-1">
                      {area.label}
                    </h3>
                    <p className="text-sm text-text-on-dark-muted">
                      {area.range}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── STATS BAR ──────────────────────────────────────────────────────────── */}
      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-brand mb-2">
                  17,000+
                </div>
                <p className="text-sm text-text-on-dark-secondary">
                  {t('statsAgents')}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-brand mb-2">
                  100+
                </div>
                <p className="text-sm text-text-on-dark-secondary">
                  {t('statsAreas')}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-brand mb-2">
                  £0
                </div>
                <p className="text-sm text-text-on-dark-secondary">
                  {t('statsFree')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AGENT CTA ──────────────────────────────────────────────────────────── */}
      <section className="relative pb-32 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #D4764E 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-title-1 text-white leading-tight mb-4">
            {t('joinCta')}
          </h2>
          <p className="text-text-on-dark-secondary mb-8 max-w-xl mx-auto">
            {t('joinDesc')}
          </p>
          <Link href="/auth/login">
            <button className="px-8 py-4 bg-brand hover:bg-brand-hover text-white font-semibold rounded-full transition-all duration-300">
              {t('joinButton')}
            </button>
          </Link>
        </div>
      </section>
    </main>
  )
}
