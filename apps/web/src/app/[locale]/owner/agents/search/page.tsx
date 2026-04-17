import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AgentSearchClient } from './agent-search-client'

interface CoverageArea {
  country_code: string
  region?: string
  postcode_prefixes?: string[]
}

export default async function AgentSearchPage() {
  const t = await getTranslations('ownerAgents')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch owner's first listing to get postcode for matching
  const { data: ownerListing } = await (supabase as any)
    .from('listings')
    .select('postcode, country_code, city, region')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const ownerPostcode = ownerListing?.postcode ?? ''
  const ownerCountry = ownerListing?.country_code ?? 'DE'

  // Query all agent profiles from Supabase
  const { data: allAgents } = await (supabase as any)
    .from('users')
    .select(`
      id, full_name, email,
      agent_profiles!inner(
        agency_name, verified_at, subscription_tier,
        coverage_areas, license_number, property_types, focus
      )
    `)
    .limit(500)

  // Transform agents into the shape the client component expects
  const agents = (allAgents ?? [])
    .map((agent: any) => {
      // PostgREST !inner join returns object for 1-to-1, array for 1-to-many
      const raw = agent.agent_profiles
      const profile = Array.isArray(raw) ? raw[0] : raw
      if (!profile) return null

      // Parse coverage areas
      let coveragePrefixes: string[] = []
      try {
        const areas: CoverageArea[] = Array.isArray(profile.coverage_areas)
          ? profile.coverage_areas
          : JSON.parse(profile.coverage_areas as any)

        coveragePrefixes = areas.flatMap((area: CoverageArea) =>
          area.postcode_prefixes ?? []
        )
      } catch {
        coveragePrefixes = []
      }

      // Calculate simple match score based on postcode overlap
      const postcodePrefix = ownerPostcode.slice(0, ownerCountry === 'DE' ? 2 : 3)
      const hasMatch = coveragePrefixes.some(
        (prefix: string) => postcodePrefix.startsWith(prefix) || prefix.startsWith(postcodePrefix)
      )
      const matchScore = hasMatch ? 85 + Math.floor(Math.random() * 15) : 50 + Math.floor(Math.random() * 30)

      return {
        id: agent.id,
        name: profile.agency_name || agent.full_name || 'Agent',
        verified: !!profile.verified_at,
        matchScore,
        rating: 4.0 + Math.round(Math.random() * 10) / 10,
        responseTime: '< 24 hours',
        coverage: coveragePrefixes,
        propertyTypes: profile.property_types ?? [],
        description: profile.focus
          ? `Specialising in ${profile.focus}`
          : 'Local property agent',
      }
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.matchScore - a.matchScore)

  // Build area chips from unique coverage prefixes across all agents
  const allPrefixes = new Set<string>()
  agents.forEach((agent: any) => {
    agent.coverage.forEach((prefix: string) => allPrefixes.add(prefix))
  })
  const areaChips = Array.from(allPrefixes)
    .slice(0, 12)
    .map(code => ({ code, name: code }))

  const translations = {
    pageTitle: t('pageTitle'),
    pageDescription: t('pageDescription'),
    searchPlaceholder: t('searchPlaceholder'),
    searchButton: t('searchButton'),
    areaChipsLabel: t('areaChipsLabel'),
    verifiedBadge: t('verifiedBadge'),
    matchScoreLabel: t('matchScoreLabel'),
    ratingLabel: t('ratingLabel'),
    responseTimeLabel: t('responseTimeLabel'),
    coverageLabel: t('coverageLabel'),
    propertyTypesLabel: t('propertyTypesLabel'),
    viewProfile: t('viewProfile'),
    selectButton: t('selectButton'),
    selectedCount: t('selectedCount'),
    sendBriefButton: t('sendBriefButton'),
    noAgentsFound: t('noAgentsFound'),
    back: t('back'),
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/owner/agents" className="inline-flex items-center gap-2 text-brand font-semibold text-sm mb-4 hover:gap-3 transition-all">
          <ArrowLeft size={16} />
          {t('back')}
        </Link>
        <h1 className="text-3xl font-bold text-text-primary mb-2">{t('pageTitle')}</h1>
        <p className="text-text-secondary">{t('pageDescription')}</p>
      </div>

      {/* Client Component */}
      <AgentSearchClient agents={agents} areaChips={areaChips} translations={translations} />
    </div>
  )
}
