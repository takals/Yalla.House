'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { Calendar, Clock, MapPin, User, Plus, X, Check, XCircle, Trash2 } from 'lucide-react'
import { useAuthAction } from '@/lib/use-auth-action'
import { addAvailabilitySlotAction, removeAvailabilitySlotAction, confirmViewingAction, declineViewingAction } from './actions'

interface Slot {
  id: string
  listing_id: string
  starts_at: string
  ends_at: string
  is_booked: boolean
  viewing_id: string | null
}

interface Viewing {
  id: string
  listing_id: string
  slot_id: string | null
  scheduled_at: string
  status: string
  type: string
  hunter: { full_name: string | null; email: string; phone: string | null } | null
}

interface Translations {
  addSlots: string
  upcoming: string
  noSlots: string
  noViewings: string
  booked: string
  available: string
  pending: string
  confirmed: string
  addAvailability: string
  selectListing: string
  date: string
  startTime: string
  endTime: string
  save: string
  cancel: string
  viewings: string
  slots: string
  inPerson: string
  virtual: string
  confirm: string
  decline: string
  remove: string
}

interface Props {
  initialSlots: Slot[]
  initialViewings: Viewing[]
  listingMap: Record<string, { title_de: string | null; place_id: string; city: string }>
  listingIds: string[]
  translations: Translations
}

function formatDate(iso: string, dateLocale: string): string {
  return new Date(iso).toLocaleDateString(dateLocale, { weekday: 'short', day: 'numeric', month: 'short' })
}

function formatTime(iso: string, dateLocale: string): string {
  return new Date(iso).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })
}

function formatDateInput(iso: string): string {
  return new Date(iso).toISOString().split('T')[0] ?? ''
}

type Tab = 'viewings' | 'slots'

