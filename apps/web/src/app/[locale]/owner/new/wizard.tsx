'use client'

import { useState, useTransition } from 'react'
import { createListingAction, type WizardPayload } from './actions'

interface WizardFormData {
  property_type: string
  intent: string
  address_line1: string
  address_line2: string
  postcode: string
  city: string
  region: string
  size_sqm: string
  rooms: string
  bedrooms: string
  bathrooms: string
  floor: string
  total_floors: string
  construction_year: string
  energy_class: string
  title_de: string
  description_de: string
  sale_price: string
  price_qualifier: string
  rent_price: string
  nebenkosten: string
  kaution: string
}

const INITIAL: WizardFormData = {
  property_type: '', intent: '',
  address_line1: '', address_line2: '', postcode: '', city: '', region: '',
  size_sqm: '', rooms: '', bedrooms: '', bathrooms: '',
  floor: '', total_floors: '', construction_year: '', energy_class: '',
  title_de: '', description_de: '',
  sale_price: '', price_qualifier: '', rent_price: '', nebenkosten: '', kaution: '',
}

const STEP_TITLES = [
  'Typ & Angebot',
  'Adresse',
  'Objektdetails',
  'Preis & Beschreibung',
  'Zusammenfassung',
]

const PROPERTY_TYPES = [
  { value: 'house',      label: 'Haus',       emoji: '🏠' },
  { value: 'flat',       label: 'Wohnung',    emoji: '🏢' },
  { value: 'apartment',  label: 'Apartment',  emoji: '🏙️' },
  { value: 'villa',      label: 'Villa',      emoji: '🏡' },
  { value: 'commercial', label: 'Gewerbe',    emoji: '🏪' },
  { value: 'land',       label: 'Grundstück', emoji: '🌿' },
  { value: 'other',      label: 'Sonstiges',  emoji: '···' },
]

const ENERGY_CLASSES = ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

type FormErrors = Partial<Record<keyof WizardFormData, string>>

// ── Shared input primitives ─────────────────────────────────────────────────

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

// ── Step components ─────────────────────────────────────────────────────────

