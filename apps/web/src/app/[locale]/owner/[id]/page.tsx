import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { redirect } from 'next/navigation'
import { ListingEditForm } from './edit-form'
import type { PortalRow, PortalStatusRow } from './portals'
import type { FreeChannel, ChannelStatus } from './free-channels'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditListingPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const { data: listing } = await (supabase as any)
    .from('listings')
    .select(`
      id, place_id, status, intent, property_type,
      address_line1, address_line2, city, region, postcode,
      size_sqm, bedrooms, bathrooms, floor, total_floors, construction_year,
      sale_price, rent_price, price_qualifier, service_charge, deposit_amount,
      title_de, description_de, country_fields, created_at,
      brief_sent_at, brief_agent_count,
      listing_media(id, url, thumb_url, is_primary, sort_order, type)
    `)
    .eq('id', id)
    .eq('owner_id', userId)
    .single()

  if (!listing) redirect('/owner')

  const listingCountry = (listing as Record<string, unknown>).country_code as string | undefined ?? 'DE'

  const { data: portals } = await (supabase.from('portal_config') as any)
    .select('id, slug, display_name, min_photos')
    .eq('country_code', listingCountry)
    .eq('is_active', true)
    .order('display_name') as { data: PortalRow[] | null }

  const { data: portalStatuses } = await (supabase.from('listing_portal_status') as any)
    .select('portal_id, status, external_id, error_message, last_sync_at')
    .eq('listing_id', id) as { data: PortalStatusRow[] | null }

  const { data: freeChannels } = await (supabase as any)
    .from('free_channel_registry')
    .select('id, slug, display_name, country_code, max_active, listing_duration_days, repost_interval_days, is_default_selected')
    .eq('country_code', listingCountry)
    .eq('is_active', true)
    .order('display_name') as { data: FreeChannel[] | null }

  const { data: channelStatuses } = await (supabase as any)
    .from('listing_free_channels')
    .select('channel_id, is_enabled, status, external_url, posted_at, expires_at, next_repost_at, repost_count, last_error')
    .eq('listing_id', id) as { data: ChannelStatus[] | null }

  return (
    <ListingEditForm
      listing={listing}
      photos={(listing.listing_media as unknown as import('./photos').PhotoRow[]) ?? []}
      portals={portals ?? []}
      portalStatuses={portalStatuses ?? []}
      freeChannels={freeChannels ?? []}
      channelStatuses={channelStatuses ?? []}
      countryCode={listingCountry}
    />
  )
}
