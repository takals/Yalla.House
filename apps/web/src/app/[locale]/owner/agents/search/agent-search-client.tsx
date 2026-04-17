'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, MapPin, Shield, Star, Send, CheckCircle2, X } from 'lucide-react'

interface Agent {
  id: string
  name: string
  verified: boolean
  matchScore: number
  rating: number
  responseTime: string
  coverage: string[]
  propertyTypes: string[]
  description: string
}

interface AreaChip {
  code: string
  name: string
}

interface Translations {
  pageTitle: string
  pageDescription: string
  searchPlaceholder: string
  searchButton: string
  areaChipsLabel: string
  verifiedBadge: string
  matchScoreLabel: string
  ratingLabel: string
  responseTimeLabel: string
  coverageLabel: string
  propertyTypesLabel: string
  viewProfile: string
  selectButton: string
  selectedCount: string
  sendBriefButton: string
  noAgentsFound: string
  back: string
}

interface AgentSearchClientProps {
  agents: Agent[]
  areaChips: AreaChip[]
  translations: Translations
}

export function AgentSearchClient({ agents, areaChips, translations }: AgentSearchClientProps) {
  const router = useRouter()
  const [postcode, setPostcode] = useState('')
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])

  // Filter agents based on postcode and selected areas
  const filteredAgents = useMemo(() => {
    let filtered = agents

    // Filter by postcode (simple prefix match)
    if (postcode.trim()) {
      const code = postcode.trim().toUpperCase()
      filtered = filtered.filter(agent =>
        agent.coverage.some(c => code.startsWith(c) || c.startsWith(code))
      )
    }

    // Filter by selected areas
    if (selectedAreas.length > 0) {
      filtered = filtered.filter(agent =>
        selectedAreas.some(area => agent.coverage.includes(area))
      )
    }

    // Sort by match score (descending)
    return filtered.sort((a, b) => b.matchScore - a.matchScore)
  }, [postcode, selectedAreas, agents])

  const toggleAgentSelection = (agentId: string) => {
    setSelectedAgents(prev =>
      prev.includes(agentId)
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    )
  }

  const handleSendBrief = () => {
    const agentIds = selectedAgents.join(',')
    router.push(`/owner/agents/send?agents=${agentIds}`)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'text-[#D9DCE4]'}
          />
        ))}
        <span className="text-xs text-text-secondary ml-1">{rating}</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-border-default p-6">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <MapPin size={16} className="absolute left-4 top-3.5 text-text-secondary" />
            <input
              type="text"
              placeholder={translations.searchPlaceholder}
              value={postcode}
              onChange={e => setPostcode(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-bg rounded-lg text-sm text-text-primary placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#D4764E]"
            />
          </div>
          <button className="px-6 py-2.5 bg-brand text-white font-semibold rounded-lg hover:bg-[#C26039] transition-colors">
            {translations.searchButton}
          </button>
        </div>

        {/* Area Chips */}
        <div>
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">{translations.areaChipsLabel}</p>
          <div className="flex flex-wrap gap-2">
            {areaChips.map(area => (
              <button
                key={area.code}
                onClick={() => {
                  setSelectedAreas(prev =>
                    prev.includes(area.code)
                      ? prev.filter(c => c !== area.code)
                      : [...prev, area.code]
                  )
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                  selectedAreas.includes(area.code)
                    ? 'bg-brand text-white'
                    : 'bg-bg text-text-primary hover:bg-hover-muted'
                }`}
              >
                {area.code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="space-y-4">
        {filteredAgents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border-default p-12 text-center">
            <p className="text-text-secondary">{translations.noAgentsFound}</p>
          </div>
        ) : (
          filteredAgents.map(agent => (
            <div
              key={agent.id}
              className="bg-white rounded-2xl border border-border-default p-6 hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-text-primary">{agent.name}</h3>
                    {agent.verified && (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-200">
                        <Shield size={12} />
                        {translations.verifiedBadge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary">{agent.description}</p>
                </div>
                <button
                  onClick={() => toggleAgentSelection(agent.id)}
                  className={`flex-shrink-0 ml-4 w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                    selectedAgents.includes(agent.id)
                      ? 'bg-brand border-brand'
                      : 'border-border-default hover:border-brand'
                  }`}
                >
                  {selectedAgents.includes(agent.id) && (
                    <CheckCircle2 size={18} className="text-white" />
                  )}
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-4 gap-4 mb-4 py-4 border-y border-border-default">
                <div>
                  <p className="text-xs text-text-secondary font-semibold mb-1">{translations.matchScoreLabel}</p>
                  <p className="font-bold text-text-primary">{agent.matchScore}%</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary font-semibold mb-1">{translations.ratingLabel}</p>
                  {renderStars(agent.rating)}
                </div>
                <div>
                  <p className="text-xs text-text-secondary font-semibold mb-1">{translations.responseTimeLabel}</p>
                  <p className="font-semibold text-sm text-text-primary">{agent.responseTime}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary font-semibold mb-1">{translations.coverageLabel}</p>
                  <p className="font-semibold text-sm text-text-primary">{agent.coverage.length} areas</p>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-text-secondary font-semibold mb-2">{translations.propertyTypesLabel}</p>
                  <div className="flex flex-wrap gap-2">
                    {agent.propertyTypes.map(type => (
                      <span
                        key={type}
                        className="inline-block bg-bg text-text-secondary text-xs font-semibold px-3 py-1 rounded-full"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-border-default">
                <Link href={`/owner/agents/profile/${agent.id}`} className="flex-1">
                  <button className="w-full text-sm font-semibold text-text-secondary py-2 hover:text-text-primary transition-colors">
                    {translations.viewProfile}
                  </button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Bar */}
      {selectedAgents.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-default p-6 shadow-lg">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="text-sm font-semibold text-text-primary">
              {selectedAgents.length} {translations.selectedCount}
            </div>
            <button
              onClick={handleSendBrief}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand text-white font-semibold rounded-lg hover:bg-[#C26039] transition-colors"
            >
              <Send size={16} />
              {translations.sendBriefButton}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
