'use client'

import { useState, useTransition, useRef, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Home, Building2, Building, Store, TreePine, MapPin, Crosshair, Search, Sparkles, Lightbulb } from 'lucide-react'
import { useAuthAction } from '@/lib/use-auth-action'
import { createListingAction, type WizardPayload } from './actions'
import { countryFromLocale, countryConfigFromLocale } from '@/lib/detect-country'

interface WizardFormData {
  property_type: string
  intent: string
  address_line1: string
  address_line2: string
  postcode: string
  city: string
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
  service_charge: string
  deposit_amount: string
}

const INITIAL: WizardFormData = {
  property_type: '', intent: '',
  address_line1: '', address_line2: '', postcode: '', city: '',
  size_sqm: '', rooms: '', bedrooms: '', bathrooms: '',
  floor: '', total_floors: '', construction_year: '', energy_class: '',
  title_de: '', description_de: '',
  sale_price: '', price_qualifier: '', rent_price: '', service_charge: '', deposit_amount: '',
}

type FormErrors = Partial<Record<keyof WizardFormData, string>>

// ── Shared input primitives ─────────────────────────────────────────────────

function Field({
  label, id, required, error, children,
}: {
  label: string; id: string; required?: boolean | undefined; error?: string | undefined; children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-text-primary mb-1.5">
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
        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-text-primary bg-white ${error ? 'border-red-400' : 'border-[#E4E6EF]'}`}
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
        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-text-primary bg-white ${error ? 'border-red-400' : 'border-[#E4E6EF]'}`}
        {...props}
      >
        {children}
      </select>
    </Field>
  )
}

// ── Step components ─────────────────────────────────────────────────────────

