import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { pageAlternates } from '@/lib/seo'
import { LocaleLink as Link } from '@/components/locale-link'
import { getLocale, getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { ArrowLeft, ShieldCheck, Star, Globe } from 'lucide-react'
import { QuoteRequestForm } from './quote-request-form'

interface Category {
  id: string
  slug: string
  name_en: string
  name_de: string
  description_en: string | null
  description_de: string | null
}

interface Provider {
  id: string
  business_name: string
  website: string | null
  description_en: string | null
  description_de: string | null
  avg_rating: number | null
  review_count: number
  accreditation_body: string | null
  accreditation_verified: boolean
}

async function loadCategory(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data } = await (supabase as any)
    .from('service_categories')
    .select('id, slug, name_en, name_de, description_en, description_de')
    .eq('slug', slug)
    .maybeSingle()
  return (data as Category) ?? null
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; slug: string }> }
): Promise<Metadata> {
  const { locale, slug } = await params
  const category = await loadCategory(slug)
  if (!category) return {}

  const isEN = locale === 'en'
  const name = isEN ? category.name_en : (category.name_de ?? category.name_en)
  const description = (isEN ? category.description_en : category.description_de)
    ?? category.description_en
    ?? name

  return {
    alternates: pageAlternates(locale, `/marketplace/${slug}`),
    title: name,
    description,
    openGraph: {
      type: 'website',
      title: name,
      description,
      url: locale === 'en'
        ? `https://yalla.house/en/marketplace/${slug}`
        : `https://yalla.house/marketplace/${slug}`,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Yalla.House' }],
    },
  }
}

/**
 * A single marketplace category: what it is, who does it, and one form to ask
 * for a quote.
 *
 * Every "Request quote" button in the category grid has always pointed here and
 * this route did not exist, so the whole demand side of the marketplace ended
 * in a 404 and service_requests never got a single row. No sign-in to look, no
 * sign-in to fill it in — the account is asked for when the request is sent.
 */
export default async function MarketplaceCategoryPage(
  { params }: { params: Promise<{ locale: string; slug: string }> }
) {
  const { slug } = await params
  const locale = await getLocale()
  const isEN = locale === 'en'
  const t = await getTranslations('marketplaceCategory')

  const category = await loadCategory(slug)
  if (!category) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rawLinks } = await (supabase as any)
    .from('provider_services')
    .select('provider_id')
    .eq('category_id', category.id)

  const providerIds = ((rawLinks ?? []) as { provider_id: string }[]).map(r => r.provider_id)

  let providers: Provider[] = []
  if (providerIds.length > 0) {
    const { data: rawProviders } = await (supabase as any)
      .from('providers')
      .select('id, business_name, website, description_en, description_de, avg_rating, review_count, accreditation_body, accreditation_verified')
      .in('id', providerIds)
      .eq('status', 'active')
      .order('avg_rating', { ascending: false, nullsFirst: false })
      .limit(24)
    providers = (rawProviders ?? []) as Provider[]
  }

  const name = isEN ? category.name_en : (category.name_de ?? category.name_en)
  const description = (isEN ? category.description_en : category.description_de)
    ?? category.description_en
    ?? ''

  return (
    <main className="bg-page-dark min-h-screen">
      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="pt-40 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-sm text-text-on-dark-secondary hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={15} />
            {t('backToMarketplace')}
          </Link>
          <h1 className="text-display text-white">{name}</h1>
          {description && (
            <p className="mt-5 text-lede text-text-on-dark-secondary font-normal">
              {description}
            </p>
          )}
        </div>
      </section>

      {/* ── QUOTE REQUEST ──────────────────────────────────────────── */}
      <section className="pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <QuoteRequestForm
            category={category.slug}
            authenticated={!!user}
            labels={{
              formTitle: t('formTitle', { category: name }),
              formHint: t('formHint'),
              postcodeLabel: t('postcodeLabel'),
              postcodePlaceholder: t('postcodePlaceholder'),
              detailsLabel: t('detailsLabel'),
              detailsPlaceholder: t('detailsPlaceholder', { category: name }),
              submit: t('submit'),
              submitting: t('submitting'),
              successTitle: t('successTitle'),
              successBody: t('successBody'),
              errorGeneric: t('errorGeneric'),
            }}
          />
        </div>
      </section>

      {/* ── PROVIDERS ──────────────────────────────────────────────── */}
      <section className="pb-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-title-2 text-white mb-2">
            {providers.length > 0 ? t('providersTitle') : t('noProvidersTitle')}
          </h2>
          <p className="text-sm text-text-on-dark-secondary mb-8 max-w-xl">
            {providers.length > 0 ? t('providersBody') : t('noProvidersBody')}
          </p>

          {providers.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-5">
              {providers.map(p => {
                const blurb = (isEN ? p.description_en : p.description_de) ?? p.description_en
                return (
                  <div
                    key={p.id}
                    className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-6"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-white leading-tight">{p.business_name}</h3>
                      {p.accreditation_verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-brand/10 rounded-full flex-shrink-0">
                          <ShieldCheck size={13} className="text-brand" />
                          <span className="text-[0.6875rem] font-semibold text-brand">
                            {t('verified')}
                          </span>
                        </span>
                      )}
                    </div>
                    {p.avg_rating != null && p.review_count > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-white/60 mb-2">
                        <Star size={13} className="text-brand fill-brand" />
                        {Number(p.avg_rating).toFixed(1)}
                        <span className="text-white/35">
                          {t('reviews', { count: p.review_count })}
                        </span>
                      </div>
                    )}
                    {blurb && (
                      <p className="text-sm text-text-on-dark-secondary leading-relaxed line-clamp-3">
                        {blurb}
                      </p>
                    )}
                    {p.website && (
                      <a
                        href={p.website}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-brand hover:text-brand-hover transition-colors"
                      >
                        <Globe size={13} />
                        {t('visitWebsite')}
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-10 pt-8 border-t border-white/[0.08]">
            <p className="text-sm text-text-on-dark-secondary">
              {t('providerPrompt')}{' '}
              <Link href="/providers/join" className="text-brand hover:text-brand-hover font-semibold">
                {t('providerPromptLink')}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
