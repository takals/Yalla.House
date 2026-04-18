import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import {
  LayoutDashboard, Send, BarChart3, Shield,
  Camera, ScanLine, FileText, Megaphone,
  CheckCircle2, ArrowRight,
} from 'lucide-react'
import { PricingTables } from './pricing-tables'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isEnglish = locale === 'en'

  return {
    title: isEnglish ? 'Services & Pricing | Yalla.House' : 'Dienstleistungen & Preise | Yalla.House',
    description: isEnglish
      ? 'Solutions for owners, home hunters, and agents. Free dashboards and comprehensive marketing tools.'
      : 'Lösungen für Eigentümer, Suchende und Makler. Kostenlose Dashboards und umfangreiche Marketingtools.',
    openGraph: {
      type: 'website',
      title: isEnglish ? 'Services & Pricing | Yalla.House' : 'Dienstleistungen & Preise | Yalla.House',
      description: isEnglish
        ? 'Solutions for owners, home hunters, and agents. Free dashboards and comprehensive marketing tools.'
        : 'Lösungen für Eigentümer, Suchende und Makler. Kostenlose Dashboards und umfangreiche Marketingtools.',
      url: isEnglish ? 'https://yalla.house/en/services' : 'https://yalla.house/services',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Yalla.House',
        },
      ],
    },
  }
}

