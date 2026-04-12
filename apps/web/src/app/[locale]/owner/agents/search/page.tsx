import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AgentSearchClient } from './agent-search-client'

export default async function AgentSearchPage() {
  const t = await getTranslations('ownerAgents')

  // Mock agent data for now - in production this would come from Supabase
  const mockAgents = [
    {
      id: 'agent-1',
      name: 'John Smith & Co',
      verified: true,
      matchScore: 95,
      rating: 4.8,
      responseTime: '< 2 hours',
      coverage: ['E3', 'E1', 'E2'],
      propertyTypes: ['Houses', 'Flats', 'New Builds'],
      description: 'Specializing in East London residential sales',
    },
    {
      id: 'agent-2',
      name: 'London Heights Estates',
      verified: true,
      matchScore: 88,
      rating: 4.6,
      responseTime: '< 4 hours',
      coverage: ['E1', 'EC1', 'EC2'],
      propertyTypes: ['Flats', 'Commercial'],
      description: 'Premium agent with access to major portals',
    },
    {
      id: 'agent-3',
      name: 'City Centre Properties',
      verified: false,
      matchScore: 82,
      rating: 4.3,
      responseTime: '< 1 day',
      coverage: ['E3', 'E8', 'E9'],
      propertyTypes: ['Houses', 'Flats'],
      description: 'Full-service agent covering North and East London',
    },
    {
      id: 'agent-4',
      name: 'Riverside Lettings & Sales',
      verified: true,
      matchScore: 90,
      rating: 4.7,
      responseTime: '< 3 hours',
      coverage: ['E1', 'E3', 'E14'],
      propertyTypes: ['Houses', 'Flats', 'Investment'],
      description: 'Boutique agent with strong local presence',
    },
    {
      id: 'agent-5',
      name: 'Tower Bridge Area Agents',
      verified: true,
      matchScore: 85,
      rating: 4.5,
      responseTime: '< 6 hours',
      coverage: ['E1', 'SE1', 'SE16'],
      propertyTypes: ['Flats', 'Luxury'],
      description: 'Specialist in riverside and luxury properties',
    },
  ]

  const areaChips = [
    { code: 'E1', name: 'Shoreditch' },
    { code: 'E2', name: 'Bethnal Green' },
    { code: 'E3', name: 'Bow' },
    { code: 'E8', name: 'Hackney' },
    { code: 'E9', name: 'Homerton' },
    { code: 'EC1', name: 'Clerkenwell' },
    { code: 'EC2', name: 'Moorgate' },
    { code: 'N1', name: 'Angel' },
    { code: 'SE1', name: 'Southwark' },
    { code: 'W1', name: 'Mayfair' },
  ]

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
        <Link href="/owner/agents" className="inline-flex items-center gap-2 text-[#D4764E] font-semibold text-sm mb-4 hover:gap-3 transition-all">
          <ArrowLeft size={16} />
          {t('back')}
        </Link>
        <h1 className="text-3xl font-bold text-[#0F1117] mb-2">{t('pageTitle')}</h1>
        <p className="text-[#5E6278]">{t('pageDescription')}</p>
      </div>

      {/* Client Component */}
      <AgentSearchClient agents={mockAgents} areaChips={areaChips} translations={translations} />
    </div>
  )
}
