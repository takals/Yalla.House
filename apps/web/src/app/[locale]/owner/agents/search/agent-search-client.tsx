'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, MapPin, Shield, Phone, Mail, Globe, Building2, Copy,
  CheckCircle2, Send, AlertCircle, Loader2, ChevronDown, ChevronUp,
  ExternalLink, UserPlus,
} from 'lucide-react'

interface Agent {
  id: string
  agencyName: string
  branchManager: string | null
  address: string | null
  postcode: string | null
  phone: string | null
  email: string | null
  website: string | null
  source: string | null
  sourceUrl: string | null
  verifiedAt: string | null
  serviceTypes: string[]
  propertyTypes: string[]
  portalPresence: string[]
  focus: string | null
  matchScore: number
  matchType: string
}

interface SearchMeta {
  total: number
  query: string
  area: string
  district: string
  radius: string
  error?: string
}

type RadiusTier = 'district' | 'area' | 'wide'

interface Props {
  translations: Record<string, string>
}

export function AgentSearchClient({ translations: t }: Props) {
  const router = useRouter()
  const [postcode, setPostcode] = useState('')
  const [agents, setAgents] = useState<Agent[]>([])
  const [meta, setMeta] = useState<SearchMeta | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [radius, setRadius] = useState<RadiusTier>('area')
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set())
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const doSearch = useCallback(async (searchPostcode: string, searchRadius: RadiusTier) => {
    if (!searchPostcode.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const params = new URLSearchParams({
        postcode: searchPostcode.trim(),
        radius: searchRadius,
        limit: '80',
      })
      const res = await fetch(`/api/agents/search?${params}`)
      const data = await res.json()
      setAgents(data.agents ?? [])
      setMeta(data.meta ?? null)
    } catch {
      setAgents([])
      setMeta({ total: 0, query: searchPostcode, area: '', district: '', radius: searchRadius, error: 'network' })
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSearch = () => {
    doSearch(postcode, radius)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  const handleRadiusChange = (newRadius: RadiusTier) => {
    setRadius(newRadius)
    if (searched && postcode.trim()) {
      doSearch(postcode, newRadius)
    }
  }

  const toggleAgent = (id: string) => {
    setSelectedAgents(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSendBrief = () => {
    const ids = Array.from(selectedAgents).join(',')
    router.push(`/owner/agents/send?agents=${ids}`)
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const radiusTiers: { key: RadiusTier; label: string }[] = [
    { key: 'district', label: t.radiusDistrict ?? 'Exact match' },
    { key: 'area', label: t.radiusArea ?? 'Same area' },
    { key: 'wide', label: t.radiusWide ?? 'Wider search' },
  ]

  return (
    <div className="space-y-6">
      {/* ── Search Bar ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border-default p-5">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <MapPin size={16} className="absolute left-4 top-3.5 text-text-muted" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={postcode}
              onChange={e => setPostcode(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2.5 bg-bg rounded-xl text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 transition-shadow"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !postcode.trim()}
            className="px-6 py-2.5 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {loading ? t.searching : t.searchButton}
          </button>
        </div>

        {/* Radius Selector */}
        <div className="flex items-center gap-2 mt-3">
          {radiusTiers.map(tier => (
            <button
              key={tier.key}
              onClick={() => handleRadiusChange(tier.key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                radius === tier.key
                  ? 'bg-brand text-white'
                  : 'bg-bg text-text-secondary hover:text-text-primary hover:bg-bg-muted'
              }`}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── States ──────────────────────────────────────────────────── */}

      {/* Initial state — no search yet */}
      {!searched && !loading && (
        <div className="bg-white rounded-2xl border border-border-default p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-brand" />
          </div>
          <h3 className="font-bold text-text-primary mb-1">{t.enterPostcodePrompt}</h3>
          <p className="text-sm text-text-secondary max-w-sm mx-auto">{t.enterPostcodeHint}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white rounded-2xl border border-border-default p-12 text-center">
          <Loader2 size={32} className="animate-spin text-brand mx-auto mb-3" />
          <p className="text-sm font-semibold text-text-primary">{t.loadingAgents}</p>
        </div>
      )}

      {/* Invalid postcode */}
      {searched && !loading && meta?.error === 'invalid_postcode' && (
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
            <AlertCircle size={22} className="text-red-500" />
          </div>
          <h3 className="font-bold text-text-primary mb-1">{t.invalidPostcode}</h3>
          <p className="text-sm text-text-secondary">{t.invalidPostcodeHint}</p>
        </div>
      )}

      {/* No results */}
      {searched && !loading && !meta?.error && agents.length === 0 && (
        <div className="bg-white rounded-2xl border border-border-default p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-3">
            <MapPin size={22} className="text-amber-600" />
          </div>
          <h3 className="font-bold text-text-primary mb-1">{t.noResults}</h3>
          <p className="text-sm text-text-secondary mb-5 max-w-md mx-auto">{t.noResultsHint}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {radius !== 'area' && (
              <button
                onClick={() => handleRadiusChange('area')}
                className="text-sm font-semibold px-4 py-2 bg-brand/10 text-brand rounded-lg hover:bg-brand/20 transition-colors"
              >
                {t.expandArea}
              </button>
            )}
            {radius !== 'wide' && (
              <button
                onClick={() => handleRadiusChange('wide')}
                className="text-sm font-semibold px-4 py-2 bg-brand/10 text-brand rounded-lg hover:bg-brand/20 transition-colors"
              >
                {t.expandWide}
              </button>
            )}
            <button
              onClick={() => router.push('/owner/agents')}
              className="text-sm font-semibold px-4 py-2 bg-bg text-text-secondary rounded-lg hover:bg-bg-muted transition-colors"
            >
              {t.inviteManually}
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {searched && !loading && meta?.error === 'network' && (
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center">
          <AlertCircle size={22} className="text-red-500 mx-auto mb-3" />
          <h3 className="font-bold text-text-primary mb-1">{t.errorGeneric}</h3>
          <button onClick={handleSearch} className="text-sm font-semibold text-brand mt-2">{t.tryAgain}</button>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────── */}
      {searched && !loading && agents.length > 0 && (
        <>
          {/* Result count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              <span className="font-bold text-text-primary">{agents.length}</span>{' '}
              {agents.length === 1 ? t.resultCount : t.resultCountPlural}
              {meta?.query && (
                <span className="ml-1">
                  &mdash; <span className="font-semibold">{meta.query}</span>
                </span>
              )}
            </p>
          </div>

          {/* Agent cards */}
          <div className="space-y-3">
            {agents.map(agent => {
              const isSelected = selectedAgents.has(agent.id)
              const isExpanded = expandedAgent === agent.id

              return (
                <div
                  key={agent.id}
                  className={`bg-white rounded-xl border transition-all ${
                    isSelected
                      ? 'border-brand shadow-sm ring-1 ring-brand/20'
                      : 'border-border-default hover:border-border-dark'
                  }`}
                >
                  {/* Main row */}
                  <div className="p-4 flex items-start gap-4">
                    {/* Select checkbox */}
                    <button
                      onClick={() => toggleAgent(agent.id)}
                      className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-brand border-brand'
                          : 'border-border-default hover:border-brand'
                      }`}
                    >
                      {isSelected && <CheckCircle2 size={14} className="text-white" />}
                    </button>

                    {/* Agent info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-text-primary text-[0.9375rem] truncate">
                          {agent.agencyName}
                        </h3>
                        {agent.verifiedAt && (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200">
                            <Shield size={10} />
                            {t.verifiedBadge}
                          </span>
                        )}
                        <span className="text-xs font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-full">
                          {agent.matchScore}%
                        </span>
                      </div>

                      {/* Address line */}
                      {agent.address && (
                        <p className="text-xs text-text-secondary truncate">{agent.address}</p>
                      )}

                      {/* Quick contact row */}
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        {agent.phone && (
                          <button
                            onClick={() => copyToClipboard(agent.phone!, `phone-${agent.id}`)}
                            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                          >
                            <Phone size={12} />
                            <span>{agent.phone}</span>
                            {copiedField === `phone-${agent.id}` ? (
                              <span className="text-green-600 font-semibold">{t.copied}</span>
                            ) : (
                              <Copy size={10} className="text-text-muted" />
                            )}
                          </button>
                        )}
                        {agent.email && (
                          <button
                            onClick={() => copyToClipboard(agent.email!, `email-${agent.id}`)}
                            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
                          >
                            <Mail size={12} />
                            <span className="truncate max-w-[180px]">{agent.email}</span>
                            {copiedField === `email-${agent.id}` ? (
                              <span className="text-green-600 font-semibold">{t.copied}</span>
                            ) : (
                              <Copy size={10} className="text-text-muted" />
                            )}
                          </button>
                        )}
                        {agent.website && (
                          <a
                            href={agent.website.startsWith('http') ? agent.website : `https://${agent.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-brand hover:underline"
                          >
                            <Globe size={12} />
                            {t.websiteLabel}
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>

                      {/* Service types */}
                      {agent.serviceTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {agent.serviceTypes.slice(0, isExpanded ? undefined : 3).map(type => (
                            <span
                              key={type}
                              className="text-[10px] font-semibold bg-bg text-text-secondary px-2 py-0.5 rounded-full"
                            >
                              {type}
                            </span>
                          ))}
                          {!isExpanded && agent.serviceTypes.length > 3 && (
                            <span className="text-[10px] font-semibold text-text-muted px-1">
                              +{agent.serviceTypes.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Expand/collapse */}
                    <button
                      onClick={() => setExpandedAgent(isExpanded ? null : agent.id)}
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:bg-bg transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-border-default mx-4 mt-0 pt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-bold text-text-muted uppercase tracking-wider">{t.addressLabel}</span>
                          <p className="text-text-primary mt-0.5">{agent.address ?? '—'}</p>
                        </div>
                        <div>
                          <span className="font-bold text-text-muted uppercase tracking-wider">{t.postcodeLabel}</span>
                          <p className="text-text-primary mt-0.5">{agent.postcode ?? '—'}</p>
                        </div>
                        <div>
                          <span className="font-bold text-text-muted uppercase tracking-wider">{t.sourceLabel}</span>
                          <p className="text-text-primary mt-0.5 capitalize">{agent.source ?? '—'}</p>
                        </div>
                        <div>
                          <span className="font-bold text-text-muted uppercase tracking-wider">{t.verifiedLabel}</span>
                          <p className="text-text-primary mt-0.5">
                            {agent.verifiedAt
                              ? new Date(agent.verifiedAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric' })
                              : '—'}
                          </p>
                        </div>
                      </div>

                      {agent.serviceTypes.length > 0 && (
                        <div>
                          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{t.serviceTypesLabel}</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {agent.serviceTypes.map(type => (
                              <span key={type} className="text-[10px] font-semibold bg-bg text-text-secondary px-2 py-0.5 rounded-full">
                                {type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {agent.portalPresence.length > 0 && (
                        <div>
                          <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{t.coverageLabel}</span>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {agent.portalPresence.map(portal => (
                              <span key={portal} className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                                {portal}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Data transparency note */}
          <p className="text-[11px] text-text-muted text-center py-2">{t.dataNote}</p>
        </>
      )}

      {/* ── Floating Action Bar ─────────────────────────────────────── */}
      {selectedAgents.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border-default p-4 shadow-lg z-50">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center">
                <UserPlus size={14} className="text-white" />
              </div>
              <span className="text-sm font-bold text-text-primary">
                {selectedAgents.size} {t.selectedCount}
              </span>
            </div>
            <button
              onClick={handleSendBrief}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand text-white font-bold rounded-xl hover:bg-brand-hover transition-colors text-sm"
            >
              <Send size={16} />
              {t.sendBriefButton}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
