'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  ShieldCheck, Check, Home, Banknote, Clock, Minus, X,
  ChevronLeft, BadgeCheck, FileCheck, UserCheck, KeyRound,
} from 'lucide-react'
import { HunterPassportIntake } from '@/components/intake/hunter-passport-intake'
import { findTagBySlug, getTagLabel, type HunterTagPreference } from '@/lib/property-tags'

// ─────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────

interface SampleAgent {
  name: string
  postcode: string
  focus: string
  services: string
  address: string
}

interface ReadinessBadge {
  key: string
  label: string
  icon: React.ReactNode
  verified: boolean
  ctaLabel: string
  ctaAction: () => void
}

interface PassportPageClientProps {
  userId: string
  profile?: Record<string, unknown> | null
  userName?: string | null
  translations: Record<string, string>
  sampleAgents?: SampleAgent[]
  countryCode: string
  locale: string
  currency: string
  regions: Array<{ prefix: string; label: string; range?: string }>
  readiness?: {
    mortgage_verified: boolean
    identity_verified: boolean
    profile_complete: boolean
    renter_ready: boolean
  }
}

// ─────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────

function FinanceBadge({ status }: { status: string }) {
  const styles: Record<string, { cls: string; label: string; icon: React.ReactNode }> = {
    cash:              { cls: 'bg-brand-solid-bg text-brand-badge-text',    label: 'Cash buyer',             icon: <Banknote size={12} /> },
    mortgage_approved: { cls: 'bg-[rgba(74,222,128,0.15)] text-[#4ADE80]', label: 'Mortgage in principle', icon: <Check size={12} /> },
    mortgage_pending:  { cls: 'bg-[rgba(251,191,36,0.15)] text-[#FBBF24]', label: 'Mortgage in progress',  icon: <Clock size={12} /> },
    not_specified:     { cls: 'bg-[rgba(255,255,255,0.07)] text-[rgba(255,255,255,0.4)]', label: 'Finance not specified', icon: <Minus size={12} /> },
  }
  const s = (styles[status] ?? styles.not_specified) as { cls: string; label: string; icon: React.ReactNode }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  )
}

