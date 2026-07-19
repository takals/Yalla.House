'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { BadgeCheck, Building2, MapPin } from 'lucide-react'
import { claimAgentProfileAction } from './actions'

export interface ClaimCandidate {
  user_id: string
  agency_name: string | null
  raw_address: string | null
  postcode: string | null
  website: string | null
}

export function ClaimCard({ candidates }: { candidates: ClaimCandidate[] }) {
  const t = useTranslations('agentProfile')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [claimed, setClaimed] = useState(false)

  function handleClaim(candidateId: string) {
    setError(null)
    startTransition(async () => {
      const result = await claimAgentProfileAction(candidateId)
      if ('success' in result) {
        setClaimed(true)
        router.refresh()
      } else if ('error' in result) {
        setError(result.error)
      }
    })
  }

  if (claimed) {
    return (
      <div className="mb-6 rounded-2xl border border-brand bg-brand-solid-bg p-6 flex items-start gap-4">
        <BadgeCheck size={24} className="text-brand flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-text-primary mb-1">{t('claimSuccessTitle')}</h3>
          <p className="text-sm text-text-secondary">{t('claimSuccessBody')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-2xl border-2 border-brand bg-brand-solid-bg p-6">
      <div className="flex items-start gap-3 mb-4">
        <BadgeCheck size={22} className="text-brand flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-text-primary">{t('claimFoundTitle')}</h3>
          <p className="text-sm text-text-secondary">{t('claimFoundBody')}</p>
        </div>
      </div>

      <div className="space-y-3">
        {candidates.map(c => (
          <div
            key={c.user_id}
            className="bg-white rounded-xl border border-border-default p-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-bold text-text-primary">
                <Building2 size={15} className="text-brand flex-shrink-0" />
                <span className="truncate">{c.agency_name ?? t('claimUnnamedAgency')}</span>
              </div>
              {(c.raw_address || c.postcode) && (
                <div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
                  <MapPin size={13} className="flex-shrink-0" />
                  <span className="truncate">{[c.raw_address, c.postcode].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => handleClaim(c.user_id)}
              disabled={isPending}
              className="px-5 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-bold text-sm rounded-lg transition-colors"
            >
              {isPending ? t('claimPending') : t('claimButton')}
            </button>
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      <p className="text-xs text-text-secondary mt-4">{t('claimNotYou')}</p>
    </div>
  )
}
