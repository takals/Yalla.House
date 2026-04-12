import { inngest } from '@/lib/inngest/client'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * score-response — Triggered when an agent submits a reply to a search brief.
 *
 * Calculates a relevance_score (0–100) based on how well the agent's reply
 * matches the hunter's search criteria, then assigns a priority tier.
 *
 * Weights (from design doc Section D1):
 *   Area match       25%
 *   Budget match     25%
 *   Intent match     15%
 *   Property type    10%
 *   Notes/prefs fit  10%
 *   Response quality 15%
 */

const WEIGHTS = {
  area: 0.25,
  budget: 0.25,
  intent: 0.15,
  propertyType: 0.10,
  notesFit: 0.10,
  quality: 0.15,
} as const

interface SuggestedProperty {
  title?: string
  price?: number
  url?: string
  beds?: number
  area?: string
  lat?: number
  lng?: number
}

function assignTier(score: number): 'top_match' | 'other' | 'low_relevance' {
  if (score >= 70) return 'top_match'
  if (score >= 30) return 'other'
  return 'low_relevance'
}

export const scoreResponse = inngest.createFunction(
  { id: 'search.score-response', retries: 2 },
  { event: 'search/response.received' },
  async ({ event, step }) => {
    const { agentMatchId, agentResponseId } = event.data
    const db = createServiceClient()

    // 1. Fetch the response + match + search request
    const { data: response } = await step.run('fetch-response', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (db as any)
        .from('agent_responses')
        .select('id, message, properties')
        .eq('id', agentResponseId)
        .single()
    })

    if (!response) {
      return { skipped: true, reason: 'response not found' }
    }

    const { data: match } = await step.run('fetch-match', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (db as any)
        .from('agent_matches')
        .select('id, search_request_id')
        .eq('id', agentMatchId)
        .single()
    })

    if (!match) {
      return { skipped: true, reason: 'match not found' }
    }

    const { data: search } = await step.run('fetch-search', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (db as any)
        .from('search_requests')
        .select('*')
        .eq('id', match.search_request_id)
        .single()
    })

    if (!search) {
      return { skipped: true, reason: 'search not found' }
    }

    // 2. Score the response
    const properties: SuggestedProperty[] = Array.isArray(response.properties)
      ? response.properties : []

    // Area match: check if suggested properties are in the search area
    const searchAreas = Array.isArray(search.areas) ? search.areas : []
    const searchPostcodes = searchAreas
      .map((a: { postcode?: string }) => a.postcode)
      .filter(Boolean) as string[]

    let areaScore = 50 // default if no geo data
    if (properties.length > 0 && searchPostcodes.length > 0) {
      const inArea = properties.filter(p =>
        p.area && searchPostcodes.some(sp =>
          p.area!.includes(sp) || sp.includes(p.area!)
        )
      )
      areaScore = properties.length > 0
        ? Math.round((inArea.length / properties.length) * 100)
        : 0
    }

    // Budget match: check if suggested property prices fall within ±20% of budget
    let budgetScore = 50
    if (properties.length > 0 && (search.budget_min || search.budget_max)) {
      const tolerance = 0.20
      const sMin = (search.budget_min ?? 0) * (1 - tolerance)
      const sMax = (search.budget_max ?? Number.MAX_SAFE_INTEGER) * (1 + tolerance)
      const inBudget = properties.filter(p =>
        p.price && p.price >= sMin && p.price <= sMax
      )
      budgetScore = Math.round((inBudget.length / properties.length) * 100)
    }

    // Intent match: assume the agent responds to the correct intent (high default)
    const intentScore = 80

    // Property type fit
    const searchTypes = search.property_types ?? []
    let typeScore = 50
    if (properties.length > 0 && searchTypes.length > 0) {
      // Simple: check property titles/areas for type keywords
      const typeKeywords = searchTypes.map((t: string) => t.toLowerCase())
      const matching = properties.filter(p =>
        p.title && typeKeywords.some((kw: string) =>
          p.title!.toLowerCase().includes(kw)
        )
      )
      typeScore = properties.length > 0
        ? Math.round((matching.length / properties.length) * 100)
        : 50
    }

    // Notes/prefs fit: keyword matching against hunter's free-text notes
    let notesScore = 50
    if (search.notes && response.message) {
      const noteWords = search.notes.toLowerCase().split(/\s+/).filter(
        (w: string) => w.length > 3
      )
      if (noteWords.length > 0) {
        const msgLower = response.message.toLowerCase()
        const matched = noteWords.filter((w: string) => msgLower.includes(w))
        notesScore = Math.round((matched.length / noteWords.length) * 100)
      }
    }

    // Response quality: based on specificity
    let qualityScore = 0
    if (properties.length > 0) qualityScore += 40
    if (properties.length >= 2) qualityScore += 20
    if (properties.some((p: SuggestedProperty) => p.price)) qualityScore += 15
    if (properties.some((p: SuggestedProperty) => p.beds)) qualityScore += 10
    if (response.message.length > 100) qualityScore += 15
    qualityScore = Math.min(qualityScore, 100)

    // Check for generic/template reply (auto-downgrade by 20 points)
    const genericPhrases = [
      'call us', 'contact us', 'we have many', 'please call',
      'reach out', 'get in touch', 'ring us',
    ]
    const isGeneric = genericPhrases.some(phrase =>
      response.message.toLowerCase().includes(phrase)
    ) && properties.length === 0
    const templatePenalty = isGeneric ? 20 : 0

    const rawScore = Math.round(
      areaScore * WEIGHTS.area +
      budgetScore * WEIGHTS.budget +
      intentScore * WEIGHTS.intent +
      typeScore * WEIGHTS.propertyType +
      notesScore * WEIGHTS.notesFit +
      qualityScore * WEIGHTS.quality
    )

    const finalScore = Math.max(0, rawScore - templatePenalty)
    const tier = assignTier(finalScore)

    // 3. Update the response with score + tier
    await step.run('update-response', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db as any)
        .from('agent_responses')
        .update({
          relevance_score: finalScore,
          priority_tier: tier,
        })
        .eq('id', agentResponseId)
    })

    // 4. Update the match status → responded
    await step.run('update-match', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (db as any)
        .from('agent_matches')
        .update({ status: 'responded' })
        .eq('id', agentMatchId)
    })

    return {
      responseId: agentResponseId,
      relevanceScore: finalScore,
      priorityTier: tier,
      breakdown: {
        area: areaScore,
        budget: budgetScore,
        intent: intentScore,
        propertyType: typeScore,
        notesFit: notesScore,
        quality: qualityScore,
        templatePenalty,
      },
    }
  }
)
