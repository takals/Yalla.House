import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Image from 'next/image'
import { ContactCard } from './contact-form'
import { ViewingCalendar } from './viewing-calendar'
import { ListingStatusBadge } from './listing-status-badge'
import { StickyBookingBar } from './sticky-booking-bar'
import { OwnerToolbar } from './owner-toolbar'
import { Home, BedDouble, Bath, Building, CalendarDays } from 'lucide-react'
import { resolveListing, canonicalListingPath, canonicalListingUrl } from '@/lib/resolve-listing'

interface Props {
  params: Promise<{ place_id: string; locale: string }>
  searchParams: Promise<{ slot?: string; ref?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { place_id: identifier, locale } = await params
  const supabase = await createClient()
  const t = await getTranslations('listingPage')

  const resolved = await resolveListing(
    supabase,
    identifier,
    'title_de, title, description_de, description, city, postcode, slug, place_id, listing_media(url, is_primary)',
  )

  if (!resolved) return { title: t('metaNotFound') }
  const data = resolved.listing

  const title = locale === 'de'
    ? ((data['title_de'] as string) ?? (data['title'] as string) ?? t('metaFallbackTitle'))
    : ((data['title'] as string) ?? (data['title_de'] as string) ?? t('metaFallbackTitle'))

  const description = locale === 'de'
    ? ((data['description_de'] as string) ?? (data['description'] as string) ?? '')
    : ((data['description'] as string) ?? (data['description_de'] as string) ?? '')

  const primaryPhoto = (data['listing_media'] as Array<{ url: string; is_primary: boolean }> | null)
    ?.find(m => m.is_primary)?.url

  const canonical = canonicalListingUrl(data, locale)
  const location = [data['postcode'], data['city']].filter(Boolean).join(' ')
  const fullTitle = title + (location ? ` — ${location}` : '')

  return {
    title: fullTitle,
    description: description.slice(0, 155),
    alternates: { canonical },
    openGraph: {
      title: fullTitle,
      description: description.slice(0, 155),
      url: canonical,
      type: 'website',
      siteName: 'Yalla.House',
      images: primaryPhoto ? [{
        url: primaryPhoto,
        width: 1200,
        height: 630,
        alt: fullTitle,
      }] : [],
    },
    twitter: {
      card: primaryPhoto ? 'summary_large_image' : 'summary',
      title: fullTitle,
      description: description.slice(0, 155),
      images: primaryPhoto ? [primaryPhoto] : [],
    },
    robots: { index: true, follow: true },
  }
}

export default async function PropertyPage({ params, searchParams }: Props) {
  const { place_id: identifier, locale } = await params
  const { slot: preselectedSlotId, ref: refSource } = await searchParams
  const supabase = await createClient()
  const t = await getTranslations('listingPage')

  const { data: { user } } = await supabase.auth.getUser()

  // Resolve listing by slug, short_id, or place_id
  const resolved = await resolveListing(supabase, identifier)

  if (!resolved) notFound()

  const listing = resolved.listing as Record<string, any>

  // If accessed via short_id or place_id but listing has a slug, redirect to canonical slug URL
  if (resolved.matched_by !== 'slug' && listing.slug) {
    const canonical = canonicalListingPath(listing)
    const qs = new URLSearchParams()
    if (preselectedSlotId) qs.set('slot', preselectedSlotId)
    if (refSource) qs.set('ref', refSource)
    const qsStr = qs.toString()
    redirect(`${canonical}${qsStr ? `?${qsStr}` : ''}`)
  }

  // Track ref source if present (e.g. ?ref=whatsapp, ?ref=rightmove, ?ref=qr)
  if (refSource && listing.id) {
    // Fire-and-forget: update inbound_leads link_clicked_at if matching lead exists
    const { createServiceClient } = await import('@/lib/supabase/server')
    const service = createServiceClient()
    ;(service.from('inbound_leads') as any)
      .update({ link_clicked_at: new Date().toISOString() })
      .eq('listing_id', listing.id)
      .eq('reply_channel', refSource)
      .is('link_clicked_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(() => {})
      .catch(() => {})
  }

  const isOwner = !!user && listing.owner_id === user.id
  const isAuthenticated = !!user
  const isPublicVisible = listing.status === 'active' || listing.status === 'under_offer'

  if (!isOwner && !isPublicVisible) notFound()

  const { count: slotCount } = await (supabase as any)
    .from('availability_slots')
    .select('id', { count: 'exact', head: true })
    .eq('listing_id', listing.id)
    .eq('is_booked', false)
    .gt('starts_at', new Date().toISOString())

  const title  = locale === 'de' ? (listing.title_de  ?? listing.title)  : (listing.title  ?? listing.title_de)
  const desc   = locale === 'de' ? (listing.description_de ?? listing.description) : (listing.description ?? listing.description_de)
  const photos = (listing.listing_media as Array<{
    id: string; url: string; thumb_url: string | null; caption_de: string | null; caption: string | null; sort_order: number; is_primary: boolean; type: string
  }> | null)
    ?.filter(m => m.type === 'photo')
    .sort((a, b) => a.sort_order - b.sort_order) ?? []

  const primaryPhoto = photos.find(p => p.is_primary) ?? photos[0]
  const localeFmt = locale === 'de' ? 'de-DE' : 'en-GB'

  // Format price
  const formattedSalePrice = listing.intent !== 'rent' && listing.sale_price
    ? new Intl.NumberFormat(localeFmt, { style: 'currency', currency: listing.currency, maximumFractionDigits: 0 }).format(listing.sale_price / 100)
    : null
  const formattedRentPrice = listing.intent !== 'sale' && listing.rent_price
    ? new Intl.NumberFormat(localeFmt, { style: 'currency', currency: listing.currency, maximumFractionDigits: 0 }).format(listing.rent_price / 100)
    : null

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateListing',
            name: title ?? listing.title_de ?? listing.place_id,
            description: desc?.substring(0, 200) ?? '',
            url: canonicalListingUrl(listing, locale),
            ...(listing.sale_price || listing.rent_price ? {
              offers: {
                '@type': 'Offer',
                price: (listing.sale_price ?? listing.rent_price) / 100,
                priceCurrency: listing.currency || 'EUR',
              }
            } : {}),
            address: {
              '@type': 'PostalAddress',
              addressLocality: listing.city,
              postalCode: listing.postcode,
              addressCountry: listing.country_code || 'DE',
            },
          })
        }}
      />

      {/* ── Owner toolbar ───────────────────────────────────────── */}
      {isOwner && (
        <OwnerToolbar
          listingId={listing.id}
          placeId={listing.place_id}
          slug={listing.slug ?? null}
          shortId={listing.short_id ?? null}
          status={listing.status}
          locale={locale}
          listingTitle={title ?? undefined}
          address={`${listing.postcode} ${listing.city}`}
          price={formattedSalePrice ?? formattedRentPrice ?? undefined}
          photoUrl={primaryPhoto?.url ?? undefined}
        />
      )}

      {/* ── Sticky booking bar (hunters) ────────────────────────── */}
      {!isOwner && isPublicVisible && (
        <StickyBookingBar
          status={listing.status}
          slotCount={slotCount ?? 0}
          listingId={listing.id}
        />
      )}

      {/* ── Draft notice ────────────────────────────────────────── */}
      {isOwner && !isPublicVisible && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
          <p className="text-sm text-amber-800 font-medium">
            {t('draftNotice')}
          </p>
        </div>
      )}

      {/* ═══ HERO: Photo with gradient overlay + title/price ═══ */}
      <div className="relative w-full h-[55vh] min-h-[380px] bg-gray-900">
        {primaryPhoto ? (
          <Image
            src={primaryPhoto.url}
            alt={title ?? 'Property photo'}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <ListingStatusBadge status={listing.status} />
        </div>

        {/* Title + price on overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              {title ?? t('titleFallback')}
            </h1>
            <p className="text-white/70 text-sm md:text-base mb-3">
              {listing.postcode} {listing.city}
            </p>
            <div className="flex items-baseline gap-3 flex-wrap">
              {formattedSalePrice && (
                <span className="text-2xl md:text-3xl font-extrabold text-white">{formattedSalePrice}</span>
              )}
              {formattedRentPrice && (
                <span className="text-2xl md:text-3xl font-extrabold text-white">
                  {formattedRentPrice} <span className="text-lg font-medium text-white/60">/ {t('perMonth')}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ KEY STATS BAR ═══ */}
      <div className="bg-surface border-b border-border-default">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-6 overflow-x-auto">
          {listing.size_sqm ? (
            <StatPill icon={<Home size={15} />} value={`${listing.size_sqm} m²`} label={t('statLivingSpace')} />
          ) : null}
          {listing.bedrooms ? (
            <StatPill icon={<BedDouble size={15} />} value={String(listing.bedrooms)} label={t('statRooms')} />
          ) : null}
          {listing.bathrooms ? (
            <StatPill icon={<Bath size={15} />} value={String(listing.bathrooms)} label={t('statBathrooms')} />
          ) : null}
          {listing.floor != null ? (
            <StatPill icon={<Building size={15} />} value={String(listing.floor)} label={t('statFloor')} />
          ) : null}
          {listing.construction_year ? (
            <StatPill icon={<CalendarDays size={15} />} value={String(listing.construction_year)} label={t('statBuilt')} />
          ) : null}
        </div>
      </div>

      {/* ═══ CALENDAR HERO — The main conversion section ═══ */}
      <div className="bg-[#FAFBFC] border-b border-border-default">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <ViewingCalendar
            listingId={listing.id}
            authenticated={isAuthenticated}
            isOwner={isOwner}
            locale={locale}
            placeId={listing.place_id}
            preselectedSlotId={preselectedSlotId}
          />
        </div>
      </div>

      {/* ═══ CONTENT: Description + Photos + Sidebar ═══ */}
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0 space-y-4">
          {/* Description */}
          {desc && (
            <div className="bg-surface rounded-card p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-3">{t('descriptionTitle')}</h2>
              <p className="text-text-secondary leading-relaxed whitespace-pre-line">{desc}</p>
            </div>
          )}

          {/* Photo gallery */}
          {photos.length > 1 && (
            <div className="bg-surface rounded-card p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-3">{t('photosTitle')} ({photos.length})</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {photos.map(photo => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={photo.thumb_url ?? photo.url}
                      alt={photo.caption_de ?? photo.caption ?? (title ? `${title} photo` : 'Property photo')}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="sticky top-20 space-y-4">
            {!isOwner && <ContactCard listingId={listing.id} />}
            {isOwner && (
              <div className="bg-surface rounded-card p-6 shadow-sm border border-border-default">
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-3">
                  {t('quickActions')}
                </p>
                <div className="space-y-2">
                  <a href={`/owner/${listing.id}`} className="block w-full text-center bg-bg hover:bg-hover-muted text-text-primary font-semibold text-sm py-2.5 rounded-lg transition-colors">
                    {t('editListing')}
                  </a>
                  <a href="/owner/viewings" className="block w-full text-center bg-bg hover:bg-hover-muted text-text-primary font-semibold text-sm py-2.5 rounded-lg transition-colors">
                    {t('manageViewings')}
                  </a>
                  <a href="/owner/agents" className="block w-full text-center bg-bg hover:bg-hover-muted text-text-primary font-semibold text-sm py-2.5 rounded-lg transition-colors">
                    {t('inviteAgents')}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0">
      <div className="text-brand">{icon}</div>
      <div className="leading-tight">
        <p className="font-bold text-sm text-text-primary">{value}</p>
        <p className="text-[10px] text-text-secondary uppercase tracking-wide">{label}</p>
      </div>
    </div>
  )
}
