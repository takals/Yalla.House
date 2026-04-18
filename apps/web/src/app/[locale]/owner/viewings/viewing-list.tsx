'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { ChevronDown, ChevronUp, Mail, Phone, Calendar, MessageSquare } from 'lucide-react'
import { confirmViewingAction, declineViewingAction } from './actions'

export interface ViewingRow {
  id: string
  listing_id: string
  status: string
  type: string
  scheduled_at: string | null
  hunter_notes: string | null
  created_at: string
  hunter: { full_name: string | null; email: string; phone: string | null } | null
}

function getStatusBadge(status: string, t: ReturnType<typeof useTranslations>) {
  switch (status) {
    case 'pending':
      return { label: t('viewings.pending'), className: 'bg-yellow-100 text-yellow-700' }
    case 'confirmed':
      return { label: t('viewings.confirmed'), className: 'bg-green-100 text-green-700' }
    case 'cancelled':
      return { label: t('viewings.cancelled'), className: 'bg-gray-100 text-gray-500' }
    case 'completed':
      return { label: t('viewings.completed'), className: 'bg-blue-100 text-blue-700' }
    case 'no_show':
      return { label: t('viewings.noShow'), className: 'bg-red-100 text-red-700' }
    default:
      return { label: status, className: 'bg-gray-100 text-gray-500' }
  }
}

