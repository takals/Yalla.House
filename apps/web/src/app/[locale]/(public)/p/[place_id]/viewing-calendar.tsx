'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import {
  Calendar, Clock, Check, Plus, User, X, Trash2,
  ChevronLeft, ChevronRight, MessageCircle, Bell,
  MapPin, UserCheck, Star, Repeat, Users, Video, Home,
  Send,
} from 'lucide-react'
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

/* ── Date helpers ────────────────────────────────────────────── */

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

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/* ── Month calendar grid builder ─────────────────────────────── */

function getMonthDays(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1)
  const startDay = first.getDay() === 0 ? 6 : first.getDay() - 1 // Monday start
  const last = new Date(year, month + 1, 0)
  const totalDays = last.getDate()

  const weeks: Date[][] = []
  let week: Date[] = []

  // Pad leading days from previous month
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month, -i)
    week.push(d)
  }

  for (let d = 1; d <= totalDays; d++) {
    week.push(new Date(year, month, d))
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }

  // Pad trailing days
  if (week.length > 0) {
    let nextDay = 1
    while (week.length < 7) {
      week.push(new Date(year, month + 1, nextDay++))
    }
    weeks.push(week)
  }

  return weeks
}

/* ── WhatsApp Flow Timeline ──────────────────────────────────── */

