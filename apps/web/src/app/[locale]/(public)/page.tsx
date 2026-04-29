import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Home, Search, Handshake } from 'lucide-react'
import HomepageHero from '@/components/homepage-hero'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('hero')

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    keywords: t('metaKeywords').split(','),
    openGraph: {
      type: 'website',
      title: t('metaTitle'),
      description: t('metaDescription'),
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

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const t = await getTranslations('hero')
  const th = await getTranslations('heroHunter')
  const stats = await getTranslations('stats')
  const statsH = await getTranslations('statsHunter')
  const how = await getTranslations('howItWorks')
  const howH = await getTranslations('howItWorksHunter')
  const why = await getTranslations('whyYalla')
  const whyH = await getTranslations('whyYallaHunter')
  const paths = await getTranslations('paths')
  const cta = await getTranslations('ctaBand')

  return (
    <main className="bg-page-dark min-h-screen">

      {/* ── MODE-AWARE: HERO + STATS + HOW IT WORKS + WHY YALLA ──────── */}
      <HomepageHero
        toggleOwnerLabel={t('toggleOwner')}
        toggleHunterLabel={t('toggleHunter')}
        agentLabel={t('agentLink')}
        {...(!user ? { signInLabel: t('signIn'), signInHref: '/auth/login' } : {})}
        owner={{
          headlinePrefix: t('headlinePrefix'),
          headlineWords: t('headlineWords').split(','),
          headlineSuffix: t('headlineSuffix'),
          subline: t('subline'),
          cta: t('cta'),
          ctaHref: '/owner/listings',
          stats: [
            { value: stats('stat1Value'), label: stats('stat1Label') },
            { value: stats('stat2Value'), label: stats('stat2Label') },
            { value: stats('stat3Value'), label: stats('stat3Label') },
            { value: stats('stat4Value'), label: stats('stat4Label') },
          ],
          howTitle: how('title'),
          howSubtitle: how('subtitle'),
          steps: [
            { title: how('step1Title'), body: how('step1Body') },
            { title: how('step2Title'), body: how('step2Body') },
            { title: how('step3Title'), body: how('step3Body') },
          ],
          whyTitle: why('title'),
          whyItems: [
            { title: why('item1Title'), body: why('item1Body') },
            { title: why('item2Title'), body: why('item2Body') },
            { title: why('item3Title'), body: why('item3Body') },
            { title: why('item4Title'), body: why('item4Body') },
          ],
        }}
        hunter={{
          headlinePrefix: th('headlinePrefix'),
          headlineWords: th('headlineWords').split(','),
          headlineSuffix: th('headlineSuffix'),
          subline: th('subline'),
          cta: th('cta'),
          ctaHref: '/hunter/info',
          stats: [
            { value: statsH('stat1Value'), label: statsH('stat1Label') },
            { value: statsH('stat2Value'), label: statsH('stat2Label') },
            { value: statsH('stat3Value'), label: statsH('stat3Label') },
            { value: statsH('stat4Value'), label: statsH('stat4Label') },
          ],
          howTitle: howH('title'),
          howSubtitle: howH('subtitle'),
          steps: [
            { title: howH('step1Title'), body: howH('step1Body') },
            { title: howH('step2Title'), body: howH('step2Body') },
            { title: howH('step3Title'), body: howH('step3Body') },
          ],
          whyTitle: whyH('title'),
          whyItems: [
            { title: whyH('item1Title'), body: whyH('item1Body') },
            { title: whyH('item2Title'), body: whyH('item2Body') },
            { title: whyH('item3Title'), body: whyH('item3Body') },
            { title: whyH('item4Title'), body: whyH('item4Body') },
          ],
        }}
      />

      {/* ── THREE PATHS ──────────────────────────────────────────────────── */}
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
                href="/owner/info"
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
                href="/hunter/info"
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
                href="/agent/info"
                className="text-sm font-semibold text-brand hover:text-brand-hover transition-[color] duration-300"
              >
                {paths('agentCta')} →
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────────────────────── */}
      <section className="relative py-20 px-4 overflow-hidden">
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
              href="/owner/listings"
              className="inline-flex items-center bg-brand hover:bg-brand-hover text-white font-semibold px-8 py-3.5 rounded-lg transition-[background-color] duration-300 text-base"
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              {cta('cta')} →
            </Link>
            <Link
              href="/agent/info"
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
