'use client'

import { useState } from 'react'
import { Globe, Check, X, Loader2 } from 'lucide-react'
import { useAuthAction } from '@/lib/use-auth-action'
import { updateListingDefaultsAction } from './actions'

interface ListingDefaultsData {
  default_intent: string
  default_property_type: string
  default_currency: string
  default_price_qualifier: string
  default_rent_period: string
  default_city: string
  default_postcode: string
  default_region: string
}

interface Props {
  defaults: ListingDefaultsData
  translations: {
    sectionListingDefaults: string
    defaultsDescription: string
    labelIntent: string
    intentSale: string
    intentRent: string
    intentBoth: string
    labelPropertyType: string
    typeHouse: string
    typeFlat: string
    typeApartment: string
    typeVilla: string
    typeCommercial: string
    typeLand: string
    typeOther: string
    labelCurrency: string
    labelPriceQualifier: string
    qualFixedPrice: string
    qualOffersOver: string
    qualGuidePrice: string
    qualPOA: string
    qualVB: string
    labelRentPeriod: string
    periodPCM: string
    periodPW: string
    periodPQ: string
    periodPA: string
    labelCity: string
    placeholderCity: string
    labelPostcode: string
    labelRegion: string
    placeholderRegion: string
    saveDefaults: string
    saving: string
    savedDefaults: string
    buttonEdit: string
    notSet: string
  }
}

