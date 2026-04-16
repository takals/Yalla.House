'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar, Clock, Check, Plus, User } from 'lucide-react'
import { fetchAvailableSlotsAction, bookSlotAction } from './actions'

interface Slot {
  id: string
  starts_at: string
  ends_at: string
}

interface Props {
  listingId: string
  authenticated: boolean
  isOwner: boolean
  locale: string
  placeId: string
  preselectedSlotId?: string
}

function formatDay(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(iso: string, dateLocale: string): string {
  return new Date(iso).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })
}

function groupByDay(slots: Slot[], dateLocale: string): Map<string, Slot[]> {
  const groups = new Map<string, Slot[]>()
  for (const slot of slots) {
    const day = new Date(slot.starts_at).toLocaleDateString(dateLocale)
    const existing = groups.get(day) ?? []
    existing.push(slot)
    groups.set(day, existing)
  }
  return groups
}

function generateMockSlots(dateLocale: string): { day: string; times: string[] }[] {
  const now = new Date()
  const days: { day: string; times: string[] }[] = []
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    if (d.getDay() === 0) continue
    days.push({
      day: d.toLocaleDateString(dateLocale, { weekday: 'short', day: 'numeric', month: 'short' }),
      times: ['10:00 – 10:30', '11:00 – 11:30', '14:00 – 14:30', '15:30 – 16:00'],
    })
  }
  return days.slice(0, 5)
}

