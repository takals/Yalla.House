'use client'

import { useTransition, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Check, X } from 'lucide-react'
import { updateMatchStatusAction } from './actions'

interface Match {
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
  match: Match
}

function ScoreCircle({ score }: { score: number }) {
  const tier = score >= 80 ? 'high' : score >= 40 ? 'mid' : 'low'
  const styles = {
    high: 'bg-green-50 text-green-800 border-2 border-green-200',
    mid:  'bg-yellow-50 text-yellow-800 border-2 border-yellow-200',
    low:  'bg-gray-100 text-gray-500 border-2 border-[#D8DBE5]',
  }
  return (
    <div className={`w-14 h-14 rounded-full flex-shrink-0 flex flex-col items-center justify-center text-center ${styles[tier]}`}>
      <span className="text-base font-black leading-none">{score}%</span>
      <span className="text-[0.6rem] font-bold uppercase tracking-wide">match</span>
    </div>
  )
}

export function MatchCard({ match }: Props) {
  const t = useTranslations('hunterDashboard')
  const [isPending, startTransition] = useTransition()
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  function update(status: 'saved' | 'dismissed') {
    if (status === 'dismissed') setDismissed(true)
    startTransition(async () => { await updateMatchStatusAction(match.id, status) })
  }

  const price = match.price
    ? new Intl.NumberFormat('de-DE', { style: 'currency', currency: match.currency, maximumFractionDigits: 0 })
        .format(Math.round(match.price / 100))
    : null

  const criteria = Object.entries(match.match_breakdown)

  return (
    <div className="bg-surface rounded-card p-5 flex gap-4 items-start border border-[#E2E4EB] hover:border-[#C8CCD6] hover:shadow-sm transition-all">
      <ScoreCircle score={match.match_score} />

      <div className="flex-1 min-w-0">
        <p className="font-bold">{match.address}</p>
        <p className="text-sm text-[#5E6278] mt-0.5">
          {[price, match.bedrooms ? `${match.bedrooms} Zi.` : null, match.bathrooms ? `${match.bathrooms} Bad` : null, match.tenure].filter(Boolean).join(' · ')}
        </p>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
            {match.source_name}
          </span>
          <span className="text-xs text-[#999]">
            {new Date(match.received_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
          </span>
        </div>

        {criteria.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {criteria.map(([key, pass]) => (
              <span
                key={key}
                className={`text-[0.7rem] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                  pass ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-700'
                }`}
              >
                {pass ? <Check size={10} /> : <X size={10} />}{key}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-3 flex-wrap">
          {match.status === 'new' && (
            <>
              <button
                onClick={() => update('saved')}
                disabled={isPending}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-[#0F1117] transition-colors disabled:opacity-50"
              >
                {t('save')}
              </button>
              <button
                onClick={() => update('dismissed')}
                disabled={isPending}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E2E4EB] text-[#5E6278] hover:border-[#C8CCD6] transition-colors disabled:opacity-50"
              >
                {t('reject')}
              </button>
            </>
          )}
          {match.status === 'saved' && (
            <span className="text-xs font-semibold text-green-700 inline-flex items-center gap-1">
              <Check size={14} /> {t('saved')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