function Step1({
  form, errors, set,
}: { form: WizardFormData; errors: FormErrors; set: (k: keyof WizardFormData, v: string) => void }) {
  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-bold text-[#0F1117] mb-4">Welche Art von Immobilie?</h2>
        {errors.property_type && (
          <p className="mb-3 text-xs text-red-500">{errors.property_type}</p>
        )}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {PROPERTY_TYPES.map(({ value, label, emoji }) => (
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
              <span className="text-2xl leading-none">{emoji}</span>
              <span className="text-xs font-semibold text-[#0F1117] leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-[#0F1117] mb-4">Angeboten als …</h2>
        {errors.intent && <p className="mb-3 text-xs text-red-500">{errors.intent}</p>}
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
    </div>
  )
}

function Step2({
  form, errors, set,
}: { form: WizardFormData; errors: FormErrors; set: (k: keyof WizardFormData, v: string) => void }) {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-[#0F1117]">Wo befindet sich die Immobilie?</h2>

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
    </div>
  )
}

function Step3({
  form, errors, set, isFlat,
}: {
  form: WizardFormData; errors: FormErrors
  set: (k: keyof WizardFormData, v: string) => void; isFlat: boolean
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#0F1117]">Objektdetails</h2>
        <p className="text-sm text-[#5E6278] mt-1">Alle Felder optional — je mehr, desto besser für Ihr Inserat.</p>
      </div>

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
    </div>
  )
}

function Step4({
  form, errors, set,
}: { form: WizardFormData; errors: FormErrors; set: (k: keyof WizardFormData, v: string) => void }) {
  const showSale = form.intent === 'sale' || form.intent === 'both'
  const showRent = form.intent === 'rent' || form.intent === 'both'

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-[#0F1117]">Preis & Beschreibung</h2>

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
    </div>
  )
}

function SummarySection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-[#5E6278] uppercase tracking-wider mb-2">{label}</h3>
      <div className="bg-bg rounded-xl p-4 space-y-2">{children}</div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-[#5E6278] shrink-0">{label}</span>
      <span className="font-medium text-[#0F1117] text-right">{value || '—'}</span>
    </div>
  )
}

function Step5({ form }: { form: WizardFormData }) {
  const typeLabel =
    PROPERTY_TYPES.find(p => p.value === form.property_type)?.label ?? form.property_type
  const intentLabels: Record<string, string> = {
    sale: 'Zum Verkauf',
    rent: 'Zur Miete',
    both: 'Verkauf & Miete',
  }

  const formatEur = (val: string) => {
    const n = parseFloat(val)
    return isNaN(n) || n <= 0
      ? ''
      : n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0F1117]">Zusammenfassung</h2>
        <p className="text-sm text-[#5E6278] mt-1">
          Bitte prüfen Sie Ihre Angaben. Nach dem Speichern können Sie alles bearbeiten.
        </p>
      </div>

      <SummarySection label="Typ & Angebot">
        <SummaryRow label="Typ" value={typeLabel} />
        <SummaryRow label="Angebot" value={intentLabels[form.intent] ?? form.intent} />
      </SummarySection>

      <SummarySection label="Adresse">
        <SummaryRow label="Straße" value={form.address_line1} />
        {form.address_line2 && <SummaryRow label="Zusatz" value={form.address_line2} />}
        <SummaryRow label="PLZ / Stadt" value={`${form.postcode} ${form.city}`} />
        {form.region && <SummaryRow label="Bundesland" value={form.region} />}
      </SummarySection>

      <SummarySection label="Objektdetails">
        {form.size_sqm && <SummaryRow label="Wohnfläche" value={`${form.size_sqm} m²`} />}
        {form.rooms && <SummaryRow label="Zimmer" value={form.rooms} />}
        {form.bedrooms && <SummaryRow label="Schlafzimmer" value={form.bedrooms} />}
        {form.bathrooms && <SummaryRow label="Badezimmer" value={form.bathrooms} />}
        {form.floor && <SummaryRow label="Etage" value={form.floor} />}
        {form.construction_year && <SummaryRow label="Baujahr" value={form.construction_year} />}
        {form.energy_class && <SummaryRow label="Energieklasse" value={form.energy_class} />}
        {!form.size_sqm && !form.rooms && !form.bedrooms && !form.bathrooms &&
          !form.construction_year && !form.energy_class && (
          <SummaryRow label="" value="Keine Details angegeben" />
        )}
      </SummarySection>

      <SummarySection label="Preis & Beschreibung">
        <SummaryRow label="Titel" value={form.title_de} />
        {form.sale_price && (
          <SummaryRow label="Kaufpreis" value={formatEur(form.sale_price)} />
        )}
        {form.rent_price && (
          <SummaryRow label="Kaltmiete" value={`${formatEur(form.rent_price)}/Monat`} />
        )}
        {form.nebenkosten && (
          <SummaryRow label="Nebenkosten" value={`${formatEur(form.nebenkosten)}/Monat`} />
        )}
        {form.kaution && (
          <SummaryRow label="Kaution" value={formatEur(form.kaution)} />
        )}
      </SummarySection>
    </div>
  )
}

// ── Main wizard ─────────────────────────────────────────────────────────────

export function ListingWizard({ ownerId }: { ownerId: string }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<WizardFormData>(INITIAL)
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState('')
  const [isPending, startTransition] = useTransition()

  function set(key: keyof WizardFormData, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  function validate(): boolean {
    const errs: FormErrors = {}

    if (step === 1) {
      if (!form.property_type) errs.property_type = 'Bitte Typ wählen'
      if (!form.intent) errs.intent = 'Bitte Art wählen'
    }

    if (step === 2) {
      if (!form.address_line1.trim()) errs.address_line1 = 'Adresse erforderlich'
      if (!/^\d{5}$/.test(form.postcode.trim())) errs.postcode = 'Bitte gültige Postleitzahl eingeben (5 Ziffern)'
      if (!form.city.trim()) errs.city = 'Stadt erforderlich'
    }

    if (step === 3) {
      const year = parseInt(form.construction_year, 10)
      const currentYear = new Date().getFullYear()
      if (form.construction_year && (isNaN(year) || year < 1800 || year > currentYear)) {
        errs.construction_year = `Baujahr muss zwischen 1800 und ${currentYear} liegen`
      }
    }

    if (step === 4) {
      if (!form.title_de.trim()) errs.title_de = 'Titel erforderlich'
      if ((form.intent === 'sale' || form.intent === 'both') && !form.sale_price.trim()) {
        errs.sale_price = 'Kaufpreis erforderlich'
      }
      if ((form.intent === 'rent' || form.intent === 'both') && !form.rent_price.trim()) {
        errs.rent_price = 'Kaltmiete erforderlich'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function next() {
    if (validate()) setStep(s => s + 1)
  }

  function back() {
    setErrors({})
    setStep(s => s - 1)
  }

  function handleSave() {
    setServerError('')
    const payload: WizardPayload = { ...form, ownerId }
    startTransition(async () => {
      const result = await createListingAction(payload)
      if (result?.error) setServerError(result.error)
    })
  }

  const isFlat = form.property_type === 'flat' || form.property_type === 'apartment'

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#5E6278]">Schritt {step} von 5</span>
          <span className="text-sm font-semibold text-[#0F1117]">{STEP_TITLES[step - 1]}</span>
        </div>
        <div className="h-2 bg-[#E4E6EF] rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Step card */}
      <div className="bg-surface rounded-card shadow-sm p-6">
        {step === 1 && <Step1 form={form} errors={errors} set={set} />}
        {step === 2 && <Step2 form={form} errors={errors} set={set} />}
        {step === 3 && <Step3 form={form} errors={errors} set={set} isFlat={isFlat} />}
        {step === 4 && <Step4 form={form} errors={errors} set={set} />}
        {step === 5 && <Step5 form={form} />}
      </div>

      {/* Server error */}
      {serverError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {serverError}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        {step > 1 ? (
          <button
            onClick={back}
            disabled={isPending}
            className="px-5 py-2.5 border border-[#E4E6EF] text-[#5E6278] rounded-lg hover:bg-bg transition-colors font-medium disabled:opacity-50"
          >
            Zurück
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button
            onClick={next}
            className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-[#0F1117] font-bold rounded-lg transition-colors"
          >
            Weiter
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-[#0F1117] font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? 'Wird gespeichert …' : 'Als Entwurf speichern'}
          </button>
        )}
      </div>
    </div>
  )
}
