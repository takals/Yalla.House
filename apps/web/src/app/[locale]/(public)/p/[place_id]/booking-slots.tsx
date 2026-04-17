'use client'

import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { Calendar, Clock, Check } from 'lucide-react'
import { fetchAvailableSlotsAction, bookSlotAction } from './actions'

interface Slot {
  id: string
  starts_at: string
  ends_at: string
}

interface Props {
  listingId: string
  authenticated: boolean
}

function formatDay(iso: string, dateLocale: string): string {
  return new Date(iso).toLocaleDateString(dateLocale, { weekday: 'short', day: 'numeric', month: 'short' })
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

export function BookingSlots({ listingId, authenticated }: Props) {
  const locale = useLocale()
  const dateLocale = locale === 'de' ? 'de-DE' : 'en-GB'
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAvailableSlotsAction(listingId).then(result => {
      setSlots(result.slots)
      setLoading(false)
    })
  }, [listingId])

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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-border-default">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={18} className="text-brand" />
          <h3 className="font-bold text-sm">Available Viewing Slots</h3>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-10 bg-hover-bg rounded-lg" />
          <div className="h-10 bg-hover-bg rounded-lg" />
        </div>
      </div>
    )
  }

  if (slots.length === 0 && !booked) {
    return null // Don't show the section if there are no available slots
  }

  if (booked) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Check size={20} className="text-green-600" />
          </div>
          <div>
            <p className="font-bold text-sm text-green-800">Viewing booked!</p>
            <p className="text-xs text-green-600 mt-0.5">The owner will confirm your viewing shortly.</p>
          </div>
        </div>
      </div>
    )
  }

  const grouped = groupByDay(slots, dateLocale)

  return (
    <div data-booking-slots className="bg-white rounded-2xl p-6 shadow-sm border border-border-default">
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={18} className="text-brand" />
        <h3 className="font-bold text-sm">Book a Viewing</h3>
      </div>

      <div className="space-y-4">
        {Array.from(grouped.entries()).map(([day, daySlots]) => (
          <div key={day}>
            <p className="text-xs font-semibold text-text-secondary mb-2">{daySlots[0] ? formatDay(daySlots[0]?.starts_at, dateLocale) : day}</p>
            <div className="flex flex-wrap gap-2">
              {daySlots.map(slot => (
                <button
                  key={slot.id}
                  onClick={() => { if (authenticated) setSelectedSlot(slot.id === selectedSlot ? null : slot.id) }}
                  disabled={!authenticated}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                    slot.id === selectedSlot
                      ? 'bg-brand text-white border-brand'
                      : authenticated
                        ? 'bg-white text-text-primary border-border-default hover:border-brand hover:text-brand'
                        : 'bg-hover-bg text-text-muted border-border-default cursor-not-allowed'
                  }`}
                >
                  <Clock size={13} />
                  {formatTime(slot.starts_at, dateLocale)} – {formatTime(slot.ends_at, dateLocale)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!authenticated && (
        <p className="text-xs text-text-muted mt-4 text-center">
          Sign in to book a viewing slot
        </p>
      )}

      {selectedSlot && authenticated && (
        <div className="mt-4 pt-4 border-t border-border-default">
          <label className="text-xs font-semibold text-text-secondary block mb-1">
            Add a note (optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any questions or preferences..."
            rows={2}
            className="w-full border border-border-default rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4764E]/30 resize-none"
          />
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          <button
            onClick={handleBook}
            disabled={booking}
            className="mt-3 w-full bg-brand hover:bg-brand-hover text-white font-bold text-sm py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {booking ? 'Booking...' : 'Book This Slot'}
          </button>
        </div>
      )}
    </div>
  )
}
