'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  Calendar, CalendarDays, Clock, Check, Plus, X, Trash2,
  ChevronLeft, ChevronRight, MessageCircle, Bell,
  MapPin, UserCheck, Star, Repeat, Users, Video, Home,
  Send, ExternalLink,
} from 'lucide-react'
import { addOwnerSlotAction, addBatchSlotsAction, removeOwnerSlotAction } from '@/app/[locale]/owner/viewings/actions'
import { dateLocaleFromLocale } from '@/lib/country-config'

interface Slot {
  id: string
  listing_id: string
  starts_at: string
  ends_at: string
  is_booked: boolean
}

interface Listing {
  id: string
  title_de: string | null
  title_en: string | null
  place_id: string
  city: string | null
  postcode: string | null
}

interface Props {
  listings: Listing[]
  initialSlots: Slot[]
  locale: string
  translations: Record<string, string>
}

/* ── Date helpers ────────────────────────────────────────────── */

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getMonthDays(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1)
  const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1
  const last = new Date(year, month + 1, 0)
  const totalDays = last.getDate()
  const weeks: Date[][] = []
  let week: Date[] = []

  for (let i = startDay - 1; i >= 0; i--) {
    week.push(new Date(year, month, -i))
  }
  for (let d = 1; d <= totalDays; d++) {
    week.push(new Date(year, month, d))
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length > 0) {
    let nextDay = 1
    while (week.length < 7) week.push(new Date(year, month + 1, nextDay++))
    weeks.push(week)
  }
  return weeks
}

function computeEndTime(startTime: string, durationMin: number): string {
  const [h, m] = startTime.split(':').map(Number)
  const totalMin = (h ?? 10) * 60 + (m ?? 0) + durationMin
  return `${String(Math.floor(totalMin / 60) % 24).padStart(2, '0')}:${String(totalMin % 60).padStart(2, '0')}`
}

/* ── WhatsApp Flow Timeline ──────────────────────────────────── */

