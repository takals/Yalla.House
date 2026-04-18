'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { submitToPortalAction } from './actions'
import { dateLocaleFromLocale } from '@/lib/country-config'

export interface PortalRow {
  id: string
  slug: string
  display_name: string
  min_photos: number
}

export interface PortalStatusRow {
  portal_id: string
  status: string
  external_id: string | null
  error_message: string | null
  last_sync_at: string | null
}

type StatusMap = Map<string, PortalStatusRow>

function getStatusBadge(status: string | undefined, errorMessage: string | null | undefined, t: any) {
  if (!status || status === 'pending') {
    return { label: t('portals.notSubmitted'), className: 'bg-gray-100 text-gray-500', spinning: false }
  }
  switch (status) {
    case 'queued':
      return { label: t('portals.queued'), className: 'bg-yellow-100 text-yellow-700', spinning: true }
    case 'published':
      return { label: t('portals.active'), className: 'bg-green-100 text-green-700', spinning: false }
    case 'failed':
      return { label: t('portals.error', { error: errorMessage ?? t('portals.unknownError') }), className: 'bg-red-100 text-red-700', spinning: false }
    case 'withdrawn':
      return { label: t('portals.withdrawn'), className: 'bg-gray-100 text-gray-500', spinning: false }
    default:
      return { label: status, className: 'bg-gray-100 text-gray-500', spinning: false }
  }
}

function formatDate(iso: string | null, dateLocale: string): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function PortalSection({
  listingId,
  portals,
  initialStatuses,
}: {
  listingId: string
  portals: PortalRow[]
  initialStatuses: PortalStatusRow[]
}) {
  const t = useTranslations('ownerDashboard')
  const locale = useLocale()
  const dateLocale = dateLocaleFromLocale(locale)
  const router = useRouter()
  const [statuses, setStatuses] = useState<StatusMap>(() => {
    const m = new Map<string, PortalStatusRow>()
    for (const s of initialStatuses) m.set(s.portal_id, s)
    return m
  })
  const [submitting, setSubmitting] = useState<Set<string>>(new Set())
  const [, startTransition] = useTransition()

  // Sync statuses when server re-renders (after router.refresh)
  useEffect(() => {
    const m = new Map<string, PortalStatusRow>()
    for (const s of initialStatuses) m.set(s.portal_id, s)
    setStatuses(m)
  }, [initialStatuses])

  // Poll every 4s while any portal is queued
  const hasQueued = [...statuses.values()].some(s => s.status === 'queued')
  useEffect(() => {
    if (!hasQueued) return
    const interval = setInterval(() => router.refresh(), 4000)
    return () => clearInterval(interval)
  }, [hasQueued, router])

  function handleSubmit(portalId: string) {
    setSubmitting(prev => new Set(prev).add(portalId))

    // Optimistic update
    setStatuses(prev => {
      const m = new Map(prev)
      const existing = m.get(portalId)
      m.set(portalId, {
        portal_id: portalId,
        status: 'queued',
        external_id: existing?.external_id ?? null,
        error_message: null,
        last_sync_at: existing?.last_sync_at ?? null,
      })
      return m
    })

    startTransition(async () => {
      const result = await submitToPortalAction(listingId, portalId)
      setSubmitting(prev => {
        const n = new Set(prev)
        n.delete(portalId)
        return n
      })
      if ('error' in result) {
        setStatuses(prev => {
          const m = new Map(prev)
          const existing = m.get(portalId)
          m.set(portalId, {
            portal_id: portalId,
            status: 'failed',
            external_id: existing?.external_id ?? null,
            error_message: result.error,
            last_sync_at: existing?.last_sync_at ?? null,
          })
          return m
        })
      }
    })
  }

  if (portals.length === 0) {
    return (
      <p className="text-sm text-[#999999]">
        {t('portals.none')}
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {portals.map(portal => {
        const row = statuses.get(portal.id)
        const badge = getStatusBadge(row?.status, row?.error_message, t)
        const isSubmitting = submitting.has(portal.id)
        const isQueued = row?.status === 'queued'

        return (
          <div
            key={portal.id}
            className="flex items-center justify-between gap-4 py-3 px-4 bg-hover-bg rounded-xl"
          >
            <div className="min-w-0">
              <p className="font-semibold text-sm text-text-primary">{portal.display_name}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
                  {badge.spinning && (
                    <svg className="w-3 h-3 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  {badge.label}
                </span>
                {row?.external_id && (
                  <span className="text-xs text-text-secondary">ID: {row.external_id}</span>
                )}
                {row?.last_sync_at && row.status === 'published' && (
                  <span className="text-xs text-[#999999]">· {formatDate(row.last_sync_at, dateLocale)}</span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSubmit(portal.id)}
              disabled={isSubmitting || isQueued}
              className="flex-shrink-0 text-xs font-bold px-3 py-1.5 bg-brand hover:bg-brand-hover text-text-primary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('portals.submitting')}
                </span>
              ) : row?.status === 'published' ? (
                t('portals.resubmit')
              ) : (
                t('portals.submit')
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
