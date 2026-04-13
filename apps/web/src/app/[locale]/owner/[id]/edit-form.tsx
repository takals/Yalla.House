'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Home, Building2, Building, Store, TreePine } from 'lucide-react'
import { useAuthAction } from '@/lib/use-auth-action'
import { updateListingAction, changeStatusAction, sendBriefAction, type EditPayload } from './actions'
import { PhotoManager, type PhotoRow } from './photos'
import { PortalSection, type PortalRow, type PortalStatusRow } from './portals'

interface Listing {
  id: string
  place_id: string
  status: string
  intent: string
  property_type: string
  address_line1: string
  address_line2: string | null
  city: string
  region: string | null
  postcode: string
  size_sqm: number | null
  bedrooms: number | null
  bathrooms: number | null
  floor: number | null
  total_floors: number | null
  construction_year: number | null
  sale_price: number | null
  rent_price: number | null
  price_qualifier: string | null
  nebenkosten: number | null
  kaution: number | null
  title_de: string | null
  description_de: string | null
  country_fields: unknown
  created_at: string
  brief_sent_at: string | null
  brief_agent_count: number | null
}

type FormErrors = Partial<Record<keyof EditPayload, string>>

const PROPERTY_TYPES = [
  { value: 'house',      label: 'Haus',       icon: 'home' },
  { value: 'flat',       label: 'Wohnung',    icon: 'building2' },
  { value: 'apartment',  label: 'Apartment',  icon: 'building' },
  { value: 'villa',      label: 'Villa',      icon: 'home' },
  { value: 'commercial', label: 'Gewerbe',    icon: 'store' },
  { value: 'land',       label: 'Grundstück', icon: 'treepine' },
  { value: 'other',      label: 'Sonstiges',  icon: null },
]

const ENERGY_CLASSES = ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const STATUS_STYLES: Record<string, string> = {
  draft:       'bg-gray-100 text-gray-600',
  active:      'bg-green-100 text-green-700',
  paused:      'bg-yellow-100 text-yellow-700',
  under_offer: 'bg-blue-100 text-blue-700',
  sold:        'bg-purple-100 text-purple-700',
  let:         'bg-purple-100 text-purple-700',
  archived:    'bg-gray-100 text-gray-400',
}

const STATUS_LABELS: Record<string, string> = {
  draft:       'Entwurf',
  active:      'Aktiv',
  paused:      'Pausiert',
  under_offer: 'Angebot liegt vor',
  sold:        'Verkauft',
  let:         'Vermietet',
  archived:    'Archiviert',
}

// ── Shared field primitives ──────────────────────────────────────────────────

