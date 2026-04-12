'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Search, X } from 'lucide-react'

interface AgentSearchProps {
  currentPostcode?: string
}

export function AgentSearch({ currentPostcode }: AgentSearchProps) {
  const router = useRouter()
  const t = useTranslations('agentDiscovery')
  const [postcode, setPostcode] = useState(currentPostcode || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!postcode.trim()) return

    setIsLoading(true)
    const normalized = postcode.trim().toUpperCase().replace(/\s+/g, '')
    router.push(`/agents?postcode=${encodeURIComponent(normalized)}`)
  }

  const handleClear = () => {
    setPostcode('')
    router.push('/agents')
  }

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-on-dark-muted pointer-events-none" />
            <input
              type="text"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-surface-dark border border-white/[0.08] rounded-lg px-4 py-3 pl-12 text-white placeholder:text-text-on-dark-muted focus:outline-none focus:border-brand/50 transition-colors"
            />
            {postcode && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-on-dark-muted hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || !postcode.trim()}
          className="px-6 py-3 bg-brand hover:bg-brand-hover text-white font-semibold rounded-lg transition-[background-color] duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {isLoading ? '...' : t('searchButton')}
        </button>
      </div>
    </form>
  )
}