function formatDate(iso: string, dateLocale: string): string {
  return new Date(iso).toLocaleDateString(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDateTime(iso: string, dateLocale: string): string {
  const d = new Date(iso)
  return `${d.toLocaleDateString(dateLocale, { weekday: 'short', day: 'numeric', month: 'short' })} · ${d.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}`
}

export function ViewingList({
  initialViewings,
  listingMap,
}: {
  initialViewings: ViewingRow[]
  listingMap: Record<string, { title_de: string | null; place_id: string }>
}) {
  const t = useTranslations('ownerDashboard')
  const locale = useLocale()
  const dateLocale = locale === 'de' ? 'de-DE' : 'en-GB'
  const [statuses, setStatuses] = useState<Map<string, string>>(() => {
    const m = new Map<string, string>()
    for (const v of initialViewings) m.set(v.id, v.status)
    return m
  })
  const [errors, setErrors] = useState<Map<string, string>>(new Map())
  const [acting, setActing] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggleExpand(viewingId: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(viewingId)) next.delete(viewingId)
      else next.add(viewingId)
      return next
    })
  }

  async function handleConfirm(viewingId: string) {
    const prev = statuses.get(viewingId)
    setActing(s => new Set(s).add(viewingId))
    setStatuses(m => new Map(m).set(viewingId, 'confirmed'))
    setErrors(m => { const n = new Map(m); n.delete(viewingId); return n })

    const result = await confirmViewingAction(viewingId)

    setActing(s => { const n = new Set(s); n.delete(viewingId); return n })
    if ('error' in result) {
      setStatuses(m => new Map(m).set(viewingId, prev ?? 'pending'))
      setErrors(m => new Map(m).set(viewingId, result.error))
    }
  }

  async function handleDecline(viewingId: string) {
    const prev = statuses.get(viewingId)
    setActing(s => new Set(s).add(viewingId))
    setStatuses(m => new Map(m).set(viewingId, 'cancelled'))
    setErrors(m => { const n = new Map(m); n.delete(viewingId); return n })

    const result = await declineViewingAction(viewingId)

    setActing(s => { const n = new Set(s); n.delete(viewingId); return n })
    if ('error' in result) {
      setStatuses(m => new Map(m).set(viewingId, prev ?? 'pending'))
      setErrors(m => new Map(m).set(viewingId, result.error))
    }
  }

  if (initialViewings.length === 0) {
    return (
      <div className="bg-surface rounded-card p-12 text-center shadow-sm">
        <p className="text-text-secondary">{t('viewings.empty')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {initialViewings.map(viewing => {
        const status = statuses.get(viewing.id) ?? viewing.status
        const badge = getStatusBadge(status, t)
        const isPending = status === 'pending'
        const isActing = acting.has(viewing.id)
        const isExpanded = expanded.has(viewing.id)
        const err = errors.get(viewing.id)
        const listing = listingMap[viewing.listing_id]

        return (
          <div key={viewing.id} className="bg-surface rounded-card shadow-sm overflow-hidden">
            {/* Clickable card header */}
            <button
              type="button"
              onClick={() => toggleExpand(viewing.id)}
              className="w-full text-left p-5 hover:bg-hover-bg/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  {/* Hunter name + listing */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {viewing.hunter?.full_name && (
                      <span className="font-bold text-text-primary">{viewing.hunter.full_name}</span>
                    )}
                    {!viewing.hunter?.full_name && viewing.hunter?.email && (
                      <span className="font-bold text-text-primary">{viewing.hunter.email}</span>
                    )}
                    {listing && (
                      <span className="text-xs text-text-muted">
                        · {listing.title_de ?? listing.place_id}
                      </span>
                    )}
                  </div>

                  {/* Scheduled date or received date */}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-text-secondary">
                    {viewing.scheduled_at && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {t('viewings.scheduled')}: {formatDateTime(viewing.scheduled_at, dateLocale)}
                      </span>
                    )}
                    <span>{t('viewings.received')}: {formatDate(viewing.created_at, dateLocale)}</span>
                  </div>

                  {/* Notes preview */}
                  {viewing.hunter_notes && !isExpanded && (
                    <p className="mt-1.5 text-sm text-text-secondary truncate max-w-md italic">
                      &ldquo;{viewing.hunter_notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Right: badge + expand indicator */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${badge.className}`}>
                    {badge.label}
                  </span>
                  {isExpanded ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
                </div>
              </div>
            </button>

            {/* Expanded detail panel */}
            {isExpanded && (
              <div className="px-5 pb-5 border-t border-border-default/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* Contact info */}
                  <div className="bg-[#F8FAFC] rounded-xl p-4">
                    <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide mb-3">
                      {t('viewings.contactInfo')}
                    </h4>
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5 text-sm">
                        <Mail size={14} className="text-text-muted flex-shrink-0" />
                        <div>
                          <span className="text-xs text-text-muted">{t('viewings.email')}</span>
                          <a
                            href={`mailto:${viewing.hunter?.email}`}
                            onClick={e => e.stopPropagation()}
                            className="block text-brand hover:underline font-medium"
                          >
                            {viewing.hunter?.email}
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 text-sm">
                        <Phone size={14} className="text-text-muted flex-shrink-0" />
                        <div>
                          <span className="text-xs text-text-muted">{t('viewings.phone')}</span>
                          {viewing.hunter?.phone ? (
                            <a
                              href={`tel:${viewing.hunter.phone}`}
                              onClick={e => e.stopPropagation()}
                              className="block text-brand hover:underline font-medium"
                            >
                              {viewing.hunter.phone}
                            </a>
                          ) : (
                            <span className="block text-text-secondary">{t('viewings.noPhone')}</span>
                          )}
                        </div>
                      </div>
                      {viewing.type && (
                        <div className="flex items-center gap-2.5 text-sm">
                          <Calendar size={14} className="text-text-muted flex-shrink-0" />
                          <div>
                            <span className="text-xs text-text-muted">{t('viewings.type')}</span>
                            <span className="block font-medium text-text-primary">
                              {viewing.type === 'video' ? t('viewings.typeVideo') : t('viewings.typeInPerson')}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Notes + communication */}
                  <div className="bg-[#F8FAFC] rounded-xl p-4">
                    {viewing.hunter_notes ? (
                      <>
                        <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <MessageSquare size={12} />
                          {t('viewings.message')}
                        </h4>
                        <p className="text-sm text-text-secondary italic leading-relaxed">
                          &ldquo;{viewing.hunter_notes}&rdquo;
                        </p>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-sm text-text-muted">
                        <MessageSquare size={14} className="mr-2 opacity-40" />
                        {t('viewings.noMessage')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions row */}
                {isPending && (
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      type="button"
                      onClick={() => handleDecline(viewing.id)}
                      disabled={isActing}
                      className="text-xs font-semibold px-4 py-2 bg-hover-bg hover:bg-[#E4E6EF] text-text-secondary rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('viewings.decline')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirm(viewing.id)}
                      disabled={isActing}
                      className="text-xs font-bold px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isActing ? (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          …
                        </span>
                      ) : t('viewings.confirm')}
                    </button>
                  </div>
                )}

                {/* Error */}
                {err && (
                  <p className="mt-3 text-xs text-red-600">{err}</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