export default async function ServicesPage() {
  const t = await getTranslations('services')

  return (
    <main className="bg-page-dark min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-full px-4 py-1.5 mb-6 text-xs font-semibold uppercase tracking-widest text-text-on-dark-muted">
            {t('heroTag')}
          </div>
          <h1 className="text-display text-white mb-6">
            {t('heroTitle')}
          </h1>
          <p className="text-lede text-text-on-dark-secondary max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* ── FREE DASHBOARD ───────────────────────────────────────────────────── */}
      <section className="pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-title-1 text-white mb-3">
              {t('dashboardTitle')}
            </h2>
            <p className="text-text-on-dark-secondary max-w-xl mx-auto">
              {t('dashboardSubtitle')}
            </p>
          </div>

          <div className="bg-surface-dark rounded-card-dark border border-white/[0.04] p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-3xl font-extrabold text-brand">£0</div>
              <div className="text-sm text-text-on-dark-muted">{t('dashboardFreeForever')}</div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: <BarChart3 size={18} />, text: t('dashboardFeature1') },
                { icon: <LayoutDashboard size={18} />, text: t('dashboardFeature2') },
                { icon: <Send size={18} />, text: t('dashboardFeature3') },
                { icon: <Shield size={18} />, text: t('dashboardFeature4') },
              ].map((feat) => (
                <div key={feat.text} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-card-dark bg-brand/10 flex items-center justify-center text-brand flex-shrink-0 mt-0.5">
                    {feat.icon}
                  </div>
                  <span className="text-sm text-text-on-dark-secondary leading-relaxed">
                    {feat.text}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/owner"
              className="inline-flex items-center bg-brand hover:bg-brand-hover text-white font-semibold px-6 py-3 rounded-lg transition-[background-color] duration-300 text-sm mt-8"
            >
              {t('dashboardCta')} →
            </Link>
          </div>
        </div>
      </section>

      {/* ── AGENT BRIEF FLOW ─────────────────────────────────────────────────── */}
      <section className="pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-title-1 text-white mb-3">
              {t('briefTitle')}
            </h2>
            <p className="text-text-on-dark-secondary max-w-xl mx-auto">
              {t('briefSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: <FileText size={24} />,
                title: t('briefStep1Title'),
                body: t('briefStep1Body'),
              },
              {
                step: '02',
                icon: <Send size={24} />,
                title: t('briefStep2Title'),
                body: t('briefStep2Body'),
              },
              {
                step: '03',
                icon: <CheckCircle2 size={24} />,
                title: t('briefStep3Title'),
                body: t('briefStep3Body'),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-surface-dark rounded-card-dark p-6 group hover:bg-card-dark transition-[background-color] duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-card-dark bg-brand/10 flex items-center justify-center text-brand">
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold text-text-on-dark-muted uppercase tracking-widest">
                    Step {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-text-on-dark-secondary leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREMIUM ADD-ONS ──────────────────────────────────────────────────── */}
      <section className="pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.08] rounded-full px-4 py-1.5 mb-4 text-xs font-semibold uppercase tracking-widest text-text-on-dark-muted">
              {t('addonsTag')}
            </div>
            <h2 className="text-title-1 text-white mb-3">
              {t('addonsTitle')}
            </h2>
            <p className="text-text-on-dark-secondary max-w-xl mx-auto">
              {t('addonsSubtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {[
              {
                icon: <Camera size={20} />,
                title: t('addon1Title'),
                desc: t('addon1Desc'),
                price: t('addon1Price'),
              },
              {
                icon: <ScanLine size={20} />,
                title: t('addon2Title'),
                desc: t('addon2Desc'),
                price: t('addon2Price'),
              },
              {
                icon: <FileText size={20} />,
                title: t('addon3Title'),
                desc: t('addon3Desc'),
                price: t('addon3Price'),
              },
              {
                icon: <Megaphone size={20} />,
                title: t('addon4Title'),
                desc: t('addon4Desc'),
                price: t('addon4Price'),
              },
            ].map((addon) => (
              <div
                key={addon.title}
                className="bg-surface-dark rounded-card-dark p-6 border border-white/[0.04] hover:border-brand/20 transition-[border-color] duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-card-dark bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                    {addon.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="text-base font-bold text-white">{addon.title}</h3>
                      <span className="text-sm font-bold text-brand ml-3 whitespace-nowrap">{addon.price}</span>
                    </div>
                    <p className="text-sm text-text-on-dark-secondary leading-relaxed">{addon.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-text-on-dark-muted text-center mt-8">
            {t('addonsNote')}
          </p>
        </div>
      </section>

      {/* ── PRICING TABLES (role tabs) ─────────────────────────────────────── */}
      <PricingTables />

      {/* ── COMPARISON ────────────────────────────────────────────────────────── */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-title-1 text-white text-center mb-12">
            {t('comparisonTitle')}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Traditional */}
            <div className="bg-surface-dark rounded-card-dark p-6 border border-white/[0.04]">
              <div className="text-sm font-semibold text-text-on-dark-muted mb-3 uppercase tracking-wider">
                {t('compTraditional')}
              </div>
              <ul className="space-y-3">
                {[
                  t('compTrad1'),
                  t('compTrad2'),
                  t('compTrad3'),
                  t('compTrad4'),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-text-on-dark-secondary">
                    <span className="text-red-400 mt-0.5">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Yalla */}
            <div className="bg-surface-dark rounded-card-dark p-6 border border-brand/30">
              <div className="text-sm font-semibold text-brand mb-3 uppercase tracking-wider">
                {t('compYalla')}
              </div>
              <ul className="space-y-3">
                {[
                  t('compYalla1'),
                  t('compYalla2'),
                  t('compYalla3'),
                  t('compYalla4'),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-text-on-dark-secondary">
                    <span className="text-brand mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────────────────────────── */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212, 118, 78, 0.08), transparent)',
          }}
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-title-1 text-white mb-4">
            {t('ctaTitle')}
          </h2>
          <p className="text-lede text-text-on-dark-secondary mb-8">
            {t('ctaSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/owner"
              className="inline-flex items-center bg-brand hover:bg-brand-hover text-white font-semibold px-8 py-3.5 rounded-lg transition-[background-color] duration-300 text-base"
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              {t('ctaCta')} →
            </Link>
            <Link
              href="/agent"
              className="text-text-on-dark-secondary hover:text-white font-medium transition-[color] duration-300 text-sm"
            >
              {t('ctaAgentLink')} →
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
