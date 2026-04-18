'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

type Tab = 'owner' | 'hunter' | 'agent' | 'partner'

function Check() {
  return <CheckCircle2 size={15} className="text-green-500 flex-shrink-0 mt-0.5" />
}

function FeatureItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-text-on-dark-secondary leading-relaxed">
      <Check />
      {text}
    </li>
  )
}

export function PricingTables() {
  const t = useTranslations('services')
  const [activeTab, setActiveTab] = useState<Tab>('owner')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'owner', label: t('tabOwner') },
    { id: 'hunter', label: t('tabHunter') },
    { id: 'agent', label: t('tabAgent') },
    { id: 'partner', label: t('tabPartner') },
  ]

  return (
    <section className="pb-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-full px-4 py-1.5 mb-4 text-xs font-semibold uppercase tracking-widest text-text-on-dark-muted">
            {t('pricingTableTag')}
          </div>
          <h2 className="text-title-1 text-white mb-3">{t('pricingTableTitle')}</h2>
          <p className="text-text-on-dark-secondary max-w-xl mx-auto">{t('pricingTableSubtitle')}</p>
        </div>

        {/* Tab buttons */}
        <div className="flex justify-center gap-1 mb-10 bg-white/[0.04] rounded-xl p-1 max-w-fit mx-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-brand text-white shadow-md'
                  : 'text-text-on-dark-muted hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OWNER TAB ──────────────────────────────────────── */}
        {activeTab === 'owner' && (
          <div>
            <div className="grid md:grid-cols-3 gap-5">
              {/* Starter */}
              <div className="bg-surface-dark rounded-card-dark border border-white/[0.04] p-6 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-1">{t('ownerStarterName')}</h3>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-3xl font-extrabold text-white">{t('ownerStarterPrice')}</span>
                  <span className="text-sm text-text-on-dark-muted">{t('ownerStarterFreq')}</span>
                </div>
                <p className="text-sm text-text-on-dark-secondary mb-5">{t('ownerStarterDesc')}</p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {(['ownerStarterF1', 'ownerStarterF2', 'ownerStarterF3', 'ownerStarterF4', 'ownerStarterF5', 'ownerStarterF6'] as const).map(k => (
                    <FeatureItem key={k} text={t(k)} />
                  ))}
                </ul>
                <Link
                  href="/owner"
                  className="block text-center bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold px-5 py-3 rounded-lg transition-colors text-sm border border-white/[0.08]"
                >
                  {t('ownerStarterCta')}
                </Link>
              </div>

              {/* Professional (featured) */}
              <div className="bg-surface-dark rounded-card-dark border-2 border-brand/40 p-6 flex flex-col relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">{t('ownerProBadge')}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1 mt-2">{t('ownerProName')}</h3>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-3xl font-extrabold text-brand">{t('ownerProPrice')}</span>
                  <span className="text-sm text-text-on-dark-muted">{t('ownerProFreq')}</span>
                </div>
                <p className="text-sm text-text-on-dark-secondary mb-5">{t('ownerProDesc')}</p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {(['ownerProF1', 'ownerProF2', 'ownerProF3', 'ownerProF4', 'ownerProF5', 'ownerProF6', 'ownerProF7'] as const).map(k => (
                    <FeatureItem key={k} text={t(k)} />
                  ))}
                </ul>
                <Link
                  href="/owner"
                  className="block text-center bg-brand hover:bg-brand-hover text-white font-semibold px-5 py-3 rounded-lg transition-colors text-sm shadow-lg shadow-[#D4764E]/20"
                >
                  {t('ownerProCta')}
                </Link>
              </div>

              {/* Complete */}
              <div className="bg-surface-dark rounded-card-dark border border-white/[0.04] p-6 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-1">{t('ownerCompleteName')}</h3>
                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-3xl font-extrabold text-white">{t('ownerCompletePrice')}</span>
                  <span className="text-sm text-text-on-dark-muted">{t('ownerCompleteFreq')}</span>
                </div>
                <p className="text-sm text-text-on-dark-secondary mb-5">{t('ownerCompleteDesc')}</p>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {(['ownerCompleteF1', 'ownerCompleteF2', 'ownerCompleteF3', 'ownerCompleteF4', 'ownerCompleteF5', 'ownerCompleteF6', 'ownerCompleteF7'] as const).map(k => (
                    <FeatureItem key={k} text={t(k)} />
                  ))}
                </ul>
                <Link
                  href="/owner"
                  className="block text-center bg-white/[0.06] hover:bg-white/[0.12] text-white font-semibold px-5 py-3 rounded-lg transition-colors text-sm border border-white/[0.08]"
                >
                  {t('ownerCompleteCta')}
                </Link>
              </div>
            </div>

            {/* Not sure CTA */}
            <p className="text-sm text-text-on-dark-secondary text-center mt-8">
              {t('ownerNotSure')}{' '}
              <a href="mailto:support@yalla.house" className="text-white font-semibold underline underline-offset-2">
                {t('ownerTalkToUs')}
              </a>{' '}
              {t('ownerTalkSuffix')}
            </p>
          </div>
        )}

        {/* ── HUNTER TAB ─────────────────────────────────────── */}
        {activeTab === 'hunter' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.04] p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-1">{t('hunterName')}</h3>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-3xl font-extrabold text-brand">{t('hunterPrice')}</span>
                <span className="text-sm text-text-on-dark-muted">{t('hunterFreq')}</span>
              </div>
              <p className="text-sm text-text-on-dark-secondary mb-6">{t('hunterDesc')}</p>
              <ul className="space-y-2.5 mb-6">
                {(['hunterF1', 'hunterF2', 'hunterF3', 'hunterF4', 'hunterF5', 'hunterF6'] as const).map(k => (
                  <FeatureItem key={k} text={t(k)} />
                ))}
              </ul>
              <Link
                href="/hunter"
                className="block text-center bg-brand hover:bg-brand-hover text-white font-semibold px-5 py-3 rounded-lg transition-colors text-sm"
              >
                {t('hunterCta')}
              </Link>
            </div>

            {/* Premium coming soon */}
            <div className="mt-5 bg-surface-dark rounded-card-dark border border-white/[0.04] p-6">
              <div className="flex items-center gap-3 mb-3">
                <h4 className="text-sm font-bold text-white">{t('hunterPremiumTitle')}</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand/15 text-brand px-2 py-0.5 rounded-full">
                  {t('hunterPremiumBadge')}
                </span>
              </div>
              <ul className="space-y-1.5">
                {(['hunterPremiumF1', 'hunterPremiumF2', 'hunterPremiumF3', 'hunterPremiumF4'] as const).map(k => (
                  <li key={k} className="text-sm text-text-on-dark-secondary flex items-center gap-2">
                    <ArrowRight size={12} className="text-text-on-dark-muted" />
                    {t(k)}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-text-on-dark-muted mt-3">{t('hunterPremiumNote')}</p>
            </div>
          </div>
        )}

        {/* ── AGENT TAB ──────────────────────────────────────── */}
        {activeTab === 'agent' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.04] p-6 md:p-8">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl font-bold text-white">{t('agentName')}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-brand/15 text-brand px-2 py-0.5 rounded-full">
                  {t('agentBadge')}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-2xl font-extrabold text-white">{t('agentPrice')}</span>
                <span className="text-sm text-text-on-dark-muted">{t('agentFreq')}</span>
              </div>
              <p className="text-sm text-text-on-dark-secondary mb-6">{t('agentDesc')}</p>
              <ul className="space-y-2.5 mb-6">
                {(['agentF1', 'agentF2', 'agentF3', 'agentF4', 'agentF5', 'agentF6', 'agentF7'] as const).map(k => (
                  <FeatureItem key={k} text={t(k)} />
                ))}
              </ul>
              <a
                href="mailto:support@yalla.house?subject=Agent Workspace — Yalla.House"
                className="block text-center bg-brand hover:bg-brand-hover text-white font-semibold px-5 py-3 rounded-lg transition-colors text-sm"
              >
                {t('agentCta')}
              </a>
            </div>
            <p className="text-xs text-text-on-dark-muted text-center mt-4">{t('agentNote')}</p>
          </div>
        )}

        {/* ── PARTNER TAB ────────────────────────────────────── */}
        {activeTab === 'partner' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.04] p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-1">{t('partnerName')}</h3>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-2xl font-extrabold text-brand">{t('partnerPrice')}</span>
                <span className="text-sm text-text-on-dark-muted">{t('partnerFreq')}</span>
              </div>
              <p className="text-sm text-text-on-dark-secondary mb-6">{t('partnerDesc')}</p>
              <ul className="space-y-2.5 mb-6">
                {(['partnerF1', 'partnerF2', 'partnerF3', 'partnerF4', 'partnerF5', 'partnerF6'] as const).map(k => (
                  <FeatureItem key={k} text={t(k)} />
                ))}
              </ul>
              <Link
                href="/partner"
                className="block text-center bg-brand hover:bg-brand-hover text-white font-semibold px-5 py-3 rounded-lg transition-colors text-sm"
              >
                {t('partnerCta')}
              </Link>
            </div>
            <p className="text-xs text-text-on-dark-muted text-center mt-4">{t('partnerNote')}</p>
          </div>
        )}
      </div>
    </section>
  )
}
