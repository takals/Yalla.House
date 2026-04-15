import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { ContactCard } from './contact-form'
import { BookingSlots } from './booking-slots'
import { ListingStatusBadge } from './listing-status-badge'
import { StickyBookingBar } from './sticky-booking-bar'

interface Props {
  params: Promise<{ place_id: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { place_id, locale } = await params
  const supabase = await createClient()

  const { data } = await (supabase as any)
    .from('listings')
    .select('title_de, title, description_de, description, city, postcode, listing_media(url, is_primary)')
    .eq('place_id', place_id)
    .in('status', ['active', 'under_offer'])
    .single()

  if (!data) return { title: 'Immobilie nicht gefunden' }

  const title = locale === 'de'
    ? (data.title_de ?? data.title ?? 'Immobilie')
    : (data.title ?? data.title_de ?? 'Property')

  const description = locale === 'de'
    ? (data.description_de ?? data.description ?? '')
    : (data.description ?? data.description_de ?? '')

  const primaryPhoto = (data.listing_media as Array<{ url: string; is_primary: boolean }> | null)
    ?.find(m => m.is_primary)?.url

  return {
    title,
    description: description.slice(0, 155),
    openGraph: {
      title,
      description: description.slice(0, 155),
      images: primaryPhoto ? [primaryPhoto] : [],
    },
  }
}

export default async function PropertyPage({ params }: Props) {
  const { place_id, locale } = await params
  const supabase = await createClient()

  const { data: listing } = await (supabase as any)
    .from('listings')
    .select(`
      *,
      listing_media ( id, url, thumb_url, caption_de, caption, sort_order, is_primary, type )
    `)
    .eq('place_id', place_id)
    .in('status', ['active', 'under_offer'])
    .single()

  if (!listing) notFound()

  // Check auth for booking slots
  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user

  // Count available slots
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
  const isDE = locale === 'de'

  return (
    <div className="min-h-screen bg-bg">

      {/* ── Sticky top bar: Book a Viewing ──────────────────────── */}
      <StickyBookingBar
        status={listing.status}
        slotCount={slotCount ?? 0}
        listingId={listing.id}
        locale={locale}
      />

      {/* Hero photo */}
      {primaryPhoto && (
        <div className="relative w-full h-[50vh] bg-gray-200">
          <Image
            src={primaryPhoto.url}
            alt={title ?? 'Property photo'}
            fill
            className="object-cover"
            priority
          />
          {/* Status badge overlay on photo */}
          <div className="absolute top-4 left-4">
            <ListingStatusBadge status={listing.status} locale={locale} />
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left: listing details */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Title + status */}
          <div className="bg-surface rounded-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-3xl font-bold">{title}</h1>
              {!primaryPhoto && <ListingStatusBadge status={listing.status} locale={locale} />}
            </div>
            <p className="text-[#5E6278]">{listing.postcode} {listing.city}</p>

            {/* Price */}
            <div className="mt-4">
              {listing.intent !== 'rent' && listing.sale_price ? (
                <p className="text-2xl font-extrabold">
                  {new Intl.NumberFormat(isDE ? 'de-DE' : 'en-GB', {
                    style: 'currency',
                    currency: listing.currency,
                    maximumFractionDigits: 0,
                  }).format(listing.sale_price / 100)}
                </p>
              ) : null}
              {listing.intent !== 'sale' && listing.rent_price ? (
                <p className="text-2xl font-extrabold">
                  {new Intl.NumberFormat(isDE ? 'de-DE' : 'en-GB', {
                    style: 'currency',
                    currency: listing.currency,
                    maximumFractionDigits: 0,
                  }).format(listing.rent_price / 100)} / {isDE ? 'Monat' : 'month'}
                </p>
              ) : null}
            </div>
          </div>

          {/* Key stats */}
          <div className="bg-surface rounded-card p-6 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
            {listing.size_sqm ? (
              <Stat label={isDE ? 'Wohnfläche' : 'Living Space'} value={`${listing.size_sqm} m²`} />
            ) : null}
            {listing.bedrooms ? (
              <Stat label={isDE ? 'Zimmer' : 'Rooms'} value={String(listing.bedrooms)} />
            ) : null}
            {listing.bathrooms ? (
              <Stat label={isDE ? 'Badezimmer' : 'Bathrooms'} value={String(listing.bathrooms)} />
            ) : null}
            {listing.floor != null ? (
              <Stat label={isDE ? 'Etage' : 'Floor'} value={String(listing.floor)} />
            ) : null}
            {listing.construction_year ? (
              <Stat label={isDE ? 'Baujahr' : 'Built'} value={String(listing.construction_year)} />
            ) : null}
          </div>

          {/* Description */}
          {desc && (
            <div className="bg-surface rounded-card p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-3">{isDE ? 'Beschreibung' : 'Description'}</h2>
              <p className="text-[#5E6278] leading-relaxed whitespace-pre-line">{desc}</p>
            </div>
          )}

          {/* Photo gallery (thumbnails) */}
          {photos.length > 1 && (
            <div className="bg-surface rounded-card p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-3">{isDE ? 'Fotos' : 'Photos'} ({photos.length})</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {photos.map(photo => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={photo.thumb_url ?? photo.url}
                      alt={photo.caption_de ?? photo.caption ?? ''}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: sticky sidebar — booking + contact */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="sticky top-20 space-y-4">
            {/* Booking slots (if any available) */}
            <BookingSlots listingId={listing.id} authenticated={isAuthenticated} />

            {/* Contact form */}
            <ContactCard listingId={listing.id} locale={locale} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#5E6278] uppercase tracking-wide mb-0.5">{label}</p>
      <p className="font-bold text-lg">{value}</p>
    </div>
  )
}