function ReadinessBadgeRow({ badge }: { badge: ReadinessBadge }) {
  return (
    <div className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-all ${
      badge.verified
        ? 'border-[rgba(74,222,128,0.25)] bg-[rgba(74,222,128,0.06)]'
        : 'border-white/[0.08] bg-white/[0.02]'
    }`}>
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
          badge.verified ? 'bg-[rgba(74,222,128,0.15)] text-[#4ADE80]' : 'bg-white/[0.06] text-white/20'
        }`}>
          {badge.icon}
        </div>
        <span className={`text-xs font-semibold ${badge.verified ? 'text-white/90' : 'text-white/40'}`}>
          {badge.label}
        </span>
      </div>
      {badge.verified ? (
        <Check size={14} className="text-[#4ADE80] flex-shrink-0" />
      ) : (
        <button
          onClick={badge.ctaAction}
          className="text-[10px] font-bold text-[#D4764E] hover:text-[#BF6840] whitespace-nowrap flex-shrink-0"
        >
          {badge.ctaLabel}
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────

export function PassportPageClient({
  userId,
  profile,
  userName,
  translations,
  sampleAgents = [],
  countryCode,
  locale,
  currency,
  regions,
  readiness,
}: PassportPageClientProps) {
  // Live passport state — synced from chat answers
  const [passportData, setPassportData] = useState<Record<string, unknown>>(
    profile ? { ...profile } : {}
  )
  // Mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handlePassportUpdate = useCallback((field: string, value: unknown) => {
    setPassportData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleBatchUpdate = useCallback((data: Record<string, unknown>) => {
    setPassportData(prev => ({ ...prev, ...data }))
  }, [])

  // Close drawer on escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Prevent body scroll when drawer is open on mobile
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  // Derived display values
  const intent = (passportData.intent as string) ?? ''
  const areas = (passportData.target_areas as string[]) ?? []
  const budgetMin = passportData.budget_min as number | undefined
  const budgetMax = passportData.budget_max as number | undefined
  const propertyTypes = (passportData.property_types as string[]) ?? []
  const minBeds = passportData.min_bedrooms as number | string | undefined
  const financeStatus = (passportData.finance_status as string) ?? 'not_specified'
  const timeline = (passportData.timeline as string) ?? ''
  const mustHaves = (passportData.must_haves as string[]) ?? []
  const dealbreakers = (passportData.dealbreakers as string[]) ?? []
  const preferenceTags = (passportData.preference_tags as HunterTagPreference[]) ?? []

  const isVerified = financeStatus !== 'not_specified'
  const hasData = areas.length > 0 || budgetMax || propertyTypes.length > 0

  // Format currency display
  const currencySymbol = currency === 'GBP' ? '£' : '€'
  const formatBudget = (val: number | undefined) => {
    if (!val) return '—'
    return `${currencySymbol}${Number(val).toLocaleString()}`
  }

  // Map area values back to labels using regions
  const areaLabels = areas.map(a => {
    const region = regions.find(r => r.prefix.toLowerCase() === a.toLowerCase() || r.label.toLowerCase() === a.toLowerCase())
    return region?.label ?? a
  })

  // Bedroom label
  const bedsLabel = (() => {
    if (minBeds === undefined || minBeds === null) return '—'
    if (minBeds === 0 || minBeds === 'studio') return 'Studio'
    if (minBeds === '4plus' || (typeof minBeds === 'number' && minBeds >= 4)) return '4+'
    return `${minBeds}`
  })()

  // Timeline label
  const timelineLabels: Record<string, string> = {
    asap: translations.opt_asap ?? 'ASAP',
    '3m': translations.opt_3m ?? '3 months',
    '6m': translations.opt_6m ?? '3–6 months',
    '1y': translations.opt_1y ?? '1 year',
    flexible: translations.opt_flexible ?? 'Flexible',
  }

  // Readiness badges
  const r = readiness ?? { mortgage_verified: false, identity_verified: false, profile_complete: false, renter_ready: false }
  const badges: ReadinessBadge[] = [
    { key: 'mortgage', label: translations.badge_mortgage ?? 'Mortgage in Principle', icon: <Banknote size={12} />, verified: r.mortgage_verified, ctaLabel: translations.badge_verify ?? 'Verify', ctaAction: () => {} },
    { key: 'identity', label: translations.badge_identity ?? 'Identity Verified', icon: <UserCheck size={12} />, verified: r.identity_verified, ctaLabel: translations.badge_verify ?? 'Verify', ctaAction: () => {} },
    { key: 'profile', label: translations.badge_profile ?? 'Profile Complete', icon: <FileCheck size={12} />, verified: r.profile_complete, ctaLabel: translations.badge_complete ?? 'Complete', ctaAction: () => {} },
    { key: 'renter', label: translations.badge_renter ?? 'Renter Ready', icon: <KeyRound size={12} />, verified: r.renter_ready, ctaLabel: translations.badge_verify ?? 'Verify', ctaAction: () => {} },
  ]

  const visibleBadges = badges.filter(b => {
    if (b.key === 'renter' && intent === 'buy') return false
    if (b.key === 'mortgage' && intent === 'rent') return false
    return true
  })

  // Count filled passport fields for the mobile pill
  const filledCount = [intent, budgetMax, areas.length > 0, propertyTypes.length > 0, minBeds, financeStatus !== 'not_specified'].filter(Boolean).length

  // ── Passport panel content (shared between desktop sidebar + mobile drawer) ──
  const passportPanelContent = (
    <>
      {/* Passport card */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden mb-5"
        style={{ background: 'linear-gradient(135deg, #0F1117 0%, #1C1F2E 100%)' }}
      >
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none" style={{ background: 'rgba(212,118,78,0.1)' }} />

        <div className="flex items-center justify-between mb-4">
          <span className="text-[0.6rem] font-black uppercase tracking-widest text-[#D4764E] flex items-center gap-1">
            <Home size={14} /> {translations.passportTitle ?? 'Home Passport'}
          </span>
          {isVerified ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wide border"
              style={{ color: '#4ADE80', background: 'rgba(74,222,128,0.12)', borderColor: 'rgba(74,222,128,0.25)' }}>
              <Check size={10} /> Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wide border"
              style={{ color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.12)' }}>
              Unverified
            </span>
          )}
        </div>

        <p className="text-white font-extrabold text-base tracking-tight mb-4">
          {userName ?? translations.yourName ?? 'Your Name'}
        </p>

        <div className="space-y-2">
          {intent && (
            <PassportRow label="Intent" value={intent === 'buy' ? (translations.opt_buy ?? 'Buy') : intent === 'rent' ? (translations.opt_rent ?? 'Rent') : intent} />
          )}
          {(budgetMin || budgetMax) && (
            <PassportRow label="Budget" value={`${formatBudget(budgetMin)} – ${formatBudget(budgetMax)}`} />
          )}
          {areas.length > 0 && (
            <PassportRow label="Areas" value={areaLabels.slice(0, 3).join(' · ') + (areaLabels.length > 3 ? ' …' : '')} />
          )}
          {propertyTypes.length > 0 && (
            <PassportRow label="Type" value={propertyTypes.map(t => translations[`opt_${t}`] ?? t).join(' · ')} />
          )}
          {minBeds !== undefined && minBeds !== null && (
            <PassportRow label="Beds" value={`${bedsLabel}+`} />
          )}
          <div className="flex gap-2 text-xs items-start">
            <span className="text-[rgba(255,255,255,0.38)] uppercase tracking-wider font-bold text-[0.6rem] w-14 flex-shrink-0 mt-1">Finance</span>
            <FinanceBadge status={financeStatus} />
          </div>
          {timeline && timeline !== 'flexible' && (
            <PassportRow label="Timeline" value={timelineLabels[timeline] ?? timeline} />
          )}
          {mustHaves.length > 0 && !mustHaves.includes('_none') && (
            <PassportRow label="Wants" value={mustHaves.slice(0, 3).map(m => translations[`opt_${m}`] ?? m).join(' · ') + (mustHaves.length > 3 ? ' …' : '')} />
          )}
          {dealbreakers.length > 0 && !dealbreakers.includes('_none') && (
            <PassportRow label="No-go" value={dealbreakers.slice(0, 2).map(d => translations[`opt_${d}`] ?? d).join(' · ') + (dealbreakers.length > 2 ? ' …' : '')} />
          )}
        </div>

        {/* Preference tags */}
        {preferenceTags.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/[0.06]">
            <div className="flex flex-wrap gap-1.5">
              {preferenceTags.slice(0, 8).map(pref => {
                const tag = findTagBySlug(pref.slug)
                const label = tag ? getTagLabel(tag, locale) : pref.slug
                return (
                  <span key={pref.slug} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    pref.sentiment === 'need' ? 'bg-[rgba(74,222,128,0.15)] text-[#4ADE80]'
                    : pref.sentiment === 'dealbreaker' ? 'bg-[rgba(239,68,68,0.15)] text-[#EF4444]'
                    : 'bg-[rgba(212,118,78,0.15)] text-[#D4764E]'
                  }`}>
                    {label}{pref.sentiment === 'need' && ' ★'}{pref.sentiment === 'dealbreaker' && ' ✕'}
                  </span>
                )
              })}
              {preferenceTags.length > 8 && (
                <span className="text-[10px] text-white/30 font-semibold self-center">+{preferenceTags.length - 8} more</span>
              )}
            </div>
          </div>
        )}

        {!hasData && !intent && (
          <div className="text-center py-4">
            <p className="text-white/30 text-xs">Start chatting to fill in your passport</p>
          </div>
        )}
      </div>

      {/* Readiness badges */}
      <div className="mb-5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
          {translations.readinessTitle ?? 'Readiness'}
        </p>
        <div className="rounded-xl p-3 space-y-2" style={{ background: 'linear-gradient(135deg, #0F1117 0%, #1C1F2E 100%)' }}>
          {visibleBadges.map(b => <ReadinessBadgeRow key={b.key} badge={b} />)}
        </div>
      </div>

      {/* Agent access count */}
      <div className="rounded-xl px-4 py-3 border border-dashed border-slate-300 text-center mb-5">
        <p className="text-xs font-semibold text-slate-500 mb-0.5">
          {translations.agentsWithAccess ?? 'Agents with access'}: <span className="text-slate-900 font-bold">0</span>
        </p>
        <p className="text-[0.68rem] text-slate-400">
          {translations.agentsRequestAccess ?? 'Agents request access · You approve'}
        </p>
      </div>

      {/* Sample agent matches */}
      {sampleAgents.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">
            {hasData ? (translations.agentsInArea ?? 'Agents in your area') : (translations.exampleAgents ?? 'Example agent matches')}
          </p>
          <div className="space-y-3">
            {sampleAgents.slice(0, 3).map(a => (
              <a key={a.name + a.postcode} href={`/${locale === 'de' ? '' : 'en/'}agents?postcode=${a.postcode}`} className="block hover:bg-slate-50 rounded-lg p-2 -mx-2 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-sm">{a.name}</span>
                    <p className="text-xs text-slate-500">{a.address || a.postcode} · {a.services}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    a.focus === 'both' ? 'bg-[#DBEAFE] text-[#1E40AF]'
                    : a.focus === 'rent' ? 'bg-[#FEF3C7] text-[#92400E]'
                    : 'bg-[#DCFCE7] text-[#166534]'
                  }`}>
                    {a.focus === 'both' ? 'Sales & Lettings' : a.focus === 'rent' ? 'Lettings' : 'Sales'}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  )

  return (
    <div className="relative h-[calc(100vh-64px)] flex flex-col lg:flex-row overflow-hidden">

      {/* ══════════════════════════════════════════════════════════════
           DESKTOP: Side-by-side layout (lg+)
         ══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block w-[380px] xl:w-[420px] flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50 p-6">
        {passportPanelContent}
      </div>

      {/* ══════════════════════════════════════════════════════════════
           MOBILE: Floating pill button to open passport drawer (<lg)
         ══════════════════════════════════════════════════════════════ */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden fixed top-[72px] left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-full shadow-lg transition-all active:scale-95"
        style={{ background: 'linear-gradient(135deg, #0F1117 0%, #1C1F2E 100%)' }}
      >
        <Home size={14} className="text-[#D4764E]" />
        <span className="text-white text-xs font-bold">
          {hasData ? 'My Passport' : 'View Passport'}
        </span>
        {filledCount > 0 && (
          <span className="bg-[#D4764E] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
            {filledCount}
          </span>
        )}
      </button>

      {/* ══════════════════════════════════════════════════════════════
           MOBILE: Passport drawer (bottom sheet overlay)
         ══════════════════════════════════════════════════════════════ */}
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-2xl bg-slate-50 shadow-2xl flex flex-col animate-drawer-up">
            {/* Handle + close */}
            <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 rounded-full bg-slate-300 mx-auto" />
              </div>
              <span className="text-sm font-bold text-slate-800">
                {translations.passportTitle ?? 'Home Passport'}
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-5 overscroll-contain">
              {passportPanelContent}
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════
           CHAT: Full width on mobile, flex-1 on desktop
         ══════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col h-full">
        <HunterPassportIntake
          userId={userId}
          existingProfile={profile}
          userName={userName}
          translations={translations}
          countryCode={countryCode}
          locale={locale}
          currency={currency}
          regions={regions}
          onFieldUpdate={handlePassportUpdate}
          onBatchUpdate={handleBatchUpdate}
        />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Shared sub-components
// ─────────────────────────────────────────────────────────────────────

function PassportRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-[rgba(255,255,255,0.38)] uppercase tracking-wider font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">
        {label}
      </span>
      <span className="text-[rgba(255,255,255,0.87)] font-bold">{value}</span>
    </div>
  )
}
