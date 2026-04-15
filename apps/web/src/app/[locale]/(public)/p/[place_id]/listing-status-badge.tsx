'use client'

import { useTranslations } from 'next-intl'

interface Props {
  status: string
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string; labelKey: string; pulse: boolean }> = {
  active: {
    bg: 'bg-green-500/15 backdrop-blur-md',
    text: 'text-green-100',
    dot: 'bg-green-400',
    labelKey: 'badgeLive',
    pulse: true,
  },
  under_offer: {
    bg: 'bg-amber-500/15 backdrop-blur-md',
    text: 'text-amber-100',
    dot: 'bg-amber-400',
    labelKey: 'badgeUnderOffer',
    pulse: false,
  },
}

export function ListingStatusBadge({ status }: Props) {
  const t = useTranslations('listingPage')
  const config = STATUS_CONFIG[status]
  if (!config) return null

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
      <span className="relative flex h-2.5 w-2.5">
        {config.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${config.dot}`} />
      </span>
      {t(config.labelKey)}
    </span>
  )
}
