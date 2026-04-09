'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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

const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'land', 'commercial']
const TIMELINES = [
  { value: 'immediate', label: 'Immediate' },
  { value: '1_3_months', label: '1–3 months' },
  { value: '3_6_months', label: '3–6 months' },
  { value: 'flexible', label: 'Flexible' },
]

export function SearchForm({ defaults }: SearchFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1) // 1 = search details, 2 = consent
  const [saving, setSaving] = useState(false)
  const [searchId, setSearchId] = useState<string | null>(null)

  // Form state
  const [intent, setIntent] = useState(defaults?.intent ?? 'buy')
  const [areaInput, setAreaInput] = useState('')
  const [areas, setAreas] = useState<{ name: string; postcode?: string }[]>(
    defaults?.areas?.map(a => {
      const base: { name: string; postcode?: string } = { name: a.name ?? '' }
      if (a.postcode !== undefined) base.postcode = a.postcode
      return base
    }) ?? []
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
        throw new Error(data.error ?? 'Failed to create search')
      }

      const data = await res.json()
      setSearchId(data.id)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
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
        throw new Error(data.error ?? 'Failed to save consent')
      }

      // Success — redirect to inbox
      router.push('/hunter/inbox')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  // ─── STEP 1: Search details ──────────────────────────────────────
  if (step === 1) {
    return (
      <form onSubmit={handleSubmitSearch}>
        <div className="bg-surface rounded-2xl p-6 border border-[#E2E4EB]">
          <h2 className="text-lg font-bold mb-6">New Search</h2>

          {error && (
            <div className="bg-[#FEE2E2] text-[#991B1B] text-sm p-3 rounded-lg mb-4">{error}</div>
          )}

          {/* Intent */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">Looking to</label>
            <div className="flex gap-2">
              {['buy', 'rent'].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setIntent(v)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition ${
                    intent === v
                      ? 'bg-brand border-brand text-black'
                      : 'bg-white border-[#D8DBE5] text-[#5E6278] hover:border-[#C8CCD6]'
                  }`}
                >
                  {v === 'buy' ? 'Buy' : 'Rent'}
                </button>
              ))}
            </div>
          </div>

          {/* Areas */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">Target areas</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={areaInput}
                onChange={e => setAreaInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addArea())}
                placeholder="City, district, or postcode"
                className="flex-1 px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm focus:outline-none focus:ring-2 focus:ring-[#FFD400]/30"
              />
              <button type="button" onClick={addArea} className="px-4 py-2 bg-[#EDEEF2] rounded-lg text-sm font-semibold hover:bg-[#D9DCE4] transition">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {areas.map((a, i) => (
                <span key={i} className="inline-flex items-center gap-1 bg-[#FFFBE0] text-[#7A5F00] text-xs font-semibold px-3 py-1 rounded-full border border-[#FFD400]/30">
                  {a.name}
                  <button type="button" onClick={() => removeArea(i)} className="text-[#7A5F00] hover:text-red-600 ml-1">&times;</button>
                </span>
              ))}
            </div>
          </div>

          {/* Radius */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">Radius: {radiusKm} km</label>
            <input
              type="range"
              min={1}
              max={50}
              value={radiusKm}
              onChange={e => setRadiusKm(Number(e.target.value))}
              className="w-full accent-[#FFD400]"
            />
          </div>

          {/* Budget */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-[#5E6278]">Currency</label>
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
              <label className="block text-xs font-semibold mb-1 text-[#5E6278]">Min budget</label>
              <input
                type="number"
                value={budgetMin}
                onChange={e => setBudgetMin(e.target.value)}
                placeholder="e.g. 200000"
                className="w-full px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-[#5E6278]">Max budget</label>
              <input
                type="number"
                value={budgetMax}
                onChange={e => setBudgetMax(e.target.value)}
                placeholder="e.g. 500000"
                className="w-full px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm"
              />
            </div>
          </div>

          {/* Property types */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">Property type</label>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition capitalize ${
                    propertyTypes.includes(t)
                      ? 'bg-brand border-brand text-black'
                      : 'bg-white border-[#D8DBE5] text-[#5E6278] hover:border-[#C8CCD6]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-[#5E6278]">Min bedrooms</label>
              <select value={bedroomsMin} onChange={e => setBedroomsMin(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm">
                <option value="">Any</option>
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-[#5E6278]">Max bedrooms</label>
              <select value={bedroomsMax} onChange={e => setBedroomsMax(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm">
                <option value="">Any</option>
                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}+</option>)}
              </select>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">Timeline</label>
            <div className="flex flex-wrap gap-2">
              {TIMELINES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTimeline(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                    timeline === t.value
                      ? 'bg-brand border-brand text-black'
                      : 'bg-white border-[#D8DBE5] text-[#5E6278] hover:border-[#C8CCD6]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2">Notes / Preferences</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Near a park, high ceilings, family-friendly, modern kitchen, wheelchair accessible..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#FFD400]/30"
            />
          </div>

          {/* Languages */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">Communication languages</label>
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
                      : 'bg-white border-[#D8DBE5] text-[#5E6278] hover:border-[#C8CCD6]'
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
            className="w-full py-3 bg-brand text-black font-bold rounded-xl hover:bg-[#E6C200] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Search & Continue'}
          </button>
        </div>
      </form>
    )
  }

  // ─── STEP 2: Consent ──────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmitConsent}>
      <div className="bg-surface rounded-2xl p-6 border border-[#E2E4EB]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#FFFBE0] border-2 border-brand flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🤝</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Agent Outreach</h2>
          <p className="text-[#5E6278] text-sm max-w-md mx-auto">
            Would you like Yalla.House to share your search with relevant
            real estate agents in your area?
          </p>
        </div>

        {error && (
          <div className="bg-[#FEE2E2] text-[#991B1B] text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        {/* Consent options */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={() => setAgentOutreach(true)}
            className={`w-full p-4 rounded-xl border-2 text-left transition ${
              agentOutreach
                ? 'border-brand bg-[#FFFBE0]'
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
                <p className="font-semibold text-sm">Yes, introduce me to relevant agents</p>
                <p className="text-xs text-[#5E6278] mt-0.5">Recommended — up to 8 agents will receive your search brief</p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => { setAgentOutreach(false); setPhoneAllowed(false) }}
            className={`w-full p-4 rounded-xl border-2 text-left transition ${
              !agentOutreach
                ? 'border-brand bg-[#FFFBE0]'
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
                <p className="font-semibold text-sm">No, I only want to use Yalla.House directly</p>
                <p className="text-xs text-[#5E6278] mt-0.5">You can enable this later from settings</p>
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
                className="w-4 h-4 accent-[#FFD400] rounded"
              />
              <div>
                <p className="text-sm font-medium">Allow matched agents to call me by phone</p>
                <p className="text-xs text-[#5E6278]">Unchecked by default — phone numbers are redacted otherwise</p>
              </div>
            </label>
          </div>
        )}

        {/* Privacy note */}
        <div className="bg-[#F5F5F7] rounded-lg p-3 mb-6">
          <p className="text-xs text-[#5E6278] leading-relaxed">
            <span className="font-semibold text-[#0F1117]">Privacy: </span>
            Your name, email, and phone number are never shared with agents.
            They only receive your search criteria. All agent communication
            goes through Yalla.House. You can revoke consent at any time.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-brand text-black font-bold rounded-xl hover:bg-[#E6C200] transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : agentOutreach ? 'Save & Start Matching' : 'Save & Continue'}
        </button>
      </div>
    </form>
  )
}
