import { inngest } from '@/lib/inngest/client'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * match-agents — Triggered when a hunter grants consent for agent outreach.
 *
 * Queries agent_profiles for agents whose coverage area, property type focus,
 * and budget range overlap with the search request. Scores each agent using a
 * weighted model and inserts the top 8 as agent_match rows.
 *
 * Weights (from design doc Section C3):
 *   Area overlap   35%
 *   Intent match   20%
 *   Budget align   20%
 *   Property type  15%
 *   Language match  10%
 */

const WEIGHTS = {
  area: 0.35,
  intent: 0.20,
  budget: 0.20,
  propertyType: 0.15,
  language: 0.10,
} as const

const MATCH_THRESHOLD = 50
const MAX_MATCHES = 8

interface SearchArea {
  name?: string
  lat?: number
  lng?: number
  postcode?: string
}

interface AgentCoverage {
  country_code?: string
  region?: string
  postcode_prefixes?: string[]
}

interface AgentPriceBand {
  min?: number
  max?: number
  currency?: string
}

export const matchAgents = inngest.createFunction(
  { id: 'search.match-agents', retries: 2 },
  { event: 'search/consent.granted' },
  async ({ event, step }) => {
    const { searchRequestId, hunterId } = event.data
    const db = createServiceClient()

    // 1. Fetch the search request
    const { data: search, error: searchErr } = await step.run('fetch-search', async () => {
      return (db as any)
        .from('search_requests')
        .select('*')
        .eq('id', searchRequestId)
        .single()
    })

    if (searchErr || !search) {
      return { skipped: true, reason: 'search request not found' }
    }

    // 2. Fetch blocked agents for this hunter
    const { data: blocked } = await step.run('fetch-blocked', async () => {
      return (db as any)
        .from('blocked_agents')
        .select('agent_id')
        .eq('hunter_id', hunterId)
    })
    const blockedIds = new Set((blocked ?? []).map((b: { agent_id: string }) => b.agent_id))

    // 3. Fetch all active agents (exclude the hunter themselves)
    const { data: agents } = await step.run('fetch-agents', async () => {
      return (db as any)
        .from('agent_profiles')
        .select('user_id, coverage_areas, property_types, price_bands, languages, focus')
        .neq('user_id', hunterId)
    })

    if (!agents || agents.length === 0) {
      return { skipped: true, reason: 'no agents available' }
    }

    // 4. Score each agent against the search
    const searchAreas: SearchArea[] = Array.isArray(search.areas) ? search.areas : []
    const searchPostcodes = searchAreas
      .map((a: SearchArea) => a.postcode)
      .filter(Boolean) as string[]

    type ScoredAgent = {
      agentId: string
      score: number
      breakdown: Record<string, number>
    }

    const scored: ScoredAgent[] = agents
      .filter((a: { user_id: string }) => !blockedIds.has(a.user_id))
      .map((agent: {
        user_id: string
        coverage_areas: AgentCoverage[] | null
        property_types: string[] | null
        price_bands: AgentPriceBand[] | null
        languages: string[] | null
        focus: string | null
      }) => {
        // Area overlap: check if agent coverage postcodes overlap with search postcodes
        const agentAreas: AgentCoverage[] = Array.isArray(agent.coverage_areas)
          ? agent.coverage_areas : []
        const agentPostcodes = agentAreas.flatMap(
          (a: AgentCoverage) => a.postcode_prefixes ?? []
        )
        const areaScore = searchPostcodes.length > 0 && agentPostcodes.length > 0
          ? searchPostcodes.some(sp =>
              agentPostcodes.some((ap: string) =>
                sp.startsWith(ap) || ap.startsWith(sp)
              )
            ) ? 100 : 0
          : 50 // partial credit if no postcode data

        // Intent match
        const agentFocus = agent.focus ?? 'both'
        const intentScore =
          agentFocus === 'both' ? 100
          : (agentFocus === 'sale' && search.intent === 'buy') ? 100
          : (agentFocus === 'rent' && search.intent === 'rent') ? 100
          : 0

        // Budget alignment
        const agentBands: AgentPriceBand[] = Array.isArray(agent.price_bands)
          ? agent.price_bands : []
        let budgetScore = 50 // default if no data
        if (agentBands.length > 0 && (search.budget_min || search.budget_max)) {
          const sameCurrency = agentBands.filter(
            (b: AgentPriceBand) => !b.currency || b.currency === search.currency
          )
          if (sameCurrency.length > 0) {
            const overlap = sameCurrency.some((band: AgentPriceBand) => {
              const bMin = band.min ?? 0
              const bMax = band.max ?? Number.MAX_SAFE_INTEGER
              const sMin = search.budget_min ?? 0
              const sMax = search.budget_max ?? Number.MAX_SAFE_INTEGER
              return bMin <= sMax && bMax >= sMin
            })
            budgetScore = overlap ? 100 : 0
          }
        }

        // Property type match
        const agentTypes = agent.property_types ?? []
        const searchTypes = search.property_types ?? []
        const typeScore = searchTypes.length === 0 ? 50
          : agentTypes.some((t: string) => searchTypes.includes(t)) ? 100 : 0

        // Language match
        const agentLangs = agent.languages ?? ['de']
        const searchLangs: string[] = search.languages ?? ['en']
        const langScore = agentLangs.some((l: string) => searchLangs.includes(l)) ? 100 : 0

        const total = Math.round(
          areaScore * WEIGHTS.area +
          intentScore * WEIGHTS.intent +
          budgetScore * WEIGHTS.budget +
          typeScore * WEIGHTS.propertyType +
          langScore * WEIGHTS.language
        )

        return {
          agentId: agent.user_id,
          score: total,
          breakdown: {
            area: areaScore,
            intent: intentScore,
            budget: budgetScore,
            propertyType: typeScore,
            language: langScore,
          },
        }
      })
      .filter((s: ScoredAgent) => s.score >= MATCH_THRESHOLD)
      .sort((a: ScoredAgent, b: ScoredAgent) => b.score - a.score)
      .slice(0, MAX_MATCHES)

    if (scored.length === 0) {
      return { matched: 0, reason: 'no agents above threshold' }
    }

    // 5. Insert agent_match rows
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const matchRows = scored.map((s: ScoredAgent) => ({
      search_request_id: searchRequestId,
      agent_id: s.agentId,
      match_score: s.score,
      score_breakdown: s.breakdown,
      status: 'pending',
    }))

    const { data: inserted, error: insertErr } = await step.run('insert-matches', async () => {
      return (db as any)
        .from('agent_matches')
        .insert(matchRows)
        .select('id')
    })

    if (insertErr) {
      throw new Error(`Failed to insert agent matches: ${insertErr.message}`)
    }

    const matchIds = (inserted ?? []).map((m: { id: string }) => m.id)

    // 6. Trigger brief distribution
    await step.sendEvent('distribute-briefs', {
      name: 'search/agents.matched',
      data: { searchRequestId, matchIds },
    })

    return { matched: matchIds.length, matchIds, scores: scored.map((s: ScoredAgent) => s.score) }
  }
)
