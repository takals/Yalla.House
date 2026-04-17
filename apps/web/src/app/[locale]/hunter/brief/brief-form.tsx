'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Check, CheckCircle2 } from 'lucide-react'
import { useAuthAction } from '@/lib/use-auth-action'
import { saveBriefAction } from './actions'

interface BriefProfile {
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
  profile: BriefProfile | null
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
  { key: 'connectAgents', label: 'Connect my inbox to local agents' },
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
          ? 'bg-brand border-brand text-text-primary'
          : 'bg-surface border-border-default text-text-secondary hover:border-[#C8CCD6]'
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

export function BriefForm({ profile }: Props) {
  const t = useTranslations('briefForm')
  const [state, setState] = useState<{ success?: boolean; error?: string }>({})
  const [isPending, startTransition] = useTransition()
  const { handleAuthRequired } = useAuthAction()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await saveBriefAction({}, formData)
      if (handleAuthRequired(result)) return
      setState(result)
    })
  }

  // Controlled form state — drives live preview
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

  // Derive preview text
  const previewBeds = BEDROOMS.find(b => b.value === minBeds)?.label ?? `${minBeds}+`
  const previewTypes = propertyTypes.map(t => PROPERTY_TYPES.find(p => p.value === t)?.label ?? t)
  const previewFinance = FINANCE_OPTIONS.find(f => f.value === financeStatus)?.label
  const previewTimeline = TIMELINE_OPTIONS.find(t => t.value === timeline)?.label
  const hasBrief = areas.length > 0 || budgetMax !== '' || propertyTypes.length > 0

  // Sample listings matching brief (illustrative)
  const sampleListings = [
    { price: '£495k', location: 'Bow, E3', spec: '2 bed · Balcony · 7 min to station' },
    { price: '£505k', location: 'Hackney, E8', spec: '3 bed · Garden · Near tube' },
    { price: '£475k', location: 'Bethnal Green, E2', spec: '2 bed · Period flat · Zone 2' },
  ]

  return (
    <form onSubmit={handleSubmit}>
      {/* Inject controlled state as hidden inputs */}
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
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-sm text-green-800 font-medium flex items-center gap-2">
          <CheckCircle2 size={16} /> Brief activated — the system is now working for you.
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
          <div className="bg-surface rounded-2xl p-6 border border-border-default">
            <StepHeader n="1" title={t('stepLocation')} />
            <div className="flex flex-wrap gap-2">
              {AREAS.map(a => (
                <Chip key={a} label={a} active={areas.includes(a)} onClick={() => setAreas(toggle(areas, a))} />
              ))}
            </div>
          </div>

          {/* Step 2 — Budget */}
          <div className="bg-surface rounded-2xl p-6 border border-border-default">
            <StepHeader n="2" title={t('stepBudget')} />
            <div className="flex gap-3 mb-4">
              {['buy', 'rent'].map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setIntent(v)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                    intent === v ? 'bg-brand border-brand text-text-primary' : 'bg-surface border-border-default text-text-secondary'
                  }`}
                >
                  {v === 'buy' ? 'Buy' : 'Rent'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Min {intent === 'rent' ? '(£/pcm)' : '(£)'}
                </label>
                <input
                  type="number"
                  placeholder={intent === 'rent' ? '800' : '200,000'}
                  value={budgetMin}
                  onChange={e => setBudgetMin(e.target.value)}
                  className="w-full border border-border-default rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Max {intent === 'rent' ? '(£/pcm)' : '(£)'}
                </label>
                <input
                  type="number"
                  placeholder={intent === 'rent' ? '2,000' : '525,000'}
                  value={budgetMax}
                  onChange={e => setBudgetMax(e.target.value)}
                  className="w-full border border-border-default rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>
          </div>

          {/* Step 3 — Property type + bedrooms */}
          <div className="bg-surface rounded-2xl p-6 border border-border-default">
            <StepHeader n="3" title={t('stepPropertyType')} />
            <div className="flex flex-wrap gap-2 mb-5">
              {PROPERTY_TYPES.map(t => (
                <Chip key={t.value} label={t.label} active={propertyTypes.includes(t.value)} onClick={() => setPropertyTypes(toggle(propertyTypes, t.value))} />
              ))}
            </div>
            <p className="text-xs font-semibold text-text-secondary mb-3">Minimum bedrooms</p>
            <div className="flex flex-wrap gap-2">
              {BEDROOMS.map(b => (
                <Chip key={b.value} label={b.label} active={minBeds === b.value} onClick={() => setMinBeds(b.value)} />
              ))}
            </div>
          </div>

          {/* Step 4 — Must-haves + dealbreakers */}
          <div className="bg-surface rounded-2xl p-6 border border-border-default">
            <StepHeader n="4" title={t('stepPreferences')} />
            <p className="text-xs font-semibold text-text-secondary mb-3">Must-haves</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {MUST_HAVES.map(m => (
                <Chip key={m} label={m} active={mustHaves.includes(m)} onClick={() => setMustHaves(toggle(mustHaves, m))} />
              ))}
            </div>
            <p className="text-xs font-semibold text-text-secondary mb-3">Dealbreakers</p>
            <div className="flex flex-wrap gap-2">
              {DEALBREAKERS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDealbreakers(toggle(dealbreakers, d))}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors select-none ${
                    dealbreakers.includes(d)
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-surface border-border-default text-text-secondary hover:border-[#C8CCD6]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Step 5 — Timing */}
          <div className="bg-surface rounded-2xl p-6 border border-border-default">
            <StepHeader n="5" title={t('stepTiming')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Finance status</label>
                <select
                  value={financeStatus}
                  onChange={e => setFinanceStatus(e.target.value)}
                  className="w-full border border-border-default rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-surface"
                >
                  {FINANCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Timeline</label>
                <select
                  value={timeline}
                  onChange={e => setTimeline(e.target.value)}
                  className="w-full border border-border-default rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-surface"
                >
                  {TIMELINE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Activate button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-brand hover:bg-brand-hover disabled:opacity-50 text-text-primary font-bold py-4 rounded-2xl text-base transition-colors shadow-sm"
          >
            {isPending ? t('activating') : t('activate')}
          </button>

        </div>

        {/* ── RIGHT: Live preview panel ── */}
        <div className="w-full lg:w-80 lg:sticky lg:top-6 space-y-4 flex-shrink-0">

          {/* Brief preview */}
          <div className="bg-surface rounded-2xl p-5 border border-border-default">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-wide">Your Brief</p>
              {hasBrief && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-200">
                  Active
                </span>
              )}
            </div>

            {!hasBrief ? (
              <p className="text-sm text-text-muted italic">Fill in the form to see your brief here.</p>
            ) : (
              <div className="space-y-2 text-sm">
                {intent && (
                  <div className="flex gap-2">
                    <span className="text-text-muted w-20 flex-shrink-0">Looking to</span>
                    <span className="font-semibold capitalize">{intent}</span>
                  </div>
                )}
                {areas.length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-text-muted w-20 flex-shrink-0">Location</span>
                    <span className="font-semibold">{areas.join(', ')}</span>
                  </div>
                )}
                {(budgetMin !== '' || budgetMax !== '') && (
                  <div className="flex gap-2">
                    <span className="text-text-muted w-20 flex-shrink-0">Budget</span>
                    <span className="font-semibold">
                      {budgetMin !== '' ? `£${Number(budgetMin).toLocaleString()}` : '—'}
                      {' → '}
                      {budgetMax !== '' ? `£${Number(budgetMax).toLocaleString()}` : '—'}
                    </span>
                  </div>
                )}
                {propertyTypes.length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-text-muted w-20 flex-shrink-0">Type</span>
                    <span className="font-semibold">{previewTypes.join(', ')}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-text-muted w-20 flex-shrink-0">Bedrooms</span>
                  <span className="font-semibold">{previewBeds}+</span>
                </div>
                {mustHaves.length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-text-muted w-20 flex-shrink-0">Must-haves</span>
                    <span className="font-semibold">{mustHaves.join(' · ')}</span>
                  </div>
                )}
                {dealbreakers.length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-text-muted w-20 flex-shrink-0">Nope</span>
                    <span className="font-semibold text-red-600">{dealbreakers.join(' · ')}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-text-muted w-20 flex-shrink-0">Finance</span>
                  <span className="font-semibold">{previewFinance}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-text-muted w-20 flex-shrink-0">Timeline</span>
                  <span className="font-semibold">{previewTimeline}</span>
                </div>
              </div>
            )}

            {hasBrief && (
              <div className="mt-4 pt-4 border-t border-border-default">
                <p className="text-xs font-semibold text-text-secondary mb-2">This brief will be shared with:</p>
                {['Matching engine', 'Connected agents', 'Newsletter feeds'].map(item => (
                  <div key={item} className="flex items-center gap-1.5 text-xs text-text-secondary mb-1">
                    <Check size={12} className="text-green-600 flex-shrink-0" /> {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Automation toggles */}
          <div className="bg-surface rounded-2xl p-5 border border-border-default">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-4">Automation Settings</p>
            <div className="space-y-3">
              {AUTOMATIONS.map(a => (
                <label key={a.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={automations[a.key as keyof typeof automations]}
                    onChange={() => toggleAutomation(a.key)}
                    className="w-4 h-4 accent-brand rounded"
                  />
                  <span className="text-sm text-text-primary">{a.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sample listings */}
          <div className="bg-surface rounded-2xl p-5 border border-border-default">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-4">
              {hasBrief ? 'Listings we would show you' : 'Example matches'}
            </p>
            <div className="space-y-3">
              {sampleListings.map(l => (
                <div key={l.location} className="text-sm">
                  <span className="font-bold">{l.price}</span>
                  <span className="text-text-secondary"> · {l.location}</span>
                  <p className="text-xs text-text-muted">{l.spec}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-text-muted mt-3 italic">
              Real listings will appear once your brief is active.
            </p>
          </div>

        </div>
      </div>
    </form>
  )
}
