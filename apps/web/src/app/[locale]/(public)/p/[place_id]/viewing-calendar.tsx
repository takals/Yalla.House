'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Calendar, Clock, Check, Plus, User, X, Trash2, Zap } from 'lucide-react'
import { fetchAvailableSlotsAction, bookSlotAction } from './actions'
import { addOwnerSlotAction, addBatchSlotsAction, removeOwnerSlotAction } from '@/app/[locale]/owner/viewings/actions'
import { dateLocaleFromLocale } from '@/lib/country-config'

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
  return new Date(iso).toLocaleDateString(dateLocaleFromLocale(locale), { weekday: 'short', day: 'numeric', month: 'short' })
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
  for (var i = 1; i <= 7; i++) {
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

function getDefaultDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0] ?? ''
}

function generateQuickWeekSlots(): Array<{ startsAt: string; endsAt: string }> {
  const slots: Array<{ startsAt: string; endsAt: string }> = []
  const now = new Date()
  const times = [
    { h: 10, m: 0, eh: 10, em: 30 },
    { h: 11, m: 0, eh: 11, em: 30 },
    { h: 14, m: 0, eh: 14, em: 30 },
    { h: 15, m: 30, eh: 16, em: 0 },
  ]

  for (var i = 1; i <= 7; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    if (d.getDay() === 0 || d.getDay() === 6) continue
    for (const t of times) {
      const start = new Date(d)
      start.setHours(t.h, t.m, 0, 0)
      const end = new Date(d)
      end.setHours(t.eh, t.em, 0, 0)
      slots.push({ startsAt: start.toISOString(), endsAt: end.toISOString() })
    }
  }
  return slots
}

