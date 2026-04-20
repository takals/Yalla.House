import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, Zap, Eye, Users, Shield, Home, Search } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations('about')

  return {
    title: `${t('heroTitle')} ${t('heroTitleAccent')} | Yalla.House`,
    description: t('heroSubtitle'),
    openGraph: {
      type: 'website',
      title: `${t('heroTitle')} ${t('heroTitleAccent')} | Yalla.House`,
      description: t('heroSubtitle'),
      url: locale === 'en' ? 'https://yalla.house/en/about' : 'https://yalla.house/about',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Yalla.House' }],
    },
  }
}

export default async function AboutPage() {
  const t = await getTranslations('about')

  return (
    <main className="bg-page-dark min-h-screen">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.8s ease-out both; }
        .fade-up-d1 { animation: fadeUp 0.8s ease-out 0.15s both; }
        .fade-up-d2 { animation: fadeUp 0.8s ease-out 0.3s both; }
        .fade-up-d3 { animation: fadeUp 0.8s ease-out 0.45s both; }
      `}</style>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="pt-40 pb-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="fade-up text-display text-white">
            {t('heroTitle')}{' '}<span className="text-brand">{t('heroTitleAccent')}</span>
          </h1>
          <p className="fade-up-d1 mt-6 text-lede text-text-on-dark-secondary font-normal max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────── */}
      <section className="pb-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              <div className="fade-up text-center">
                <div className="text-4xl md:text-5xl font-extrabold tabular-nums text-brand">17,000+</div>
                <p className="mt-2 text-sm text-text-on-dark-secondary">{t('statsAgents')}</p>
              </div>
              <div className="fade-up-d1 text-center">
                <div className="text-4xl md:text-5xl font-extrabold tabular-nums text-white">100+</div>
                <p className="mt-2 text-sm text-text-on-dark-secondary">{t('statsAreas')}</p>
              </div>
              <div className="fade-up-d2 text-center">
                <div className="text-4xl md:text-5xl font-extrabold tabular-nums text-white">3</div>
                <p className="mt-2 text-sm text-text-on-dark-secondary">{t('statsDashboards')}</p>
              </div>
              <div className="fade-up-d3 text-center">
                <div className="text-4xl md:text-5xl font-extrabold tabular-nums text-brand">{'\u00a3'}0</div>
                <p className="mt-2 text-sm text-text-on-dark-secondary">{t('statsStart')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION ────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand mb-6">
            {t('missionEyebrow')}
          </p>
          <h2 className="text-title-1 text-white leading-tight">
            {t('missionTitle')}
          </h2>
          <p className="mt-8 text-lede text-text-on-dark-secondary">
            {t('missionBody')}
          </p>
        </div>
      </section>

      {/* ── THREE ROLES ────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand mb-6 text-center">
            {t('rolesEyebrow')}
          </p>
          <h2 className="text-title-1 text-white leading-tight text-center mb-16">
            {t('rolesTitle')}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Owners */}
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <div className="h-1.5 bg-brand" />
              <div className="p-8">
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mb-5">
                  <Home size={24} className="text-brand" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t('ownerTitle')}</h3>
                <p className="text-sm text-text-on-dark-secondary leading-relaxed mb-5">
                  {t('ownerBody')}
                </p>
                <Link href="/owner/info" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:gap-2.5 transition-all">
                  {t('ownerCta')} <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Hunters */}
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <div className="h-1.5 bg-[#5856D6]" />
              <div className="p-8">
                <div className="w-12 h-12 rounded-xl bg-[#5856D6]/10 flex items-center justify-center mb-5">
                  <Search size={24} className="text-[#5856D6]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t('hunterTitle')}</h3>
                <p className="text-sm text-text-on-dark-secondary leading-relaxed mb-5">
                  {t('hunterBody')}
                </p>
                <Link href="/hunter/info" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5856D6] hover:gap-2.5 transition-all">
                  {t('hunterCta')} <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Agents */}
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <div className="h-1.5 bg-[#34C759]" />
              <div className="p-8">
                <div className="w-12 h-12 rounded-xl bg-[#34C759]/10 flex items-center justify-center mb-5">
                  <Shield size={24} className="text-[#34C759]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t('agentTitle')}</h3>
                <p className="text-sm text-text-on-dark-secondary leading-relaxed mb-5">
                  {t('agentBody')}
                </p>
                <Link href="/agent/info" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#34C759] hover:gap-2.5 transition-all">
                  {t('agentCta')} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ─────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand mb-6 text-center">
            {t('valuesEyebrow')}
          </p>
          <h2 className="text-title-1 text-white leading-tight text-center mb-16">
            {t('valuesTitle')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-8">
              <Eye size={28} className="text-brand mb-4" />
              <h3 className="text-lg font-bold text-white mb-3">{t('value1Title')}</h3>
              <p className="text-sm text-text-on-dark-secondary leading-relaxed">{t('value1Body')}</p>
            </div>
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-8">
              <Zap size={28} className="text-brand mb-4" />
              <h3 className="text-lg font-bold text-white mb-3">{t('value2Title')}</h3>
              <p className="text-sm text-text-on-dark-secondary leading-relaxed">{t('value2Body')}</p>
            </div>
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-8">
              <Users size={28} className="text-brand mb-4" />
              <h3 className="text-lg font-bold text-white mb-3">{t('value3Title')}</h3>
              <p className="text-sm text-text-on-dark-secondary leading-relaxed">{t('value3Body')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR STORY ──────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand mb-6">
            {t('storyEyebrow')}
          </p>
          <h2 className="text-title-1 text-white leading-tight mb-8">
            {t('storyTitle')}
          </h2>
          <div className="space-y-6 text-text-on-dark-secondary text-base leading-relaxed">
            <p>{t('storyP1')}</p>
            <p>{t('storyP2')}</p>
            <p className="text-white font-semibold">{t('storyP3')}</p>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #D4764E 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-title-1 text-white leading-tight mb-6">{t('ctaTitle')}</h2>
          <p className="text-lede text-white/50 mb-10 max-w-xl mx-auto">{t('ctaBody')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/owner/info">
              <button className="px-8 py-4 bg-brand text-white font-semibold rounded-full hover:bg-brand-hover transition-all duration-300">
                {t('ctaOwner')}
              </button>
            </Link>
            <Link href="/agent/info">
              <button className="px-8 py-4 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300">
                {t('ctaAgent')}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
