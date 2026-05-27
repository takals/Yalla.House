'use client'

import { useState, useEffect } from 'react'
import { CalendarDays, Clock, ChevronRight, Plus } from 'lucide-react'
import { fetchAvailableSlotsAction } from './actions'

interface Slot {
  id: string
  starts_at: string
  ends_at: string
}

interface Props {
  listingId: string
  placeId: string
  slotCount: number
  isOwner: boolean
  locale: string
  dateLocale: string
  translations: Record<string, string>
}

function tr(t: Record<string, string>, key: string): string {
  return t[key] ?? key
}

function formatSlotDay(iso: string, dateLocale: string): string {
  return new Date(iso).toLocaleDateString(dateLocale, { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatSlotTime(iso: string, dateLocale: string): string {
  return new Date(iso).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })
}

/**
 * Compact calendar card that overlays the hero photo area.
 * Owners see a CTA to add slots; hunters see next available slots.
 */
export function HeroCalendarBox({
  listingId,
  placeId,
  slotCount,
  isOwner,
  locale,
  dateLocale,
  translations: t,
}: Props) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(!isOwner)

  useEffect(() => {
    if (isOwner) return
    fetchAvailableSlotsAction(listingId).then(result => {
      setSlots(result.slots.slice(0, 3))
      setLoading(false)
    })
  }, [listingId, isOwner])

  function handleBookSlot() {
    const target = document.querySelector('[data-booking-slots]')
      ?? document.querySelector('[data-contact-card]')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // ── Owner view: Add slots CTA ──
  if (isOwner) {
    return (
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-5 w-[300px]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
            <CalendarDays size={20} className="text-brand" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{tr(t, 'heroCalendarTitle')}</p>
            <p className="text-xs text-gray-500">
              {slotCount > 0
                ? tr(t, 'heroSlotsActive').replace('{count}', String(slotCount))
                : tr(t, 'heroNoSlots')}
            </p>
          </div>
        </div>
        <a
          href="/owner/calendar"
          className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus size={16} />
          {tr(t, 'heroAddSlots')}
        </a>
      </div>
    )
  }

  // ── Hunter view: Available slots + Book CTA ──
  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-5 w-[300px]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
          <CalendarDays size={20} className="text-brand" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">{tr(t, 'heroCalendarTitle')}</p>
          {slotCount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              <span className="text-xs text-green-700 font-medium">
                {tr(t, 'heroSlotsAvailable').replace('{count}', String(slotCount))}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Next available slots */}
      {loading ? (
        <div className="space-y-2 mb-3">
          {[1, 2].map(i => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : slots.length > 0 ? (
        <div className="space-y-1.5 mb-3">
          {slots.map(slot => (
            <button
              key={slot.id}
              onClick={handleBookSlot}
              className="w-full flex items-center gap-3 px-3 py-2 bg-gray-50 hover:bg-brand/5 rounded-lg transition-colors text-left group"
            >
              <Clock size={14} className="text-brand flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900">{formatSlotDay(slot.starts_at, dateLocale)}</p>
                <p className="text-[11px] text-gray-500">{formatSlotTime(slot.starts_at, dateLocale)} – {formatSlotTime(slot.ends_at, dateLocale)}</p>
              </div>
              <ChevronRight size={14} className="text-gray-300 group-hover:text-brand transition-colors" />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 mb-3 text-center py-2">{tr(t, 'heroNoSlotsHunter')}</p>
      )}

      <button
        onClick={handleBookSlot}
        className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
      >
        <CalendarDays size={16} />
        {tr(t, 'heroBookViewing')}
      </button>
    </div>
  )
}
