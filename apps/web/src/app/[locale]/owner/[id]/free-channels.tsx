'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { ExternalLink, Zap } from 'lucide-react'
import { dateLocaleFromLocale } from '@/lib/country-config'

export interface FreeChannel {
  id: string
  slug: string
  display_name: string
  country_code: string
  max_active: number
  listing_duration_days: number
  repost_interval_days: number
  is_default_selected: boolean
}

export interface ChannelStatus {
  channel_id: string
  is_enabled: boolean
  status: string // 'pending' | 'active' | 'expired' | 'error' | 'not_posted'
  external_url: string | null
  posted_at: string | null
  expires_at: string | null
  next_repost_at: string | null
  repost_count: number
  last_error: string | null
}

type StatusMap = Map<string, ChannelStatus>

const FLAG_MAP: Record<string, string> = {
  GB: '\u{1F1EC}\u{1F1E7}',
  DE: '\u{1F1E9}\u{1F1EA}',
}

function getStatusBadge(status: string, t: (key: string) => string) {
  switch (status) {
    case 'active':
      return { label: t('statusActive'), className: 'bg-green-100 text-green-700' }
    case 'pending':
      return { label: t('statusPending'), className: 'bg-blue-100 text-blue-700' }
    case 'expired':
      return { label: t('statusExpired'), className: 'bg-yellow-100 text-yellow-700' }
    case 'error':
      return { label: t('statusError'), className: 'bg-red-100 text-red-700' }
    default:
      return { label: t('statusNotPosted'), className: 'bg-gray-100 text-gray-500' }
  }
}

