import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  params: Promise<{ locale: string }>
  searchParams: Promise<{
    city?: string
    intent?: string
    type?: string
    min?: string
    max?: string
  }>
}

function formatPrice(
  minor: number | null,
  currency: string,
  intent: string,
  locale: string
): string | null {
  if (!minor) return null
  const formatted = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100)
  return intent === 'rent' || intent === 'both' ? `${formatted} / Mo.` : formatted
}

export default async function ListingsPage({ params, searchParams }: Props) {
  const { locale } = await params
  const { city, intent, type, min, max } = await searchParams

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase.from('listings') as any)
    .select('id, place_id, title_de, intent, property_type, city, postcode, size_sqm, bedrooms, sale_price, rent_price, currency, listing_media(url, is_primary, type)')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(48)

  if (city?.trim()) q = q.ilike('city', `%${city.trim()}%`)
  if (intent === 'buy')  q = q.in('intent', ['sale', 'both'])
  if (intent === 'rent') q = q.in('intent', ['rent', 'both'])
  if (type) q = q.eq('property_type', type)

  const priceCol = intent === 'rent' ? 'rent_price' : 'sale_price'
  if (min && !isNaN(parseInt(min))) q = q.gte(priceCol, parseInt(min) * 100)
  if (max && !isNaN(parseInt(max))) q = q.lte(priceCol, parseInt(max) * 100)

  const { data: listings } = await q as {
    data: Array<{
      id: string
      place_id: string
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
    }> | null
  }

  const results = listings ?? []

  const propertyTypes = [
    { value: 'house', label: locale === 'de' ? 'Haus' : 'House' },
    { value: 'flat', label: locale === 'de' ? 'Wohnung' : 'Flat' },
    { value: 'apartment', label: locale === 'de' ? 'Apartment' : 'Apartment' },
    { value: 'villa', label: 'Villa' },
    { value: 'commercial', label: locale === 'de' ? 'Gewerbe' : 'Commercial' },
    { value: 'land', label: locale === 'de' ? 'Grundstück' : 'Land' },
  ]

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">
          {locale === 'de' ? 'Inserate' : 'Listings'}
        </h1>

        {/* Filter bar */}
        <form method="GET" className="bg-surface rounded-card p-4 shadow-sm mb-8 flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-[140px]">
            <label className="text-xs font-semibold text-[#5E6278]">
              {locale === 'de' ? 'Stadt / Ort' : 'City'}
            </label>
            <input
              type="text"
              name="city"
              defaultValue={city ?? ''}
              placeholder={locale === 'de' ? 'z.B. Berlin' : 'e.g. Berlin'}
              className="px-3 py-2 text-sm border border-[#E2E4EB] rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>

          <div className="flex flex-col gap-1 min-w-[110px]">
            <label className="text-xs font-semibold text-[#5E6278]">
              {locale === 'de' ? 'Art' : 'Intent'}
            </label>
            <select
              name="intent"
              defaultValue={intent ?? ''}
              className="px-3 py-2 text-sm border border-[#E2E4EB] rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            >
              <option value="">{locale === 'de' ? 'Alle' : 'All'}</option>
              <option value="buy">{locale === 'de' ? 'Kaufen' : 'Buy'}</option>
              <option value="rent">{locale === 'de' ? 'Mieten' : 'Rent'}</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[130px]">
            <label className="text-xs font-semibold text-[#5E6278]">
              {locale === 'de' ? 'Immobilientyp' : 'Property type'}
            </label>
            <select
              name="type"
              defaultValue={type ?? ''}
              className="px-3 py-2 text-sm border border-[#E2E4EB] rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            >
              <option value="">{locale === 'de' ? 'Alle Typen' : 'All types'}</option>
              {propertyTypes.map(pt => (
                <option key={pt.value} value={pt.value}>{pt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[90px]">
            <label className="text-xs font-semibold text-[#5E6278]">
              {locale === 'de' ? 'Min €' : 'Min €'}
            </label>
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
            <label className="text-xs font-semibold text-[#5E6278]">
              {locale === 'de' ? 'Max €' : 'Max €'}
            </label>
            <input
              type="number"
              name="max"
              defaultValue={max ?? ''}
              min="0"
              step="100"
              placeholder="∞"
              className="px-3 py-2 text-sm border border-[#E2E4EB] rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-brand hover:bg-brand-hover text-[#0F1117] font-bold text-sm rounded-lg transition-colors whitespace-nowrap"
          >
            {locale === 'de' ? 'Suchen' : 'Search'}
          </button>

          {(city || intent || type || min || max) && (
            <Link
              href="/listings"
              className="px-4 py-2 text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] transition-colors whitespace-nowrap self-end"
            >
              {locale === 'de' ? 'Zurücksetzen' : 'Reset'}
            </Link>
          )}
        </form>

        {/* Results count */}
        <p className="text-sm text-[#5E6278] mb-4">
          {results.length === 48
            ? locale === 'de' ? 'Mehr als 48 Inserate gefunden' : 'More than 48 listings found'
            : results.length === 1
              ? locale === 'de' ? '1 Inserat gefunden' : '1 listing found'
              : locale === 'de'
                ? `${results.length} Inserate gefunden`
                : `${results.length} listings found`}
        </p>

        {/* Results grid */}
        {results.length === 0 ? (
          <div className="bg-surface rounded-card p-12 text-center shadow-sm">
            <p className="text-[#5E6278]">
              {locale === 'de' ? 'Keine Inserate gefunden.' : 'No listings found.'}
            </p>
            <Link
              href="/listings"
              className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
            >
              {locale === 'de' ? 'Filter zurücksetzen' : 'Reset filters'}
            </Link>
          </div>
        ) : (
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
              if (listing.size_sqm) stats.push(`${listing.size_sqm} m²`)

              return (
                <Link
                  key={listing.id}
                  href={`/p/${listing.place_id}`}
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
                      <p className="text-xs text-[#5E6278] mt-1">{stats.join(' · ')}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
