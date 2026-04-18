'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Calendar, MapPin, MessageSquare, AlertCircle, Video, ExternalLink } from 'lucide-react'
import { cancelViewingAction } from '../actions'

interface Viewing {
  id: string
  listing_id: string
  status: string
  type: string
  scheduled_at: string | null
  hunter_notes: string | null
  created_at: string
  video_room_url: string | null
  listing_title: string | null
  listing_city: string | null
  listing_postcode: string | null
  listing_address: string | null
  place_id: string | null
  slug: string | null
}

type T = { [k: string]: string }

function tx(t: T, key: string): string {
  return t[key] ?? key
}

interface Props {
  viewings: Viewing[]
  t: T
  locale: string
}

export function HunterViewingsList({ viewings, t, locale }: Props) {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')

  const filtered = viewings.filter(v => {
    if (filter === 'upcoming') return ['pending', 'confirmed'].includes(v.status)
    if (filter === 'past') return ['cancelled', 'completed', 'no_show'].includes(v.status)
    return true
  })

  const upcomingCount = viewings.filter(v => ['pending', 'confirmed'].includes(v.status)).length

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-4 mb-6">
        <FilterTab
          label={tx(t, 'filterAll')}
          count={viewings.length}
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <FilterTab
          label={tx(t, 'filterUpcoming')}
          count={upcomingCount}
          active={filter === 'upcoming'}
          onClick={() => setFilter('upcoming')}
        />
        <FilterTab
          label={tx(t, 'filterPast')}
          count={viewings.length - upcomingCount}
          active={filter === 'past'}
          onClick={() => setFilter('past')}
        />
      </div>

      {/* Viewings list */}
      {filtered.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border-default p-12 text-center">
          <AlertCircle className="w-8 h-8 text-[#D9DCE4] mx-auto mb-3" />
          <p className="text-text-secondary font-medium mb-4">{tx(t, 'noViewings')}</p>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
          >
            {tx(t, 'browseListings')}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(viewing => (
            <ViewingCard key={viewing.id} viewing={viewing} t={t} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterTab({ label, count, active, onClick }: {
  label: string; count: number; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
        active
          ? 'bg-[#0F1117] text-white'
          : 'bg-transparent text-text-secondary hover:bg-[#F1F3F5]'
      }`}
    >
      {label} <span className="ml-1 opacity-60">{count}</span>
    </button>
  )
}

function getTypeBadgeStyle(type: string) {
  switch (type) {
    case 'online':
    case 'virtual':
      return 'bg-purple-100 text-purple-700'
    case 'open_house':
      return 'bg-blue-100 text-blue-700'
    case 'in_person':
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function getTypeLabel(type: string, t: T): string {
  switch (type) {
    case 'online':
    case 'virtual':
      return tx(t, 'typeOnline')
    case 'open_house':
      return tx(t, 'typeOpenHouse')
    case 'in_person':
    default:
      return tx(t, 'typeInPerson')
  }
}

function isVideoCallActive(scheduledAt: string | null): boolean {
  if (!scheduledAt) return false
  const now = Date.now()
  const viewingTime = new Date(scheduledAt).getTime()
  const fiveMinBefore = viewingTime - 5 * 60 * 1000
  const oneHourAfter = viewingTime + 60 * 60 * 1000
  return now >= fiveMinBefore && now <= oneHourAfter
}

function ViewingCard({ viewing, t, locale }: { viewing: Viewing; t: T; locale: string }) {
  const [isPending, startTransition] = useTransition()
  const [localStatus, setLocalStatus] = useState(viewing.status)

  const canCancel = ['pending', 'confirmed'].includes(localStatus)
  const isCompleted = localStatus === 'completed'
  const isConfirmed = localStatus === 'confirmed'
  const isOnline = viewing.type === 'online' || viewing.type === 'virtual'
  const isInPerson = viewing.type === 'in_person' || (!viewing.type)
  const callActive = isVideoCallActive(viewing.scheduled_at)

  const dateFormatter = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'de-DE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const requestDate = dateFormatter.format(new Date(viewing.created_at))
  const scheduledDate = viewing.scheduled_at
    ? new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'de-DE', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(viewing.scheduled_at))
    : null

  function handleCancel() {
    if (!confirm(tx(t, 'confirmCancel'))) return
    startTransition(async () => {
      const prev = localStatus
      setLocalStatus('cancelled')
      const result = await cancelViewingAction(viewing.id)
      if ('error' in result) {
        setLocalStatus(prev)
      }
    })
  }

  return (
    <div className={`bg-surface rounded-2xl border border-border-default overflow-hidden ${isPending ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#FFF4EF] flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-brand" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-text-primary text-sm truncate">
              {viewing.listing_title ?? viewing.listing_postcode ?? tx(t, 'property')}
            </p>
            {(viewing.listing_postcode || viewing.listing_city) && (
              <p className="text-xs text-text-secondary flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {viewing.listing_postcode} {viewing.listing_city}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${getTypeBadgeStyle(viewing.type)}`}>
            {getTypeLabel(viewing.type, t)}
          </span>
          <StatusBadge status={localStatus} t={t} />
        </div>
      </div>

      {/* Body */}
      <div className="px-5 pb-4">
        {/* Confirmation banner */}
        {localStatus === 'confirmed' && (
          <div className="mb-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
            {tx(t, 'confirmationMessage')}
          </div>
        )}

        {localStatus === 'cancelled' && (
          <div className="mb-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600">
            {tx(t, 'cancelledMessage')}
          </div>
        )}

        {/* Video call button for online confirmed viewings */}
        {isOnline && isConfirmed && viewing.video_room_url && (
          <div className="mb-3 bg-purple-50 border border-purple-200 rounded-lg px-4 py-3">
            {callActive ? (
              <a
                href={viewing.video_room_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold px-4 py-2.5 rounded-lg text-sm transition-colors"
              >
                <Video className="w-4 h-4" />
                {tx(t, 'joinVideoCall')}
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <div>
                <p className="text-sm font-medium text-purple-700 flex items-center gap-1.5">
                  <Video className="w-4 h-4" />
                  {tx(t, 'callOpens')}
                </p>
                <p className="text-xs text-purple-600 mt-0.5">{tx(t, 'onlineViewingInfo')}</p>
              </div>
            )}
          </div>
        )}

        {/* Get directions for in-person confirmed viewings */}
        {isInPerson && isConfirmed && viewing.listing_address && (
          <div className="mb-3">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                [viewing.listing_address, viewing.listing_postcode, viewing.listing_city].filter(Boolean).join(', ')
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-[#BF6840] transition-colors"
            >
              <MapPin className="w-4 h-4" />
              {tx(t, 'getDirections')}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Date info */}
        <div className="flex flex-wrap gap-4 mb-3 text-sm">
          <span className="text-text-secondary">
            {tx(t, 'requestedOn')}: <span className="font-medium text-text-primary">{requestDate}</span>
          </span>
          {scheduledDate && (
            <span className="text-text-secondary">
              {tx(t, 'scheduledFor')}: <span className="font-medium text-text-primary">{scheduledDate}</span>
            </span>
          )}
        </div>

        {/* Notes */}
        {viewing.hunter_notes && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-text-secondary mb-1 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {tx(t, 'yourNotes')}
            </p>
            <p className="text-sm text-text-primary bg-[#FAFBFC] rounded-lg p-3 border border-border-default italic">
              {viewing.hunter_notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={isPending}
              className="text-xs font-semibold text-text-secondary hover:text-red-600 transition-colors disabled:opacity-50"
            >
              {isPending ? tx(t, 'cancelling') : tx(t, 'withdraw')}
            </button>
          )}
          {isCompleted && (
            <Link
              href={`/hunter/viewings/${viewing.id}/feedback`}
              className="text-xs font-semibold text-brand hover:text-[#BF6840] transition-colors"
            >
              {tx(t, 'leaveFeedback')} &rarr;
            </Link>
          )}
          {viewing.place_id && (
            <Link
              href={`/p/${viewing.slug ?? viewing.place_id}`}
              className="text-xs font-semibold text-text-primary hover:underline ml-auto"
            >
              {tx(t, 'viewListing')} &rarr;
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status, t }: { status: string; t: T }) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500',
    completed: 'bg-blue-100 text-blue-700',
    no_show: 'bg-red-100 text-red-700',
  }

  const labels: Record<string, string> = {
    pending: tx(t, 'statusPending'),
    confirmed: tx(t, 'statusConfirmed'),
    cancelled: tx(t, 'statusCancelled'),
    completed: tx(t, 'statusCompleted'),
    no_show: tx(t, 'statusNoShow'),
  }

  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${styles[status] ?? styles.pending}`}>
      {labels[status] ?? status}
    </span>
  )
}