function Field({
  label, id, required, error, children,
}: {
  label: string; id: string; required?: boolean | undefined; error?: string | undefined; children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#0F1117] mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function Input({
  label, id, required, error, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string; id: string; required?: boolean | undefined; error?: string | undefined
}) {
  return (
    <Field label={label} id={id} required={required} error={error}>
      <input
        id={id}
        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-[#0F1117] bg-white ${error ? 'border-red-400' : 'border-[#E4E6EF]'}`}
        {...props}
      />
    </Field>
  )
}

function Select({
  label, id, required, error, children, ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string; id: string; required?: boolean | undefined; error?: string | undefined; children: React.ReactNode
}) {
  return (
    <Field label={label} id={id} required={required} error={error}>
      <select
        id={id}
        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-[#0F1117] bg-white ${error ? 'border-red-400' : 'border-[#E4E6EF]'}`}
        {...props}
      >
        {children}
      </select>
    </Field>
  )
}

// ── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-card shadow-sm p-6 space-y-5">
      <h2 className="text-base font-bold text-[#0F1117] border-b border-[#E4E6EF] pb-3">{title}</h2>
      {children}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function centsToStr(val: number | null): string {
  return val ? (val / 100).toString() : ''
}

function initForm(listing: Listing): EditPayload {
  const cf = (listing.country_fields ?? {}) as Record<string, unknown>
  return {
    property_type:    listing.property_type  ?? '',
    intent:           listing.intent         ?? '',
    address_line1:    listing.address_line1  ?? '',
    address_line2:    listing.address_line2  ?? '',
    postcode:         listing.postcode       ?? '',
    city:             listing.city           ?? '',
    region:           listing.region         ?? '',
    size_sqm:         listing.size_sqm?.toString()          ?? '',
    rooms:            cf['rooms']?.toString()                ?? '',
    bedrooms:         listing.bedrooms?.toString()          ?? '',
    bathrooms:        listing.bathrooms?.toString()         ?? '',
    floor:            listing.floor?.toString()             ?? '',
    total_floors:     listing.total_floors?.toString()      ?? '',
    construction_year: listing.construction_year?.toString() ?? '',
    energy_class:     (cf['energy_class'] as string)        ?? '',
    title_de:         listing.title_de        ?? '',
    description_de:   listing.description_de  ?? '',
    sale_price:       centsToStr(listing.sale_price),
    price_qualifier:  listing.price_qualifier ?? '',
    rent_price:       centsToStr(listing.rent_price),
    nebenkosten:      centsToStr(listing.nebenkosten),
    kaution:          centsToStr(listing.kaution),
  }
}

// ── Main component ───────────────────────────────────────────────────────────

export function ListingEditForm({
  listing,
  photos,
  portals,
  portalStatuses,
}: {
  listing: Listing
  photos: PhotoRow[]
  portals: PortalRow[]
  portalStatuses: PortalStatusRow[]
}) {
  const [form, setForm] = useState<EditPayload>(() => initForm(listing))
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState('')
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState(listing.status)
  const [statusError, setStatusError] = useState('')
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [isSendingBrief, setIsSendingBrief] = useState(false)
  const [briefResult, setBriefResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const { handleAuthRequired } = useAuthAction()

  function set(key: keyof EditPayload, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
    setSaved(false)
  }

  function validate(): boolean {
    const errs: FormErrors = {}

    if (!form.property_type) errs.property_type = 'Bitte Typ wählen'
    if (!form.intent) errs.intent = 'Bitte Art wählen'
    if (!form.address_line1.trim()) errs.address_line1 = 'Adresse erforderlich'
    if (!/^\d{5}$/.test(form.postcode.trim())) errs.postcode = 'Bitte gültige Postleitzahl eingeben (5 Ziffern)'
    if (!form.city.trim()) errs.city = 'Stadt erforderlich'

    const year = parseInt(form.construction_year, 10)
    const currentYear = new Date().getFullYear()
    if (form.construction_year && (isNaN(year) || year < 1800 || year > currentYear)) {
      errs.construction_year = `Baujahr muss zwischen 1800 und ${currentYear} liegen`
    }

    if (!form.title_de.trim()) errs.title_de = 'Titel erforderlich'
    if ((form.intent === 'sale' || form.intent === 'both') && !form.sale_price.trim()) {
      errs.sale_price = 'Kaufpreis erforderlich'
    }
    if ((form.intent === 'rent' || form.intent === 'both') && !form.rent_price.trim()) {
      errs.rent_price = 'Kaltmiete erforderlich'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSave() {
    if (!validate()) return
    setServerError('')
    setSaved(false)
    startTransition(async () => {
      const result = await updateListingAction(listing.id, form)
      if (handleAuthRequired(result)) return
      if ('error' in result) {
        setServerError(result.error)
      } else {
        setSaved(true)
      }
    })
  }

  async function handleStatusChange(newStatus: string) {
    setIsChangingStatus(true)
    setStatusError('')
    const result = await changeStatusAction(listing.id, newStatus)
    if (handleAuthRequired(result)) {
      setIsChangingStatus(false)
      return
    }
    setIsChangingStatus(false)
    if ('error' in result) {
      setStatusError(result.error)
    } else {
      setCurrentStatus(newStatus)
    }
  }

  async function handleSendBrief() {
    setIsSendingBrief(true)
    setBriefResult(null)
    const result = await sendBriefAction(listing.id)
    if (handleAuthRequired(result)) {
      setIsSendingBrief(false)
      return
    }
    setIsSendingBrief(false)
    if ('error' in result) {
      setBriefResult({ type: 'error', message: result.error })
    } else if ('success' in result) {
      setBriefResult({ type: 'success', message: `Brief an ${result.agentCount} Makler gesendet!` })
    }
  }

  const isFlat = form.property_type === 'flat' || form.property_type === 'apartment'
  const showSale = form.intent === 'sale' || form.intent === 'both'
  const showRent = form.intent === 'rent' || form.intent === 'both'

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/owner"
          className="inline-flex items-center gap-1.5 text-sm text-[#5E6278] hover:text-[#0F1117] transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Meine Inserate
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F1117]">Inserat bearbeiten</h1>
            <p className="text-sm text-[#5E6278] mt-1">{listing.place_id}</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap mt-1 ${STATUS_STYLES[currentStatus] ?? STATUS_STYLES['draft']}`}>
            {STATUS_LABELS[currentStatus] ?? currentStatus}
          </span>
        </div>
      </div>

      {/* Status section */}
      <div className="bg-surface rounded-card shadow-sm p-6">
        <h2 className="text-base font-bold text-[#0F1117] border-b border-[#E4E6EF] pb-3 mb-4">Status</h2>

        <div className="flex flex-wrap gap-2">
          {currentStatus === 'draft' && (
            <button
              type="button"
              onClick={() => handleStatusChange('active')}
              disabled={isChangingStatus}
              className="px-4 py-2 text-sm font-bold bg-brand hover:bg-brand-hover text-[#0F1117] rounded-lg transition-colors disabled:opacity-50"
            >
              Veröffentlichen
            </button>
          )}

          {currentStatus === 'active' && (
            <>
              <button
                type="button"
                onClick={() => handleStatusChange('paused')}
                disabled={isChangingStatus}
                className="px-4 py-2 text-sm font-semibold bg-[#F5F5FA] hover:bg-[#E4E6EF] text-[#5E6278] rounded-lg transition-colors disabled:opacity-50"
              >
                Pausieren
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('sold')}
                disabled={isChangingStatus}
                className="px-4 py-2 text-sm font-semibold bg-[#F5F5FA] hover:bg-[#E4E6EF] text-[#5E6278] rounded-lg transition-colors disabled:opacity-50"
              >
                Als verkauft markieren
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('let')}
                disabled={isChangingStatus}
                className="px-4 py-2 text-sm font-semibold bg-[#F5F5FA] hover:bg-[#E4E6EF] text-[#5E6278] rounded-lg transition-colors disabled:opacity-50"
              >
                Als vermietet markieren
              </button>
            </>
          )}

          {(currentStatus === 'paused' || currentStatus === 'under_offer') && (
            <button
              type="button"
              onClick={() => handleStatusChange('active')}
              disabled={isChangingStatus}
              className="px-4 py-2 text-sm font-bold bg-brand hover:bg-brand-hover text-[#0F1117] rounded-lg transition-colors disabled:opacity-50"
            >
              Reaktivieren
            </button>
          )}

          {currentStatus === 'under_offer' && (
            <>
              <button
                type="button"
                onClick={() => handleStatusChange('sold')}
                disabled={isChangingStatus}
                className="px-4 py-2 text-sm font-semibold bg-[#F5F5FA] hover:bg-[#E4E6EF] text-[#5E6278] rounded-lg transition-colors disabled:opacity-50"
              >
                Als verkauft markieren
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('let')}
                disabled={isChangingStatus}
                className="px-4 py-2 text-sm font-semibold bg-[#F5F5FA] hover:bg-[#E4E6EF] text-[#5E6278] rounded-lg transition-colors disabled:opacity-50"
              >
                Als vermietet markieren
              </button>
            </>
          )}

          {['sold', 'let', 'archived'].includes(currentStatus) && (
            <p className="text-sm text-[#5E6278]">
              {currentStatus === 'sold' && 'Dieses Inserat wurde als verkauft markiert.'}
              {currentStatus === 'let' && 'Dieses Inserat wurde als vermietet markiert.'}
              {currentStatus === 'archived' && 'Dieses Inserat ist archiviert.'}
            </p>
          )}

          {isChangingStatus && (
            <span className="flex items-center gap-1.5 text-sm text-[#5E6278]">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Wird aktualisiert …
            </span>
          )}
        </div>

        {statusError && (
          <p className="mt-3 text-xs text-red-600">{statusError}</p>
        )}
      </div>

      {/* Section 1: Typ & Angebot */}
      <Section title="Immobilientyp & Angebot">
        <div>
          <p className="text-sm font-medium text-[#0F1117] mb-3">Immobilientyp</p>
          {errors.property_type && (
            <p className="mb-2 text-xs text-red-500">{errors.property_type}</p>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {PROPERTY_TYPES.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => set('property_type', value)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors text-center ${
                  form.property_type === value
                    ? 'border-brand bg-brand-solid-bg'
                    : 'border-[#E4E6EF] hover:border-brand/50'
                }`}
              >
                {icon === 'home' && <Home size={24} className="text-[#0F1117]" />}
                {icon === 'building2' && <Building2 size={24} className="text-[#0F1117]" />}
                {icon === 'building' && <Building size={24} className="text-[#0F1117]" />}
                {icon === 'store' && <Store size={24} className="text-[#0F1117]" />}
                {icon === 'treepine' && <TreePine size={24} className="text-[#0F1117]" />}
                {icon === null && <span className="text-xs font-bold text-[#0F1117]">···</span>}
                <span className="text-xs font-semibold text-[#0F1117] leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-[#0F1117] mb-3">Angebotsart</p>
          {errors.intent && <p className="mb-2 text-xs text-red-500">{errors.intent}</p>}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'sale', label: 'Zum Verkauf' },
              { value: 'rent', label: 'Zur Miete' },
              { value: 'both', label: 'Verkauf & Miete' },
            ].map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => set('intent', value)}
                className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-colors ${
                  form.intent === value
                    ? 'border-brand bg-brand-solid-bg text-[#0F1117]'
                    : 'border-[#E4E6EF] text-[#5E6278] hover:border-brand/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Section 2: Adresse */}
      <Section title="Adresse">
        <Input
          label="Straße und Hausnummer"
          id="address_line1"
          required
          placeholder="Musterstraße 42"
          value={form.address_line1}
          onChange={e => set('address_line1', e.target.value)}
          error={errors.address_line1}
        />
        <Input
          label="Adresszusatz"
          id="address_line2"
          placeholder="Hinterhaus, EG links"
          value={form.address_line2}
          onChange={e => set('address_line2', e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Postleitzahl"
            id="postcode"
            required
            placeholder="10115"
            maxLength={5}
            value={form.postcode}
            onChange={e => set('postcode', e.target.value)}
            error={errors.postcode}
          />
          <Input
            label="Stadt"
            id="city"
            required
            placeholder="Berlin"
            value={form.city}
            onChange={e => set('city', e.target.value)}
            error={errors.city}
          />
        </div>
        <Input
          label="Bundesland"
          id="region"
          placeholder="Berlin"
          value={form.region}
          onChange={e => set('region', e.target.value)}
        />
      </Section>

      {/* Section 3: Objektdetails */}
      <Section title="Objektdetails">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Wohnfläche (m²)"
            id="size_sqm"
            type="number"
            min="1"
            placeholder="85"
            value={form.size_sqm}
            onChange={e => set('size_sqm', e.target.value)}
          />
          <Input
            label="Zimmer"
            id="rooms"
            type="number"
            min="0.5"
            step="0.5"
            placeholder="3"
            value={form.rooms}
            onChange={e => set('rooms', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Schlafzimmer"
            id="bedrooms"
            type="number"
            min="0"
            placeholder="2"
            value={form.bedrooms}
            onChange={e => set('bedrooms', e.target.value)}
          />
          <Input
            label="Badezimmer"
            id="bathrooms"
            type="number"
            min="0"
            placeholder="1"
            value={form.bathrooms}
            onChange={e => set('bathrooms', e.target.value)}
          />
        </div>
        {isFlat && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Etage"
              id="floor"
              type="number"
              min="0"
              placeholder="3"
              value={form.floor}
              onChange={e => set('floor', e.target.value)}
            />
            <Input
              label="Gesamte Etagen"
              id="total_floors"
              type="number"
              min="1"
              placeholder="5"
              value={form.total_floors}
              onChange={e => set('total_floors', e.target.value)}
            />
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Baujahr"
            id="construction_year"
            type="number"
            min="1800"
            max={new Date().getFullYear()}
            placeholder="1995"
            value={form.construction_year}
            onChange={e => set('construction_year', e.target.value)}
            error={errors.construction_year}
          />
          <Select
            label="Energieklasse"
            id="energy_class"
            value={form.energy_class}
            onChange={e => set('energy_class', e.target.value)}
          >
            <option value="">Keine Angabe</option>
            {ENERGY_CLASSES.map(cls => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </Select>
        </div>
      </Section>

      {/* Section 4: Preis & Beschreibung */}
      <Section title="Preis & Beschreibung">
        <Input
          label="Inserat-Titel"
          id="title_de"
          required
          placeholder="Gepflegte 3-Zimmer-Wohnung mit Balkon in Mitte"
          value={form.title_de}
          onChange={e => set('title_de', e.target.value)}
          error={errors.title_de}
        />
        <Field label="Beschreibung" id="description_de">
          <textarea
            id="description_de"
            rows={4}
            placeholder="Beschreiben Sie Ihre Immobilie…"
            value={form.description_de}
            onChange={e => set('description_de', e.target.value)}
            className="w-full px-4 py-2.5 border border-[#E4E6EF] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-[#0F1117] bg-white resize-none"
          />
        </Field>

        {showSale && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Kaufpreis (€)"
              id="sale_price"
              type="number"
              min="0"
              placeholder="350000"
              required
              value={form.sale_price}
              onChange={e => set('sale_price', e.target.value)}
              error={errors.sale_price}
            />
            <Select
              label="Preishinweis"
              id="price_qualifier"
              value={form.price_qualifier}
              onChange={e => set('price_qualifier', e.target.value)}
            >
              <option value="">Kein Hinweis</option>
              <option value="fixed_price">Festpreis</option>
              <option value="vb">Verhandelbar (VB)</option>
            </Select>
          </div>
        )}

        {showRent && (
          <div className="space-y-4">
            <Input
              label="Kaltmiete pro Monat (€)"
              id="rent_price"
              type="number"
              min="0"
              placeholder="1200"
              required
              value={form.rent_price}
              onChange={e => set('rent_price', e.target.value)}
              error={errors.rent_price}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nebenkosten (€/Monat)"
                id="nebenkosten"
                type="number"
                min="0"
                placeholder="200"
                value={form.nebenkosten}
                onChange={e => set('nebenkosten', e.target.value)}
              />
              <Input
                label="Kaution (€)"
                id="kaution"
                type="number"
                min="0"
                placeholder="2400"
                value={form.kaution}
                onChange={e => set('kaution', e.target.value)}
              />
            </div>
          </div>
        )}
      </Section>

      {/* Section 5: Photos */}
      <Section title="Fotos">
        <PhotoManager listingId={listing.id} photos={photos} />
      </Section>

      {/* Section 6: Portale */}
      <Section title="Portale">
        <PortalSection
          listingId={listing.id}
          portals={portals}
          initialStatuses={portalStatuses}
        />
      </Section>

      {/* Section 7: Send Brief to Agents */}
      {(currentStatus === 'active' || currentStatus === 'draft') && (
        <Section title="Brief an Makler senden">
          <p className="text-sm text-[#5E6278] leading-relaxed">
            Senden Sie Ihren Eigentümer-Brief an lokale Makler in Ihrer Gegend.
            Die Makler erhalten eine Zusammenfassung Ihrer Immobilie und können
            mit einem Vorschlag antworten. Ihre Kontaktdaten bleiben geschützt.
          </p>
          {listing.brief_sent_at && (
            <div className="flex items-center gap-2 text-xs text-[#5E6278] bg-[#F5F5FA] rounded-lg px-3 py-2">
              <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Zuletzt gesendet am{' '}
              {new Date(listing.brief_sent_at).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
              {listing.brief_agent_count ? ` an ${listing.brief_agent_count} Makler` : ''}
            </div>
          )}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSendBrief}
              disabled={isSendingBrief}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-[#0F1117] font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {isSendingBrief ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Wird gesendet …
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                  Brief senden
                </>
              )}
            </button>
            {briefResult && (
              <p className={`text-sm font-medium ${briefResult.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {briefResult.message}
              </p>
            )}
          </div>
        </Section>
      )}

      {/* Save bar */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <div>
          {serverError && (
            <p className="text-sm text-red-600">{serverError}</p>
          )}
          {saved && !isPending && (
            <p className="text-sm text-green-600 font-medium flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Gespeichert
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-[#0F1117] font-bold rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {isPending ? 'Wird gespeichert …' : 'Änderungen speichern'}
        </button>
      </div>
    </div>
  )
}
