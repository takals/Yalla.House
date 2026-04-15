import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { ContactCard } from './contact-form'
import { ViewingCalendar } from './viewing-calendar'
import { ListingStatusBadge } from './listing-status-badge'
import { StickyBookingBar } from './sticky-booking-bar'
import { OwnerToolbar } from './owner-toolbar'

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
    .in('status', ['active', 'under_offer', 'draft', 'paused'])
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
    openGraph: { title, description: description.slice(0, 155), images: primaryPhoto ? [primaryPhoto] : [] },
  }
}

export default async function PropertyPage({ params }: Props) {
  const { place_id, locale } = await params
  const supabase = await createClient()

  // Check auth first
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch listing — owners can see their own drafts too
  const { data: listing } = await (supabase as any)
    .from('listings')
    .select(`
      *,
      listing_media ( id, url, thumb_url, caption_de, caption, sort_order, is_primary, type )
    `)
    .eq('place_id', place_id)
    .single()

  if (!listing) notFound()

  // Determine if viewer is the owner
  const isOwner = !!user && listing.owner_id === user.id
  const isAuthenticated = !!user
  const isPublicVisible = listing.status === 'active' || listing.status === 'under_offer'

  // Non-owners can only see active/under_offer listings
  if (!isOwner && !isPublicVisible) notFound()

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

      {/* ── Owner toolbar: edit, Live/Draft toggle, share ───────── */}
      {isOwner && (
        <OwnerToolbar
          listingId={listing.id}
          placeId={listing.place_id}
          status={listing.status}
          locale={locale}
        />
      )}

      {/* ── Sticky booking bar (hunters see Book a Viewing) ─────── */}
      {!isOwner && isPublicVisible && (
        <StickyBookingBar
          status={listing.status}
          slotCount={slotCount ?? 0}
          listingId={listing.id}
          locale={locale}
        />
      )}

      {/* Draft notice for owner */}
      {isOwner && !isPublicVisible && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
          <p className="text-sm text-amber-800 font-medium">
            {isDE
              ? 'Diese Immobilie ist nicht veröffentlicht. Schalten Sie sie auf „Live", damit sie für Suchende sichtbar wird.'
              : 'This property is not published. Toggle it to Live to make it visible to home hunters.'}
          </p>
        </div>
      )}

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
          <div className="absolute top-4 left-4">
            <ListingStatusBadge status={listing.status} locale={locale} />
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        {/* Left: listing details + calendar */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Title + status */}
          <div className="bg-surface rounded-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-3xl font-bold">{title ?? (isDE ? 'Ihre Immobilie' : 'Your Property')}</h1>
              {!primaryPhoto && <ListingStatusBadge status={listing.status} locale={locale} />}
            </div>
            <p className="text-[#5E6278]">{listing.postcode} {listing.city}</p>

            {/* Price */}
            <div className="mt-4">
              {listing.intent !== 'rent' && listing.sale_price ? (
                <p className="text-2xl font-extrabold">
                  {new Intl.NumberFormat(isDE ? 'de-DE' : 'en-GB', {
                    style: 'currency', currency: listing.currency, maximumFractionDigits: 0,
                  }).format(listing.sale_price / 100)}
                </p>
              ) : null}
              {listing.intent !== 'sale' && listing.rent_price ? (
                <p className="text-2xl font-extrabold">
                  {new Intl.NumberFormat(isDE ? 'de-DE' : 'en-GB', {
                    style: 'currency', currency: listing.currency, maximumFractionDigits: 0,
                  }).format(listing.rent_price / 100)} / {isDE ? 'Monat' : 'month'}
                </p>
              ) : null}
            </div>
          </div>

          {/* ── PROMINENT: Viewing Calendar ──────────────────────── */}
          <ViewingCalendar
            listingId={listing.id}
            authenticated={isAuthenticated}
            isOwner={isOwner}
            locale={locale}
          />

          {/* Key stats */}
          <div className="bg-surface rounded-card p-6 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
            {listing.size_sqm ? <Stat label={isDE ? 'Wohnfläche' : 'Living Space'} value={`${listing.size_sqm} m²`} /> : null}
            {listing.bedrooms ? <Stat label={isDE ? 'Zimmer' : 'Rooms'} value={String(listing.bedrooms)} /> : null}
            {listing.bathrooms ? <Stat label={isDE ? 'Badezimmer' : 'Bathrooms'} value={String(listing.bathrooms)} /> : null}
            {listing.floor != null ? <Stat label={isDE ? 'Etage' : 'Floor'} value={String(listing.floor)} /> : null}
            {listing.construction_year ? <Stat label={isDE ? 'Baujahr' : 'Built'} value={String(listing.construction_year)} /> : null}
          </div>

          {/* Description */}
          {desc && (
            <div className="bg-surface rounded-card p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-3">{isDE ? 'Beschreibung' : 'Description'}</h2>
              <p className="text-[#5E6278] leading-relaxed whitespace-pre-line">{desc}</p>
            </div>
          )}

          {/* Photo gallery */}
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

        {/* Right: sticky sidebar — contact form */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="sticky top-20 space-y-4">
            {!isOwner && <ContactCard listingId={listing.id} locale={locale} />}
            {isOwner && (
              <div className="bg-surface rounded-card p-6 shadow-sm border border-[#E2E4EB]">
                <p className="text-xs font-bold text-[#5E6278] uppercase tracking-wide mb-3">
                  {isDE ? 'Schnellaktionen' : 'Quick Actions'}
                </p>
                <div className="space-y-2">
                  <a href={`/owner/${listing.id}`} className="block w-full text-center bg-[#EDEEF2] hover:bg-[#D9DCE4] text-[#0F1117] font-semibold text-sm py-2.5 rounded-lg transition-colors">
                    {isDE ? 'Listing bearbeiten' : 'Edit listing'}
                  </a>
                  <a href="/owner/viewings" className="block w-full text-center bg-[#EDEEF2] hover:bg-[#D9DCE4] text-[#0F1117] font-semibold text-sm py-2.5 rounded-lg transition-colors">
                    {isDE ? 'Termine verwalten' : 'Manage viewings'}
                  </a>
                  <a href="/owner/agents" className="block w-full text-center bg-[#EDEEF2] hover:bg-[#D9DCE4] text-[#0F1117] font-semibold text-sm py-2.5 rounded-lg transition-colors">
                    {isDE ? 'Makler einladen' : 'Invite agents'}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#5E6278] uppercase tracking-wide mb-0.5">{label}</p>
      <p className="font-bold text-lg">{value}</p>
    </div>
  )
}
