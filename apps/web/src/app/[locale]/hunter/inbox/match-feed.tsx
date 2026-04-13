'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { MatchCard } from './match-card'

interface MatchItem {
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
  source_name: string
  received_at: string
}

interface Props {
  bestMatches: MatchItem[]
  possibleMatches: MatchItem[]
}

type Tab = 'best' | 'possible'

export function MatchFeed({ bestMatches, possibleMatches }: Props) {
  const t = useTranslations('hunterDashboard')
  const [tab, setTab] = useState<Tab>('best')

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'best', label: t('bestMatches'), count: bestMatches.length },
    { key: 'possible', label: t('possible'), count: possibleMatches.length },
  ]

  const active = tab === 'best' ? bestMatches : possibleMatches

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b-2 border-[#E2E4EB] mb-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 text-sm font-bold border-b-2 -mb-0.5 transition-colors ${
              tab === t.key
                ? 'text-[#0F1117] border-brand'
                : 'text-[#5E6278] border-transparent hover:text-[#0F1117]'
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Cards */}
      {active.length === 0 ? (
        <div className="bg-surface rounded-card p-8 text-center text-sm text-[#5E6278]">
          {t('noMatches')}
        </div>
      ) : (
        <div className="space-y-3">
          {active.map(m => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      )}
    </div>
  )
}
