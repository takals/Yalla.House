import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { dateLocaleFromLocale } from '@/lib/country-config'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('listings')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      type: 'website',
    },
  }
}

const PER_PAGE = 48

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    city?: string
    intent?: string
    type?: string
    min?: string
    max?: string
    page?: string
  }>
}

function formatPrice(
  minor: number | null,
  currency: string,
  intent: string,
  locale: string
): string | null {
  if (!minor) return null
  const formatted = new Intl.NumberFormat(dateLocaleFromLocale(locale), {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100)
  return intent === 'rent' || intent === 'both' ? `${formatted} / Mo.` : formatted
}

function buildPageHref(
  currentParams: Record<string, string | undefined>,
  page: number
): string {
  const params = new URLSearchParams()
  for (const [key, val] of Object.entries(currentParams)) {
    if (val && key !== 'page') params.set(key, val)
  }
  if (page > 1) params.set('page', String(page))
  const qs = params.toString()
  return qs ? `/listings?${qs}` : '/listings'
}

export default async function ListingsPage({ params, searchParams }: Props) {
  const t = await getTranslations('listings')
  const { locale } = await params
  const { city, intent, type, min, max, page: pageParam } = await searchParams

  const currentPage = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const offset = (currentPage - 1) * PER_PAGE

  const supabase = await createClient()

  /* --- Build base filter (shared between count query and data query) --- */
  function applyFilters(query: ReturnType<typeof supabase.from>) {
    let q = query.eq('status', 'active') as any
    if (city?.trim()) q = q.ilike('city', `%${city.trim()}%`)
    if (intent === 'buy') q = q.in('intent', ['sale', 'both'])
    if (intent === 'rent') q = q.in('intent', ['rent', 'both'])
    if (type) q = q.eq('property_type', type)
    const priceCol = intent === 'rent' ? 'rent_price' : 'sale_price'
    if (min && !isNaN(parseInt(min))) q = q.gte(priceCol, parseInt(min) * 100)
    if (max && !isNaN(parseInt(max))) q = q.lte(priceCol, parseInt(max) * 100)
    return q
  }

  /* Parallel: count + paginated data */
  const countQuery = applyFilters(
    supabase.from('listings').select('id', { count: 'exact', head: true }) as any
  )
  const dataQuery = applyFilters(
    supabase.from('listings').select(
      'id, place_id, slug, title_de, intent, property_type, city, postcode, size_sqm, bedrooms, sale_price, rent_price, currency, listing_media(url, is_primary, type)'
    ) as any
  )
    .order('created_at', { ascending: false })
    .range(offset, offset + PER_PAGE - 1)

  const [countResult, dataResult] = await Promise.all([countQuery, dataQuery])

  const totalCount = countResult.count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE))

  const listings = (dataResult.data ?? []) as Array<{
    id: string
    place_id: string
    slug: string | null
    title_de: string | null
    intent: string
    property_type: string
    city: string
    postcode: string
    size_sqm: number | null
    bedrooms: number | null
    sale_price: number | null
    rent_price: number | null
    currency: string
    listing_media: Array<{ url: string; is_primary: boolean; type: string }> | null
  }>

  const results = listings

  const propertyTypes = [
    { value: 'house', label: t('house') },
    { value: 'flat', label: t('flat') },
    { value: 'apartment', label: t('apartment') },
    { value: 'villa', label: t('villa') },
    { value: 'commercial', label: t('commercial') },
    { value: 'land', label: t('land') },
  ]

  const filterParams = { city, intent, type, min, max }

  /* Results count text */
  const resultsText =
    totalCount === 1
      ? t('resultsCountOne')
      : t('resultsCount', { count: totalCount })

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('title')}</h1>

        {/* Filter bar */}
        <form method="GET" className="bg-surface rounded-card p-4 shadow-sm mb-8 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
            <label className="text-xs font-semibold text-[#5E6278]">{t('city')}</label>
            <input
              type="text"
              name="city"
              defaultValue={city ?? ''}
              placeholder={locale === 'de' ? 'z.B. Berlin' : 'e.g. Berlin'}
              className="px-3 py-2 text-sm border border-[#E2E4EB] rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1 min-w-[110px]">
            <label className="text-xs font-semibold text-[#5E6278]">{t('intent')}</label>
            <select
              name="intent"
              defaultValue={intent ?? ''}
              className="px-3 py-2 text-sm border border-[#E2E4EB] rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            >
              <option value="">{t('intentAll')}</option>
              <option value="buy">{t('intentBuy')}</option>
              <option value="rent">{t('intentRent')}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[130px]">
            <label className="text-xs font-semibold text-[#5E6278]">{t('propertyType')}</label>
            <select
              name="type"
              defaultValue={type ?? ''}
              className="px-3 py-2 text-sm border border-[#E2E4EB] rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            >
              <option value="">{t('allTypes')}</option>
              {propertyTypes.map(pt => (
                <option key={pt.value} value={pt.value}>{pt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[90px]">
            <label className="text-xs font-semibold text-[#5E6278]">{t('minPrice')}</label>
            <input
              type="number"
              name="min"
              defaultValue={min ?? ''}
              min="0"
              step="100"
              placeholder="0"
              className="px-3 py-2 text-sm border border-[#E2E4EB] rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1 min-w-[90px]">
            <label className="text-xs font-semibold text-[#5E6278]">{t('maxPrice')}</label>
            <input
              type="number"
              name="max"
              defaultValue={max ?? ''}
              min="0"
              step="100"
              placeholder={'\u221e'}
              className="px-3 py-2 text-sm border border-[#E2E4EB] rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-brand hover:bg-brand-hover text-[#0F1117] font-bold text-sm rounded-lg transition-colors whitespace-nowrap"
          >
            {t('search')}
          </button>

          {(city || intent || type || min || max) && (
            <Link
              href="/listings"
              className="px-4 py-2 text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] transition-colors whitespace-nowrap self-end"
            >
              {t('reset')}
            </Link>
          )}
        </form>

        {/* Results count */}
        <p className="text-sm text-[#5E6278] mb-4">{resultsText}</p>

        {/* Results grid */}
        {results.length === 0 ? (
          <div className="bg-surface rounded-card p-12 text-center shadow-sm">
            <p className="text-[#5E6278]">{t('noResults')}</p>
            <Link
              href="/listings"
              className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
            >
              {t('resetFilters')}
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map(listing => {
                const photos = listing.listing_media?.filter(m => m.type === 'photo') ?? []
                const primaryPhoto = photos.find(p => p.is_primary) ?? photos[0]

                const price = listing.intent === 'rent'
                  ? formatPrice(listing.rent_price, listing.currency, listing.intent, locale)
                  : formatPrice(listing.sale_price, listing.currency, listing.intent, locale)
                    ?? formatPrice(listing.rent_price, listing.currency, listing.intent, locale)

                const stats: string[] = []
                if (listing.bedrooms) stats.push(`${listing.bedrooms} Zi.`)
                if (listing.size_sqm) stats.push(`${listing.size_sqm} m\u00b2`)

                return (
                  <Link
                    key={listing.id}
                    href={`/p/${listing.slug ?? listing.place_id}`}
                    className="bg-surface rounded-card shadow-sm overflow-hidden hover:-translate-y-1 transition-transform block"
                  >
                    {/* Photo */}
                    <div className="relative w-full aspect-[4/3] bg-gray-100">
                      {primaryPhoto ? (
                        <Image
                          src={primaryPhoto.url}
                          alt={listing.title_de ?? listing.place_id}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <p className="font-bold text-[#0F1117] truncate">
                        {listing.title_de ?? listing.place_id}
                      </p>
                      <p className="text-sm text-[#5E6278] mt-0.5">
                        {listing.city}{listing.postcode ? `, ${listing.postcode}` : ''}
                      </p>
                      {price && (
                        <p className="text-lg font-extrabold text-[#0F1117] mt-2">{price}</p>
                      )}
                      {stats.length > 0 && (
                        <p className="text-xs text-[#5E6278] mt-1">{stats.join(' \u00b7 ')}</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-[#E2E4EB]">
                {currentPage > 1 ? (
                  <Link
                    href={buildPageHref(filterParams, currentPage - 1)}
                    className="px-4 py-2 text-sm font-semibold bg-surface border border-[#E2E4EB] rounded-lg hover:bg-[#F1F5F9] transition-colors"
                  >
                    {t('previous')}
                  </Link>
                ) : (
                  <span className="px-4 py-2 text-sm font-semibold text-[#CBD5E1] bg-surface border border-[#E2E4EB] rounded-lg cursor-not-allowed">
                    {t('previous')}
                  </span>
                )}

                <span className="text-sm text-[#5E6278] font-medium">
                  {t('pageOf', { current: currentPage, total: totalPages })}
                </span>

                {currentPage < totalPages ? (
                  <Link
                    href={buildPageHref(filterParams, currentPage + 1)}
                    className="px-4 py-2 text-sm font-semibold bg-surface border border-[#E2E4EB] rounded-lg hover:bg-[#F1F5F9] transition-colors"
                  >
                    {t('next')}
                  </Link>
                ) : (
                  <span className="px-4 py-2 text-sm font-semibold text-[#CBD5E1] bg-surface border border-[#E2E4EB] rounded-lg cursor-not-allowed">
                    {t('next')}
                  </span>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}