function WhatsAppFlow() {
  const t = useTranslations('listingPage')
  const steps = [
    { icon: Send, label: t('waFlowBooked'), desc: t('waFlowBookedDesc'), color: 'bg-brand' },
    { icon: Bell, label: t('waFlowReminder24h'), desc: t('waFlowReminder24hDesc'), color: 'bg-amber-500' },
    { icon: UserCheck, label: t('waFlowConfirmed'), desc: t('waFlowConfirmedDesc'), color: 'bg-green-500' },
    { icon: MapPin, label: t('waFlowDayOf'), desc: t('waFlowDayOfDesc'), color: 'bg-blue-500' },
    { icon: Home, label: t('waFlowArrived'), desc: t('waFlowArrivedDesc'), color: 'bg-purple-500' },
    { icon: Star, label: t('waFlowFollowUp'), desc: t('waFlowFollowUpDesc'), color: 'bg-emerald-500' },
  ]

  return (
    <div className="space-y-0">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
          <MessageCircle size={14} className="text-green-600" />
        </div>
        <h3 className="text-sm font-bold text-text-primary">{t('waFlowTitle')}</h3>
      </div>
      <div className="relative">
        {steps.map((step, i) => {
          const Icon = step.icon
          return (
            <div key={i} className="flex gap-3 relative">
              {i < steps.length - 1 && (
                <div className="absolute left-[13px] top-[28px] w-[2px] h-[calc(100%-8px)] bg-border-default" />
              )}
              <div className={`w-[28px] h-[28px] rounded-full ${step.color} flex items-center justify-center flex-shrink-0 relative z-10`}>
                <Icon size={13} className="text-white" />
              </div>
              <div className={`pb-5 ${i === steps.length - 1 ? 'pb-0' : ''}`}>
                <p className="text-xs font-bold text-text-primary leading-tight">{step.label}</p>
                <p className="text-[11px] text-text-secondary mt-0.5 leading-snug">{step.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────────── */

export function OwnerCalendarView({ listings, initialSlots, locale, translations: tr }: Props) {
  const t = useTranslations('listingPage')
  const dateLocale = dateLocaleFromLocale(locale)

  const [slots, setSlots] = useState<Slot[]>(initialSlots)
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    listings.length === 1 ? listings[0]!.id : null
  )

  // Calendar state
  const today = useMemo(() => new Date(), [])
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Slot creation form
  const [slotStartTime, setSlotStartTime] = useState('10:00')
  const [slotDuration, setSlotDuration] = useState<30 | 60>(30)
  const [slotType, setSlotType] = useState<'in_person' | 'online'>('in_person')
  const [slotGroupType, setSlotGroupType] = useState<'single' | 'group'>('single')
  const [slotRecurring, setSlotRecurring] = useState(false)
  const [slotRecurringWeeks, setSlotRecurringWeeks] = useState(4)
  const [addingSlot, setAddingSlot] = useState(false)
  const [removingSlot, setRemovingSlot] = useState<string | null>(null)
  const [slotSuccess, setSlotSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Filtered slots for selected listing (or all)
  const filteredSlots = useMemo(() => {
    if (!selectedListingId) return slots
    return slots.filter(s => s.listing_id === selectedListingId)
  }, [slots, selectedListingId])

  // Upcoming slots grouped by day (for the top section)
  const upcomingByDay = useMemo(() => {
    const groups: Map<string, Slot[]> = new Map()
    for (const slot of filteredSlots) {
      const dayKey = new Date(slot.starts_at).toLocaleDateString(dateLocale, {
        weekday: 'short', day: 'numeric', month: 'short',
      })
      const existing = groups.get(dayKey) ?? []
      existing.push(slot)
      groups.set(dayKey, existing)
    }
    return groups
  }, [filteredSlots, dateLocale])

  // Dates with slots (for calendar dots)
  const slotDates = useMemo(() => {
    const dates = new Set<string>()
    for (const slot of filteredSlots) dates.add(toDateKey(new Date(slot.starts_at)))
    return dates
  }, [filteredSlots])

  // Slots for selected date
  const slotsForDate = useMemo(() => {
    if (!selectedDate) return []
    return filteredSlots.filter(s => isSameDay(new Date(s.starts_at), selectedDate))
  }, [filteredSlots, selectedDate])

  const weeks = useMemo(() => getMonthDays(currentYear, currentMonth), [currentYear, currentMonth])
  const weekdayLabels = useMemo(() => {
    const days: string[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(2024, 0, i + 1)
      days.push(d.toLocaleDateString(dateLocale, { weekday: 'narrow' }))
    }
    return days
  }, [dateLocale])

  const monthLabel = new Date(currentYear, currentMonth).toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' })

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  function handleDateClick(date: Date) {
    if (date < today && !isSameDay(date, today)) return
    setSelectedDate(date)
  }

  function advanceStartTime(endTime: string) {
    const [h, m] = endTime.split(':').map(Number)
    const nextH = (m ?? 0) >= 30 ? (h ?? 10) + 1 : (h ?? 10)
    const nextM = (m ?? 0) >= 30 ? '00' : '30'
    setSlotStartTime(`${String(nextH).padStart(2, '0')}:${nextM}`)
  }

  async function handleAddSlot() {
    const listingId = selectedListingId ?? listings[0]?.id
    if (!selectedDate || !listingId) return
    setAddingSlot(true)
    setError(null)
    setSlotSuccess(null)

    const dateStr = toDateKey(selectedDate)
    const endTime = computeEndTime(slotStartTime, slotDuration)

    if (slotRecurring) {
      const batchSlots: Array<{ startsAt: string; endsAt: string }> = []
      for (let w = 0; w < slotRecurringWeeks; w++) {
        const d = new Date(selectedDate)
        d.setDate(d.getDate() + w * 7)
        const dayStr = toDateKey(d)
        batchSlots.push({
          startsAt: new Date(`${dayStr}T${slotStartTime}:00`).toISOString(),
          endsAt: new Date(`${dayStr}T${endTime}:00`).toISOString(),
        })
      }
      const result = await addBatchSlotsAction(listingId, batchSlots)
      setAddingSlot(false)
      if ('error' in result) {
        setError(result.error)
      } else if ('count' in result) {
        setSlotSuccess(t('calendarBatchAdded', { count: result.count }))
        refreshSlots()
        advanceStartTime(endTime)
        setTimeout(() => setSlotSuccess(null), 3000)
      }
    } else {
      const startsAt = new Date(`${dateStr}T${slotStartTime}:00`).toISOString()
      const endsAt = new Date(`${dateStr}T${endTime}:00`).toISOString()
      const result = await addOwnerSlotAction(listingId, startsAt, endsAt)
      setAddingSlot(false)
      if ('error' in result) {
        setError(result.error)
      } else {
        setSlotSuccess(t('calendarSlotAdded'))
        refreshSlots()
        advanceStartTime(endTime)
        setTimeout(() => setSlotSuccess(null), 2500)
      }
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

  function refreshSlots() {
    // Refetch from server action — use dynamic import
    import('@/app/[locale]/(public)/p/[place_id]/actions').then(mod => {
      const listingId = selectedListingId ?? listings[0]?.id
      if (!listingId) return
      mod.fetchAvailableSlotsAction(listingId).then(result => {
        setSlots(prev => {
          const otherSlots = prev.filter(s => s.listing_id !== listingId)
          const newSlots = result.slots.map((s: any) => ({ ...s, listing_id: listingId, is_booked: false }))
          return [...otherSlots, ...newSlots].sort((a, b) => a.starts_at.localeCompare(b.starts_at))
        })
      })
    })
  }

  function getListingLabel(listing: Listing): string {
    const title = locale === 'en' ? (listing.title_en ?? listing.title_de) : listing.title_de
    return title ?? (`${listing.postcode ?? ''} ${listing.city ?? ''}`.trim() || listing.place_id)
  }

  const freeCount = filteredSlots.filter(s => !s.is_booked).length
  const bookedCount = filteredSlots.filter(s => s.is_booked).length

  // ── No listings state ──
  if (listings.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-4">
          <CalendarDays size={28} className="text-brand" />
        </div>
        <h1 className="text-2xl font-bold mb-2">{tr.noListings}</h1>
        <p className="text-sm text-text-secondary">{tr.noListingsDesc}</p>
      </div>
    )
  }

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{tr.title}</h1>
          <p className="text-sm text-text-secondary mt-1">{tr.subtitle}</p>
        </div>
      </div>

      {/* ── Listing selector (multi-listing owners) ────────────── */}
      {listings.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedListingId(null)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              !selectedListingId
                ? 'bg-brand text-white border-brand shadow-sm'
                : 'bg-surface border-border-default text-text-secondary hover:border-brand/30'
            }`}
          >
            {tr.allListings}
          </button>
          {listings.map(listing => (
            <button
              key={listing.id}
              onClick={() => setSelectedListingId(listing.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                selectedListingId === listing.id
                  ? 'bg-brand text-white border-brand shadow-sm'
                  : 'bg-surface border-border-default text-text-secondary hover:border-brand/30'
              }`}
            >
              {getListingLabel(listing)}
            </button>
          ))}
        </div>
      )}

      {/* ═══ OFFERED VIEWING SLOTS — on top ═══════════════════════ */}
      <div className="bg-surface rounded-2xl border border-border-default shadow-sm mb-6 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center">
              <Clock size={16} className="text-brand" />
            </div>
            <div>
              <h2 className="text-base font-bold">{tr.upcomingSlots}</h2>
              <p className="text-xs text-text-secondary">
                {freeCount} {tr.free} · {bookedCount} {tr.booked}
              </p>
            </div>
          </div>
          {selectedListingId && (
            <Link
              href={`/${locale === 'de' ? '' : 'en/'}p/${listings.find(l => l.id === selectedListingId)?.place_id ?? ''}`}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-[#BF6840] transition-colors"
            >
              <ExternalLink size={12} />
              {tr.viewProperty}
            </Link>
          )}
        </div>

        {filteredSlots.length === 0 ? (
          <div className="text-center py-10 px-6">
            <p className="text-sm font-semibold text-text-primary mb-1">{tr.noSlots}</p>
            <p className="text-xs text-text-secondary">{tr.noSlotsDesc}</p>
          </div>
        ) : (
          <div className="px-6 py-4 max-h-[280px] overflow-y-auto">
            <div className="space-y-4">
              {Array.from(upcomingByDay.entries()).map(([dayLabel, daySlots]) => (
                <div key={dayLabel}>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wide mb-1.5">{dayLabel}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
                    {daySlots.map(slot => {
                      const startT = new Date(slot.starts_at).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })
                      const endT = new Date(slot.ends_at).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })
                      return (
                        <div
                          key={slot.id}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border ${
                            slot.is_booked
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : 'bg-white border-border-default text-text-primary'
                          }`}
                        >
                          <Clock size={11} className={slot.is_booked ? 'text-green-500' : 'text-text-muted'} />
                          {startT} – {endT}
                          {slot.is_booked && <Check size={11} className="text-green-500 ml-auto" />}
                          {!slot.is_booked && (
                            <button
                              onClick={() => handleRemoveSlot(slot.id)}
                              disabled={removingSlot === slot.id}
                              className="ml-auto p-0.5 text-text-muted hover:text-red-500 transition-colors"
                            >
                              {removingSlot === slot.id ? (
                                <div className="w-3 h-3 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 size={11} />
                              )}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ MONTH CALENDAR + WHATSAPP FLOW ═══════════════════════ */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Calendar + slot creation ─────────────────────────── */}
        <div className="flex-1 bg-surface rounded-2xl border border-border-default shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand/10 flex items-center justify-center">
                <Calendar size={16} className="text-brand" />
              </div>
              <h2 className="text-base font-bold">{t('calendarTitle')}</h2>
            </div>
          </div>

          <div className="px-6 pb-6">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-hover-bg transition-colors text-text-secondary">
                <ChevronLeft size={16} />
              </button>
              <p className="text-sm font-bold text-text-primary capitalize">{monthLabel}</p>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-hover-bg transition-colors text-text-secondary">
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {weekdayLabels.map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-text-muted uppercase py-1">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {weeks.flat().map((date, i) => {
                const isCurrentMonth = date.getMonth() === currentMonth
                const isToday = isSameDay(date, today)
                const isPast = date < today && !isToday
                const isSelected = selectedDate && isSameDay(date, selectedDate)
                const hasSlot = slotDates.has(toDateKey(date))

                return (
                  <button
                    key={`${toDateKey(date)}-${i}`}
                    onClick={() => handleDateClick(date)}
                    disabled={isPast || !isCurrentMonth}
                    className={`
                      relative aspect-square flex items-center justify-center rounded-lg text-xs font-semibold transition-all
                      ${!isCurrentMonth ? 'text-text-muted/30 cursor-default' : ''}
                      ${isPast && isCurrentMonth ? 'text-text-muted/40 cursor-default' : ''}
                      ${isCurrentMonth && !isPast && !isSelected ? 'hover:bg-hover-bg text-text-primary cursor-pointer' : ''}
                      ${isSelected ? 'bg-brand text-white shadow-md shadow-brand/20' : ''}
                      ${isToday && !isSelected ? 'ring-2 ring-brand/30 ring-inset' : ''}
                    `}
                  >
                    {date.getDate()}
                    {hasSlot && !isSelected && isCurrentMonth && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brand" />
                    )}
                    {hasSlot && isSelected && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/70" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* ── Selected date panel ───────────────────────── */}
            {selectedDate && (
              <div className="mt-5 bg-[#FAFBFC] rounded-xl border border-border-default/60 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-text-primary uppercase tracking-wide">
                    {selectedDate.toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                  <span className="text-[10px] font-semibold text-text-muted">
                    {slotsForDate.length} {slotsForDate.length === 1 ? t('calendarSlotSingular') : t('calendarSlotPlural')}
                  </span>
                </div>

                {/* Existing slots for this date */}
                {slotsForDate.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    {slotsForDate.map(slot => {
                      const startT = new Date(slot.starts_at).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })
                      const endT = new Date(slot.ends_at).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })
                      return (
                        <div key={slot.id} className="flex items-center gap-1.5">
                          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold border flex-1 ${
                            slot.is_booked
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : 'bg-white text-text-primary border-border-default'
                          }`}>
                            <Clock size={13} className={slot.is_booked ? 'text-green-500' : 'text-text-muted'} />
                            {startT} – {endT}
                            {slot.is_booked && <span className="ml-auto text-[10px] text-green-600">{tr.booked}</span>}
                          </div>
                          {!slot.is_booked && (
                            <button
                              onClick={() => handleRemoveSlot(slot.id)}
                              disabled={removingSlot === slot.id}
                              className="p-1.5 text-text-muted hover:text-red-500 transition-colors disabled:opacity-40"
                            >
                              {removingSlot === slot.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Slot creation form */}
                <div className={slotsForDate.length > 0 ? 'pt-3 border-t border-border-default/50' : ''}>
                  <p className="text-xs font-bold text-text-primary mb-3 flex items-center gap-1.5">
                    <Plus size={12} className="text-brand" />
                    {t('calendarAddSlotForDate')}
                  </p>

                  {/* Time + Duration */}
                  <div className="flex flex-wrap gap-2 items-end mb-3">
                    <div className="w-[100px]">
                      <label className="text-[10px] font-semibold text-text-secondary block mb-1">{t('calendarStartTime')}</label>
                      <input
                        type="time"
                        value={slotStartTime}
                        onChange={e => setSlotStartTime(e.target.value)}
                        className="w-full border border-border-default rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
                      />
                    </div>
                    <div className="w-[90px]">
                      <label className="text-[10px] font-semibold text-text-secondary block mb-1">{t('calendarDuration')}</label>
                      <select
                        value={slotDuration}
                        onChange={e => setSlotDuration(Number(e.target.value) as 30 | 60)}
                        className="w-full border border-border-default rounded-lg px-2.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
                      >
                        <option value={30}>30 min</option>
                        <option value={60}>60 min</option>
                      </select>
                    </div>
                    <div className="text-xs font-semibold text-text-secondary py-2">
                      → {computeEndTime(slotStartTime, slotDuration)}
                    </div>
                  </div>

                  {/* Type chips */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      onClick={() => setSlotType('in_person')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        slotType === 'in_person'
                          ? 'bg-brand/10 border-brand/30 text-brand'
                          : 'bg-white border-border-default text-text-secondary hover:border-brand/20'
                      }`}
                    >
                      <Home size={12} />
                      {t('calendarInPerson')}
                    </button>
                    <button
                      onClick={() => setSlotType('online')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        slotType === 'online'
                          ? 'bg-purple-50 border-purple-200 text-purple-700'
                          : 'bg-white border-border-default text-text-secondary hover:border-purple-200'
                      }`}
                    >
                      <Video size={12} />
                      {t('calendarOnline')}
                    </button>
                    <button
                      onClick={() => setSlotGroupType(slotGroupType === 'single' ? 'group' : 'single')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        slotGroupType === 'group'
                          ? 'bg-blue-50 border-blue-200 text-blue-700'
                          : 'bg-white border-border-default text-text-secondary hover:border-blue-200'
                      }`}
                    >
                      <Users size={12} />
                      {slotGroupType === 'group' ? t('calendarGroupViewing') : t('calendarSingleViewing')}
                    </button>
                  </div>

                  {/* Recurring toggle */}
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => setSlotRecurring(!slotRecurring)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        slotRecurring
                          ? 'bg-amber-50 border-amber-200 text-amber-700'
                          : 'bg-white border-border-default text-text-secondary hover:border-amber-200'
                      }`}
                    >
                      <Repeat size={12} />
                      {t('calendarRecurring')}
                    </button>
                    {slotRecurring && (
                      <select
                        value={slotRecurringWeeks}
                        onChange={e => setSlotRecurringWeeks(Number(e.target.value))}
                        className="border border-border-default rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
                      >
                        <option value={2}>2 {t('calendarWeeks')}</option>
                        <option value={4}>4 {t('calendarWeeks')}</option>
                        <option value={6}>6 {t('calendarWeeks')}</option>
                        <option value={8}>8 {t('calendarWeeks')}</option>
                      </select>
                    )}
                  </div>

                  {/* Add button */}
                  <button
                    onClick={handleAddSlot}
                    disabled={addingSlot || (!selectedListingId && listings.length > 1)}
                    className="w-full bg-brand hover:bg-brand-hover text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-brand/20"
                  >
                    {addingSlot ? t('calendarAdding') : slotRecurring
                      ? t('calendarAddRecurring', { weeks: slotRecurringWeeks })
                      : t('calendarAddSlot')
                    }
                  </button>

                  {slotSuccess && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                      <Check size={12} /> {slotSuccess}
                    </div>
                  )}
                  {error && (
                    <p className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                  )}
                </div>
              </div>
            )}

            {/* No date selected prompt */}
            {!selectedDate && (
              <div className="text-center py-6">
                <p className="text-sm text-text-secondary">
                  {filteredSlots.length === 0 ? tr.noSlotsDesc : t('calendarSelectDateOwner')}
                </p>
                {filteredSlots.length === 0 && (
                  <button
                    onClick={() => { setSelectedDate(today) }}
                    className="mt-3 inline-flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-brand/20"
                  >
                    <Plus size={14} />
                    {tr.addFirstSlot}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── WhatsApp automation flow ─────────────────────────── */}
        <div className="lg:w-[280px] bg-surface rounded-2xl border border-border-default shadow-sm p-6">
          <WhatsAppFlow />
        </div>
      </div>
    </div>
  )
}
