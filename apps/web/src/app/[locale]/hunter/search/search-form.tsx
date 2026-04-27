'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'

interface SearchFormProps {
  defaults?: {
    intent: string
    areas: { name?: string; postcode?: string }[]
    budget_min: number | null
    budget_max: number | null
    property_types: string[]
    timeline: string
  }
}

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'land', 'commercial'] as const
const TIMELINE_VALUES = ['immediate', '1_3_months', '3_6_months', 'flexible'] as const
const TIMELINE_KEYS: Record<string, string> = {
  immediate: 'immediate',
  '1_3_months': 'months1_3',
  '3_6_months': 'months3_6',
  flexible: 'flexible',
}

export function SearchForm({ defaults }: SearchFormProps) {
  const router = useRouter()
  const t = useTranslations('searchForm')
  const [step, setStep] = useState<1 | 2>(1) // 1 = search details, 2 = consent
  const [saving, setSaving] = useState(false)
  const [searchId, setSearchId] = useState<string | null>(null)

  // Form state
  const [intent, setIntent] = useState(defaults?.intent ?? 'buy')
  const [areaInput, setAreaInput] = useState('')
  const [areas, setAreas] = useState<{ name: string; postcode?: string }[]>(
    defaults?.areas?.map(a => ({ name: a.name ?? '', postcode: a.postcode })) ?? []
  )
  const [radiusKm, setRadiusKm] = useState(5)
  const [budgetMin, setBudgetMin] = useState(defaults?.budget_min ? String(defaults.budget_min / 100) : '')
  const [budgetMax, setBudgetMax] = useState(defaults?.budget_max ? String(defaults.budget_max / 100) : '')
  const [currency, setCurrency] = useState('GBP')
  const [propertyTypes, setPropertyTypes] = useState<string[]>(defaults?.property_types ?? [])
  const [bedroomsMin, setBedroomsMin] = useState('')
  const [bedroomsMax, setBedroomsMax] = useState('')
  const [timeline, setTimeline] = useState(defaults?.timeline ?? 'flexible')
  const [notes, setNotes] = useState('')
  const [languages, setLanguages] = useState<string[]>(['en'])

  // Consent state
  const [agentOutreach, setAgentOutreach] = useState(true)
  const [phoneAllowed, setPhoneAllowed] = useState(false)

  const [error, setError] = useState<string | null>(null)

  function addArea() {
    if (areaInput.trim()) {
      setAreas(prev => [...prev, { name: areaInput.trim() }])
      setAreaInput('')
    }
  }

  function removeArea(idx: number) {
    setAreas(prev => prev.filter((_, i) => i !== idx))
  }

  function toggleType(t: string) {
    setPropertyTypes(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    )
  }

  async function handleSubmitSearch(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const res = await fetch('/api/search-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent,
          areas,
          radius_km: radiusKm,
          budget_min: budgetMin ? Math.round(Number(budgetMin) * 100) : null,
          budget_max: budgetMax ? Math.round(Number(budgetMax) * 100) : null,
          currency,
          property_types: propertyTypes,
          bedrooms_min: bedroomsMin ? Number(bedroomsMin) : null,
          bedrooms_max: bedroomsMax ? Number(bedroomsMax) : null,
          timeline,
          notes: notes || null,
          languages,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? t('errorCreateSearch'))
      }

      const data = await res.json()
      setSearchId(data.id)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorGeneric'))
    } finally {
      setSaving(false)
    }
  }

  async function handleSubmitConsent(e: React.FormEvent) {
    e.preventDefault()
    if (!searchId) return
    setError(null)
    setSaving(true)

    try {
      const res = await fetch(`/api/search-requests/${searchId}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_outreach: agentOutreach, phone_allowed: phoneAllowed }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? t('errorSaveConsent'))
      }

      // Success — redirect to inbox
      router.push('/hunter/inbox')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errorGeneric'))
    } finally {
      setSaving(false)
    }
  }

  // ─── STEP 1: Search details ──────────────────────────────────────
  if (step === 1) {
    return (
      <form onSubmit={handleSubmitSearch}>
        <div className="bg-surface rounded-2xl p-6 border border-border-default">
          <h2 className="text-lg font-bold mb-6">{t('newSearch')}</h2>

          {error && (
            <div role="alert" className="bg-[#FEE2E2] text-[#991B1B] text-sm p-3 rounded-lg mb-4">{error}</div>
          )}

          {/* Intent */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">{t('lookingTo')}</label>
            <div className="flex gap-2">
              {['buy', 'rent'].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setIntent(v)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                    intent === v
                      ? 'bg-brand border-brand text-black'
                      : 'bg-white border-[#D8DBE5] text-text-secondary hover:border-[#C8CCD6]'
                  }`}
                >
                  {v === 'buy' ? t('buy') : t('rent')}
                </button>
              ))}
            </div>
          </div>

          {/* Areas */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">{t('targetAreas')}</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={areaInput}
                onChange={e => setAreaInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArea())}
                placeholder={t('areaPlaceholder')}
                className="flex-1 px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
              <button type="button" onClick={addArea} className="px-4 py-2 bg-bg rounded-lg text-sm font-semibold hover:bg-hover-muted transition">
                {t('add')}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {areas.map((a, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-brand-solid-bg text-brand-badge-text text-xs font-semibold px-3 py-1 rounded-full border border-brand/30">
                  {a.name}
                  <button type="button" onClick={() => removeArea(i)} className="text-brand-badge-text hover:text-red-600 ml-1" aria-label={t('removeArea')}>&times;</button>
                </span>
              ))}
            </div>
          </div>

          {/* Radius */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">{t('radius', { km: radiusKm })}</label>
            <input
              type="range"
              min={1}
              max={50}
              value={radiusKm}
              onChange={e => setRadiusKm(Number(e.target.value))}
              className="w-full accent-brand"
            />
          </div>

          {/* Budget */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-text-secondary">{t('currency')}</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm"
              >
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-text-secondary">{t('minBudget')}</label>
              <input
                type="number"
                value={budgetMin}
                onChange={e => setBudgetMin(e.target.value)}
                placeholder={t('budgetPlaceholder')}
                className="w-full px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-text-secondary">{t('maxBudget')}</label>
              <input
                type="number"
                value={budgetMax}
                onChange={e => setBudgetMax(e.target.value)}
                placeholder={t('budgetPlaceholder')}
                className="w-full px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm"
              />
            </div>
          </div>

          {/* Property types */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">{t('propertyType')}</label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map(pt => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => toggleType(pt)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                    propertyTypes.includes(pt)
                      ? 'bg-brand border-brand text-black'
                      : 'bg-white border-[#D8DBE5] text-text-secondary hover:border-[#C8CCD6]'
                  }`}
                >
                  {t(pt)}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-text-secondary">{t('minBedrooms')}</label>
              <select value={bedroomsMin} onChange={e => setBedroomsMin(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm">
                <option value="">{t('any')}</option>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-text-secondary">{t('maxBedrooms')}</label>
              <select value={bedroomsMax} onChange={e => setBedroomsMax(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm">
                <option value="">{t('any')}</option>
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">{t('timelineLabel')}</label>
            <div className="flex flex-wrap gap-2">
              {TIMELINE_VALUES.map(tv => (
                <button
                  key={tv}
                  type="button"
                  onClick={() => setTimeline(tv)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                    timeline === tv
                      ? 'bg-brand border-brand text-black'
                      : 'bg-white border-[#D8DBE5] text-text-secondary hover:border-[#C8CCD6]'
                  }`}
                >
                  {t(TIMELINE_KEYS[tv])}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">{t('notesLabel')}</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('notesPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>

          {/* Languages */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">{t('languagesLabel')}</label>
            <div className="flex flex-wrap gap-2">
              {['en', 'de', 'ar', 'tr', 'fr', 'es'].map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguages(prev =>
                    prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]
                  )}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition uppercase ${
                    languages.includes(l)
                      ? 'bg-brand border-brand text-black'
                      : 'bg-white border-[#D8DBE5] text-text-secondary hover:border-[#C8CCD6]'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || areas.length === 0}
            className="w-full py-3 bg-brand text-black font-bold rounded-xl hover:bg-brand-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? t('saving') : t('saveAndContinue')}
          </button>
        </div>
      </form>
    )
  }

  // ─── STEP 2: Consent ──────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmitConsent}>
      <div className="bg-surface rounded-2xl p-6 border border-border-default">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-brand-solid-bg border-2 border-brand flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🤝</span>
          </div>
          <h2 className="text-xl font-bold mb-2">{t('agentOutreachTitle')}</h2>
          <p className="text-text-secondary text-sm max-w-md mx-auto">
            {t('agentOutreachDesc')}
          </p>
        </div>

        {error && (
          <div role="alert" className="bg-[#FEE2E2] text-[#991B1B] text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        {/* Consent options */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => setAgentOutreach(true)}
            className={`w-full p-4 rounded-xl border-2 text-left transition ${
              agentOutreach
                ? 'border-brand bg-brand-solid-bg'
                : 'border-[#D8DBE5] bg-white hover:border-[#C8CCD6]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                agentOutreach ? 'border-brand bg-brand' : 'border-[#D8DBE5]'
              }`}>
                {agentOutreach && <div className="w-2 h-2 rounded-full bg-black" />}
              </div>
              <div>
                <p className="font-semibold text-sm">{t('consentYes')}</p>
                <p className="text-xs text-text-secondary mt-0.5">{t('consentYesDesc')}</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setAgentOutreach(false); setPhoneAllowed(false) }}
            className={`w-full p-4 rounded-xl border-2 text-left transition ${
              !agentOutreach
                ? 'border-brand bg-brand-solid-bg'
                : 'border-[#D8DBE5] bg-white hover:border-[#C8CCD6]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                !agentOutreach ? 'border-brand bg-brand' : 'border-[#D8DBE5]'
              }`}>
                {!agentOutreach && <div className="w-2 h-2 rounded-full bg-black" />}
              </div>
              <div>
                <p className="font-semibold text-sm">{t('consentNo')}</p>
                <p className="text-xs text-text-secondary mt-0.5">{t('consentNoDesc')}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Phone sub-option (only when outreach is on) */}
        {agentOutreach && (
          <div className="mb-6 pl-4 border-l-2 border-brand/30">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={phoneAllowed}
                onChange={e => setPhoneAllowed(e.target.checked)}
                className="w-4 h-4 accent-brand rounded"
              />
              <div>
                <p className="text-sm font-medium">{t('phoneConsent')}</p>
                <p className="text-xs text-text-secondary">{t('phoneConsentDesc')}</p>
              </div>
            </label>
          </div>
        )}

        {/* Privacy note */}
        <div className="bg-hover-bg rounded-lg p-3 mb-6">
          <p className="text-xs text-text-secondary leading-relaxed">
            <span className="font-semibold text-text-primary">{t('privacyTitle')}</span>
            {t('privacyBody')}
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-brand text-black font-bold rounded-xl hover:bg-brand-hover transition disabled:opacity-50"
        >
          {saving ? t('saving') : agentOutreach ? t('saveAndMatch') : t('saveAndFinish')}
        </button>
      </div>
    </form>
  )
}