function formatDate(iso: string | null, dateLocale: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin flex-shrink-0 ${className ?? 'w-3 h-3'}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export function FreeChannelsSection({
  listingId,
  countryCode,
  channels,
  channelStatuses,
}: {
  listingId: string
  countryCode: string
  channels: FreeChannel[]
  channelStatuses: ChannelStatus[]
}) {
  const t = useTranslations('freeChannels')
  const locale = useLocale()
  const dateLocale = dateLocaleFromLocale(locale)

  const [statuses, setStatuses] = useState<StatusMap>(() => {
    const m = new Map<string, ChannelStatus>()
    for (const s of channelStatuses) m.set(s.channel_id, s)
    return m
  })

  const [enabledMap, setEnabledMap] = useState<Map<string, boolean>>(() => {
    const m = new Map<string, boolean>()
    for (const ch of channels) {
      const existing = channelStatuses.find(s => s.channel_id === ch.id)
      m.set(ch.id, existing ? existing.is_enabled : ch.is_default_selected)
    }
    return m
  })

  const [pushingSet, setPushingSet] = useState<Set<string>>(new Set())
  const [pushingAll, setPushingAll] = useState(false)
  const [autoRepost, setAutoRepost] = useState(true)

  const activeCount = [...statuses.values()].filter(s => s.status === 'active').length
  const enabledCount = [...enabledMap.values()].filter(Boolean).length
  const flag = FLAG_MAP[countryCode] ?? ''

  function toggleChannel(channelId: string) {
    setEnabledMap(prev => {
      const m = new Map(prev)
      m.set(channelId, !m.get(channelId))
      return m
    })
  }

  function handlePush(channelId: string) {
    // TODO: Wire to server action when backend exists
    setPushingSet(prev => new Set(prev).add(channelId))
    setTimeout(() => {
      setStatuses(prev => {
        const m = new Map(prev)
        const existing = m.get(channelId)
        m.set(channelId, {
          channel_id: channelId,
          is_enabled: true,
          status: 'pending',
          external_url: existing?.external_url ?? null,
          posted_at: existing?.posted_at ?? null,
          expires_at: existing?.expires_at ?? null,
          next_repost_at: existing?.next_repost_at ?? null,
          repost_count: existing?.repost_count ?? 0,
          last_error: null,
        })
        return m
      })
      setPushingSet(prev => {
        const n = new Set(prev)
        n.delete(channelId)
        return n
      })
    }, 1500)
  }

  function handlePushAll() {
    // TODO: Wire to server action when backend exists
    setPushingAll(true)
    const enabledChannels = channels.filter(ch => enabledMap.get(ch.id))
    for (const ch of enabledChannels) {
      handlePush(ch.id)
    }
    setTimeout(() => setPushingAll(false), 1800)
  }

  if (channels.length === 0) {
    return (
      <p className="text-sm text-[#999999]">
        {t('noChannels')}
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{flag}</span>
          <h3 className="text-sm font-bold text-text-primary">{t('sectionTitle')}</h3>
          <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            {t('activeCount', { active: activeCount, total: enabledCount })}
          </span>
        </div>
      </div>

      <p className="text-sm text-text-secondary leading-relaxed">
        {t('sectionDescription')}
      </p>

      {/* Channel cards */}
      <div className="space-y-3">
        {channels.map(channel => {
          const status = statuses.get(channel.id)
          const isEnabled = enabledMap.get(channel.id) ?? false
          const currentStatus = status?.status ?? 'not_posted'
          const badge = getStatusBadge(currentStatus, t)
          const isPushing = pushingSet.has(channel.id)
          const isActive = currentStatus === 'active'
          const canPush = isEnabled && !isPushing && !isActive

          return (
            <div
              key={channel.id}
              className={`py-3 px-4 rounded-xl border transition-colors ${
                isEnabled
                  ? 'bg-hover-bg border-transparent'
                  : 'bg-gray-50 border-[#E4E6EF] opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    {/* Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleChannel(channel.id)}
                      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors ${
                        isEnabled ? 'bg-brand' : 'bg-gray-300'
                      }`}
                      role="switch"
                      aria-checked={isEnabled}
                      aria-label={isEnabled ? t('toggleDisable') : t('toggleEnable')}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                          isEnabled ? 'translate-x-[18px]' : 'translate-x-0.5'
                        }`}
                      />
                    </button>

                    <div>
                      <p className="font-semibold text-sm text-text-primary">{channel.display_name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs text-[#999999]">
                          {t('channelDuration', { days: channel.listing_duration_days })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status details */}
                  {isEnabled && status && currentStatus !== 'not_posted' && (
                    <div className="mt-2 ml-12 flex items-center gap-3 flex-wrap text-xs text-text-secondary">
                      {status.posted_at && (
                        <span>{t('postedOn')} {formatDate(status.posted_at, dateLocale)}</span>
                      )}
                      {status.expires_at && (
                        <span>{t('expiresOn')} {formatDate(status.expires_at, dateLocale)}</span>
                      )}
                      {status.next_repost_at && daysUntil(status.next_repost_at) !== null && (
                        <span>{t('repostsIn')} {daysUntil(status.next_repost_at)} {t('days')}</span>
                      )}
                      {status.external_url && (
                        <a
                          href={status.external_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-brand hover:text-brand-hover transition-colors"
                        >
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Error message */}
                  {isEnabled && status?.last_error && currentStatus === 'error' && (
                    <p className="mt-1.5 ml-12 text-xs text-red-600">
                      {t('errorMessage')}: {status.last_error}
                    </p>
                  )}
                </div>

                {/* Push button */}
                <button
                  type="button"
                  onClick={() => handlePush(channel.id)}
                  disabled={!canPush}
                  className="flex-shrink-0 text-xs font-bold px-3 py-1.5 bg-brand hover:bg-brand-hover text-text-primary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isPushing ? (
                    <span className="flex items-center gap-1.5">
                      <Spinner />
                      {t('pushing')}
                    </span>
                  ) : (
                    t('pushNow')
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#E4E6EF]">
        <div className="flex items-center gap-3">
          {/* Auto-repost toggle */}
          <button
            type="button"
            onClick={() => setAutoRepost(prev => !prev)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors ${
              autoRepost ? 'bg-brand' : 'bg-gray-300'
            }`}
            role="switch"
            aria-checked={autoRepost}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                autoRepost ? 'translate-x-[18px]' : 'translate-x-0.5'
              }`}
            />
          </button>
          <span className="text-xs font-medium text-text-secondary">
            {t('autoRepost')}: {autoRepost ? t('autoRepostOn') : t('autoRepostOff')}
          </span>
        </div>

        <button
          type="button"
          onClick={handlePushAll}
          disabled={pushingAll || enabledCount === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-text-primary text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pushingAll ? (
            <>
              <Spinner className="w-3.5 h-3.5" />
              {t('pushing')}
            </>
          ) : (
            <>
              <Zap size={14} />
              {t('pushAll')}
            </>
          )}
        </button>
      </div>

      {/* Pro tip */}
      <div className="flex items-start gap-2.5 p-3 bg-brand-solid-bg rounded-xl">
        <Zap size={14} className="text-brand flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-text-primary">{t('proTip')}</p>
          <p className="text-xs text-text-secondary mt-0.5">{t('proTipText')}</p>
        </div>
      </div>
    </div>
  )
}
