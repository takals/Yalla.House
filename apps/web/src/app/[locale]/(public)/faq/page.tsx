import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Mail } from 'lucide-react'
import FaqAccordion from '@/components/faq-accordion'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations('faq')

  return {
    title: `${t('heroTitle')} ${t('heroTitleAccent')} | Yalla.House`,
    description: t('heroSubtitle'),
    openGraph: {
      type: 'website',
      title: `${t('heroTitle')} ${t('heroTitleAccent')} | Yalla.House`,
      description: t('heroSubtitle'),
      url: locale === 'en' ? 'https://yalla.house/en/faq' : 'https://yalla.house/faq',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Yalla.House' }],
    },
  }
}

export default async function FaqPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('faq')

  // Build sections for accordion
  const sections = [
    {
      title: t('sectionOwners'),
      items: [
        { question: t('ownerQ1'), answer: t('ownerA1') },
        { question: t('ownerQ2'), answer: t('ownerA2') },
        { question: t('ownerQ3'), answer: t('ownerA3') },
        { question: t('ownerQ4'), answer: t('ownerA4') },
        { question: t('ownerQ5'), answer: t('ownerA5') },
      ],
    },
    {
      title: t('sectionHunters'),
      items: [
        { question: t('hunterQ1'), answer: t('hunterA1') },
        { question: t('hunterQ2'), answer: t('hunterA2') },
        { question: t('hunterQ3'), answer: t('hunterA3') },
        { question: t('hunterQ4'), answer: t('hunterA4') },
        { question: t('hunterQ5'), answer: t('hunterA5') },
      ],
    },
    {
      title: t('sectionAgents'),
      items: [
        { question: t('agentQ1'), answer: t('agentA1') },
        { question: t('agentQ2'), answer: t('agentA2') },
        { question: t('agentQ3'), answer: t('agentA3') },
        { question: t('agentQ4'), answer: t('agentA4') },
      ],
    },
    {
      title: t('sectionPricing'),
      items: [
        { question: t('pricingQ1'), answer: t('pricingA1') },
        { question: t('pricingQ2'), answer: t('pricingA2') },
        { question: t('pricingQ3'), answer: t('pricingA3') },
      ],
    },
    {
      title: t('sectionTrust'),
      items: [
        { question: t('trustQ1'), answer: t('trustA1') },
        { question: t('trustQ2'), answer: t('trustA2') },
        { question: t('trustQ3'), answer: t('trustA3') },
      ],
    },
  ]

  // All Q&A pairs for schema.org
  const allItems = sections.flatMap(s => s.items)

  // JSON-LD FAQ structured data for Google
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: allItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <main className="bg-page-dark min-h-screen">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-display text-white">
            {t('heroTitle')}{' '}
            <span className="text-brand">{t('heroTitleAccent')}</span>
          </h1>
          <p className="mt-6 text-lede text-text-on-dark-secondary font-normal max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* ── ACCORDION ──────────────────────────────────────────────── */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <FaqAccordion sections={sections} />
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="relative py-24 px-6 overflow-hidden">
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
            {t('ctaBody')}
          </p>
          <a
            href={`mailto:${t('ctaEmail')}`}
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-semibold px-8 py-3.5 rounded-lg transition-[background-color] duration-300 text-base"
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            <Mail size={18} />
            {t('ctaButton')}
          </a>
        </div>
      </section>
    </main>
  )
}