export function ViewingCalendar({ listingId, authenticated, isOwner, locale, placeId, preselectedSlotId }: Props) {
  const t = useTranslations('listingPage')
  const dateLocale = locale === 'de' ? 'de-DE' : 'en-GB'
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(preselectedSlotId ?? null)
  const [notes, setNotes] = useState('')
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAvailableSlotsAction(listingId).then(result => {
      setSlots(result.slots)
      setLoading(false)
      // If we have a preselected slot from auth redirect, auto-select it
      if (preselectedSlotId && result.slots.some(s => s.id === preselectedSlotId)) {
        setSelectedSlot(preselectedSlotId)
      }
    })
  }, [listingId, preselectedSlotId])

  function handleSlotClick(slotId: string) {
    if (isOwner) return

    // If not authenticated, redirect to auth with slot param embedded in the return URL
    if (!authenticated) {
      const returnPath = `/${locale === 'de' ? '' : 'en/'}p/${placeId}?slot=${slotId}`
      const loginUrl = `/${locale === 'de' ? '' : 'en/'}auth/login?next=${encodeURIComponent(returnPath)}`
      window.location.href = loginUrl
      return
    }

    setSelectedSlot(slotId === selectedSlot ? null : slotId)
  }

  async function handleBook() {
    if (!selectedSlot || !authenticated) return
    setBooking(true)
    setError(null)
    const result = await bookSlotAction(listingId, selectedSlot, notes)
    setBooking(false)
    if ('error' in result) {
      setError(result.error)
    } else {
      setBooked(true)
      setSlots(prev => prev.filter(s => s.id !== selectedSlot))
    }
  }

  const hasSlots = slots.length > 0
  const grouped = hasSlots ? groupByDay(slots, dateLocale) : null
  const mockDays = !hasSlots && !loading ? generateMockSlots(dateLocale) : []

  if (loading) {
    return (
      <div data-booking-slots className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-border-default/60">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#D4764E]/10 flex items-center justify-center">
            <Calendar size={18} className="text-[#D4764E]" />
          </div>
          <h2 className="text-xl font-bold">{t('calendarTitle')}</h2>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-[#F5F5FA] rounded-xl" />
          <div className="h-12 bg-[#F5F5FA] rounded-xl" />
          <div className="h-12 bg-[#F5F5FA] rounded-xl" />
        </div>
      </div>
    )
  }

  if (booked) {
    return (
      <div data-booking-slots className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-green-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check size={24} className="text-green-600" />
          </div>
          <div>
            <p className="font-bold text-lg text-green-800">{t('calendarBooked')}</p>
            <p className="text-sm text-green-600 mt-0.5">{t('calendarOwnerConfirm')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div data-booking-slots className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-border-default/60">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#D4764E]/10 flex items-center justify-center">
            <Calendar size={18} className="text-[#D4764E]" />
          </div>
          <h2 className="text-xl font-bold">{t('calendarTitle')}</h2>
        </div>
        {isOwner && (
          <a
            href="/owner/viewings"
            className="flex items-center gap-1.5 text-sm font-semibold text-[#D4764E] hover:text-[#BF6840] transition-colors"
          >
            <Plus size={14} />
            {t('calendarAddSlots')}
          </a>
        )}
      </div>

      {/* Real slots — 7-day week-at-a-glance grid */}
      {hasSlots && grouped && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(grouped.entries()).map(([day, daySlots]) => (
              <div key={day} className="bg-[#FAFBFC] rounded-xl p-4 border border-border-default/50">
                <p className="text-xs font-bold text-text-primary mb-3 uppercase tracking-wide">
                  {daySlots[0] ? formatDay(daySlots[0].starts_at, locale) : day}
                </p>
                <div className="flex flex-col gap-1.5">
                  {daySlots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => handleSlotClick(slot.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold border transition-all w-full text-left ${
                        slot.id === selectedSlot
                          ? 'bg-[#D4764E] text-white border-[#D4764E] shadow-md shadow-[#D4764E]/20'
                          : 'bg-white text-text-primary border-border-default hover:border-[#D4764E] hover:text-[#D4764E]'
                      }`}
                    >
                      <Clock size={13} className={slot.id === selectedSlot ? 'text-white/80' : 'text-[#999]'} />
                      {formatTime(slot.starts_at, dateLocale)} – {formatTime(slot.ends_at, dateLocale)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Book / complete booking panel */}
          {selectedSlot && authenticated && !isOwner && (
            <div className="bg-[#D4764E]/5 rounded-xl p-5 border border-[#D4764E]/15">
              <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                {t('calendarAddNote')}
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={t('calendarNotePlaceholder')}
                rows={2}
                className="w-full border border-border-default rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4764E]/30 resize-none"
              />
              {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
              <button
                onClick={handleBook}
                disabled={booking}
                className="mt-3 w-full bg-[#D4764E] hover:bg-brand-hover text-white font-bold text-sm py-3.5 rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-[#D4764E]/20"
              >
                {booking ? t('calendarBooking') : t('calendarBookThis')}
              </button>
            </div>
          )}

          {/* Not authenticated — prompt to sign in (clicking a slot redirects) */}
          {!authenticated && !isOwner && !selectedSlot && (
            <div className="flex items-center gap-2 justify-center py-2">
              <User size={14} className="text-[#999]" />
              <p className="text-xs text-[#999]">{t('calendarSignIn')}</p>
            </div>
          )}
        </div>
      )}

      {/* Empty state with greyed-out mock slots */}
      {!hasSlots && (
        <div className="relative">
          <div className="opacity-30 pointer-events-none select-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockDays.map(day => (
                <div key={day.day} className="bg-[#FAFBFC] rounded-xl p-4 border border-border-default/50">
                  <p className="text-xs font-bold text-text-primary mb-3 uppercase tracking-wide">{day.day}</p>
                  <div className="flex flex-col gap-1.5">
                    {day.times.map(time => (
                      <div
                        key={time}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold border border-border-default bg-white text-[#999]"
                      >
                        <Clock size={13} />
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-xl border border-border-default text-center max-w-sm">
              {isOwner ? (
                <>
                  <p className="font-bold text-text-primary mb-1.5">
                    {t('calendarNoSlotsOwner')}
                  </p>
                  <p className="text-sm text-text-secondary mb-4">
                    {t('calendarNoSlotsOwnerDesc')}
                  </p>
                  <a
                    href="/owner/viewings"
                    className="inline-flex items-center gap-2 bg-[#D4764E] hover:bg-brand-hover text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-[#D4764E]/20"
                  >
                    <Plus size={14} />
                    {t('calendarAddViewingSlots')}
                  </a>
                </>
              ) : (
                <>
                  <p className="font-bold text-text-primary mb-1.5">
                    {t('calendarComingSoon')}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {t('calendarComingSoonDesc')}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