function Step1({
  form, errors, set, propertyTypes, t, intentLabels,
}: { form: WizardFormData; errors: FormErrors; set: (k: keyof WizardFormData, v: string) => void; propertyTypes: Array<{ value: string; label: string; icon: string | null }>; t: (key: string) => string; intentLabels: Record<string, string> }) {
  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-xl font-bold text-text-primary mb-4">{t('step1.heading')}</h2>
        {errors.property_type && (
          <p className="mb-3 text-xs text-red-500">{errors.property_type}</p>
        )}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {propertyTypes.map(({ value, label, icon }) => (
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
              {icon === 'home' && <Home size={24} className="text-text-primary" />}
              {icon === 'building2' && <Building2 size={24} className="text-text-primary" />}
              {icon === 'building' && <Building size={24} className="text-text-primary" />}
              {icon === 'store' && <Store size={24} className="text-text-primary" />}
              {icon === 'treepine' && <TreePine size={24} className="text-text-primary" />}
              {icon === null && <span className="text-xs font-bold text-text-primary">···</span>}
              <span className="text-xs font-semibold text-text-primary leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-text-primary mb-4">{t('step1.intentHeading')}</h2>
        {errors.intent && <p className="mb-3 text-xs text-red-500">{errors.intent}</p>}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'sale', label: intentLabels.sale },
            { value: 'rent', label: intentLabels.rent },
            { value: 'both', label: intentLabels.both },
          ].map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => set('intent', value)}
              className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-colors ${
                form.intent === value
                  ? 'border-brand bg-brand-solid-bg text-text-primary'
                  : 'border-[#E4E6EF] text-text-secondary hover:border-brand/50'
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
  form, errors, set, t, postcodeLabel, postcodeMaxLength, isUK, countryCode,
}: {
  form: WizardFormData; errors: FormErrors; set: (k: keyof WizardFormData, v: string) => void; t: (key: string) => string
  postcodeLabel: string; postcodeMaxLength: number; isUK: boolean; countryCode: string
}) {
  const [locating, setLocating] = useState(false)
  const [locationError, setLocationError] = useState('')

  // Address autocomplete state
  interface Suggestion {
    display: string
    line1: string
    line2: string
    city: string
    postcode: string
  }
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [addressQuery, setAddressQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close suggestions on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced address autocomplete via Nominatim
  const searchAddress = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 3) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const country = countryCode.toLowerCase()
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&countrycodes=${country}&limit=6`,
          { headers: { 'Accept-Language': isUK ? 'en' : 'de' } }
        )
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Suggestion[] = data.map((item: {
            display_name: string
            address: {
              road?: string
              house_number?: string
              city?: string
              town?: string
              village?: string
              suburb?: string
              postcode?: string
            }
          }) => {
            const addr = item.address
            const road = addr.road || ''
            const houseNum = addr.house_number || ''
            const line1 = houseNum ? `${road} ${houseNum}`.trim() : road
            const city = addr.city || addr.town || addr.village || ''
            const suburb = addr.suburb || ''
            return {
              display: item.display_name,
              line1,
              line2: suburb && suburb !== city ? suburb : '',
              city,
              postcode: addr.postcode || '',
            }
          }).filter((s: Suggestion) => s.line1)
          setSuggestions(mapped)
          setShowSuggestions(mapped.length > 0)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      } catch {
        // Silently fail — user can type manually
      }
    }, 350)
  }, [countryCode, isUK])

  function handleAddressInput(value: string) {
    setAddressQuery(value)
    set('address_line1', value)
    searchAddress(value)
  }

  function selectSuggestion(s: Suggestion) {
    set('address_line1', s.line1)
    if (s.line2) set('address_line2', s.line2)
    if (s.city) set('city', s.city)
    if (s.postcode) set('postcode', s.postcode)
    setAddressQuery(s.line1)
    setShowSuggestions(false)
    setSuggestions([])
  }

  // Geolocation → reverse geocode to postcode
  async function handleFindLocation() {
    setLocating(true)
    setLocationError('')
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      })
      const { latitude, longitude } = pos.coords
      if (isUK) {
        const res = await fetch(`https://api.postcodes.io/postcodes?lon=${longitude}&lat=${latitude}&limit=1`)
        const data = await res.json()
        if (data.result?.[0]) {
          set('postcode', data.result[0].postcode)
          set('city', data.result[0].admin_district || data.result[0].parish || '')
        }
      } else {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`)
        const data = await res.json()
        if (data.address) {
          set('postcode', data.address.postcode || '')
          set('city', data.address.city || data.address.town || data.address.village || '')
          if (data.address.road) {
            const line1 = data.address.house_number
              ? `${data.address.road} ${data.address.house_number}`
              : data.address.road
            set('address_line1', line1)
            setAddressQuery(line1)
          }
        }
      }
    } catch {
      setLocationError(t('step2.locationError'))
    } finally {
      setLocating(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-text-primary">{t('step2.heading')}</h2>
        <button
          type="button"
          onClick={handleFindLocation}
          disabled={locating}
          className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover transition-colors disabled:opacity-50"
        >
          <Crosshair size={14} className={locating ? 'animate-spin' : ''} />
          {locating ? t('step2.locating') : t('step2.findMyLocation')}
        </button>
      </div>

      {locationError && (
        <p className="text-xs text-red-500">{locationError}</p>
      )}

      {/* Street and house number — with live autocomplete */}
      <div className="relative" ref={wrapperRef}>
        <Field label={t('step2.addressLine1')} id="address_line1" required error={errors.address_line1}>
          <div className="relative">
            <input
              id="address_line1"
              className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-text-primary bg-white ${errors.address_line1 ? 'border-red-400' : 'border-[#E4E6EF]'}`}
              placeholder={t('step2.addressSearchPlaceholder')}
              value={addressQuery || form.address_line1}
              onChange={e => handleAddressInput(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true) }}
              autoComplete="off"
            />
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        </Field>

        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white border border-[#E4E6EF] rounded-xl shadow-lg overflow-hidden">
            <div className="max-h-56 overflow-y-auto">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => selectSuggestion(s)}
                  className="w-full text-left px-4 py-2.5 text-sm hover:bg-brand/5 border-b border-[#E4E6EF] last:border-0 transition-colors"
                >
                  <span className="font-medium text-text-primary">{s.line1}</span>
                  {s.city && <span className="text-text-secondary">, {s.postcode} {s.city}</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <Input
        label={t('step2.addressLine2')}
        id="address_line2"
        placeholder={t('step2.addressLine2Placeholder')}
        value={form.address_line2}
        onChange={e => set('address_line2', e.target.value)}
      />

      {/* Postcode + City — auto-filled from selection, editable */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={postcodeLabel}
          id="postcode"
          required
          placeholder={t('step2.postcodePlaceholder')}
          maxLength={postcodeMaxLength}
          value={form.postcode}
          onChange={e => set('postcode', e.target.value)}
          error={errors.postcode}
        />
        <Input
          label={t('step2.city')}
          id="city"
          required
          placeholder={t('step2.cityPlaceholder')}
          value={form.city}
          onChange={e => set('city', e.target.value)}
          error={errors.city}
        />
      </div>
    </div>
  )
}

