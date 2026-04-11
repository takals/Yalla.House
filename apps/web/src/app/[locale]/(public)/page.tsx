import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { LayoutDashboard, Send, BarChart3, Home, Search, Handshake } from 'lucide-react'
import HeroHeadline from '@/components/hero-headline'

export default async function HomePage() {
  const t = await getTranslations('hero')
  const stats = await getTranslations('stats')
  const how = await getTranslations('howItWorks')
  const paths = await getTranslations('paths')
  const why = await getTranslations('whyYalla')
  const cta = await getTranslations('ctaBand')

  return (
    <main className="bg-page-dark min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <HeroHeadline
            prefix={t('headlinePrefix')}
            words={t('headlineWords').split(',')}
            suffix={t('headlineSuffix')}
          />
          <p className="text-lede text-text-on-dark-secondary max-w-2xl mx-auto mb-10">
            {t('subline')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/owner"
              className="inline-flex items-center bg-brand hover:bg-brand-hover text-white font-semibold px-8 py-3.5 rounded-lg transition-[background-color] duration-300 text-base"
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              {t('cta')} →
            </Link>
            <Link
              href="/hunter/brief"
              className="inline-flex items-center text-text-on-dark-secondary hover:text-white font-medium px-6 py-3.5 rounded-lg transition-[color] duration-300 text-base border border-white/10 hover:border-white/20"
            >
              {t('ctaHunter')} →
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────────────────── */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: stats('stat1Value'), label: stats('stat1Label') },
              { value: stats('stat2Value'), label: stats('stat2Label') },
              { value: stats('stat3Value'), label: stats('stat3Label') },
              { value: stats('stat4Value'), label: stats('stat4Label') },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-card-dark rounded-card-dark p-5 text-center shadow-dark-card"
              >
                <div className="text-2xl font-bold text-brand mb-1">{stat.value}</div>
                <div className="text-xs text-text-on-dark-muted leading-snug">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────────── */}
      <section className="pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-title-1 text-white text-center mb-4">
            {how('title')}
          </h2>
          <p className="text-text-on-dark-secondary text-center mb-12 max-w-xl mx-auto">
            {how('subtitle')}
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <LayoutDashboard size={24} />,
                step: '01',
                title: how('step1Title'),
                body: how('step1Body'),
              },
              {
                icon: <Send size={24} />,
                step: '02',
                title: how('step2Title'),
                body: how('step2Body'),
              },
              {
                icon: <BarChart3 size={24} />,
                step: '03',
                title: how('step3Title'),
                body: how('step3Body'),
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

      {/* ── THREE PATHS ──────────────────────────────────────────────────────── */}
      <section className="pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">

            {/* Owner */}
            <div className="bg-surface-dark rounded-card-dark p-6 border border-white/[0.04] hover:border-brand/30 transition-[border-color] duration-300">
              <div className="w-10 h-10 rounded-card-dark bg-brand/10 flex items-center justify-center text-brand mb-4">
                <Home size={22} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">{paths('ownerTitle')}</h3>
              <p className="text-xs text-brand font-semibold mb-3">{paths('ownerTagline')}</p>
              <p className="text-sm text-text-on-dark-secondary leading-relaxed mb-5">
                {paths('ownerBody')}
              </p>
              <Link
                href="/owner"
                className="text-sm font-semibold text-brand hover:text-brand-hover transition-[color] duration-300"
              >
                {paths('ownerCta')} →
              </Link>
            </div>

            {/* Hunter */}
            <div className="bg-surface-dark rounded-card-dark p-6 border border-white/[0.04] hover:border-brand/30 transition-[border-color] duration-300">
              <div className="w-10 h-10 rounded-card-dark bg-brand/10 flex items-center justify-center text-brand mb-4">
                <Search size={22} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">{paths('hunterTitle')}</h3>
              <p className="text-xs text-brand font-semibold mb-3">{paths('hunterTagline')}</p>
              <p className="text-sm text-text-on-dark-secondary leading-relaxed mb-5">
                {paths('hunterBody')}
              </p>
              <Link
                href="/hunter/brief"
                className="text-sm font-semibold text-brand hover:text-brand-hover transition-[color] duration-300"
              >
                {paths('hunterCta')} →
              </Link>
            </div>

            {/* Agent */}
            <div className="bg-surface-dark rounded-card-dark p-6 border border-white/[0.04] hover:border-brand/30 transition-[border-color] duration-300">
              <div className="w-10 h-10 rounded-card-dark bg-brand/10 flex items-center justify-center text-brand mb-4">
                <Handshake size={22} />
              </div>
              <h3 className="text-base font-bold text-white mb-1">{paths('agentTitle')}</h3>
              <p className="text-xs text-brand font-semibold mb-3">{paths('agentTagline')}</p>
              <p className="text-sm text-text-on-dark-secondary leading-relaxed mb-5">
                {paths('agentBody')}
              </p>
              <Link
                href="/agent"
                className="text-sm font-semibold text-brand hover:text-brand-hover transition-[color] duration-300"
              >
                {paths('agentCta')} →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── WHY YALLA ────────────────────────────────────────────────────────── */}
      <section className="pb-24 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-title-1 text-white text-center mb-12">
            {why('title')}
          </h2>
          <div className="space-y-8">
            {([1, 2, 3, 4] as const).map((n) => (
              <div key={n} className="flex gap-4">
                <div className="w-1.5 rounded-full bg-brand flex-shrink-0 self-stretch" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{why(`item${n}Title`)}</h3>
                  <p className="text-sm text-text-on-dark-secondary leading-relaxed">{why(`item${n}Body`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────────────────────────── */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212, 118, 78, 0.08), transparent)',
          }}
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-title-1 text-white mb-4">
            {cta('headline')}
          </h2>
          <p className="text-lede text-text-on-dark-secondary mb-8">
            {cta('body')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/owner"
              className="inline-flex items-center bg-brand hover:bg-brand-hover text-white font-semibold px-8 py-3.5 rounded-lg transition-[background-color] duration-300 text-base"
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              {cta('cta')} →
            </Link>
            <Link
              href="/agent"
              className="text-text-on-dark-secondary hover:text-white font-medium transition-[color] duration-300 text-sm"
            >
              {cta('agentLink')} →
            </Link>
          </div>
        </div>
      </section>

    </main>
  )
}
