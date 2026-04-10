'use client'

import { useState, useTransition } from 'react'
import { savePassportAction } from './actions'

interface PassportProfile {
  intent: string | null
  budget_min: number | null
  budget_max: number | null
  target_areas: string[] | null
  property_types: string[] | null
  min_bedrooms: number | null
  must_haves: string[] | null
  dealbreakers: string[] | null
  finance_status: string | null
  timeline: string | null
}

interface Props {
  profile: PassportProfile | null
  userName: string | null
}

const AREAS = ['East London', 'North London', 'South East London', 'Zone 2', 'Zone 3', 'West London', 'South West London']
const PROPERTY_TYPES: { value: string; label: string }[] = [
  { value: 'flat', label: 'Flat' },
  { value: 'terraced', label: 'Terraced' },
  { value: 'semi-detached', label: 'Semi-detached' },
  { value: 'detached', label: 'Detached' },
  { value: 'new_build', label: 'New build' },
  { value: 'period', label: 'Period' },
]
const BEDROOMS = [
  { value: 0, label: 'Studio' },
  { value: 1, label: '1 bed' },
  { value: 2, label: '2 beds' },
  { value: 3, label: '3 beds' },
  { value: 4, label: '4+ beds' },
]
const MUST_HAVES = ['Balcony', 'Near station', 'Garden', 'Parking', 'EV charging', 'Period features', 'Open plan', 'Guest WC', 'Storage', 'Quiet street']
const DEALBREAKERS = ['No auctions', 'No retirement homes', 'No ground floor', 'No top floor without lift', 'No shared ownership', 'No ex-social', 'No estate-agency only']
const FINANCE_OPTIONS = [
  { value: 'not_specified', label: 'Not specified' },
  { value: 'mortgage_pending', label: 'Mortgage in progress' },
  { value: 'mortgage_approved', label: 'Mortgage in principle' },
  { value: 'cash', label: 'Cash buyer' },
]
const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '3m', label: '3 months' },
  { value: '6m', label: '3–6 months' },
  { value: '1y', label: '1 year' },
  { value: 'flexible', label: 'Flexible' },
]
const AUTOMATIONS = [
  { key: 'matchPortals', label: 'Match properties from portals' },
  { key: 'connectAgents', label: 'Connect me with local agents' },
  { key: 'subscribeNewsletters', label: 'Subscribe to agent newsletters' },
  { key: 'filterAuto', label: 'Filter listings automatically' },
  { key: 'notifyMatches', label: 'Notify me when strong matches appear' },
]

