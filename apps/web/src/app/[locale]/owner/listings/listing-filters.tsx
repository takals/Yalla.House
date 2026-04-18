'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

interface FilterDef {
  key: string
  labelKey: string
  count: number
}

interface ListingFiltersProps {
  counts: Record<string, number>
  translations: Record<string, string>
}

const FILTERS: Omit<FilterDef, 'count'>[] = [
  { key: 'all', labelKey: 'filterAll' },
  { key: 'active', labelKey: 'filterLive' },
  { key: 'draft', labelKey: 'filterDrafts' },
  { key: 'under_offer', labelKey: 'filterUnderOffer' },
  { key: 'archived', labelKey: 'filterArchived' },
]

export default function ListingFilters({ counts, translations }: ListingFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentFilter = searchParams.get('status') ?? 'all'

  const handleFilter = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (key === 'all') {
        params.delete('status')
      } else {
        params.set('status', key)
      }
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {FILTERS.map(({ key, labelKey }) => {
        const isActive = currentFilter === key
        const count = counts[key] ?? 0
        return (
          <button
            key={key}
            onClick={() => handleFilter(key)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors will-change-transform ${
              isActive
                ? 'bg-[#0F1117] text-white'
                : 'bg-surface text-text-secondary border border-border-default hover:bg-bg'
            }`}
          >
            {translations[labelKey] ?? labelKey}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-bg text-text-muted'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
