'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Check, Plus } from 'lucide-react'
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
}

function formatDay(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function groupByDay(slots: Slot[]): Map<string, Slot[]> {
  const groups = new Map<string, Slot[]>()
  for (const slot of slots) {
    const day = new Date(slot.starts_at).toLocaleDateString('en-GB')
    const existing = groups.get(day) ?? []
    existing.push(slot)
    groups.set(day, existing)
  }
  return groups
}

// Mock slots for the greyed-out empty state
function generateMockSlots(): { day: string; times: string[] }[] {
  const now = new Date()
  const days: { day: string; times: string[] }[] = []
  for (let i = 1; i <= 5; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() + i)
    if (d.getDay() === 0) continue // skip Sunday
    days.push({
      day: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
      times: ['10:00 – 10:30', '11:00 – 11:30', '14:00 – 14:30', '15:30 – 16:00'],
    })
  }
  return days.slice(0, 4)
}

export function ViewingCalendar({ listingId, authenticated, isOwner, locale }: Props) {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDE = locale === 'de'

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

  const hasSlots = slots.length > 0
  const grouped = hasSlots ? groupByDay(slots) : null
  const mockDays = !hasSlots && !loading ? generateMockSlots() : []

  if (loading) {
    return (
      <div data-booking-slots className="bg-surface rounded-card p-6 shadow-sm border border-[#E2E4EB]">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={20} className="text-[#D4764E]" />
          <h2 className="text-lg font-bold">{isDE ? 'Besichtigungstermine' : 'Viewing Calendar'}</h2>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-[#F5F5FA] rounded-lg" />
          <div className="h-10 bg-[#F5F5FA] rounded-lg" />
          <div className="h-10 bg-[#F5F5FA] rounded-lg" />
        </div>
      </div>
    )
  }

  // Booked success
  if (booked) {
    return (
      <div data-booking-slots className="bg-surface rounded-card p-6 shadow-sm border border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Check size={20} className="text-green-600" />
          </div>
          <div>
            <p className="font-bold text-green-800">{isDE ? 'Besichtigung gebucht!' : 'Viewing booked!'}</p>
            <p className="text-xs text-green-600 mt-0.5">{isDE ? 'Der Eigentümer wird sich in Kürze melden.' : 'The owner will confirm shortly.'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div data-booking-slots className="bg-surface rounded-card p-6 shadow-sm border border-[#E2E4EB]">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-[#D4764E]" />
          <h2 className="text-lg font-bold">{isDE ? 'Besichtigungstermine' : 'Viewing Calendar'}</h2>
        </div>
        {isOwner && (
          <a
            href={`/owner/viewings`}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#D4764E] hover:text-[#BF6840] transition-colors"
          >
            <Plus size={14} />
            {isDE ? 'Termine hinzufügen' : 'Add slots'}
          </a>
        )}
      </div>

      {/* Real slots */}
      {hasSlots && grouped && (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([day, daySlots]) => (
            <div key={day}>
              <p className="text-xs font-semibold text-[#5E6278] mb-2">{daySlots[0] ? formatDay(daySlots[0].starts_at, locale) : day}</p>
              <div className="flex flex-wrap gap-2">
                {daySlots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => { if (authenticated && !isOwner) setSelectedSlot(slot.id === selectedSlot ? null : slot.id) }}
                    disabled={!authenticated || isOwner}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border transition-all ${
                      slot.id === selectedSlot
                        ? 'bg-[#D4764E] text-white border-[#D4764E]'
                        : authenticated && !isOwner
                          ? 'bg-white text-[#0F1117] border-[#E2E4EB] hover:border-[#D4764E] hover:text-[#D4764E]'
                          : 'bg-white text-[#0F1117] border-[#E2E4EB]'
                    }`}
                  >
                    <Clock size={13} />
                    {formatTime(slot.starts_at)} – {formatTime(slot.ends_at)}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Book button for hunters */}
          {selectedSlot && authenticated && !isOwner && (
            <div className="pt-4 border-t border-[#E2E4EB]">
              <label className="text-xs font-semibold text-[#5E6278] block mb-1">
                {isDE ? 'Notiz hinzufügen (optional)' : 'Add a note (optional)'}
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={isDE ? 'Fragen oder Präferenzen...' : 'Any questions or preferences...'}
                rows={2}
                className="w-full border border-[#E2E4EB] rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4764E]/30 resize-none"
              />
              {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
              <button
                onClick={handleBook}
                disabled={booking}
                className="mt-3 w-full bg-[#D4764E] hover:bg-[#BF6840] text-white font-bold text-sm py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {booking ? (isDE ? 'Buche...' : 'Booking...') : (isDE ? 'Besichtigung buchen' : 'Book This Viewing')}
              </button>
            </div>
          )}

          {!authenticated && !isOwner && (
            <p className="text-xs text-[#999] mt-3 text-center">
              {isDE ? 'Melden Sie sich an, um einen Termin zu buchen' : 'Sign in to book a viewing slot'}
            </p>
          )}
        </div>
      )}

      {/* Empty state with greyed-out mock slots */}
      {!hasSlots && (
        <div className="relative">
          {/* Mock calendar — greyed out */}
          <div className="opacity-40 pointer-events-none select-none space-y-4">
            {mockDays.map(day => (
              <div key={day.day}>
                <p className="text-xs font-semibold text-[#5E6278] mb-2">{day.day}</p>
                <div className="flex flex-wrap gap-2">
                  {day.times.map(time => (
                    <div
                      key={time}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border border-[#E2E4EB] bg-[#F5F5FA] text-[#999]"
                    >
                      <Clock size={13} />
                      {time}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Overlay message */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg border border-[#E2E4EB] text-center max-w-xs">
              {isOwner ? (
                <>
                  <p className="font-bold text-sm text-[#0F1117] mb-1">
                    {isDE ? 'Noch keine Termine angelegt' : 'No viewing slots yet'}
                  </p>
                  <p className="text-xs text-[#5E6278] mb-3">
                    {isDE ? 'Fügen Sie Verfügbarkeiten hinzu, damit Interessenten Besichtigungen buchen können.' : 'Add your availability so interested buyers can book viewings.'}
                  </p>
                  <a
                    href="/owner/viewings"
                    className="inline-flex items-center gap-1.5 bg-[#D4764E] hover:bg-[#BF6840] text-white font-bold text-sm px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus size={14} />
                    {isDE ? 'Termine hinzufügen' : 'Add viewing slots'}
                  </a>
                </>
              ) : (
                <>
                  <p className="font-bold text-sm text-[#0F1117] mb-1">
                    {isDE ? 'Termine in Kürze verfügbar' : 'Viewing slots coming soon'}
                  </p>
                  <p className="text-xs text-[#5E6278]">
                    {isDE ? 'Der Eigentümer hat noch keine Termine eingestellt. Nutzen Sie das Kontaktformular, um eine Besichtigung anzufragen.' : 'The owner hasn\'t added slots yet. Use the contact form below to request a viewing.'}
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