function WhatsAppFlow({ t }: { t: (key: string) => string }) {
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
              {/* Vertical line */}
              {i < steps.length - 1 && (
                <div className="absolute left-[13px] top-[28px] w-[2px] h-[calc(100%-8px)] bg-border-default" />
              )}
              {/* Dot */}
              <div className={`w-[28px] h-[28px] rounded-full ${step.color} flex items-center justify-center flex-shrink-0 relative z-10`}>
                <Icon size={13} className="text-white" />
              </div>
              {/* Content */}
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

export function ViewingCalendar({ listingId, authenticated, isOwner, locale, placeId, preselectedSlotId }: Props) {
  const t = useTranslations('listingPage')
  const dateLocale = dateLocaleFromLocale(locale)

  // Slot data
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(preselectedSlotId ?? null)
  const [notes, setNotes] = useState('')
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Owner calendar state
  const today = useMemo(() => new Date(), [])
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showScheduler, setShowScheduler] = useState(false)

  // Slot creation form
  const [slotStartTime, setSlotStartTime] = useState('10:00')
  const [slotDuration, setSlotDuration] = useState<30 | 60>(30)
  const [slotType, setSlotType] = useState<'in_person' | 'online'>('in_person')
  const [slotGroupType, setSlotGroupType] = useState<'single' | 'group'>('single')
  const [slotRecurring, setSlotRecurring] = useState(false)
  const [slotRecurringWeeks, setSlotRecurringWeeks] = useState(4)
  const [addingSlot, setAddingSlot] = useState(false)
  const [slotSuccess, setSlotSuccess] = useState<string | null>(null)
  const [removingSlot, setRemovingSlot] = useState<string | null>(null)

  // Pending new slots (shown in list before saving)
  const [pendingSlots, setPendingSlots] = useState<Array<{ time: string; duration: number; type: string; group: string }>>([])

  useEffect(() => {
    fetchAvailableSlotsAction(listingId).then(result => {
      setSlots(result.slots)
      setLoading(false)
      if (preselectedSlotId && result.slots.some(s => s.id === preselectedSlotId)) {
        setSelectedSlot(preselectedSlotId)
      }
    })
  }, [listingId, preselectedSlotId])

  const refreshSlots = useCallback(() => {
    fetchAvailableSlotsAction(listingId).then(result => setSlots(result.slots))
  }, [listingId])

  // Dates that have existing slots
  const slotDates = useMemo(() => {
    const dates = new Set<string>()
    for (const slot of slots) {
      dates.add(toDateKey(new Date(slot.starts_at)))
    }
    return dates
  }, [slots])

  // Slots for selected date
  const slotsForDate = useMemo(() => {
    if (!selectedDate) return []
    return slots.filter(s => isSameDay(new Date(s.starts_at), selectedDate))
  }, [slots, selectedDate])

  const weeks = useMemo(() => getMonthDays(currentYear, currentMonth), [currentYear, currentMonth])

  const weekdayLabels = useMemo(() => {
    const days: string[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(2024, 0, i + 1) // Jan 1 2024 = Monday
      days.push(d.toLocaleDateString(dateLocale, { weekday: 'narrow' }))
    }
    return days
  }, [dateLocale])

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(y => y - 1)
    } else {
      setCurrentMonth(m => m - 1)
    }
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(y => y + 1)
    } else {
      setCurrentMonth(m => m + 1)
    }
  }

  function handleDateClick(date: Date) {
    if (date < today && !isSameDay(date, today)) return
    setSelectedDate(date)
    if (isOwner) setShowScheduler(true)
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

  function computeEndTime(startTime: string, durationMin: number): string {
    const [h, m] = startTime.split(':').map(Number)
    const totalMin = (h ?? 10) * 60 + (m ?? 0) + durationMin
    const endH = Math.floor(totalMin / 60) % 24
    const endM = totalMin % 60
    return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
  }

  async function handleAddSlot() {
    if (!selectedDate) return
    setAddingSlot(true)
    setError(null)
    setSlotSuccess(null)

    const dateStr = toDateKey(selectedDate)
    const endTime = computeEndTime(slotStartTime, slotDuration)

    if (slotRecurring) {
      // Create slots for multiple weeks
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

  function advanceStartTime(endTime: string) {
    const [h, m] = endTime.split(':').map(Number)
    const nextH = (m ?? 0) >= 30 ? (h ?? 10) + 1 : (h ?? 10)
    const nextM = (m ?? 0) >= 30 ? '00' : '30'
    setSlotStartTime(`${String(nextH).padStart(2, '0')}:${nextM}`)
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
  const monthLabel = new Date(currentYear, currentMonth).toLocaleDateString(dateLocale, { month: 'long', year: 'numeric' })

  /* ── Loading state ────────────────────────────────────────── */
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

  /* ── Booking success state ────────────────────────────────── */
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

  /* ── Main calendar UI ─────────────────────────────────────── */
  return (
    <div data-booking-slots id="viewing-calendar" className="bg-white rounded-2xl shadow-sm border border-border-default/60 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
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

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row">
        {/* ── LEFT: Calendar + Slots ─────────────────────────── */}
        <div className={`flex-1 px-6 pb-6 ${isOwner ? 'lg:border-r lg:border-border-default/60' : ''}`}>
          {/* Month calendar grid */}
          <div className="mb-5">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg hover:bg-hover-bg transition-colors text-text-secondary"
              >
                <ChevronLeft size={16} />
              </button>
              <p className="text-sm font-bold text-text-primary capitalize">{monthLabel}</p>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg hover:bg-hover-bg transition-colors text-text-secondary"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {weekdayLabels.map((d, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-text-muted uppercase py-1">
                  {d}
                </div>
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
                const key = toDateKey(date)

                return (
                  <button
                    key={`${key}-${i}`}
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
          </div>

          {/* ── Selected date slot list ─────────────────────── */}
          {selectedDate && (
            <div className="bg-[#FAFBFC] rounded-xl border border-border-default/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-text-primary uppercase tracking-wide">
                  {selectedDate.toLocaleDateString(dateLocale, { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <span className="text-[10px] font-semibold text-text-muted">
                  {slotsForDate.length} {slotsForDate.length === 1 ? t('calendarSlotSingular') : t('calendarSlotPlural')}
                </span>
              </div>

              {slotsForDate.length > 0 ? (
                <div className="space-y-1.5">
                  {slotsForDate.map(slot => (
                    <div key={slot.id} className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSlotClick(slot.id)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold border transition-all flex-1 text-left ${
                          slot.id === selectedSlot
                            ? 'bg-brand text-white border-brand shadow-md shadow-brand/20'
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
              ) : (
                <p className="text-xs text-text-muted py-2">
                  {isOwner ? t('calendarNoSlotsDate') : t('calendarNoSlotsDateHunter')}
                </p>
              )}

              {/* Owner: Inline slot form below date slots */}
              {isOwner && showScheduler && (
                <div className="mt-4 pt-4 border-t border-border-default/50">
                  <p className="text-xs font-bold text-text-primary mb-3 flex items-center gap-1.5">
                    <Plus size={12} className="text-brand" />
                    {t('calendarAddSlotForDate')}
                  </p>

                  {/* Time + Duration row */}
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
                    disabled={addingSlot}
                    className="w-full bg-brand hover:bg-brand-hover text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm shadow-brand/20"
                  >
                    {addingSlot ? t('calendarAdding') : slotRecurring
                      ? t('calendarAddRecurring', { weeks: slotRecurringWeeks })
                      : t('calendarAddSlot')
                    }
                  </button>

                  {/* Feedback */}
                  {slotSuccess && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                      <Check size={12} />
                      {slotSuccess}
                    </div>
                  )}
                  {error && (
                    <p className="mt-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                  )}
                </div>
              )}

              {/* Hunter: Booking panel */}
              {selectedSlot && authenticated && !isOwner && (
                <div className="mt-4 pt-4 border-t border-border-default/50">
                  <label className="text-xs font-semibold text-text-secondary block mb-1.5">
                    {t('calendarAddNote')}
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder={t('calendarNotePlaceholder')}
                    rows={2}
                    className="w-full border border-border-default rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none"
                  />
                  {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
                  <button
                    onClick={handleBook}
                    disabled={booking}
                    className="mt-3 w-full bg-brand hover:bg-brand-hover text-white font-bold text-sm py-3 rounded-xl transition-colors disabled:opacity-50 shadow-md shadow-brand/20"
                  >
                    {booking ? t('calendarBooking') : t('calendarBookThis')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* No date selected — prompt */}
          {!selectedDate && !hasSlots && (
            <div className="text-center py-8">
              <p className="text-sm font-semibold text-text-primary mb-1">
                {isOwner ? t('calendarNoSlotsOwner') : t('calendarComingSoon')}
              </p>
              <p className="text-xs text-text-secondary">
                {isOwner ? t('calendarNoSlotsOwnerDesc') : t('calendarComingSoonDesc')}
              </p>
              {isOwner && (
                <button
                  onClick={() => {
                    setSelectedDate(today)
                    setShowScheduler(true)
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-brand/20"
                >
                  <Plus size={14} />
                  {t('calendarAddViewingSlots')}
                </button>
              )}
            </div>
          )}

          {!selectedDate && hasSlots && (
            <div className="text-center py-4">
              <p className="text-xs text-text-muted">
                {isOwner ? t('calendarSelectDateOwner') : t('calendarSelectDate')}
              </p>
            </div>
          )}

          {/* Not authenticated prompt */}
          {!authenticated && !isOwner && !selectedSlot && hasSlots && (
            <div className="flex items-center gap-2 justify-center py-3 mt-2">
              <User size={14} className="text-text-muted" />
              <p className="text-xs text-text-muted">{t('calendarSignIn')}</p>
            </div>
          )}
        </div>

        {/* ── RIGHT: WhatsApp Flow (owner only) ──────────────── */}
        {isOwner && (
          <div className="lg:w-[300px] flex-shrink-0 px-6 pb-6 pt-2 lg:pt-0">
            <WhatsAppFlow t={t} />
          </div>
        )}
      </div>
    </div>
  )
}
