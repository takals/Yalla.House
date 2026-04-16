import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Image from 'next/image'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { AgentListingCta } from './agent-cta'

interface Props {
  params: Promise<{ id: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params
  const supabase = await createClient()

  const { data } = await (supabase as any)
    .from('listings')
    .select('title_de, title, city, postcode')
    .eq('id', id)
    .single()

  if (!data) return { title: 'Property not found' }

  const title = locale === 'de'
    ? (data.title_de ?? data.title ?? 'Immobilie')
    : (data.title ?? data.title_de ?? 'Property')

  return {
    title: `${title} — Agent View`,
    description: `${data.postcode} ${data.city}`,
    robots: { index: false, follow: false },
  }
}

export default async function AgentListingPage({ params }: Props) {
  const { id, locale } = await params
  const t = await getTranslations('agentListing')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch listing with media — no owner personal info
  const { data: listing } = await (supabase as any)
    .from('listings')
    .select(`
      id, title, title_de, description, description_de,
      city, postcode, country, intent,
      sale_price, rent_price, currency,
      size_sqm, bedrooms, bathrooms, floor, construction_year,
      property_type, energy_rating, parking, garden, balcony,
      status, created_at,
      listing_media ( id, url, thumb_url, caption_de, caption, sort_order, is_primary, type )
    `)
    .eq('id', id)
    .in('status', ['active', 'under_offer'])
    .single()

  if (!listing) notFound()

  // Check if agent already has an assignment for this listing
  const { data: existingAssignment } = await (supabase as any)
    .from('listing_agent_assignments')
    .select('id, status, tier')
    .eq('listing_id', id)
    .eq('agent_id', userId)
    .maybeSingle()

  const title = locale === 'de' ? (listing.title_de ?? listing.title) : (listing.title ?? listing.title_de)
  const desc = locale === 'de' ? (listing.description_de ?? listing.description) : (listing.description ?? listing.description_de)

  const photos = (listing.listing_media as Array<{
    id: string; url: string; thumb_url: string | null; caption_de: string | null; caption: string | null; sort_order: number; is_primary: boolean; type: string
  }> | null)
    ?.filter(m => m.type === 'photo')
    .sort((a, b) => a.sort_order - b.sort_order) ?? []

  const primaryPhoto = photos.find(p => p.is_primary) ?? photos[0]

  const formatPrice = (amount: number) =>
    new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', {
      style: 'currency',
      currency: listing.currency,
      maximumFractionDigits: 0,
    }).format(amount / 100)

  return (
    <div className="max-w-5xl">
      {/* Agent-view banner */}
      <div className="mb-6 bg-brand-solid-bg border border-brand/30 rounded-2xl p-4 flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand flex items-center justify-center">
          <svg className="w-4 h-4 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-text-primary">{t('agentViewBanner')}</p>
          <p className="text-xs text-text-secondary">{t('agentViewBannerSub')}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: listing details */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Hero photo */}
          {primaryPhoto && (
            <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gray-200">
              <Image
                src={primaryPhoto.url}
                alt={title ?? 'Property photo'}
                fill
                className="object-cover"
                priority
              />
              {listing.status === 'under_offer' && (
                <div className="absolute top-4 left-4 bg-[#FEE2E2] text-[#991B1B] text-xs font-bold px-3 py-1 rounded-full">
                  {t('underOffer')}
                </div>
              )}
            </div>
          )}

          {/* Title + location + price */}
          <div className="bg-surface rounded-2xl p-6 border border-border-default">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">{title}</h1>
                <p className="text-text-secondary text-sm">{listing.postcode} {listing.city}</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#DBEAFE] text-[#1E40AF] capitalize whitespace-nowrap">
                {listing.intent === 'both' ? 'Sale / Rent' : listing.intent}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-4">
              {listing.intent !== 'rent' && listing.sale_price ? (
                <p className="text-2xl font-extrabold">{formatPrice(listing.sale_price)}</p>
              ) : null}
              {listing.intent !== 'sale' && listing.rent_price ? (
                <p className="text-2xl font-extrabold">
                  {formatPrice(listing.rent_price)}{' '}
                  <span className="text-sm font-normal text-text-secondary">/ {locale === 'de' ? 'Monat' : 'month'}</span>
                </p>
              ) : null}
            </div>
          </div>

          {/* Key stats */}
          <div className="bg-surface rounded-2xl p-6 border border-border-default grid grid-cols-2 sm:grid-cols-4 gap-4">
            {listing.property_type && (
              <Stat label={t('propertyType')} value={listing.property_type.replace(/_/g, ' ')} />
            )}
            {listing.size_sqm ? (
              <Stat label={t('livingSpace')} value={`${listing.size_sqm} m²`} />
            ) : null}
            {listing.bedrooms ? (
              <Stat label={t('bedrooms')} value={String(listing.bedrooms)} />
            ) : null}
            {listing.bathrooms ? (
              <Stat label={t('bathrooms')} value={String(listing.bathrooms)} />
            ) : null}
            {listing.floor != null ? (
              <Stat label={t('floor')} value={String(listing.floor)} />
            ) : null}
            {listing.construction_year ? (
              <Stat label={t('built')} value={String(listing.construction_year)} />
            ) : null}
            {listing.energy_rating ? (
              <Stat label={t('energyRating')} value={listing.energy_rating} />
            ) : null}
            {listing.parking ? (
              <Stat label={t('parking')} value={t('yes')} />
            ) : null}
          </div>

          {/* Description */}
          {desc && (
            <div className="bg-surface rounded-2xl p-6 border border-border-default">
              <h2 className="text-lg font-bold mb-3">{t('description')}</h2>
              <p className="text-text-secondary leading-relaxed whitespace-pre-line">{desc}</p>
            </div>
          )}

          {/* Photo gallery */}
          {photos.length > 1 && (
            <div className="bg-surface rounded-2xl p-6 border border-border-default">
              <h2 className="text-lg font-bold mb-3">{t('photos')} ({photos.length})</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {photos.map(photo => (
                  <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={photo.thumb_url ?? photo.url}
                      alt={(locale === 'de' ? photo.caption_de : photo.caption) ?? (title ? `${title} photo` : 'Property photo')}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: sticky CTA panel */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="sticky top-6">
            <AgentListingCta
              listingId={listing.id}
              locale={locale}
              existingAssignment={existingAssignment ? {
                id: existingAssignment.id,
                status: existingAssignment.status,
                tier: existingAssignment.tier,
              } : null}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-text-secondary uppercase tracking-wide font-semibold mb-0.5">{label}</p>
      <p className="font-bold text-lg capitalize">{value}</p>
    </div>
  )
}
