import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight } from 'lucide-react'
import { MarketplaceGrid } from '@/components/marketplace-grid'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations('marketplace')

  return {
    title: `${t('heroTitle')} ${t('heroTitleAccent')} | Yalla.House`,
    description: t('heroSubtitle'),
    openGraph: {
      type: 'website',
      title: `${t('heroTitle')} ${t('heroTitleAccent')} | Yalla.House`,
      description: t('heroSubtitle'),
      url: locale === 'en' ? 'https://yalla.house/en/marketplace' : 'https://yalla.house/marketplace',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Yalla.House' }],
    },
  }
}

// Icon name → lucide-react mapping (loaded dynamically by the client component)
const TIER_ORDER = ['transaction', 'lettings', 'moving'] as const

export default async function MarketplacePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('marketplace')
  const isEN = locale === 'en'

  // Types for marketplace data
  interface ServiceCategory {
    id: string
    slug: string
    name_en: string
    name_de: string
    description_en: string | null
    description_de: string | null
    icon: string | null
    tier: string
    phase: string
    revenue_model: string | null
    sort_order: number
  }

  interface ProviderService {
    category_id: string
    provider_id: string
  }

  // Fetch categories with provider counts
  const supabase = await createClient()
  const { data: rawCategories } = await supabase
    .from('service_categories' as 'users')
    .select('id, slug, name_en, name_de, description_en, description_de, icon, tier, phase, revenue_model, sort_order')
    .order('sort_order')

  const categories = (rawCategories ?? []) as unknown as ServiceCategory[]

  // Count active providers per category
  const { data: rawProviderCounts } = await supabase
    .from('provider_services' as 'users')
    .select('category_id, provider_id')

  const providerCounts = (rawProviderCounts ?? []) as unknown as ProviderService[]

  const countMap = new Map<string, number>()
  for (const row of providerCounts) {
    countMap.set(row.category_id, (countMap.get(row.category_id) ?? 0) + 1)
  }

  // Build tier groups
  const tierLabels: Record<string, string> = {
    transaction: t('filterTransaction'),
    lettings: t('filterLettings'),
    moving: t('filterMoving'),
  }

  const tiers = TIER_ORDER.map(tier => ({
    key: tier,
    label: tierLabels[tier] ?? tier,
    categories: categories
      .filter(c => c.tier === tier)
      .map(c => ({
        id: c.id,
        slug: c.slug,
        name: isEN ? c.name_en : (c.name_de ?? c.name_en),
        description: isEN ? (c.description_en ?? '') : (c.description_de ?? c.description_en ?? ''),
        icon: c.icon ?? 'wrench',
        phase: c.phase,
        providerCount: countMap.get(c.id) ?? 0,
      })),
  }))

  // Translations for the client component
  const gridTranslations = {
    filterAll: t('filterAll'),
    filterTransaction: t('filterTransaction'),
    filterLettings: t('filterLettings'),
    filterMoving: t('filterMoving'),
    providersLabel: t('providersLabel'),
    noProviders: t('noProviders'),
    comingSoon: t('comingSoon'),
    requestQuote: t('requestQuote'),
    searchPlaceholder: t('searchPlaceholder'),
  }

  return (
    <main className="bg-page-dark min-h-screen">
      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="pt-40 pb-16 px-6">
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

      {/* ── CATEGORY GRID ──────────────────────────────────────────── */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <MarketplaceGrid tiers={tiers} translations={gridTranslations} />
        </div>
      </section>

      {/* ── MORTGAGE CARD ──────────────────────────────────────────── */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-surface-dark rounded-card-dark border border-brand/20 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-14 h-14 rounded-card-dark bg-brand/10 flex items-center justify-center flex-shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">{t('mortgageTitle')}</h3>
              <p className="text-sm text-text-on-dark-secondary leading-relaxed">{t('mortgageBody')}</p>
            </div>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-semibold px-6 py-3 rounded-lg transition-[background-color] duration-300 text-sm whitespace-nowrap"
            >
              {t('mortgageCta')}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROVIDER CTA ───────────────────────────────────────────── */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212, 118, 78, 0.08), transparent)',
          }}
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-title-1 text-white mb-4">{t('ctaTitle')}</h2>
          <p className="text-lede text-text-on-dark-secondary mb-8">{t('ctaBody')}</p>
          <Link
            href="/providers/join"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-semibold px-8 py-3.5 rounded-lg transition-[background-color] duration-300 text-base"
          >
            {t('ctaButton')}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  )
}
