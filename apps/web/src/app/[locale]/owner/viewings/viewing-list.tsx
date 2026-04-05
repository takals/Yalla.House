'use client'

import { useState } from 'react'
import Link from 'next/link'
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

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return { label: 'Ausstehend', className: 'bg-yellow-100 text-yellow-700' }
    case 'confirmed':
      return { label: 'Bestätigt', className: 'bg-green-100 text-green-700' }
    case 'cancelled':
      return { label: 'Abgelehnt', className: 'bg-gray-100 text-gray-500' }
    case 'completed':
      return { label: 'Abgeschlossen', className: 'bg-blue-100 text-blue-700' }
    case 'no_show':
      return { label: 'Nicht erschienen', className: 'bg-red-100 text-red-700' }
    default:
      return { label: status, className: 'bg-gray-100 text-gray-500' }
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function ViewingList({
  initialViewings,
  listingMap,
}: {
  initialViewings: ViewingRow[]
  listingMap: Record<string, { title_de: string | null; place_id: string }>
}) {
  const [statuses, setStatuses] = useState<Map<string, string>>(() => {
    const m = new Map<string, string>()
    for (const v of initialViewings) m.set(v.id, v.status)
    return m
  })
  const [errors, setErrors] = useState<Map<string, string>>(new Map())
  const [acting, setActing] = useState<Set<string>>(new Set())

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
        <p className="text-[#5E6278]">Noch keine Besichtigungsanfragen.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {initialViewings.map(viewing => {
        const status = statuses.get(viewing.id) ?? viewing.status
        const badge = getStatusBadge(status)
        const isPending = status === 'pending'
        const isActing = acting.has(viewing.id)
        const err = errors.get(viewing.id)
        const listing = listingMap[viewing.listing_id]

        return (
          <div key={viewing.id} className="bg-surface rounded-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                {/* Listing link */}
                {listing && (
                  <Link
                    href={`/owner/${viewing.listing_id}`}
                    className="text-sm font-semibold text-[#0F1117] hover:underline truncate block"
                  >
                    {listing.title_de ?? listing.place_id}
                  </Link>
                )}

                {/* Hunter info */}
                <div className="mt-1 text-sm text-[#5E6278]">
                  {viewing.hunter?.full_name && (
                    <span className="font-medium text-[#0F1117]">{viewing.hunter.full_name}</span>
                  )}
                  {viewing.hunter?.full_name && ' · '}
                  <span>{viewing.hunter?.email}</span>
                  {viewing.hunter?.phone && (
                    <span> · {viewing.hunter.phone}</span>
                  )}
                </div>

                {/* Notes */}
                {viewing.hunter_notes && (
                  <p className="mt-2 text-sm text-[#5E6278] italic">
                    &ldquo;{viewing.hunter_notes}&rdquo;
                  </p>
                )}

                {/* Date */}
                <p className="mt-2 text-xs text-[#999999]">
                  Eingegangen: {formatDate(viewing.created_at)}
                </p>

                {/* Error */}
                {err && (
                  <p className="mt-2 text-xs text-red-600">{err}</p>
                )}
              </div>

              {/* Right: badge + actions */}
              <div className="flex flex-col items-end gap-3 flex-shrink-0">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${badge.className}`}>
                  {badge.label}
                </span>

                {isPending && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecline(viewing.id)}
                      disabled={isActing}
                      className="text-xs font-semibold px-3 py-1.5 bg-[#F5F5FA] hover:bg-[#E4E6EF] text-[#5E6278] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ablehnen
                    </button>
                    <button
                      type="button"
                      onClick={() => handleConfirm(viewing.id)}
                      disabled={isActing}
                      className="text-xs font-bold px-3 py-1.5 bg-brand hover:bg-brand-hover text-[#0F1117] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isActing ? (
                        <span className="flex items-center gap-1.5">
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          …
                        </span>
                      ) : 'Bestätigen'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
