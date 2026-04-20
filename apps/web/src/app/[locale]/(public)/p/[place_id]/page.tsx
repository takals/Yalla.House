import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { ContactCard } from './contact-form'
import { ViewingCalendar } from './viewing-calendar'
import { ListingStatusBadge } from './listing-status-badge'
import { OwnerToolbar } from './owner-toolbar'
import {
  Home, BedDouble, Bath, Building, CalendarDays,
  MapPin, FileText, Zap, ArrowLeft, Eye,
} from 'lucide-react'
import { dateLocaleFromLocale } from '@/lib/country-config'
import { OwnerQuickActions } from './owner-quick-actions'
import { PhotoGallery } from './photo-gallery'
import { HeroPhoto } from './hero-photo'
import { OwnerInlineControls } from './owner-inline-controls'
import { resolveListing, canonicalListingPath, canonicalListingUrl } from '@/lib/resolve-listing'
import { ListingCtaBox } from './listing-cta-box'
import { KeyFactsGrid } from './key-facts-grid'
import { ListingActionsBar } from './listing-actions-bar'

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

  const [{ count: slotCount }, { data: portalSyncsData }] = await Promise.all([
    (supabase as any)
      .from('availability_slots')
      .select('id', { count: 'exact', head: true })
      .eq('listing_id', listing.id)
      .eq('is_booked', false)
      .gt('starts_at', new Date().toISOString()),
    isOwner
      ? (supabase as any)
          .from('portal_syncs')
          .select('portal, status')
          .eq('listing_id', listing.id)
          .then((r: { data: unknown }) => r)
          .catch(() => ({ data: null }))
      : Promise.resolve({ data: null }),
  ])

  const title  = locale === 'de' ? (listing.title_de  ?? listing.title)  : (listing.title  ?? listing.title_de)
  const desc   = locale === 'de' ? (listing.description_de ?? listing.description) : (listing.description ?? listing.description_de)
  const photos = (listing.listing_media as Array<{
    id: string; url: string; thumb_url: string | null; caption_de: string | null; caption: string | null; sort_order: number; is_primary: boolean; type: string
  }> | null)
    ?.filter(m => m.type === 'photo')
    .sort((a, b) => a.sort_order - b.sort_order) ?? []

  const primaryPhoto = photos.find(p => p.is_primary) ?? photos[0]
  const localeFmt = dateLocaleFromLocale(locale)

  // Format prices
  const formattedSalePrice = listing.intent !== 'rent' && listing.sale_price
    ? new Intl.NumberFormat(localeFmt, { style: 'currency', currency: listing.currency, maximumFractionDigits: 0 }).format(listing.sale_price / 100)
    : null
  const formattedRentPrice = listing.intent !== 'sale' && listing.rent_price
    ? new Intl.NumberFormat(localeFmt, { style: 'currency', currency: listing.currency, maximumFractionDigits: 0 }).format(listing.rent_price / 100)
    : null

  // Determine if listing is essentially empty (show example placeholder)
  const hasContent = !!(title || desc || photos.length > 0 || listing.sale_price || listing.rent_price)
  const showExample = isOwner && !hasContent

  // Build translation record for client components
  const ctaTranslations: Record<string, string> = {
    perMonth: t('perMonth'),
    ctaBookViewing: t('ctaBookViewing'),
    ctaMessageOwner: t('ctaMessageOwner'),
    ctaSlotsAvailable: t('ctaSlotsAvailable'),
    ctaNoSlots: t('ctaNoSlots'),
    barUnderOffer: t('barUnderOffer'),
    contactPrivacy: t('contactPrivacy'),
    shareProperty: t('shareProperty'),
    downloadBrochure: t('downloadBrochure'),
    exportForAgent: t('exportForAgent'),
  }

  const factTranslations: Record<string, string> = {
    factPropertyType: t('factPropertyType'),
    factBedrooms: t('factBedrooms'),
    factBathrooms: t('factBathrooms'),
    factLivingSpace: t('factLivingSpace'),
    factFloor: t('factFloor'),
    factBuiltYear: t('factBuiltYear'),
    factParking: t('factParking'),
    factGarden: t('factGarden'),
    factEnergyRating: t('factEnergyRating'),
    factAvailableFrom: t('factAvailableFrom'),
    factTypeFlat: t('factTypeFlat'),
    factTypeHouse: t('factTypeHouse'),
    factTypeStudio: t('factTypeStudio'),
    factTypeBungalow: t('factTypeBungalow'),
    factYes: t('factYes'),
    factNo: t('factNo'),
  }

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
          preMarketOptIn={!!listing.pre_market_opt_in}
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

      {/* ═══ HERO: Full-width photo with gradient overlay ═══ */}
      <div className={`relative w-full h-[55vh] min-h-[380px] ${showExample ? 'grayscale opacity-60' : ''} bg-gray-900`}>
        {primaryPhoto ? (
          <HeroPhoto
            photos={photos.map(p => ({
              id: p.id,
              url: p.url,
              thumb_url: p.thumb_url,
              caption_de: p.caption_de,
              caption: p.caption,
            }))}
            primaryUrl={primaryPhoto.url}
            alt={title ?? 'Property photo'}
            photoCount={photos.length}
            translations={{
              viewAllPhotos: t('viewAllPhotos'),
              photoOf: t('photoOf'),
              closeGallery: t('closeGallery'),
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <Home size={64} className="text-gray-600" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        {/* Status badge */}
        <div className="absolute top-4 left-4 z-10">
          <ListingStatusBadge status={listing.status} />
        </div>

        {/* Example badge for empty listings */}
        {showExample && (
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1.5 rounded-full">
              <Eye size={12} />
              {t('exampleBadge')}
            </span>
          </div>
        )}

        {/* Title + location on overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 pointer-events-none z-10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              {showExample ? t('exampleTitle') : (title ?? t('titleFallback'))}
            </h1>
            <div className="flex items-center gap-2 text-white/70 text-sm md:text-base">
              <MapPin size={14} className="flex-shrink-0" />
              <span>{showExample ? t('exampleLocation') : `${listing.postcode} ${listing.city}`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ PRICE BAR + ACTIONS ═══ */}
      <div className="bg-surface border-b border-border-default">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          {/* Left: Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            {showExample ? (
              <span className="text-2xl font-extrabold text-text-primary opacity-50">{t('examplePrice')}</span>
            ) : (
              <>
                {formattedSalePrice && (
                  <span className="text-2xl font-extrabold text-text-primary">{formattedSalePrice}</span>
                )}
                {formattedRentPrice && (
                  <span className="text-2xl font-extrabold text-text-primary">
                    {formattedRentPrice} <span className="text-sm font-medium text-text-secondary">/ {t('perMonth')}</span>
                  </span>
                )}
                {!formattedSalePrice && !formattedRentPrice && (
                  <span className="text-lg font-bold text-text-secondary">{t('titleFallback')}</span>
                )}
              </>
            )}
          </div>

          {/* Right: Share / Brochure */}
          {!isOwner && (
            <ListingActionsBar
              slug={listing.slug ?? null}
              placeId={listing.place_id}
              translations={ctaTranslations}
            />
          )}
        </div>
      </div>

      {/* ═══ MAIN CONTENT — Two column: content + CTA sidebar ═══ */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left column: Structured sections ── */}
          <div className="flex-1 min-w-0 space-y-8">

            {/* §1 KEY FACTS */}
            <section>
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <Home size={18} className="text-brand" />
                {t('sectionKeyFacts')}
              </h2>
              <KeyFactsGrid listing={listing} translations={factTranslations} />
            </section>

            {/* §2 DESCRIPTION */}
            <section>
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <FileText size={18} className="text-brand" />
                {t('sectionDescription')}
              </h2>
              {isOwner ? (
                <div className="bg-surface rounded-xl border border-border-default p-6">
                  <OwnerInlineControls
                    listingId={listing.id}
                    title={title ?? ''}
                    description={desc ?? null}
                    salePrice={listing.sale_price ?? null}
                    rentPrice={listing.rent_price ?? null}
                    currency={listing.currency ?? 'GBP'}
                    photoCount={photos.length}
                  />
                </div>
              ) : showExample ? (
                <div className="bg-surface rounded-xl border border-border-default p-6 opacity-50">
                  <p className="text-text-secondary leading-relaxed">{t('exampleDescription')}</p>
                </div>
              ) : desc ? (
                <div className="bg-surface rounded-xl border border-border-default p-6">
                  <p className="text-text-secondary leading-relaxed whitespace-pre-line">{desc}</p>
                </div>
              ) : null}
            </section>

            {/* §3 PHOTO GALLERY */}
            {photos.length > 1 && (
              <section>
                <PhotoGallery
                  photos={photos.map(p => ({
                    id: p.id,
                    url: p.url,
                    thumb_url: p.thumb_url,
                    caption_de: p.caption_de,
                    caption: p.caption,
                  }))}
                  title={title}
                  translations={{
                    photosTitle: t('sectionPhotos'),
                    viewAllPhotos: t('viewAllPhotos'),
                    photoOf: t('photoOf'),
                    closeGallery: t('closeGallery'),
                  }}
                />
              </section>
            )}

            {/* §4 LOCATION */}
            {(listing.city || listing.postcode) && (
              <section>
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-brand" />
                  {t('sectionLocation')}
                </h2>
                <div className="bg-surface rounded-xl border border-border-default p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-brand" />
                    </div>
                    <div>
                      <p className="font-bold text-text-primary">{listing.postcode} {listing.city}</p>
                      {listing.street && (
                        <p className="text-sm text-text-secondary">{listing.street}</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* §5 FLOOR PLAN — owner upload placeholder */}
            {isOwner && (
              <section>
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-brand" />
                  {t('sectionFloorPlan')}
                </h2>
                <div className="bg-surface rounded-xl border border-dashed border-border-default p-8 text-center">
                  <FileText size={32} className="mx-auto mb-3 text-text-secondary" />
                  <p className="text-sm text-text-secondary mb-4">{t('noFloorPlan')}</p>
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-bg hover:bg-hover-muted text-text-primary text-sm font-semibold rounded-lg border border-border-default transition-colors">
                    {t('uploadFloorPlan')}
                  </button>
                </div>
              </section>
            )}

            {/* §6 ENERGY CERTIFICATE — owner upload placeholder */}
            {isOwner && (
              <section>
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-brand" />
                  {t('sectionEpc')}
                </h2>
                <div className="bg-surface rounded-xl border border-dashed border-border-default p-8 text-center">
                  <Zap size={32} className="mx-auto mb-3 text-text-secondary" />
                  <p className="text-sm text-text-secondary mb-4">{t('noEpc')}</p>
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-bg hover:bg-hover-muted text-text-primary text-sm font-semibold rounded-lg border border-border-default transition-colors">
                    {t('uploadEpc')}
                  </button>
                </div>
              </section>
            )}

            {/* §7 VIEWING CALENDAR */}
            <section>
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <CalendarDays size={18} className="text-brand" />
                {t('calendarTitle')}
              </h2>
              {isOwner ? (
                <div className="bg-surface rounded-xl border border-border-default p-8 text-center">
                  <CalendarDays size={40} className="mx-auto mb-3 text-brand" />
                  <p className="text-sm text-text-secondary mb-5 max-w-md mx-auto">{t('calendarOwnerCta')}</p>
                  <a
                    href="/owner/calendar"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-lg hover:bg-brand-hover transition-colors"
                  >
                    <CalendarDays size={16} />
                    {t('calendarManageSlots')}
                  </a>
                </div>
              ) : (
                <ViewingCalendar
                  listingId={listing.id}
                  authenticated={isAuthenticated}
                  isOwner={false}
                  locale={locale}
                  placeId={listing.place_id}
                  preselectedSlotId={preselectedSlotId}
                />
              )}
            </section>

            {/* §8 CONTACT FORM (for hunters, below calendar) */}
            {!isOwner && (
              <section id="contact-section">
                <ContactCard listingId={listing.id} />
              </section>
            )}
          </div>

          {/* ── Right column: CTA box + Owner tools ── */}
          <div className="lg:w-[340px] flex-shrink-0">
            <div className="sticky top-20 space-y-6">
              {/* CTA box for hunters */}
              {!isOwner && (
                <ListingCtaBox
                  listingId={listing.id}
                  placeId={listing.place_id}
                  slotCount={slotCount ?? 0}
                  status={listing.status}
                  salePrice={formattedSalePrice}
                  rentPrice={formattedRentPrice}
                  translations={ctaTranslations}
                />
              )}

              {/* Owner quick actions */}
              {isOwner && (
                <OwnerQuickActions
                  listingId={listing.id}
                  translations={{
                    quickActions: t('quickActions'),
                    editListing: t('editListing'),
                    propertyDetails: t('propertyDetails'),
                    addViewingSlots: t('addViewingSlots'),
                    manageViewings: t('manageViewings'),
                    inviteAgents: t('inviteAgents'),
                    viewAnalytics: t('viewAnalytics'),
                    portalStatus: t('portalStatus'),
                    portalStatusLive: t('portalStatusLive'),
                    portalStatusPending: t('portalStatusPending'),
                    portalStatusNone: t('portalStatusNone'),
                  }}
                  portalSyncs={portalSyncsData as Array<{ portal: string; status: string }> | undefined}
                />
              )}

              {/* Listed by Yalla.House */}
              <div className="text-center text-xs text-text-secondary pt-4 border-t border-border-default">
                <p>{t('listedBy')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