export function CalendarManager({ initialSlots, initialViewings, listingMap, listingIds, translations: t }: Props) {
  const { handleAuthRequired } = useAuthAction()
  const locale = useLocale()
  const dateLocale = locale === 'de' ? 'de-DE' : 'en-GB'
  const [tab, setTab] = useState<Tab>('viewings')
  const [slots, setSlots] = useState(initialSlots)
  const [viewings, setViewings] = useState(initialViewings)
  const [showAddForm, setShowAddForm] = useState(false)
  const [acting, setActing] = useState<Set<string>>(new Set())

  // Add form state
  const [formListing, setFormListing] = useState(listingIds[0] ?? '')
  const [formDate, setFormDate] = useState(formatDateInput(new Date().toISOString()))
  const [formStart, setFormStart] = useState('10:00')
  const [formEnd, setFormEnd] = useState('10:30')
  const [formError, setFormError] = useState<string | null>(null)

  const pendingViewings = viewings.filter(v => v.status === 'pending')
  const confirmedViewings = viewings.filter(v => v.status === 'confirmed')
  const availableSlots = slots.filter(s => !s.is_booked)
  const bookedSlots = slots.filter(s => s.is_booked)

  async function handleAddSlot() {
    setFormError(null)
    if (!formListing) { setFormError(t.selectListing); return }

    const startsAt = new Date(`${formDate}T${formStart}:00`).toISOString()
    const endsAt = new Date(`${formDate}T${formEnd}:00`).toISOString()

    setActing(s => new Set(s).add('add'))
    const result = await addAvailabilitySlotAction(formListing, startsAt, endsAt)
    setActing(s => { const n = new Set(s); n.delete('add'); return n })

    if (handleAuthRequired(result)) {
      return
    }

    if ('error' in result) {
      setFormError(result.error)
      return
    }

    if ('success' in result) {
      setSlots(prev => [...prev, {
        id: result.slotId,
        listing_id: formListing,
        starts_at: startsAt,
        ends_at: endsAt,
        is_booked: false,
        viewing_id: null,
      }])
      setShowAddForm(false)
    }
  }

  async function handleRemoveSlot(slotId: string) {
    setActing(s => new Set(s).add(slotId))
    const result = await removeAvailabilitySlotAction(slotId)
    setActing(s => { const n = new Set(s); n.delete(slotId); return n })

    if (handleAuthRequired(result)) {
      return
    }

    if ('success' in result) {
      setSlots(prev => prev.filter(s => s.id !== slotId))
    }
  }

  async function handleConfirm(viewingId: string) {
    setActing(s => new Set(s).add(viewingId))
    const result = await confirmViewingAction(viewingId)
    setActing(s => { const n = new Set(s); n.delete(viewingId); return n })

    if (handleAuthRequired(result)) {
      return
    }

    if ('success' in result) {
      setViewings(prev => prev.map(v => v.id === viewingId ? { ...v, status: 'confirmed' } : v))
    }
  }

  async function handleDecline(viewingId: string) {
    setActing(s => new Set(s).add(viewingId))
    const result = await declineViewingAction(viewingId)
    setActing(s => { const n = new Set(s); n.delete(viewingId); return n })

    if (handleAuthRequired(result)) {
      return
    }

    if ('success' in result) {
      setViewings(prev => prev.filter(v => v.id !== viewingId))
    }
  }

  function getListingLabel(listingId: string): string {
    const listing = listingMap[listingId]
    if (!listing) return listingId.slice(0, 8)
    return listing.title_de ?? listing.place_id
  }

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-surface rounded-card p-4">
          <p className="text-2xl font-bold text-brand">{pendingViewings.length}</p>
          <p className="text-xs text-text-secondary mt-0.5">{t.pending}</p>
        </div>
        <div className="bg-surface rounded-card p-4">
          <p className="text-2xl font-bold text-green-600">{confirmedViewings.length}</p>
          <p className="text-xs text-text-secondary mt-0.5">{t.confirmed}</p>
        </div>
        <div className="bg-surface rounded-card p-4">
          <p className="text-2xl font-bold">{availableSlots.length}</p>
          <p className="text-xs text-text-secondary mt-0.5">{t.available}</p>
        </div>
        <div className="bg-surface rounded-card p-4">
          <p className="text-2xl font-bold">{bookedSlots.length}</p>
          <p className="text-xs text-text-secondary mt-0.5">{t.booked}</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-[#F5F5FA] rounded-lg p-1">
          <button
            onClick={() => setTab('viewings')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              tab === 'viewings' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t.viewings} ({viewings.length})
          </button>
          <button
            onClick={() => setTab('slots')}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              tab === 'slots' ? 'bg-surface shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {t.slots} ({slots.length})
          </button>
        </div>

        {tab === 'slots' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-text-primary font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} /> {t.addAvailability}
          </button>
        )}
      </div>

      {/* Add slot form */}
      {showAddForm && (
        <div className="bg-surface rounded-card p-5 mb-4 border-2 border-brand">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">{t.addAvailability}</h3>
            <button onClick={() => setShowAddForm(false)} className="text-[#999] hover:text-[#333]">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">{t.selectListing}</label>
              <select
                value={formListing}
                onChange={e => setFormListing(e.target.value)}
                className="w-full border border-border-default rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                {listingIds.map(id => (
                  <option key={id} value={id}>{getListingLabel(id)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">{t.date}</label>
              <input
                type="date"
                value={formDate}
                onChange={e => setFormDate(e.target.value)}
                className="w-full border border-border-default rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">{t.startTime}</label>
              <input
                type="time"
                value={formStart}
                onChange={e => setFormStart(e.target.value)}
                className="w-full border border-border-default rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary block mb-1">{t.endTime}</label>
              <input
                type="time"
                value={formEnd}
                onChange={e => setFormEnd(e.target.value)}
                className="w-full border border-border-default rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>
          </div>

          {formError && <p className="text-xs text-red-600 mb-3">{formError}</p>}

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowAddForm(false)}
              className="text-sm font-semibold px-4 py-2 bg-[#F5F5FA] hover:bg-[#E4E6EF] text-text-secondary rounded-lg transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleAddSlot}
              disabled={acting.has('add')}
              className="text-sm font-bold px-4 py-2 bg-brand hover:bg-brand-hover text-text-primary rounded-lg transition-colors disabled:opacity-50"
            >
              {acting.has('add') ? '...' : t.save}
            </button>
          </div>
        </div>
      )}

      {/* Viewings tab */}
      {tab === 'viewings' && (
        <div className="space-y-3">
          {viewings.length === 0 ? (
            <div className="bg-surface rounded-card p-10 text-center">
              <Calendar size={32} className="mx-auto text-[#D1D5DB] mb-3" />
              <p className="text-sm text-text-secondary">{t.noViewings}</p>
            </div>
          ) : (
            viewings.map(viewing => {
              const isPending = viewing.status === 'pending'
              const isActing = acting.has(viewing.id)
              return (
                <div key={viewing.id} className="bg-surface rounded-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {/* Listing */}
                      <p className="text-sm font-semibold text-text-primary">
                        {getListingLabel(viewing.listing_id)}
                      </p>
                      {listingMap[viewing.listing_id]?.city && (
                        <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                          <MapPin size={11} /> {listingMap[viewing.listing_id]?.city}
                        </p>
                      )}

                      {/* Hunter */}
                      <div className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
                        <User size={13} />
                        <span className="font-medium text-text-primary">
                          {viewing.hunter?.full_name ?? viewing.hunter?.email ?? 'Unknown'}
                        </span>
                        {viewing.hunter?.email && (
                          <span className="text-xs">{viewing.hunter.email}</span>
                        )}
                      </div>

                      {/* Time */}
                      <div className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
                        <Clock size={13} />
                        <span>{formatDate(viewing.scheduled_at, dateLocale)} · {formatTime(viewing.scheduled_at, dateLocale)}</span>
                        <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full border ${
                          viewing.type === 'virtual'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {viewing.type === 'virtual' ? t.virtual : t.inPerson}
                        </span>
                      </div>
                    </div>

                    {/* Status + actions */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        viewing.status === 'confirmed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {viewing.status === 'confirmed' ? t.confirmed : t.pending}
                      </span>

                      {isPending && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDecline(viewing.id)}
                            disabled={isActing}
                            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-[#F5F5FA] hover:bg-red-50 text-text-secondary hover:text-red-600 rounded-lg transition-colors disabled:opacity-50"
                          >
                            <XCircle size={12} /> {t.decline}
                          </button>
                          <button
                            onClick={() => handleConfirm(viewing.id)}
                            disabled={isActing}
                            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-brand hover:bg-brand-hover text-text-primary rounded-lg transition-colors disabled:opacity-50"
                          >
                            <Check size={12} /> {t.confirm}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Slots tab */}
      {tab === 'slots' && (
        <div className="space-y-3">
          {slots.length === 0 ? (
            <div className="bg-surface rounded-card p-10 text-center">
              <Calendar size={32} className="mx-auto text-[#D1D5DB] mb-3" />
              <p className="text-sm text-text-secondary">{t.noSlots}</p>
            </div>
          ) : (
            slots.map(slot => (
              <div key={slot.id} className={`bg-surface rounded-card p-4 flex items-center gap-4 ${
                slot.is_booked ? 'border-l-4 border-green-500' : 'border-l-4 border-border-default'
              }`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">
                    {getListingLabel(slot.listing_id)}
                  </p>
                  <p className="text-sm text-text-secondary mt-0.5 flex items-center gap-1">
                    <Clock size={12} />
                    {formatDate(slot.starts_at, dateLocale)} · {formatTime(slot.starts_at, dateLocale)} – {formatTime(slot.ends_at, dateLocale)}
                  </p>
                </div>

                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  slot.is_booked ? 'bg-green-100 text-green-700' : 'bg-[#F5F5FA] text-text-secondary'
                }`}>
                  {slot.is_booked ? t.booked : t.available}
                </span>

                {!slot.is_booked && (
                  <button
                    onClick={() => handleRemoveSlot(slot.id)}
                    disabled={acting.has(slot.id)}
                    className="text-[#999] hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
