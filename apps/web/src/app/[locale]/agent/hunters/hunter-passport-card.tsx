'use client'

import { useTransition } from 'react'
import { useLocale } from 'next-intl'
import { ShieldCheck, Check } from 'lucide-react'
import { disconnectHunterAction } from './actions'
import { dateLocaleFromLocale } from '@/lib/country-config'

interface HunterPassport {
  assignmentId: string
  status: string
  dataScope: string
  connectedAt: string | null
  hunterName: string | null
  hunterEmail: string
  intent: string | null
  budgetMin: number | null
  budgetMax: number | null
  targetAreas: string[] | null
  propertyTypes: string[] | null
  minBedrooms: number | null
  mustHaves: string[] | null
  financeStatus: string | null
  timeline: string | null
  hasPassport: boolean
}

const FINANCE_LABELS: Record<string, { label: string; cls: string }> = {
  cash:              { label: 'Cash-Käufer', cls: 'bg-brand-solid-bg text-brand-badge-text' },
  mortgage_approved: { label: 'Hypothek (Zusage)', cls: 'bg-[#DCFCE7] text-[#166534]' },
  mortgage_pending:  { label: 'Hypothek (laufend)', cls: 'bg-brand-solid-bg text-brand-badge-text' },
  not_specified:     { label: 'Nicht angegeben', cls: 'bg-[#F1F5F9] text-[#64748B]' },
}

const PROP_LABELS: Record<string, string> = {
  flat: 'Wohnung', terraced: 'Reihenhaus', 'semi-detached': 'DHH',
  detached: 'Freistehendes', new_build: 'Neubau', period: 'Altbau',
}

export function HunterPassportCard({ passport }: { passport: HunterPassport }) {
  const [isPending, startTransition] = useTransition()
  const locale = useLocale()
  const dateLocale = dateLocaleFromLocale(locale)

  const name = passport.hunterName ?? passport.hunterEmail
  const finance = passport.financeStatus ? FINANCE_LABELS[passport.financeStatus] : null
  const budgetStr = passport.budgetMax
    ? `bis €${Math.round(passport.budgetMax / 100).toLocaleString(dateLocale)}`
    : null
  const types = passport.propertyTypes?.map(t => PROP_LABELS[t] ?? t) ?? []

  return (
    <div className="bg-surface rounded-2xl border border-border-default overflow-hidden">

      {/* Passport card header — dark gradient */}
      <div
        className="p-5 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F1117 0%, #1C1F2E 100%)' }}
      >
        <div
          className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
          style={{ background: 'rgba(255,212,0,0.08)' }}
        />
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 text-[0.6rem] font-black uppercase tracking-widest text-brand">
            <ShieldCheck size={14} />
            Home Passport
          </div>
          {passport.hasPassport ? (
            <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1"
              style={{ color: '#4ADE80', background: 'rgba(74,222,128,0.12)', borderColor: 'rgba(74,222,128,0.25)' }}>
              <Check size={10} />
              Aktiv
            </span>
          ) : (
            <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full border"
              style={{ color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.12)' }}>
              Kein Passport
            </span>
          )}
        </div>

        <p className="text-white font-extrabold text-base tracking-tight mb-3">{name}</p>

        {passport.hasPassport ? (
          <div className="space-y-1.5">
            {passport.intent && (
              <div className="flex gap-2 text-xs">
                <span className="text-[rgba(255,255,255,0.38)] uppercase font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">Intent</span>
                <span className="text-[rgba(255,255,255,0.87)] font-bold capitalize">{passport.intent === 'buy' ? 'Kaufen' : 'Mieten'}</span>
              </div>
            )}
            {budgetStr && (
              <div className="flex gap-2 text-xs">
                <span className="text-[rgba(255,255,255,0.38)] uppercase font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">Budget</span>
                <span className="text-[rgba(255,255,255,0.87)] font-bold">{budgetStr}</span>
              </div>
            )}
            {(passport.targetAreas?.length ?? 0) > 0 && (
              <div className="flex gap-2 text-xs">
                <span className="text-[rgba(255,255,255,0.38)] uppercase font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">Gebiete</span>
                <span className="text-[rgba(255,255,255,0.87)] font-bold">
                  {passport.targetAreas!.slice(0, 3).join(' · ')}{passport.targetAreas!.length > 3 ? ' …' : ''}
                </span>
              </div>
            )}
            {types.length > 0 && (
              <div className="flex gap-2 text-xs">
                <span className="text-[rgba(255,255,255,0.38)] uppercase font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">Typ</span>
                <span className="text-[rgba(255,255,255,0.87)] font-bold">{types.join(' · ')}</span>
              </div>
            )}
            {passport.minBedrooms != null && (
              <div className="flex gap-2 text-xs">
                <span className="text-[rgba(255,255,255,0.38)] uppercase font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">Zimmer</span>
                <span className="text-[rgba(255,255,255,0.87)] font-bold">{passport.minBedrooms}+</span>
              </div>
            )}
            {finance && (
              <div className="flex gap-2 text-xs items-center">
                <span className="text-[rgba(255,255,255,0.38)] uppercase font-bold text-[0.6rem] w-14 flex-shrink-0">Finanzen</span>
                <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${finance.cls}`}>{finance.label}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[rgba(255,255,255,0.38)] text-xs">Käufer hat noch keinen Passport erstellt.</p>
        )}
      </div>

      {/* Must-haves */}
      {(passport.mustHaves?.length ?? 0) > 0 && (
        <div className="px-5 py-4 border-t border-border-default">
          <p className="text-[0.6rem] font-bold uppercase tracking-wide text-text-secondary mb-2">Must-haves</p>
          <div className="flex flex-wrap gap-1.5">
            {passport.mustHaves!.map(m => (
              <span key={m} className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#DCFCE7] text-[#166534]">{m}</span>
            ))}
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="px-5 py-4 border-t border-border-default flex items-center justify-between gap-3 flex-wrap">
        <div className="text-xs text-text-muted">
          {passport.connectedAt
            ? `Verbunden seit ${new Date(passport.connectedAt).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' })}`
            : 'Verbindungszeit unbekannt'}
        </div>
        <button
          onClick={() => startTransition(async () => { await disconnectHunterAction(passport.assignmentId) })}
          disabled={isPending}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border-default text-text-secondary hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
        >
          Verbindung trennen
        </button>
      </div>
    </div>
  )
}