export function ViewingCalendar({ listingId, authenticated, isOwner, locale, placeId, preselectedSlotId }: Props) {
  const t = useTranslations('listingPage')
  const dateLocale = dateLocaleFromLocale(locale)
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(preselectedSlotId ?? null)
  const [notes, setNotes] = useState('')
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Inline scheduler state (owner only)
  const [showScheduler, setShowScheduler] = useState(false)
  const [slotDate, setSlotDate] = useState(getDefaultDate)
  const [slotStartTime, setSlotStartTime] = useState('10:00')
  const [slotEndTime, setSlotEndTime] = useState('10:30')
  const [addingSlot, setAddingSlot] = useState(false)
  const [slotSuccess, setSlotSuccess] = useState<string | null>(null)
  const [addingBatch, setAddingBatch] = useState(false)
  const [removingSlot, setRemovingSlot] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetchAvailableSlotsAction(listingId).then(result => {
      setSlots(result.slots)
      setLoading(false)
      if (preselectedSlotId && result.slots.some(s => s.id === preselectedSlotId)) {
        setSelectedSlot(preselectedSlotId)
      }
    })
  }, [listingId, preselectedSlotId])

  function refreshSlots() {
    fetchAvailableSlotsAction(listingId).then(result => {
      setSlots(result.slots)
    })
  }

  function handleSlotClick(slotId: string) {
    if (isOwner) return

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

  async function handleAddSlot() {
    setAddingSlot(true)
    setError(null)
    setSlotSuccess(null)
    const startsAt = new Date(`${slotDate}T${slotStartTime}:00`).toISOString()
    const endsAt = new Date(`${slotDate}T${slotEndTime}:00`).toISOString()
    const result = await addOwnerSlotAction(listingId, startsAt, endsAt)
    setAddingSlot(false)
    if ('error' in result) {
      setError(result.error)
    } else {
      setSlotSuccess(t('calendarSlotAdded'))
      refreshSlots()
      // Advance start time for next quick add
      const parts = slotEndTime.split(':').map(Number)
      const h = parts[0] ?? 10
      const m = parts[1] ?? 0
      const nextH = m >= 30 ? h + 1 : h
      const nextM = m >= 30 ? '00' : '30'
      const nextEndH = nextM === '30' ? nextH : nextH + 1
      const nextEndM = nextM === '30' ? '00' : '30'
      setSlotStartTime(`${String(nextH).padStart(2, '0')}:${nextM}`)
      setSlotEndTime(`${String(nextEndH).padStart(2, '0')}:${nextEndM}`)
      setTimeout(() => setSlotSuccess(null), 2500)
    }
  }

  async function handleQuickWeek() {
    setAddingBatch(true)
    setError(null)
    setSlotSuccess(null)
    const weekSlots = generateQuickWeekSlots()
    const result = await addBatchSlotsAction(listingId, weekSlots)
    setAddingBatch(false)
    if ('error' in result) {
      setError(result.error)
    } else if ('count' in result) {
      setSlotSuccess(t('calendarBatchAdded', { count: result.count }))
      refreshSlots()
      setTimeout(() => setSlotSuccess(null), 3000)
    }
  }

  async function handleRemoveSlot(slotId: string) {
    setRemovingSlot(slotId)
    const result = await removeOwnerSlotAction(slotId)
    setRemovingSlot(null)
    if ('error' in result) {
      setError(result.error)
    } else {
      setSlots(prev => prev.filter(s => s.id !== slotId))
    }
  }

  const hasSlots = slots.length > 0
  const grouped = hasSlots ? groupByDay(slots, dateLocale) : null
  const mockDays = !hasSlots && !loading ? generateMockSlots(dateLocale) : []

  if (loading) {
    return (
      <div data-booking-slots className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-border-default/60">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
            <Calendar size={18} className="text-brand" />
          </div>
          <h2 className="text-xl font-bold">{t('calendarTitle')}</h2>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-hover-bg rounded-xl" />
          <div className="h-12 bg-hover-bg rounded-xl" />
          <div className="h-12 bg-hover-bg rounded-xl" />
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

  // ── Inline Slot Scheduler (owner only) ──────────────────────
  const schedulerPanel = showScheduler && isOwner && (
    <div className="mt-5 bg-[#FAFBFC] rounded-xl border border-border-default/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Plus size={14} className="text-brand" />
          {t('calendarScheduleTitle')}
        </h3>
        <button
          onClick={() => setShowScheduler(false)}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Single slot form */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="text-xs font-semibold text-text-secondary block mb-1">{t('calendarDate')}</label>
          <input
            type="date"
            value={slotDate}
            onChange={e => setSlotDate(e.target.value)}
            min={new Date().toISOString().split('T')[0] ?? ''}
            className="w-full border border-border-default rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div className="w-[100px]">
          <label className="text-xs font-semibold text-text-secondary block mb-1">{t('calendarStartTime')}</label>
          <input
            type="time"
            value={slotStartTime}
            onChange={e => setSlotStartTime(e.target.value)}
            className="w-full border border-border-default rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div className="w-[100px]">
          <label className="text-xs font-semibold text-text-secondary block mb-1">{t('calendarEndTime')}</label>
          <input
            type="time"
            value={slotEndTime}
            onChange={e => setSlotEndTime(e.target.value)}
            className="w-full border border-border-default rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <button
          onClick={handleAddSlot}
          disabled={addingSlot}
          className="bg-brand hover:bg-brand-hover text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
        >
          {addingSlot ? t('calendarAdding') : t('calendarAddSlot')}
        </button>
      </div>

      {/* Quick week shortcut */}
      <div className="mt-4 pt-4 border-t border-border-default/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-text-primary">{t('calendarQuickWeek')}</p>
              <p className="text-xs text-text-secondary">{t('calendarQuickWeekDesc')}</p>
            </div>
          </div>
          <button
            onClick={handleQuickWeek}
            disabled={addingBatch}
            className="text-sm font-semibold text-brand hover:text-[#BF6840] transition-colors disabled:opacity-50"
          >
            {addingBatch ? t('calendarAddingBatch') : t('calendarAddWeekSlots')}
          </button>
        </div>
      </div>

      {/* Feedback messages */}
      {slotSuccess && (
        <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
          <Check size={14} />
          {slotSuccess}
        </div>
      )}
      {error && (
        <p className="mt-3 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}
    </div>
  )

  return (
    <div data-booking-slots className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-border-default/60">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center">
            <Calendar size={18} className="text-brand" />
          </div>
          <h2 className="text-xl font-bold">{t('calendarTitle')}</h2>
        </div>
        {isOwner && (
          <button
            onClick={() => setShowScheduler(!showScheduler)}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-[#BF6840] transition-colors"
          >
            {showScheduler ? <X size={14} /> : <Plus size={14} />}
            {showScheduler ? t('calendarDone') : t('calendarAddSlots')}
          </button>
        )}
      </div>

      {/* Inline scheduler for owner */}
      {schedulerPanel}

      {/* Real slots — 7-day week-at-a-glance grid */}
      {hasSlots && grouped && (
        <div className={`space-y-5 ${showScheduler ? 'mt-5' : ''}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(grouped.entries()).map(([day, daySlots]) => (
              <div key={day} className="bg-[#FAFBFC] rounded-xl p-4 border border-border-default/50">
                <p className="text-xs font-bold text-text-primary mb-3 uppercase tracking-wide">
                  {daySlots[0] ? formatDay(daySlots[0].starts_at, locale) : day}
                </p>
                <div className="flex flex-col gap-1.5">
                  {daySlots.map(slot => (
                    <div key={slot.id} className="flex items-center gap-1">
                      <button
                        onClick={() => handleSlotClick(slot.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold border transition-all flex-1 text-left ${
                          slot.id === selectedSlot
                            ? 'bg-brand text-white border-brand shadow-md shadow-[#D4764E]/20'
                            : isOwner
                              ? 'bg-white text-text-primary border-border-default'
                              : 'bg-white text-text-primary border-border-default hover:border-brand hover:text-brand'
                        }`}
                      >
                        <Clock size={13} className={slot.id === selectedSlot ? 'text-white/80' : 'text-text-muted'} />
                        {formatTime(slot.starts_at, dateLocale)} – {formatTime(slot.ends_at, dateLocale)}
                      </button>
                      {isOwner && showScheduler && (
                        <button
                          onClick={() => handleRemoveSlot(slot.id)}
                          disabled={removingSlot === slot.id}
                          className="p-1.5 text-text-muted hover:text-red-500 transition-colors disabled:opacity-40"
                          title={t('calendarRemoveSlot')}
                        >
                          {removingSlot === slot.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Book / complete booking panel */}
          {selectedSlot && authenticated && !isOwner && (
            <div className="bg-brand/5 rounded-xl p-5 border border-brand/15">
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
                className="mt-3 w-full bg-brand hover:bg-brand-hover text-white font-bold text-sm py-3.5 rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-[#D4764E]/20"
              >
                {booking ? t('calendarBooking') : t('calendarBookThis')}
              </button>
            </div>
          )}

          {/* Not authenticated — prompt to sign in (clicking a slot redirects) */}
          {!authenticated && !isOwner && !selectedSlot && (
            <div className="flex items-center gap-2 justify-center py-2">
              <User size={14} className="text-text-muted" />
              <p className="text-xs text-text-muted">{t('calendarSignIn')}</p>
            </div>
          )}
        </div>
      )}

      {/* Empty state with greyed-out mock slots */}
      {!hasSlots && !dismissed && (
        <div className="relative">
          <div className="pointer-events-none select-none">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockDays.map(day => (
                <div key={day.day} className="bg-gray-100/70 rounded-xl p-4 border border-gray-200/80">
                  <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wide">{day.day}</p>
                  <div className="flex flex-col gap-1.5">
                    {day.times.map(time => (
                      <div
                        key={time}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 bg-gray-50 text-gray-300"
                      >
                        <Clock size={13} />
                        {time}
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-300 font-medium mt-2 text-center uppercase tracking-wider">{t('calendarMockLabel')}</p>
                </div>
              ))}
            </div>
          </div>

          {!showScheduler && (
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
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setShowScheduler(true)}
                        className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-[#D4764E]/20"
                      >
                        <Plus size={14} />
                        {t('calendarAddViewingSlots')}
                      </button>
                      <button
                        onClick={() => setDismissed(true)}
                        className="text-sm text-text-muted hover:text-text-secondary transition-colors py-1"
                      >
                        {t('calendarLater')}
                      </button>
                    </div>
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
          )}
        </div>
      )}

      {/* Dismissed empty state — just show the scheduler panel above if owner opens it */}
      {!hasSlots && dismissed && !showScheduler && (
        <div className="text-center py-6">
          <p className="text-sm text-text-muted">{t('calendarNoSlotsOwnerDesc')}</p>
        </div>
      )}
    </div>
  )
}
