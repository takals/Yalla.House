import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import { Share2, Link2, Trophy, Wallet } from 'lucide-react'
import { pageAlternates } from '@/lib/seo'
import { JoinButton } from './join-button'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('referrerJoin')
  return {
    // The locale layout appends "| Yalla.House" via its title template.
    title: t('heroTitle'),
    description: t('heroBody'),
    alternates: pageAlternates(await getLocale(), '/referrer/join'),
  }
}

export default async function ReferrerJoinPage() {
  const locale = await getLocale()
  const t = await getTranslations('referrerJoin')
  const tm = await getTranslations('referrer')

  const steps = [
    { icon: Link2, title: t('step1Title'), body: t('step1Body') },
    { icon: Share2, title: t('step2Title'), body: t('step2Body') },
    { icon: Trophy, title: t('step3Title'), body: t('step3Body') },
    { icon: Wallet, title: t('step4Title'), body: t('step4Body') },
  ]

  const milestones = [
    tm('milestoneSignUp'),
    tm('milestoneListingDraft'),
    tm('milestoneListingPublished'),
    tm('milestoneFirstBooking'),
    tm('milestonePaidPlan'),
    tm('milestoneAgentActivated'),
  ]

  return (
    <main className="bg-page-dark min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="pt-32 pb-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-pill mb-6">
            {t('badge')}
          </div>
          <h1 className="text-title-1 text-white mb-4">{t('heroTitle')}</h1>
          <p className="text-lede text-text-on-dark-secondary max-w-xl mx-auto">
            {t('heroBody')}
          </p>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="pb-14 px-4">
        <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="bg-surface-dark rounded-card p-6 border border-white/[0.06]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-card-dark bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                  <step.icon size={18} />
                </div>
                <span className="text-xs font-mono text-text-on-dark-muted">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h2 className="text-base font-bold text-white mb-1.5">{step.title}</h2>
              <p className="text-sm text-text-on-dark-secondary leading-relaxed">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What counts ───────────────────────────────────────── */}
      <section className="pb-14 px-4">
        <div className="max-w-3xl mx-auto bg-surface-dark rounded-card p-8 border border-white/[0.06]">
          <h2 className="text-lg font-bold text-white mb-2">{t('milestonesTitle')}</h2>
          <p className="text-sm text-text-on-dark-secondary mb-6 max-w-xl">
            {t('milestonesBody')}
          </p>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {milestones.map(m => (
              <li
                key={m}
                className="flex items-center gap-2.5 text-sm text-white bg-white/[0.03] rounded-card-dark px-4 py-3"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                {m}
              </li>
            ))}
          </ul>
          <p className="text-xs text-text-on-dark-muted mt-6 leading-relaxed">
            {t('milestonesNote')}
          </p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="pb-24 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-title-2 text-white mb-3">{t('ctaTitle')}</h2>
          <p className="text-sm text-text-on-dark-secondary mb-8">{t('ctaBody')}</p>
          <JoinButton
            locale={locale}
            label={t('ctaButton')}
            workingLabel={t('ctaButtonWorking')}
          />
        </div>
      </section>

    </main>
  )
}