function Step3({
  form, errors, set, isFlat, t,
}: {
  form: WizardFormData; errors: FormErrors
  set: (k: keyof WizardFormData, v: string) => void; isFlat: boolean; t: (key: string) => string
}) {
  const ENERGY_CLASSES = ['A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-text-primary">{t('step3.heading')}</h2>
        <p className="text-sm text-text-secondary mt-1">{t('step3.optionalFieldsHint')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('step3.sizeSqm')}
          id="size_sqm"
          type="number"
          min="1"
          placeholder="85"
          value={form.size_sqm}
          onChange={e => set('size_sqm', e.target.value)}
        />
        <Input
          label={t('step3.rooms')}
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
          label={t('step3.bedrooms')}
          id="bedrooms"
          type="number"
          min="0"
          placeholder="2"
          value={form.bedrooms}
          onChange={e => set('bedrooms', e.target.value)}
        />
        <Input
          label={t('step3.bathrooms')}
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
            label={t('step3.floor')}
            id="floor"
            type="number"
            min="0"
            placeholder="3"
            value={form.floor}
            onChange={e => set('floor', e.target.value)}
          />
          <Input
            label={t('step3.totalFloors')}
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
          label={t('step3.constructionYear')}
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
          label={t('step3.energyClass')}
          id="energy_class"
          value={form.energy_class}
          onChange={e => set('energy_class', e.target.value)}
        >
          <option value="">{t('step3.selectClass')}</option>
          {ENERGY_CLASSES.map(cls => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </Select>
      </div>
    </div>
  )
}

function Step4({
  form, errors, set, currency, t, allFormData,
}: { form: WizardFormData; errors: FormErrors; set: (k: keyof WizardFormData, v: string) => void; currency: string; t: (key: string) => string; allFormData: WizardFormData }) {
  const showSale = form.intent === 'sale' || form.intent === 'both'
  const showRent = form.intent === 'rent' || form.intent === 'both'
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')

  const getCurrencySymbol = () => {
    try {
      const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency })
      return formatter.formatToParts(1).find(p => p.type === 'currency')?.value || currency
    } catch {
      return currency
    }
  }
  const currencySymbol = getCurrencySymbol()

  async function handleAiAssist() {
    setAiLoading(true)
    setAiError('')
    try {
      const res = await fetch('/api/ai/description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_type: allFormData.property_type,
          intent: allFormData.intent,
          city: allFormData.city,
          postcode: allFormData.postcode,
          bedrooms: allFormData.bedrooms,
          bathrooms: allFormData.bathrooms,
          size_sqm: allFormData.size_sqm,
          construction_year: allFormData.construction_year,
          title: allFormData.title_de,
        }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      if (data.description) set('description_de', data.description)
    } catch {
      setAiError(t('step4.aiAssistError'))
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-text-primary">{t('step4.heading')}</h2>

      <Input
        label={t('step4.titleDe')}
        id="title_de"
        required
        placeholder={t('step4.titleDePlaceholder')}
        value={form.title_de}
        onChange={e => set('title_de', e.target.value)}
        error={errors.title_de}
      />

      {/* Description with hints sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="description_de" className="block text-sm font-medium text-text-primary">
              {t('step4.descriptionDe')}
            </label>
            <button
              type="button"
              onClick={handleAiAssist}
              disabled={aiLoading || !form.title_de.trim()}
              className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover transition-colors disabled:opacity-40"
            >
              <Sparkles size={13} className={aiLoading ? 'animate-pulse' : ''} />
              {aiLoading ? t('step4.aiAssistGenerating') : t('step4.aiAssist')}
            </button>
          </div>
          <textarea
            id="description_de"
            rows={6}
            placeholder={t('step4.descriptionDePlaceholder')}
            value={form.description_de}
            onChange={e => set('description_de', e.target.value)}
            className="w-full px-4 py-2.5 border border-[#E4E6EF] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-text-primary bg-white resize-none"
          />
          {aiError && <p className="mt-1 text-xs text-red-500">{aiError}</p>}
        </div>

        {/* Hints panel */}
        <div className="bg-[#FFF8F5] border border-brand/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-brand" />
            <p className="text-xs font-bold text-text-primary">{t('step4.descriptionHintsTitle')}</p>
          </div>
          <ul className="space-y-2">
            {[1, 2, 3, 4, 5].map(n => (
              <li key={n} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-brand mt-1.5 flex-shrink-0" />
                <span className="text-xs text-text-secondary leading-relaxed">
                  {t(`step4.descriptionHint${n}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showSale && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={`${t('step4.salePrice')} (${currencySymbol})`}
            id="sale_price"
            type="number"
            min="0"
            placeholder={t('step4.salePricePlaceholder')}
            required
            value={form.sale_price}
            onChange={e => set('sale_price', e.target.value)}
            error={errors.sale_price}
          />
          <Select
            label={t('step4.priceQualifier')}
            id="price_qualifier"
            value={form.price_qualifier}
            onChange={e => set('price_qualifier', e.target.value)}
          >
            <option value="">{t('step4.qualifierOnRequest')}</option>
            <option value="fixed_price">{t('step4.qualifierFixed')}</option>
            <option value="vb">{t('step4.qualifierNegotiable')}</option>
          </Select>
        </div>
      )}

      {showRent && (
        <div className="space-y-4">
          <Input
            label={`${t('step4.rentPrice')} (${currencySymbol})`}
            id="rent_price"
            type="number"
            min="0"
            placeholder={t('step4.rentPricePlaceholder')}
            required
            value={form.rent_price}
            onChange={e => set('rent_price', e.target.value)}
            error={errors.rent_price}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`${t('step4.serviceCharge')} (${currencySymbol})`}
              id="service_charge"
              type="number"
              min="0"
              placeholder={t('step4.serviceChargePlaceholder')}
              value={form.service_charge}
              onChange={e => set('service_charge', e.target.value)}
            />
            <Input
              label={`${t('step4.depositAmount')} (${currencySymbol})`}
              id="deposit_amount"
              type="number"
              min="0"
              placeholder={t('step4.depositAmountPlaceholder')}
              value={form.deposit_amount}
              onChange={e => set('deposit_amount', e.target.value)}
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
      <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">{label}</h3>
      <div className="bg-bg rounded-xl p-4 space-y-2">{children}</div>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-text-secondary shrink-0">{label}</span>
      <span className="font-medium text-text-primary text-right">{value || '—'}</span>
    </div>
  )
}

function Step5({
  form, currency, localeFormatting, t, propertyTypes, intentLabels,
}: {
  form: WizardFormData; currency: string; localeFormatting: string; t: (key: string) => string
  propertyTypes: Array<{ value: string; label: string; icon: string | null }>
  intentLabels: Record<string, string>
}) {
  const typeLabel =
    propertyTypes.find(p => p.value === form.property_type)?.label ?? form.property_type

  const formatCurrencyValue = (val: string) => {
    const n = parseFloat(val)
    return isNaN(n) || n <= 0
      ? ''
      : n.toLocaleString(localeFormatting, { style: 'currency', currency: currency, maximumFractionDigits: 0 })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">{t('step5.heading')}</h2>
        <p className="text-sm text-text-secondary mt-1">
          {t('step5.subheading')}
        </p>
      </div>

      <SummarySection label={t('step5.typeAndOffer')}>
        <SummaryRow label={t('step5.type')} value={typeLabel} />
        <SummaryRow label={t('step5.intent')} value={intentLabels[form.intent] ?? form.intent} />
      </SummarySection>

      <SummarySection label={t('step5.address')}>
        <SummaryRow label={t('step5.addressLine1')} value={form.address_line1} />
        {form.address_line2 && <SummaryRow label={t('step5.addressLine2')} value={form.address_line2} />}
        <SummaryRow label={t('step5.postalCity')} value={`${form.postcode} ${form.city}`} />
      </SummarySection>

      <SummarySection label={t('step5.propertyDetails')}>
        {form.size_sqm && <SummaryRow label={t('step5.size')} value={`${form.size_sqm} ${t('step5.sqm')}`} />}
        {form.rooms && <SummaryRow label={t('step5.rooms')} value={form.rooms} />}
        {form.bedrooms && <SummaryRow label={t('step5.bedrooms')} value={form.bedrooms} />}
        {form.bathrooms && <SummaryRow label={t('step5.bathrooms')} value={form.bathrooms} />}
        {form.floor && <SummaryRow label={t('step5.floor')} value={form.floor} />}
        {form.construction_year && <SummaryRow label={t('step5.constructionYear')} value={form.construction_year} />}
        {form.energy_class && <SummaryRow label={t('step5.energyClass')} value={form.energy_class} />}
        {!form.size_sqm && !form.rooms && !form.bedrooms && !form.bathrooms &&
          !form.construction_year && !form.energy_class && (
          <SummaryRow label="" value={t('step5.noDetails')} />
        )}
      </SummarySection>

      <SummarySection label={t('step5.priceAndDescription')}>
        <SummaryRow label={t('step5.title')} value={form.title_de} />
        {form.sale_price && (
          <SummaryRow label={t('step5.salePrice')} value={formatCurrencyValue(form.sale_price)} />
        )}
        {form.rent_price && (
          <SummaryRow label={t('step5.rentPrice')} value={`${formatCurrencyValue(form.rent_price)}${t('step5.perMonth')}`} />
        )}
        {form.service_charge && (
          <SummaryRow label={t('step5.serviceCharge')} value={`${formatCurrencyValue(form.service_charge)}${t('step5.perMonth')}`} />
        )}
        {form.deposit_amount && (
          <SummaryRow label={t('step5.depositAmount')} value={formatCurrencyValue(form.deposit_amount)} />
        )}
      </SummarySection>
    </div>
  )
}

// ── Main wizard ─────────────────────────────────────────────────────────────

export function ListingWizard({ ownerId, locale }: { ownerId: string; locale: string }) {
  const t = useTranslations('wizard')
  const { handleAuthRequired } = useAuthAction()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<WizardFormData>(INITIAL)
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState('')
  const [isPending, startTransition] = useTransition()

  // Derive country from locale (auto-detected via Accept-Language or URL)
  const countryCode = countryFromLocale(locale)
  const countryConfig = countryConfigFromLocale(locale)
  const localeFormatting = countryConfig.default_locale

  // Build step titles and property types from translations
  const stepTitles = [
    t('stepTitles.typeAndOffer'),
    t('stepTitles.address'),
    t('stepTitles.propertyDetails'),
    t('stepTitles.priceAndDescription'),
    t('stepTitles.summary'),
  ]

  const propertyTypes = [
    { value: 'house', label: t('propertyTypes.house'), icon: 'home' },
    { value: 'flat', label: t('propertyTypes.flat'), icon: 'building2' },
    { value: 'apartment', label: t('propertyTypes.apartment'), icon: 'building' },
    { value: 'villa', label: t('propertyTypes.villa'), icon: 'home' },
    { value: 'commercial', label: t('propertyTypes.commercial'), icon: 'store' },
    { value: 'land', label: t('propertyTypes.land'), icon: 'treepine' },
    { value: 'other', label: t('propertyTypes.other'), icon: null },
  ]

  const intentLabels = {
    sale: t('intents.sale'),
    rent: t('intents.rent'),
    both: t('intents.both'),
  }

  function set(key: keyof WizardFormData, value: string) {
    setForm(f => ({ ...f, [key]: value }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  function validate(): boolean {
    const errs: FormErrors = {}

    if (step === 1) {
      if (!form.property_type) errs.property_type = t('validation.required')
      if (!form.intent) errs.intent = t('validation.required')
    }

    if (step === 2) {
      if (!form.address_line1.trim()) errs.address_line1 = t('validation.required')
      if (!countryConfig.postal_code_format.test(form.postcode.trim())) errs.postcode = t('validation.postcodeInvalid')
      if (!form.city.trim()) errs.city = t('validation.required')
    }

    if (step === 3) {
      const year = parseInt(form.construction_year, 10)
      const currentYear = new Date().getFullYear()
      if (form.construction_year && (isNaN(year) || year < 1800 || year > currentYear)) {
        errs.construction_year = t('step3.constructionYearError', { min: 1800, max: currentYear })
      }
    }

    if (step === 4) {
      if (!form.title_de.trim()) errs.title_de = t('validation.required')
      if ((form.intent === 'sale' || form.intent === 'both') && !form.sale_price.trim()) {
        errs.sale_price = t('validation.required')
      }
      if ((form.intent === 'rent' || form.intent === 'both') && !form.rent_price.trim()) {
        errs.rent_price = t('validation.required')
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
    const payload: WizardPayload = { ...form, ownerId, locale }
    startTransition(async () => {
      const result = await createListingAction(payload)
      if (handleAuthRequired(result)) {
        return
      }
      if (result && 'error' in result) setServerError(result.error)
    })
  }

  const isFlat = form.property_type === 'flat' || form.property_type === 'apartment'

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">{t('progress', { current: step, total: stepTitles.length })}</span>
          <span className="text-sm font-semibold text-text-primary">{stepTitles[step - 1]}</span>
        </div>
        <div className="h-2 bg-[#E4E6EF] rounded-full overflow-hidden">
          <div
            className="h-full bg-brand rounded-full transition-all duration-300"
            style={{ width: `${(step / stepTitles.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step card */}
      <div className="bg-surface rounded-card shadow-sm p-6">
        {step === 1 && <Step1 form={form} errors={errors} set={set} propertyTypes={propertyTypes} t={t} intentLabels={intentLabels} />}
        {step === 2 && <Step2 form={form} errors={errors} set={set} t={t} postcodeLabel={countryConfig.postal_code_label} postcodeMaxLength={countryCode === 'GB' ? 8 : 5} isUK={countryCode === 'GB'} countryCode={countryCode} />}
        {step === 3 && <Step3 form={form} errors={errors} set={set} isFlat={isFlat} t={t} />}
        {step === 4 && <Step4 form={form} errors={errors} set={set} currency={countryConfig.currency} t={t} allFormData={form} />}
        {step === 5 && <Step5 form={form} currency={countryConfig.currency} localeFormatting={localeFormatting} t={t} propertyTypes={propertyTypes} intentLabels={intentLabels} />}
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
            className="px-5 py-2.5 border border-[#E4E6EF] text-text-secondary rounded-lg hover:bg-bg transition-colors font-medium disabled:opacity-50"
          >
            {t('buttons.back')}
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button
            onClick={next}
            className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-text-primary font-bold rounded-lg transition-colors"
          >
            {t('buttons.next')}
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-text-primary font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? t('buttons.submitting') : t('buttons.submit')}
          </button>
        )}
      </div>
    </div>
  )
}