export function ListingDefaultsForm({ defaults, translations: t }: Props) {
  const { handleAuthRequired } = useAuthAction()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [formData, setFormData] = useState<ListingDefaultsData>(defaults)

  const intentOptions = [
    { value: '', label: '—' },
    { value: 'sale', label: t.intentSale },
    { value: 'rent', label: t.intentRent },
    { value: 'both', label: t.intentBoth },
  ]

  const propertyTypeOptions = [
    { value: '', label: '—' },
    { value: 'house', label: t.typeHouse },
    { value: 'flat', label: t.typeFlat },
    { value: 'apartment', label: t.typeApartment },
    { value: 'villa', label: t.typeVilla },
    { value: 'commercial', label: t.typeCommercial },
    { value: 'land', label: t.typeLand },
    { value: 'other', label: t.typeOther },
  ]

  const currencyOptions = [
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'CHF', label: 'CHF' },
    { value: 'USD', label: 'USD ($)' },
  ]

  const priceQualifierOptions = [
    { value: '', label: '—' },
    { value: 'fixed_price', label: t.qualFixedPrice },
    { value: 'offers_over', label: t.qualOffersOver },
    { value: 'guide_price', label: t.qualGuidePrice },
    { value: 'poa', label: t.qualPOA },
    { value: 'vb', label: t.qualVB },
  ]

  const rentPeriodOptions = [
    { value: '', label: '—' },
    { value: 'pcm', label: t.periodPCM },
    { value: 'pw', label: t.periodPW },
    { value: 'pq', label: t.periodPQ },
    { value: 'pa', label: t.periodPA },
  ]

  function displayValue(value: string, options: { value: string; label: string }[]): string {
    if (!value) return t.notSet
    const opt = options.find(o => o.value === value)
    return opt?.label ?? value
  }

  async function handleSave() {
    setSaving(true)
    setFeedback(null)
    const result = await updateListingDefaultsAction(formData)
    setSaving(false)

    if (handleAuthRequired(result)) {
      setFeedback({ type: 'error', message: 'Please log in to save changes' })
      return
    }

    if ('error' in result) {
      setFeedback({ type: 'error', message: result.error as string })
      return
    }

    setFeedback({ type: 'success', message: t.savedDefaults })
    setEditing(false)
    // Clear feedback after 3 seconds
    setTimeout(() => setFeedback(null), 3000)
  }

  function handleCancel() {
    setFormData(defaults)
    setEditing(false)
    setFeedback(null)
  }

  const selectClass = 'w-full text-sm px-3 py-2 bg-bg rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-[#D4764E]'
  const inputClass = 'w-full text-sm px-3 py-2 bg-bg rounded-lg text-text-primary placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#D4764E]'

  return (
    <div className="bg-white rounded-2xl border border-border-default p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Globe size={20} className="text-text-primary" />
          <div>
            <h2 className="font-bold text-text-primary text-base">{t.sectionListingDefaults}</h2>
            <p className="text-xs text-text-muted mt-0.5">{t.defaultsDescription}</p>
          </div>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-semibold text-brand hover:text-[#BF6840] transition-colors"
          >
            {t.buttonEdit}
          </button>
        )}
      </div>

      {feedback && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          feedback.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {feedback.message}
        </div>
      )}

      {editing ? (
        <div className="space-y-4">
          {/* Row 1: Intent + Property Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">{t.labelIntent}</label>
              <select
                value={formData.default_intent}
                onChange={e => setFormData(d => ({ ...d, default_intent: e.target.value }))}
                className={selectClass}
              >
                {intentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">{t.labelPropertyType}</label>
              <select
                value={formData.default_property_type}
                onChange={e => setFormData(d => ({ ...d, default_property_type: e.target.value }))}
                className={selectClass}
              >
                {propertyTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2: Currency + Price Qualifier + Rent Period */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">{t.labelCurrency}</label>
              <select
                value={formData.default_currency}
                onChange={e => setFormData(d => ({ ...d, default_currency: e.target.value }))}
                className={selectClass}
              >
                {currencyOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">{t.labelPriceQualifier}</label>
              <select
                value={formData.default_price_qualifier}
                onChange={e => setFormData(d => ({ ...d, default_price_qualifier: e.target.value }))}
                className={selectClass}
              >
                {priceQualifierOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">{t.labelRentPeriod}</label>
              <select
                value={formData.default_rent_period}
                onChange={e => setFormData(d => ({ ...d, default_rent_period: e.target.value }))}
                className={selectClass}
              >
                {rentPeriodOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3: City + Postcode + Region */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">{t.labelCity}</label>
              <input
                type="text"
                value={formData.default_city}
                onChange={e => setFormData(d => ({ ...d, default_city: e.target.value }))}
                placeholder={t.placeholderCity}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">{t.labelPostcode}</label>
              <input
                type="text"
                value={formData.default_postcode}
                onChange={e => setFormData(d => ({ ...d, default_postcode: e.target.value }))}
                placeholder="10115"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">{t.labelRegion}</label>
              <input
                type="text"
                value={formData.default_region}
                onChange={e => setFormData(d => ({ ...d, default_region: e.target.value }))}
                placeholder={t.placeholderRegion}
                className={inputClass}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-semibold hover:bg-brand-hover transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {saving ? t.saving : t.saveDefaults}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg text-text-secondary text-sm font-semibold hover:bg-hover-muted transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        /* Read-only display */
        <div className="space-y-0">
          <DisplayRow label={t.labelIntent} value={displayValue(formData.default_intent, intentOptions)} />
          <DisplayRow label={t.labelPropertyType} value={displayValue(formData.default_property_type, propertyTypeOptions)} />
          <DisplayRow label={t.labelCurrency} value={displayValue(formData.default_currency, currencyOptions)} />
          <DisplayRow label={t.labelPriceQualifier} value={displayValue(formData.default_price_qualifier, priceQualifierOptions)} />
          <DisplayRow label={t.labelRentPeriod} value={displayValue(formData.default_rent_period, rentPeriodOptions)} />
          <DisplayRow label={t.labelCity} value={formData.default_city || t.notSet} />
          <DisplayRow label={t.labelPostcode} value={formData.default_postcode || t.notSet} />
          <DisplayRow label={t.labelRegion} value={formData.default_region || t.notSet} isLast />
        </div>
      )}
    </div>
  )
}

function DisplayRow({ label, value, isLast }: { label: string; value: string; isLast?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-3 ${isLast ? '' : 'border-b border-[#F0F0F0]'}`}>
      <div className="text-sm font-semibold text-text-primary">{label}</div>
      <div className="text-sm text-text-secondary">{value}</div>
    </div>
  )
}
