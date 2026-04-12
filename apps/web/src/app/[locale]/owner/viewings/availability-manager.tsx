'use client'

import { useState } from 'react'
import { addOwnerSlotAction, removeOwnerSlotAction } from './actions'
import { Calendar, Clock, Trash2, Plus, X } from 'lucide-react'

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

function formatSlotTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

function formatSlotDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' })
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
  const [slots, setSlots] = useState<SlotRow[]>(initialSlots)
  const [showForm, setShowForm] = useState(false)
  const [acting, setActing] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [selectedListing, setSelectedListing] = useState(listings[0]?.id ?? '')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('10:30')

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

    if ('error' in result) {
      setError(result.error)
    } else {
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

    if ('success' in result) {
      setSlots(prev => prev.filter(s => s.id !== slotId))
    } else {
      setError(result.error)
    }
  }

  // Group slots by date
  const grouped = new Map<string, SlotRow[]>()
  for (const slot of slots.sort((a, b) => a.starts_at.localeCompare(b.starts_at))) {
    const day = formatSlotDate(slot.starts_at)
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
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 bg-brand hover:bg-brand-hover text-[#0F1117] rounded-lg transition-colors"
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
          <p className="text-xs text-[#5E6278]">{t.available}</p>
        </div>
        <div className="bg-surface rounded-lg px-3 py-2 text-center flex-1">
          <p className="text-lg font-bold text-brand">{bookedSlots.length}</p>
          <p className="text-xs text-[#5E6278]">{t.booked}</p>
        </div>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-surface rounded-card p-5 shadow-sm mb-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {listings.length > 1 && (
              <div className="col-span-2 sm:col-span-4">
                <label className="text-xs font-semibold text-[#5E6278] mb-1 block">{t.selectListing}</label>
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
              <label className="text-xs font-semibold text-[#5E6278] mb-1 block">{t.date}</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full text-sm border border-[#D8DBE5] rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#5E6278] mb-1 block">{t.startTime}</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full text-sm border border-[#D8DBE5] rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#5E6278] mb-1 block">{t.endTime}</label>
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
                className="w-full text-sm font-bold px-4 py-2 bg-brand hover:bg-brand-hover text-[#0F1117] rounded-lg transition-colors disabled:opacity-50"
              >
                {acting.has('add') ? '...' : t.save}
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
      )}

      {/* Slot list grouped by day */}
      {slots.length === 0 ? (
        <div className="bg-surface rounded-card p-8 text-center shadow-sm">
          <p className="text-sm text-[#5E6278]">{t.noSlots}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {Array.from(grouped.entries()).map(([day, daySlots]) => (
            <div key={day}>
              <p className="text-xs font-semibold text-[#5E6278] mb-2">{day}</p>
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
                          {formatSlotTime(slot.starts_at)} – {formatSlotTime(slot.ends_at)}
                        </span>
                        {listings.length > 1 && (
                          <span className="text-xs text-[#5E6278] ml-2">
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
                          className="p-1 text-[#999] hover:text-red-500 transition-colors disabled:opacity-50"
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
