'use client'

import { useState, useTransition } from 'react'
import { Check, CheckCircle2, Banknote, Clock, Minus, Home } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useAuthAction } from '@/lib/use-auth-action'
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

interface SampleAgent {
  name: string
  postcode: string
  focus: string
  services: string
  address: string
}

interface Props {
  profile: PassportProfile | null
  userName: string | null
  sampleAgents?: SampleAgent[]
}

const AREA_KEYS = [
  { value: 'East London', labelKey: 'areaEastLondon' },
  { value: 'North London', labelKey: 'areaNorthLondon' },
  { value: 'South East London', labelKey: 'areaSouthEastLondon' },
  { value: 'Zone 2', labelKey: 'areaZone2' },
  { value: 'Zone 3', labelKey: 'areaZone3' },
  { value: 'West London', labelKey: 'areaWestLondon' },
  { value: 'South West London', labelKey: 'areaSouthWestLondon' },
]
const PROPERTY_TYPE_KEYS: { value: string; labelKey: string }[] = [
  { value: 'flat', labelKey: 'typeFlat' },
  { value: 'terraced', labelKey: 'typeTerraced' },
  { value: 'semi-detached', labelKey: 'typeSemiDetached' },
  { value: 'detached', labelKey: 'typeDetached' },
  { value: 'new_build', labelKey: 'typeNewBuild' },
  { value: 'period', labelKey: 'typePeriod' },
]
const BEDROOM_KEYS = [
  { value: 0, labelKey: 'bedStudio' },
  { value: 1, labelKey: 'bed1' },
  { value: 2, labelKey: 'bed2' },
  { value: 3, labelKey: 'bed3' },
  { value: 4, labelKey: 'bed4Plus' },
]
const MUST_HAVE_KEYS = [
  { value: 'Balcony', labelKey: 'mustBalcony' },
  { value: 'Near station', labelKey: 'mustNearStation' },
  { value: 'Garden', labelKey: 'mustGarden' },
  { value: 'Parking', labelKey: 'mustParking' },
  { value: 'EV charging', labelKey: 'mustEvCharging' },
  { value: 'Period features', labelKey: 'mustPeriodFeatures' },
  { value: 'Open plan', labelKey: 'mustOpenPlan' },
  { value: 'Guest WC', labelKey: 'mustGuestWc' },
  { value: 'Storage', labelKey: 'mustStorage' },
  { value: 'Quiet street', labelKey: 'mustQuietStreet' },
]
const DEALBREAKER_KEYS = [
  { value: 'No auctions', labelKey: 'dealNoAuctions' },
  { value: 'No retirement homes', labelKey: 'dealNoRetirement' },
  { value: 'No ground floor', labelKey: 'dealNoGroundFloor' },
  { value: 'No top floor without lift', labelKey: 'dealNoTopFloor' },
  { value: 'No shared ownership', labelKey: 'dealNoSharedOwnership' },
  { value: 'No ex-social', labelKey: 'dealNoExSocial' },
  { value: 'No estate-agency only', labelKey: 'dealNoEstateOnly' },
]
const FINANCE_OPTION_KEYS = [
  { value: 'not_specified', labelKey: 'finNotSpecified' },
  { value: 'mortgage_pending', labelKey: 'finMortgagePending' },
  { value: 'mortgage_approved', labelKey: 'finMortgageApproved' },
  { value: 'cash', labelKey: 'finCash' },
]
const TIMELINE_OPTION_KEYS = [
  { value: 'asap', labelKey: 'timeAsap' },
  { value: '3m', labelKey: 'time3m' },
  { value: '6m', labelKey: 'time6m' },
  { value: '1y', labelKey: 'time1y' },
  { value: 'flexible', labelKey: 'timeFlexible' },
]
const AUTOMATION_KEYS = [
  { key: 'matchPortals', labelKey: 'automationMatchPortals' },
  { key: 'connectAgents', labelKey: 'automationConnectAgents' },
  { key: 'subscribeNewsletters', labelKey: 'automationSubscribeNewsletters' },
  { key: 'filterAuto', labelKey: 'automationFilterAuto' },
  { key: 'notifyMatches', labelKey: 'automationNotifyMatches' },
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

function FinanceBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const styles: Record<string, { cls: string; labelKey: string; icon: React.ReactNode }> = {
    cash:              { cls: 'bg-brand-solid-bg text-brand-badge-text',    labelKey: 'areaCashBuyer',             icon: <Banknote size={12} /> },
    mortgage_approved: { cls: 'bg-[rgba(74,222,128,0.15)] text-[#4ADE80]', labelKey: 'areaMortgageApproved', icon: <Check size={12} /> },
    mortgage_pending:  { cls: 'bg-[rgba(251,191,36,0.15)] text-[#FBBF24]', labelKey: 'areaMortgagePending',  icon: <Clock size={12} /> },
    not_specified:     { cls: 'bg-[rgba(255,255,255,0.07)] text-[rgba(255,255,255,0.4)]', labelKey: 'areaFinanceNotSpecified', icon: <Minus size={12} /> },
  }
  const s = (styles[status] ?? styles.not_specified) as { cls: string; labelKey: string; icon: React.ReactNode }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${s.cls}`}>
      {s.icon} {t(s.labelKey)}
    </span>
  )
}

export function PassportForm({ profile, userName, sampleAgents = [] }: Props) {
  const t = useTranslations('hunterPassport')
  const [state, setState] = useState<{ success?: boolean; error?: string }>({})
  const [isPending, startTransition] = useTransition()
  const { handleAuthRequired } = useAuthAction()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await savePassportAction({}, formData)
      if (handleAuthRequired(result)) return
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

  const previewBeds = BEDROOM_KEYS.find(b => b.value === minBeds)
    ? t(BEDROOM_KEYS.find(b => b.value === minBeds)!.labelKey)
    : `${minBeds}+`
  const previewTypes = propertyTypes.map(v => {
    const found = PROPERTY_TYPE_KEYS.find(p => p.value === v)
    return found ? t(found.labelKey) : v
  })
  const previewTimeline = TIMELINE_OPTION_KEYS.find(o => o.value === timeline)
    ? t(TIMELINE_OPTION_KEYS.find(o => o.value === timeline)!.labelKey)
    : undefined
  const hasPassport = areas.length > 0 || budgetMax !== '' || propertyTypes.length > 0
  const isVerified = financeStatus !== 'not_specified'

  const displayAgents = sampleAgents.length > 0 ? sampleAgents : [
    { name: 'Foxtons', postcode: 'SW11', focus: 'both', services: 'Sales, Lettings', address: 'Battersea' },
    { name: 'Chestertons', postcode: 'E14', focus: 'sale', services: 'Residential Sales', address: 'Canary Wharf' },
    { name: 'Barnard Marcus', postcode: 'SE1', focus: 'rent', services: 'Lettings', address: 'Southwark' },
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
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-sm text-green-800 font-medium flex items-center gap-2">
          <CheckCircle2 size={16} /> {t('savedSuccess')}
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
              {AREA_KEYS.map(a => (
                <Chip key={a.value} label={t(a.labelKey)} active={areas.includes(a.value)} onClick={() => setAreas(toggle(areas, a.value))} />
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
                  {v === 'buy' ? t('labelBuy') : t('labelRent')}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  {t('labelMin')} {intent === 'rent' ? t('rentSuffix') : t('buySuffix')}
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
                  {t('labelMax')} {intent === 'rent' ? t('rentSuffix') : t('buySuffix')}
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
              {PROPERTY_TYPE_KEYS.map(pt => (
                <Chip key={pt.value} label={t(pt.labelKey)} active={propertyTypes.includes(pt.value)} onClick={() => setPropertyTypes(toggle(propertyTypes, pt.value))} />
              ))}
            </div>
            <p className="text-xs font-semibold text-text-secondary mb-3">{t('labelMinBedrooms')}</p>
            <div className="flex flex-wrap gap-2">
              {BEDROOM_KEYS.map(b => (
                <Chip key={b.value} label={t(b.labelKey)} active={minBeds === b.value} onClick={() => setMinBeds(b.value)} />
              ))}
            </div>
          </div>

          {/* Step 4 — Must-haves + dealbreakers */}
          <div className="bg-surface rounded-2xl p-6 border border-border-default">
            <StepHeader n="4" title={t('stepPreferences')} />
            <p className="text-xs font-semibold text-text-secondary mb-3">{t('labelMustHaves')}</p>
            <div className="flex flex-wrap gap-2 mb-5">
              {MUST_HAVE_KEYS.map(m => (
                <Chip key={m.value} label={t(m.labelKey)} active={mustHaves.includes(m.value)} onClick={() => setMustHaves(toggle(mustHaves, m.value))} />
              ))}
            </div>
            <p className="text-xs font-semibold text-text-secondary mb-3">{t('labelDealbreakers')}</p>
            <div className="flex flex-wrap gap-2">
              {DEALBREAKER_KEYS.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDealbreakers(toggle(dealbreakers, d.value))}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors select-none ${
                    dealbreakers.includes(d.value)
                      ? 'bg-red-50 border-red-300 text-red-700'
                      : 'bg-surface border-border-default text-text-secondary hover:border-[#C8CCD6]'
                  }`}
                >
                  {t(d.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Step 5 — Timing */}
          <div className="bg-surface rounded-2xl p-6 border border-border-default">
            <StepHeader n="5" title={t('stepTiming')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">{t('labelFinanceStatus')}</label>
                <select
                  value={financeStatus}
                  onChange={e => setFinanceStatus(e.target.value)}
                  className="w-full border border-border-default rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-surface"
                >
                  {FINANCE_OPTION_KEYS.map(o => <option key={o.value} value={o.value}>{t(o.labelKey)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">{t('labelTimeline')}</label>
                <select
                  value={timeline}
                  onChange={e => setTimeline(e.target.value)}
                  className="w-full border border-border-default rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand bg-surface"
                >
                  {TIMELINE_OPTION_KEYS.map(o => <option key={o.value} value={o.value}>{t(o.labelKey)}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-brand hover:bg-brand-hover disabled:opacity-50 text-text-primary font-bold py-4 rounded-2xl text-base transition-colors shadow-sm"
          >
            {isPending ? t('savingButton') : t('saveButton')}
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
              <span className="text-[0.6rem] font-black uppercase tracking-widest text-brand flex items-center gap-1">
                <Home size={14} /> {t('cardTitle')}
              </span>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wide border"
                  style={{ color: '#4ADE80', background: 'rgba(74,222,128,0.12)', borderColor: 'rgba(74,222,128,0.25)' }}>
                  <Check size={10} /> {t('labelVerified')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wide border"
                  style={{ color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.12)' }}>
                  {t('labelUnverified')}
                </span>
              )}
            </div>

            {/* Name */}
            <p className="text-white font-extrabold text-base tracking-tight mb-4">
              {userName ?? t('labelYourName')}
            </p>

            {/* Passport rows */}
            <div className="space-y-2">
              <div className="flex gap-2 text-xs">
                <span className="text-[rgba(255,255,255,0.38)] uppercase tracking-wider font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">{t('labelIntent')}</span>
                <span className="text-[rgba(255,255,255,0.87)] font-bold capitalize">{intent}</span>
              </div>
              {(budgetMin !== '' || budgetMax !== '') && (
                <div className="flex gap-2 text-xs">
                  <span className="text-[rgba(255,255,255,0.38)] uppercase tracking-wider font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">{t('labelBudgetRow')}</span>
                  <span className="text-[rgba(255,255,255,0.87)] font-bold">
                    {budgetMin !== '' ? `£${Number(budgetMin).toLocaleString()}` : '—'}
                    {' – '}
                    {budgetMax !== '' ? `£${Number(budgetMax).toLocaleString()}` : '—'}
                  </span>
                </div>
              )}
              {areas.length > 0 && (
                <div className="flex gap-2 text-xs">
                  <span className="text-[rgba(255,255,255,0.38)] uppercase tracking-wider font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">{t('labelAreas')}</span>
                  <span className="text-[rgba(255,255,255,0.87)] font-bold">{areas.slice(0, 3).join(' · ')}{areas.length > 3 ? ' …' : ''}</span>
                </div>
              )}
              {propertyTypes.length > 0 && (
                <div className="flex gap-2 text-xs">
                  <span className="text-[rgba(255,255,255,0.38)] uppercase tracking-wider font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">{t('labelTypeRow')}</span>
                  <span className="text-[rgba(255,255,255,0.87)] font-bold">{previewTypes.join(' · ')}</span>
                </div>
              )}
              <div className="flex gap-2 text-xs">
                <span className="text-[rgba(255,255,255,0.38)] uppercase tracking-wider font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">{t('labelBeds')}</span>
                <span className="text-[rgba(255,255,255,0.87)] font-bold">{previewBeds}+</span>
              </div>
              <div className="flex gap-2 text-xs items-start">
                <span className="text-[rgba(255,255,255,0.38)] uppercase tracking-wider font-bold text-[0.6rem] w-14 flex-shrink-0 mt-1">{t('labelFinance')}</span>
                <FinanceBadge status={financeStatus} t={t} />
              </div>
              {timeline !== 'flexible' && (
                <div className="flex gap-2 text-xs">
                  <span className="text-[rgba(255,255,255,0.38)] uppercase tracking-wider font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">{t('labelTimelineRow')}</span>
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
            <p className="text-xs font-semibold text-text-secondary mb-0.5">
              {t('agentsWithAccess', { count: 0 })}
            </p>
            <p className="text-[0.68rem] text-text-muted">{t('agentApprovalHint')}</p>
          </div>

          {/* Automation toggles */}
          <div className="bg-surface rounded-2xl p-5 border border-border-default">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-4">{t('automationSettings')}</p>
            <div className="space-y-3">
              {AUTOMATION_KEYS.map(a => (
                <label key={a.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={automations[a.key as keyof typeof automations]}
                    onChange={() => toggleAutomation(a.key)}
                    className="w-4 h-4 accent-brand rounded"
                  />
                  <span className="text-sm text-text-primary">{t(a.labelKey)}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 bg-[#F0FDF4] rounded-lg p-3 border border-[#BBF7D0]">
              <p className="text-xs text-[#166534] leading-relaxed">
                <span className="font-bold">{t('noSpamTitle')}</span> {t('noSpamBody')}
              </p>
            </div>
          </div>

          {/* Agent matches */}
          <div className="bg-surface rounded-2xl p-5 border border-border-default">
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-4">
              {hasPassport ? t('agentsInArea') : t('exampleAgentMatches')}
            </p>
            <div className="space-y-3">
              {displayAgents.slice(0, 3).map(a => (
                <a key={a.name + a.postcode} href={`/en/agents?postcode=${a.postcode}`} className="block hover:bg-hover-bg rounded-lg p-2 -mx-2 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-bold text-sm">{a.name}</span>
                      <p className="text-xs text-text-secondary">{a.address || a.postcode} · {a.services}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      a.focus === 'both' ? 'bg-[#DBEAFE] text-[#1E40AF]'
                      : a.focus === 'rent' ? 'bg-[#FEF3C7] text-[#92400E]'
                      : 'bg-[#DCFCE7] text-[#166534]'
                    }`}>
                      {a.focus === 'both' ? t('focusBoth') : a.focus === 'rent' ? t('focusRent') : t('focusSale')}
                    </span>
                  </div>
                </a>
              ))}
            </div>
            {sampleAgents.length > 0 && (
              <a href="/en/agents" className="block text-xs text-brand font-semibold mt-3 hover:underline">
                {t('viewAllAgents')}
              </a>
            )}
          </div>

        </div>
      </div>
    </form>
  )
}
