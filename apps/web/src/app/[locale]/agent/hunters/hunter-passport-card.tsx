'use client'

import { useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
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

const FINANCE_STYLES: Record<string, string> = {
  cash:              'bg-brand-solid-bg text-brand-badge-text',
  mortgage_approved: 'bg-[#DCFCE7] text-[#166534]',
  mortgage_pending:  'bg-brand-solid-bg text-brand-badge-text',
  not_specified:     'bg-[#F1F5F9] text-[#64748B]',
}

export function HunterPassportCard({ passport }: { passport: HunterPassport }) {
  const [isPending, startTransition] = useTransition()
  const locale = useLocale()
  const t = useTranslations('agentPassport')
  const dateLocale = dateLocaleFromLocale(locale)

  const name = passport.hunterName ?? passport.hunterEmail
  const financeCls = passport.financeStatus ? FINANCE_STYLES[passport.financeStatus] : null
  const financeLabel = passport.financeStatus ? t(`finance_${passport.financeStatus}`) : null
  const budgetStr = passport.budgetMax
    ? t('budgetUpTo', { amount: Math.round(passport.budgetMax / 100).toLocaleString(dateLocale) })
    : null
  const types = passport.propertyTypes?.map(pt => t(`prop_${pt}`)) ?? []

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
            {t('homePassport')}
          </div>
          {passport.hasPassport ? (
            <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1"
              style={{ color: '#4ADE80', background: 'rgba(74,222,128,0.12)', borderColor: 'rgba(74,222,128,0.25)' }}>
              <Check size={10} />
              {t('active')}
            </span>
          ) : (
            <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full border"
              style={{ color: 'rgba(255,255,255,0.4)', borderColor: 'rgba(255,255,255,0.12)' }}>
              {t('noPassport')}
            </span>
          )}
        </div>

        <p className="text-white font-extrabold text-base tracking-tight mb-3">{name}</p>

        {passport.hasPassport ? (
          <div className="space-y-1.5">
            {passport.intent && (
              <div className="flex gap-2 text-xs">
                <span className="text-[rgba(255,255,255,0.38)] uppercase font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">{t('intentLabel')}</span>
                <span className="text-[rgba(255,255,255,0.87)] font-bold capitalize">{passport.intent === 'buy' ? t('intentBuy') : t('intentRent')}</span>
              </div>
            )}
            {budgetStr && (
              <div className="flex gap-2 text-xs">
                <span className="text-[rgba(255,255,255,0.38)] uppercase font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">{t('budgetLabel')}</span>
                <span className="text-[rgba(255,255,255,0.87)] font-bold">{budgetStr}</span>
              </div>
            )}
            {(passport.targetAreas?.length ?? 0) > 0 && (
              <div className="flex gap-2 text-xs">
                <span className="text-[rgba(255,255,255,0.38)] uppercase font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">{t('areasLabel')}</span>
                <span className="text-[rgba(255,255,255,0.87)] font-bold">
                  {passport.targetAreas!.slice(0, 3).join(' \u00b7 ')}{passport.targetAreas!.length > 3 ? ' \u2026' : ''}
                </span>
              </div>
            )}
            {types.length > 0 && (
              <div className="flex gap-2 text-xs">
                <span className="text-[rgba(255,255,255,0.38)] uppercase font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">{t('typeLabel')}</span>
                <span className="text-[rgba(255,255,255,0.87)] font-bold">{types.join(' \u00b7 ')}</span>
              </div>
            )}
            {passport.minBedrooms != null && (
              <div className="flex gap-2 text-xs">
                <span className="text-[rgba(255,255,255,0.38)] uppercase font-bold text-[0.6rem] w-14 flex-shrink-0 mt-0.5">{t('bedroomsLabel')}</span>
                <span className="text-[rgba(255,255,255,0.87)] font-bold">{passport.minBedrooms}+</span>
              </div>
            )}
            {financeCls && financeLabel && (
              <div className="flex gap-2 text-xs items-center">
                <span className="text-[rgba(255,255,255,0.38)] uppercase font-bold text-[0.6rem] w-14 flex-shrink-0">{t('financeLabel')}</span>
                <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${financeCls}`}>{financeLabel}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[rgba(255,255,255,0.38)] text-xs">{t('noPassportYet')}</p>
        )}
      </div>

      {/* Must-haves */}
      {(passport.mustHaves?.length ?? 0) > 0 && (
        <div className="px-5 py-4 border-t border-border-default">
          <p className="text-[0.6rem] font-bold uppercase tracking-wide text-text-secondary mb-2">{t('mustHaves')}</p>
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
            ? t('connectedSince', { date: new Date(passport.connectedAt).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short', year: 'numeric' }) })
            : t('connectionTimeUnknown')}
        </div>
        <button
          onClick={() => startTransition(async () => { await disconnectHunterAction(passport.assignmentId) })}
          disabled={isPending}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border-default text-text-secondary hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
        >
          {t('disconnect')}
        </button>
      </div>
    </div>
  )
}
