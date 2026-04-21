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
import { DocumentUploadSection } from './document-upload-section'
import { HeroEditButton } from './hero-edit-button'

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

  // Extract floor plan and EPC documents
  const allMedia = (listing.listing_media as Array<{ id: string; url: string; type: string }> | null) ?? []
  const floorPlanMedia = allMedia.find(m => m.type === 'floor_plan')
  const epcMedia = allMedia.find(m => m.type === 'epc')

  const localeFmt = dateLocaleFromLocale(locale)

  // Format prices
  const formattedSalePrice = listing.intent !== 'rent' && listing.sale_price
    ? new Intl.NumberFormat(localeFmt, { style: 'currency', currency: listing.currency, maximumFractionDigits: 0 }).format(listing.sale_price / 100)
    : null
  const formattedRentPrice = listing.intent !== 'sale' && listing.rent_price
    ? new Intl.NumberFormat(localeFmt, { style: 'currency', currency: listing.currency, maximumFractionDigits: 0 }).format(listing.rent_price / 100)
    : null

  // Per-section empty checks — each section independently shows greyed-out placeholders
  const hasPhotos = photos.length > 0
  const hasDescription = !!desc
  const hasPrice = !!(listing.sale_price || listing.rent_price)
  const hasKeyFacts = !!(listing.property_type || listing.bedrooms || listing.bathrooms || listing.size_sqm)

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
    noFloorPlan: t('noFloorPlan'),
    noEpc: t('noEpc'),
    uploadFloorPlan: t('uploadFloorPlan'),
    uploadEpc: t('uploadEpc'),
    sectionFloorPlan: t('sectionFloorPlan'),
    sectionEpc: t('sectionEpc'),
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
      <div className={`relative w-full h-[55vh] min-h-[380px] bg-gray-900`}>
        {hasPhotos ? (
          <HeroPhoto
            photos={photos.map(p => ({
              id: p.id,
              url: p.url,
              thumb_url: p.thumb_url,
              caption_de: p.caption_de,
              caption: p.caption,
            }))}
            primaryUrl={primaryPhoto!.url}
            alt={title ?? 'Property photo'}
            photoCount={photos.length}
            translations={{
              viewAllPhotos: t('viewAllPhotos'),
              photoOf: t('photoOf'),
              closeGallery: t('closeGallery'),
            }}
          />
        ) : (
          /* Greyed-out placeholder hero — shows example property photo grid layout */
          <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-800">
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1.5 p-2">
              <div className="col-span-2 row-span-2 bg-gray-600 rounded-lg flex items-center justify-center">
                <Home size={64} className="text-gray-500/50" />
              </div>
              <div className="bg-gray-600 rounded-lg" />
              <div className="bg-gray-650 rounded-lg" style={{ backgroundColor: '#4B5563' }} />
            </div>
          </div>
        )}
        {/* Gradient overlay — heavier when real photos, lighter for placeholder */}
        <div className={`absolute inset-0 pointer-events-none ${hasPhotos ? 'bg-gradient-to-t from-black/80 via-black/30 to-transparent' : 'bg-gradient-to-t from-black/60 via-transparent to-transparent'}`} />

        {/* Status badge */}
        <div className="absolute top-4 left-4 z-10">
          <ListingStatusBadge status={listing.status} />
        </div>

        {/* Owner: Edit Photos button on hero */}
        {isOwner && (
          <HeroEditButton hasPhotos={hasPhotos} translations={{ heroUploadPhotos: t('heroUploadPhotos'), heroChangePhotos: t('heroChangePhotos') }} listingId={listing.id} photoCount={photos.length} />
        )}

        {/* Example badge when owner has no photos */}
        {isOwner && !hasPhotos && (
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
              {title ?? t('titleFallback')}
            </h1>
            <div className="flex items-center gap-2 text-white/70 text-sm md:text-base">
              <MapPin size={14} className="flex-shrink-0" />
              <span>{`${listing.postcode} ${listing.city}`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ PRICE BAR + ACTIONS ═══ */}
      <div className="bg-surface border-b border-border-default">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          {/* Left: Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            {formattedSalePrice && (
              <span className="text-2xl font-extrabold text-text-primary">{formattedSalePrice}</span>
            )}
            {formattedRentPrice && (
              <span className="text-2xl font-extrabold text-text-primary">
                {formattedRentPrice} <span className="text-sm font-medium text-text-secondary">/ {t('perMonth')}</span>
              </span>
            )}
            {!formattedSalePrice && !formattedRentPrice && (
              <span className={`text-2xl font-extrabold ${isOwner ? 'text-text-muted' : 'text-text-secondary'}`}>
                {isOwner ? t('examplePrice') : t('titleFallback')}
              </span>
            )}
          </div>

          {/* Right: Share / Brochure */}
          {!isOwner && (
            <ListingActionsBar
              slug={listing.slug ?? null}
              placeId={listing.place_id}
              title={title ?? t('titleFallback')}
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
              {hasKeyFacts ? (
                <KeyFactsGrid listing={listing} translations={factTranslations} />
              ) : (
                /* Greyed-out placeholder key facts grid */
                <div className="bg-surface rounded-xl border border-border-default p-6 opacity-40">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[t('factPropertyType'), t('factBedrooms'), t('factBathrooms'), t('factLivingSpace'), t('factFloor'), t('factBuiltYear')].map((label) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <Building size={16} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-xs text-text-muted">{label}</p>
                          <div className="h-4 w-16 bg-gray-200 rounded mt-1" />
                        </div>
                      </div>
                    ))}
                  </div>
                  {isOwner && (
                    <p className="text-xs text-brand mt-4 text-center font-medium">{t('placeholderEditHint')}</p>
                  )}
                </div>
              )}
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
                  {!hasDescription && (
                    <p className="text-xs text-brand mt-3 font-medium">{t('placeholderAddDescription')}</p>
                  )}
                </div>
              ) : desc ? (
                <div className="bg-surface rounded-xl border border-border-default p-6">
                  <p className="text-text-secondary leading-relaxed whitespace-pre-line">{desc}</p>
                </div>
              ) : (
                /* Greyed-out placeholder description for non-owners */
                <div className="bg-surface rounded-xl border border-border-default p-6 opacity-40">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="h-4 bg-gray-200 rounded w-4/6" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-3/6" />
                  </div>
                </div>
              )}
            </section>

            {/* §3 PHOTO GALLERY */}
            {photos.length > 1 ? (
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
            ) : (
              /* Greyed-out photo gallery placeholders */
              <section>
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Home size={18} className="text-brand" />
                  {t('sectionPhotos')}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 opacity-40">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-[4/3] bg-gray-200 rounded-xl flex items-center justify-center">
                      <Home size={24} className="text-gray-400" />
                    </div>
                  ))}
                </div>
                {isOwner && (
                  <p className="text-xs text-brand mt-3 text-center font-medium">{t('placeholderUploadPhotos')}</p>
                )}
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

            {/* §5 FLOOR PLAN — interactive upload for owners, display for hunters */}
            {(isOwner || floorPlanMedia) && (
              <section>
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <FileText size={18} className="text-brand" />
                  {t('sectionFloorPlan')}
                </h2>
                {isOwner ? (
                  <DocumentUploadSection
                    listingId={listing.id}
                    type="floor_plan"
                    existingUrl={floorPlanMedia?.url ?? null}
                    translations={ctaTranslations}
                  />
                ) : floorPlanMedia ? (
                  <div className="bg-surface rounded-xl border border-border-default overflow-hidden">
                    <img src={floorPlanMedia.url} alt={t('sectionFloorPlan')} className="w-full max-h-[500px] object-contain bg-gray-50" />
                  </div>
                ) : null}
              </section>
            )}

            {/* §6 ENERGY CERTIFICATE — interactive upload for owners, display for hunters */}
            {(isOwner || epcMedia) && (
              <section>
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-brand" />
                  {t('sectionEpc')}
                </h2>
                {isOwner ? (
                  <DocumentUploadSection
                    listingId={listing.id}
                    type="epc"
                    existingUrl={epcMedia?.url ?? null}
                    translations={ctaTranslations}
                  />
                ) : epcMedia ? (
                  <div className="bg-surface rounded-xl border border-border-default overflow-hidden">
                    <img src={epcMedia.url} alt={t('sectionEpc')} className="w-full max-h-[500px] object-contain bg-gray-50" />
                  </div>
                ) : null}
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