function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors select-none ${
        active
          ? 'bg-brand border-brand text-[#0F1117]'
          : 'bg-surface border-[#E2E4EB] text-[#5E6278] hover:border-[#C8CCD6]'
      }`}
    >
      {label}
    </button>
  )
}

function StepHeader({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center text-xs font-black flex-shrink-0">
        {n}
      </div>
      <h3 className="font-bold text-base">{title}</h3>
    </div>
  )
}

function FinanceBadge({ status }: { status: string }) {
  const styles: Record<string, { cls: string; label: string; icon: string }> = {
    cash:              { cls: 'bg-brand-solid-bg text-brand-badge-text',    label: 'Cash buyer',             icon: '💰' },
    mortgage_approved: { cls: 'bg-[rgba(74,222,128,0.15)] text-[#4ADE80]', label: 'Mortgage in principle', icon: '✓' },
    mortgage_pending:  { cls: 'bg-[rgba(251,191,36,0.15)] text-[#FBBF24]', label: 'Mortgage in progress',  icon: '⏳' },
    not_specified:     { cls: 'bg-[rgba(255,255,255,0.07)] text-[rgba(255,255,255,0.4)]', label: 'Finance not specified', icon: '—' },
  }
  const s = (styles[status] ?? styles.not_specified) as { cls: string; label: string; icon: string }
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  )
}

export function PassportForm({ profile, userName }: Props) {
  const [state, setState] = useState<{ success?: boolean; error?: string }>({})
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await savePassportAction({}, formData)
      setState(result)
    })
  }

  const [intent, setIntent] = useState(profile?.intent ?? 'buy')
  const [areas, setAreas] = useState<string[]>(profile?.target_areas ?? [])
  const [budgetMin, setBudgetMin] = useState(profile?.budget_min ? Math.round(profile.budget_min / 100) : '')
  const [budgetMax, setBudgetMax] = useState(profile?.budget_max ? Math.round(profile.budget_max / 100) : '')
  const [propertyTypes, setPropertyTypes] = useState<string[]>(profile?.property_types ?? [])
  const [minBeds, setMinBeds] = useState<number>(profile?.min_bedrooms ?? 2)
  const [mustHaves, setMustHaves] = useState<string[]>(profile?.must_haves ?? [])
  const [dealbreakers, setDealbreakers] = useState<string[]>(profile?.dealbreakers ?? [])
  const [financeStatus, setFinanceStatus] = useState(profile?.finance_status ?? 'not_specified')
  const [timeline, setTimeline] = useState(profile?.timeline ?? 'flexible')
  const [automations, setAutomations] = useState({
    matchPortals: true,
    connectAgents: true,
    subscribeNewsletters: true,
    filterAuto: true,
    notifyMatches: true,
  })

  function toggleAutomation(key: string) {
    setAutomations(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))
  }

  const previewBeds = BEDROOMS.find(b => b.value === minBeds)?.label ?? `${minBeds}+`
  const previewTypes = propertyTypes.map(t => PROPERTY_TYPES.find(p => p.value === t)?.label ?? t)
  const previewTimeline = TIMELINE_OPTIONS.find(t => t.value === timeline)?.label
  const hasPassport = areas.length > 0 || budgetMax !== '' || propertyTypes.length > 0
  const isVerified = financeStatus !== 'not_specified'

  const sampleListings = [
    { price: '£495k', location: 'Bow, E3', spec: '2 bed · Balcony · 7 min to station' },
    { price: '£505k', location: 'Hackney, E8', spec: '3 bed · Garden · Near tube' },
    { price: '£475k', location: 'Bethnal Green, E2', spec: '2 bed · Period flat · Zone 2' },
  ]

  return (
    <form onSubmit={handleSubmit}>
      {/* Hidden inputs — serialise controlled state */}
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="budget_min" value={budgetMin} />
      <input type="hidden" name="budget_max" value={budgetMax} />
      <input type="hidden" name="target_areas" value={JSON.stringify(areas)} />
      <input type="hidden" name="property_types" value={JSON.stringify(propertyTypes)} />
      <input type="hidden" name="min_bedrooms" value={minBeds} />
      <input type="hidden" name="must_haves" value={JSON.stringify(mustHaves)} />
      <input type="hidden" name="dealbreakers" value={JSON.stringify(dealbreakers)} />
      <input type="hidden" name="finance_status" value={financeStatus} />
      <input type="hidden" name="timeline" value={timeline} />

      {state.success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-sm text-green-800 font-medium">
          ✓ Passport saved — agents can now request access.
        </div>
      )}
      {state.error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ── LEFT: Step-by-step form ── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Step 1 — Location */}
          <div className="bg-surface rounded-2xl p-6 border border-[#E2E4EB]">
            <StepHeader n="1" title="Location — where do you want to buy or rent?" />
            <div className="flex flex-wrap gap-2">
              {AREAS.map(a => (
                <Chip key={a} label={a} active={areas.includes(a)} onClick={() => setAreas(toggle(areas, a))} />
              ))}
            </div>
          </div>

          {/* Step 2 — Budget */}
          <div className="bg-surface rounded-2xl p-6 border border-[#E2E4EB]">
            <StepHeader n="2" title="Budget" />
            <div className="flex gap-3 mb-4">
              {['buy', 'rent'].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setIntent(v)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                    intent === v ? 'bg-brand border-brand text-[#0F1117]' : 'bg-surface border-[#E2E4EB] text-[#5E6278]'
                  }`}
                >
                  {v === 'buy' ? 'Buy' : 'Rent'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#5E6278] mb-1">
                  Min {intent === 'rent' ? '(£/pcm)' : '(£)'}
                </label>
                <input
                  type="number"
                  placeholder={intent === 'rent' ? '800' : '200,000'}
                  value={budgetMin}
                  onChange={e => setBudgetMin(e.target.value)}
                  className="w-full border border-[#E2E4EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5E6278] mb-1">
                  Max {intent === 'rent' ? '(£/pcm)' : '(£)'}
                </label>
                <input
                  type="number"
                  placeholder={intent === 'rent' ? '2,000' : '525,000'}
                  value={budgetMax}
                  onChange={e => setBudgetMax(e.target.value)}
                  className="w-full border border-[#E2E4EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>
          </div>

          {/* Step 3 — Property type + bedrooms */}
          <div className="bg-surface rounded-2xl p-6 border border-[#E2E4EB]">
            <StepHeader n="3" title="Property type" />
            <div className="flex flex-wrap gap-2 mb-5">
              {PROPERTY_TYPES.map(t => (
                <Chip key={t.value} label={t.label} active={propertyTypes.includes(t.value)} onClick={() => setPropertyTypes(toggle(propertyTypes, t.value))} />
              ))}
            </div>
            <p className="text-xs font-semibold text-[#5E6278] mb-3">Minimum bedrooms</p>
            <div className="flex flex-wrap gap-2">
              {BEDROOMS.map(b => (
                <Chip key={b.value} label={b.label} active={minBeds === b.value} onClick={() => setMinBeds(b.value)} />
              ))}
            </div>
          </div>

          {/* Step 4 — Must-haves + dealbreakers */}
          <div className="bg-surface rounded-2xl p-6 border border-[#E2E4EB]">
            <StepHeader n="4" title="Preferences" />
            <p className="text-xs font-semibold text-[#5E6278] mb-3">Must-haves</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {MUST_HAVES.map(m => (
                <Chip key={m} label={m} active={mustHaves.includes(m)} onClick={() => setMustHaves(toggle(mustHaves, m))} />
              ))}
            </div>
            <p className="text-xs font-semibold text-[#5E6278] mb-3">Dealbreakers</p>
            <div className="flex flex-wrap gap-2">
              {DEALBREAKERS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDealbreakers(toggle(dealbreakers, d))}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors select-none ${
                    dealbreakers.includes(d)
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-surface border-[#E2E4EB] text-[#5E6278] hover:border-[#C8CCD6]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Step 5 — Timing */}
          <div className="bg-surface rounded-2xl p-6 border border-[#E2E4EB]">
            <StepHeader n="5" title="Timing" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#5E6278] mb-1">Finance status</label>
                <select
                  value={financeStatus}
                  onChange={e => setFinanceStatus(e.target.value)}
                  className="w-full border border-[#E2E4EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-surface"
                >
                  {FINANCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#5E6278] mb-1">Timeline</label>
                <select
                  value={timeline}
                  onChange={e => setTimeline(e.target.value)}
                  className="w-full border border-[#E2E4EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-surface"
                >
                  {TIMELINE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-brand hover:bg-brand-hover disabled:opacity-50 text-[#0F1117] font-bold py-4 rounded-2xl text-base transition-colors shadow-sm"
          >
            {isPending ? 'Saving…' : 'Save My Home Passport →'}
          </button>

        </div>

        {/* ── RIGHT: Passport Card + automations + sample listings ── */}
        <div className="w-full lg:w-80 lg:sticky lg:top-6 space-y-4 flex-shrink-0">

          {/* Passport Card */}
          <div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0F1117 0%, #1C1F2E 100%)' }}
          >
            {/* Decorative glow */}
            <div
              className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none"
              style={{ background: 'rgba(255,212,0,0.08)' }}
            />
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.6rem] font-black uppercase tracking-widest text-brand">
                🏠 Home Passport
              </span>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wide border"
                  style={{ color: '#4ADE80', background: 'rgba(74,222,128,0.12)', borderColor: 'rgba(74,222,128,0.25)' }}>
                  ✓ Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wide border"
                  style={{ color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.12)' }}>
                  Unverified
                </span>
              )}
            </div>

            {/* Name */}
            <p className="text-white font-extrabold text-base tracking-tight mb-4">
              {userName ?? 'Your Name'}
            </p>

            {/* Passport rows */}
            <div className="space-y-2">
              <div className="flex gap-2 text-xs">
                <span className="text-[rgba(255,255,255,0.38)] uppercase tracking-wider font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">Intent</span>
                <span className="text-[rgba(255,255,255,0.87)] font-bold capitalize">{intent}</span>
              </div>
              {(budgetMin !== '' || budgetMax !== '') && (
                <div className="flex gap-2 text-xs">
                  <span className="text-[rgba(255,255,255,0.38)] uppercase tracking-wider font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">Budget</span>
                  <span className="text-[rgba(255,255,255,0.87)] font-bold">
                    {budgetMin !== '' ? `£${Number(budgetMin).toLocaleString()}` : '—'}
                    {' – '}
                    {budgetMax !== '' ? `£${Number(budgetMax).toLocaleString()}` : '—'}
                  </span>
                </div>
              )}
              {areas.length > 0 && (
                <div className="flex gap-2 text-xs">
                  <span className="text-[rgba(255,255,255,0.38)] uppercase tracking-wider font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">Areas</span>
                  <span className="text-[rgba(255,255,255,0.87)] font-bold">{areas.slice(0, 3).join(' · ')}{areas.length > 3 ? ' …' : ''}</span>
                </div>
              )}
              {propertyTypes.length > 0 && (
                <div className="flex gap-2 text-xs">
                  <span className="text-[rgba(255,255,255,0.38)] uppercase tracking-wider font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">Type</span>
                  <span className="text-[rgba(255,255,255,0.87)] font-bold">{previewTypes.join(' · ')}</span>
                </div>
              )}
              <div className="flex gap-2 text-xs">
                <span className="text-[rgba(255,255,255,0.38)] uppercase tracking-wider font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">Beds</span>
                <span className="text-[rgba(255,255,255,0.87)] font-bold">{previewBeds}+</span>
              </div>
              <div className="flex gap-2 text-xs items-start">
                <span className="text-[rgba(255,255,255,0.38)] uppercase tracking-wider font-bold text-[0.6rem] w-14 flex-shrink-0 mt-1">Finance</span>
                <FinanceBadge status={financeStatus} />
              </div>
              {timeline !== 'flexible' && (
                <div className="flex gap-2 text-xs">
                  <span className="text-[rgba(255,255,255,0.38)] uppercase tracking-wider font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">Timeline</span>
                  <span className="text-[rgba(255,255,255,0.87)] font-bold">{previewTimeline}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sharing controls */}
          <div
            className="rounded-xl px-4 py-3 border border-dashed text-center"
            style={{ borderColor: '#E2E4EB' }}
          >
            <p className="text-xs font-semibold text-[#5E6278] mb-0.5">
              Agents with access: <span className="text-[#0F1117] font-bold">0</span>
            </p>
            <p className="text-[0.68rem] text-[#999]">Agents request access · You approve</p>
          </div>

          {/* Automation toggles */}
          <div className="bg-surface rounded-2xl p-5 border border-[#E2E4EB]">
            <p className="text-xs font-bold text-[#5E6278] uppercase tracking-wide mb-4">Automation Settings</p>
            <div className="space-y-3">
              {AUTOMATIONS.map(a => (
                <label key={a.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={automations[a.key as keyof typeof automations]}
                    onChange={() => toggleAutomation(a.key)}
                    className="w-4 h-4 accent-brand rounded"
                  />
                  <span className="text-sm text-[#0F1117]">{a.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sample listings */}
          <div className="bg-surface rounded-2xl p-5 border border-[#E2E4EB]">
            <p className="text-xs font-bold text-[#5E6278] uppercase tracking-wide mb-4">
              {hasPassport ? 'Listings we would show you' : 'Example matches'}
            </p>
            <div className="space-y-3">
              {sampleListings.map(l => (
                <div key={l.location} className="text-sm">
                  <span className="font-bold">{l.price}</span>
                  <span className="text-[#5E6278]"> · {l.location}</span>
                  <p className="text-xs text-[#999]">{l.spec}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#999] mt-3 italic">
              Real listings will appear once your Passport is active.
            </p>
          </div>

        </div>
      </div>
    </form>
  )
}
