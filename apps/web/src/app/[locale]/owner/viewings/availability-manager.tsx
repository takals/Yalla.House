'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { useAuthAction } from '@/lib/use-auth-action'
import { addOwnerSlotAction, removeOwnerSlotAction, addBatchSlotsAction } from './actions'
import { Calendar, Clock, Trash2, Plus, X, Repeat } from 'lucide-react'
import { dateLocaleFromLocale } from '@/lib/country-config'

export interface SlotRow {
  id: string
  listing_id: string
  starts_at: string
  ends_at: string
  is_booked: boolean
}

interface ListingOption {
  id: string
  title: string
}

function formatSlotTime(iso: string, dateLocale: string): string {
  return new Date(iso).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })
}

function formatSlotDate(iso: string, dateLocale: string): string {
  return new Date(iso).toLocaleDateString(dateLocale, { weekday: 'short', day: 'numeric', month: 'short' })
}

export function AvailabilityManager({
  initialSlots,
  listings,
  translations: t,
}: {
  initialSlots: SlotRow[]
  listings: ListingOption[]
  translations: Record<string, string>
}) {
  const { handleAuthRequired } = useAuthAction()
  const locale = useLocale()
  const dateLocale = dateLocaleFromLocale(locale)
  const [slots, setSlots] = useState<SlotRow[]>(initialSlots)
  const [showForm, setShowForm] = useState(false)
  const [acting, setActing] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [selectedListing, setSelectedListing] = useState(listings[0]?.id ?? '')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('10:30')

  // Quick Week state
  const [showQuickWeek, setShowQuickWeek] = useState(false)
  const [qwDays, setQwDays] = useState<Set<number>>(new Set([1, 2, 3, 4, 5])) // Mon-Fri
  const [qwFrom, setQwFrom] = useState('09:00')
  const [qwTo, setQwTo] = useState('17:00')
  const [qwDuration, setQwDuration] = useState(30) // minutes
  const [qwSuccess, setQwSuccess] = useState<string | null>(null)

  async function handleAdd() {
    if (!selectedListing || !date || !startTime || !endTime) {
      setError(t.fillAllFields ?? 'Alle Felder ausfüllen')
      return
    }
    setError(null)
    setActing(s => new Set(s).add('add'))

    const startsAt = new Date(`${date}T${startTime}:00`).toISOString()
    const endsAt = new Date(`${date}T${endTime}:00`).toISOString()

    const result = await addOwnerSlotAction(selectedListing, startsAt, endsAt)
    setActing(s => { const n = new Set(s); n.delete('add'); return n })

    if (handleAuthRequired(result)) {
      return
    }

    if ('error' in result) {
      setError(result.error)
    } else if ('success' in result) {
      setSlots(prev => [...prev, {
        id: result.slotId,
        listing_id: selectedListing,
        starts_at: startsAt,
        ends_at: endsAt,
        is_booked: false,
      }])
      setShowForm(false)
      setDate('')
      setStartTime('10:00')
      setEndTime('10:30')
    }
  }

  async function handleRemove(slotId: string) {
    setActing(s => new Set(s).add(slotId))
    const result = await removeOwnerSlotAction(slotId)
    setActing(s => { const n = new Set(s); n.delete(slotId); return n })

    if (handleAuthRequired(result)) {
      return
    }

    if ('success' in result) {
      setSlots(prev => prev.filter(s => s.id !== slotId))
    } else if ('error' in result) {
      setError(result.error)
    }
  }

  async function handleQuickWeek() {
    if (!selectedListing || qwDays.size === 0) {
      setError(t.fillAllFields ?? 'Fill all fields')
      return
    }
    setError(null)
    setQwSuccess(null)
    setActing(s => new Set(s).add('batch'))

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const batchSlots: Array<{ startsAt: string; endsAt: string }> = []

    for (let d = 0; d < 7; d++) {
      const day = new Date(today)
      day.setDate(today.getDate() + d + 1) // start from tomorrow
      const dow = day.getDay() // 0=Sun, 1=Mon...
      if (!qwDays.has(dow)) continue

      const fromParts = qwFrom.split(':').map(Number)
      const toParts = qwTo.split(':').map(Number)
      const fromH = fromParts[0] ?? 9
      const fromM = fromParts[1] ?? 0
      const toH = toParts[0] ?? 17
      const toM = toParts[1] ?? 0
      const dayStart = fromH * 60 + fromM
      const dayEnd = toH * 60 + toM

      for (let m = dayStart; m + qwDuration <= dayEnd; m += qwDuration) {
        const start = new Date(day)
        start.setHours(Math.floor(m / 60), m % 60, 0, 0)
        const end = new Date(day)
        end.setHours(Math.floor((m + qwDuration) / 60), (m + qwDuration) % 60, 0, 0)
        batchSlots.push({ startsAt: start.toISOString(), endsAt: end.toISOString() })
      }
    }

    if (batchSlots.length === 0) {
      setError('No valid slots generated')
      setActing(s => { const n = new Set(s); n.delete('batch'); return n })
      return
    }

    const result = await addBatchSlotsAction(selectedListing, batchSlots)
    setActing(s => { const n = new Set(s); n.delete('batch'); return n })

    if (handleAuthRequired(result)) return

    if ('error' in result) {
      setError(result.error)
    } else if ('success' in result) {
      setQwSuccess((t.slotsCreated ?? '{count} slots created').replace('{count}', String(result.count)))
      setShowQuickWeek(false)
      // Reload page to get fresh slot data
      window.location.reload()
    }
  }

  const DAY_LABELS = [
    { value: 0, label: t.sun ?? 'Sun' },
    { value: 1, label: t.mon ?? 'Mon' },
    { value: 2, label: t.tue ?? 'Tue' },
    { value: 3, label: t.wed ?? 'Wed' },
    { value: 4, label: t.thu ?? 'Thu' },
    { value: 5, label: t.fri ?? 'Fri' },
    { value: 6, label: t.sat ?? 'Sat' },
  ]

  function toggleDay(day: number) {
    setQwDays(prev => {
      const next = new Set(prev)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })
  }

  // Group slots by date
  const grouped = new Map<string, SlotRow[]>()
  for (const slot of slots.sort((a, b) => a.starts_at.localeCompare(b.starts_at))) {
    const day = formatSlotDate(slot.starts_at, dateLocale)
    if (!grouped.has(day)) grouped.set(day, [])
    grouped.get(day)!.push(slot)
  }

  const listingNameMap = Object.fromEntries(listings.map(l => [l.id, l.title]))
  const availableSlots = slots.filter(s => !s.is_booked)
  const bookedSlots = slots.filter(s => s.is_booked)

  return (
    <div className="mt-6">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-brand" />
          <h2 className="text-lg font-bold">{t.availabilityTitle}</h2>
        </div>
        {listings.length > 0 && (
          <button
            type="button"
            onClick={() => setShowForm(f => !f)}
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 bg-brand hover:bg-brand-hover text-text-primary rounded-lg transition-colors"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            {showForm ? t.cancel : t.addSlot}
          </button>
        )}
      </div>

      {/* Mini stats */}
      <div className="flex gap-3 mb-4">
        <div className="bg-surface rounded-lg px-3 py-2 text-center flex-1">
          <p className="text-lg font-bold text-green-600">{availableSlots.length}</p>
          <p className="text-xs text-text-secondary">{t.available}</p>
        </div>
        <div className="bg-surface rounded-lg px-3 py-2 text-center flex-1">
          <p className="text-lg font-bold text-brand">{bookedSlots.length}</p>
          <p className="text-xs text-text-secondary">{t.booked}</p>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-surface rounded-card p-5 shadow-sm mb-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {listings.length > 1 && (
              <div className="col-span-2 sm:col-span-4">
                <label className="text-xs font-semibold text-text-secondary mb-1 block">{t.selectListing}</label>
                <select
                  value={selectedListing}
                  onChange={e => setSelectedListing(e.target.value)}
                  className="w-full text-sm border border-[#D8DBE5] rounded-lg px-3 py-2 bg-white"
                >
                  {listings.map(l => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1 block">{t.date}</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full text-sm border border-[#D8DBE5] rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1 block">{t.startTime}</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full text-sm border border-[#D8DBE5] rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1 block">{t.endTime}</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full text-sm border border-[#D8DBE5] rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleAdd}
                disabled={acting.has('add')}
                className="w-full text-sm font-bold px-4 py-2 bg-brand hover:bg-brand-hover text-text-primary rounded-lg transition-colors disabled:opacity-50"
              >
                {acting.has('add') ? '...' : t.save}
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
      )}

      {/* Quick Week batch creator */}
      {listings.length > 0 && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => { setShowQuickWeek(f => !f); setQwSuccess(null) }}
            className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-text-primary transition-colors"
          >
            <Repeat size={14} />
            {t.quickWeek ?? 'Quick-fill week'}
          </button>

          {qwSuccess && (
            <div className="mt-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm text-green-700 font-medium">
              {qwSuccess}
            </div>
          )}

          {showQuickWeek && (
            <div className="bg-surface rounded-card p-5 shadow-sm mt-3">
              <p className="text-xs text-text-secondary mb-4">{t.quickWeekDesc ?? 'Create slots for the next 7 days automatically'}</p>

              {listings.length > 1 && (
                <div className="mb-3">
                  <label className="text-xs font-semibold text-text-secondary mb-1 block">{t.selectListing}</label>
                  <select
                    value={selectedListing}
                    onChange={e => setSelectedListing(e.target.value)}
                    className="w-full text-sm border border-[#D8DBE5] rounded-lg px-3 py-2 bg-white"
                  >
                    {listings.map(l => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Day selector */}
              <div className="mb-3">
                <label className="text-xs font-semibold text-text-secondary mb-2 block">{t.selectDays ?? 'Select days'}</label>
                <div className="flex gap-1.5">
                  {DAY_LABELS.map(d => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => toggleDay(d.value)}
                      className={`w-9 h-9 rounded-lg text-xs font-bold transition-colors ${
                        qwDays.has(d.value)
                          ? 'bg-[#0F1117] text-white'
                          : 'bg-hover-bg text-text-secondary hover:bg-[#E4E6EF]'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time range + duration */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1 block">{t.fromTime ?? 'From'}</label>
                  <input
                    type="time"
                    value={qwFrom}
                    onChange={e => setQwFrom(e.target.value)}
                    className="w-full text-sm border border-[#D8DBE5] rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1 block">{t.toTime ?? 'Until'}</label>
                  <input
                    type="time"
                    value={qwTo}
                    onChange={e => setQwTo(e.target.value)}
                    className="w-full text-sm border border-[#D8DBE5] rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1 block">{t.slotDuration ?? 'Duration'}</label>
                  <select
                    value={qwDuration}
                    onChange={e => setQwDuration(Number(e.target.value))}
                    className="w-full text-sm border border-[#D8DBE5] rounded-lg px-3 py-2 bg-white"
                  >
                    <option value={15}>15 {t.minutes ?? 'min'}</option>
                    <option value={30}>30 {t.minutes ?? 'min'}</option>
                    <option value={45}>45 {t.minutes ?? 'min'}</option>
                    <option value={60}>60 {t.minutes ?? 'min'}</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleQuickWeek}
                disabled={acting.has('batch')}
                className="w-full text-sm font-bold px-4 py-2.5 bg-brand hover:bg-brand-hover text-text-primary rounded-lg transition-colors disabled:opacity-50"
              >
                {acting.has('batch') ? '...' : (t.generateSlots ?? 'Create slots')}
              </button>
              {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
            </div>
          )}
        </div>
      )}

      {/* Slot list grouped by day */}
      {slots.length === 0 ? (
        <div className="bg-surface rounded-card p-8 text-center shadow-sm">
          <p className="text-sm text-text-secondary">{t.noSlots}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from(grouped.entries()).map(([day, daySlots]) => (
            <div key={day}>
              <p className="text-xs font-semibold text-text-secondary mb-2">{day}</p>
              <div className="space-y-2">
                {daySlots.map(slot => (
                  <div
                    key={slot.id}
                    className="bg-surface rounded-lg p-3 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Clock size={14} className={slot.is_booked ? 'text-brand' : 'text-green-500'} />
                      <div>
                        <span className="text-sm font-semibold">
                          {formatSlotTime(slot.starts_at, dateLocale)} – {formatSlotTime(slot.ends_at, dateLocale)}
                        </span>
                        {listings.length > 1 && (
                          <span className="text-xs text-text-secondary ml-2">
                            {listingNameMap[slot.listing_id] ?? '—'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${slot.is_booked ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                        {slot.is_booked ? t.booked : t.available}
                      </span>
                      {!slot.is_booked && (
                        <button
                          type="button"
                          onClick={() => handleRemove(slot.id)}
                          disabled={acting.has(slot.id)}
                          className="p-1 text-text-muted hover:text-red-500 transition-colors disabled:opacity-50"
                          title={t.remove}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
