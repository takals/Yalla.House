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
      sale_price, rent_price, price_qualifier, nebenkosten, kaution,
      title_de, description_de, country_fields, created_at,
      brief_sent_at, brief_agent_count,
      listing_media(id, url, thumb_url, is_primary, sort_order, type)
    `)
    .eq('id', id)
    .eq('owner_id', userId)
    .single()

  if (!listing) redirect('/owner')

  const { data: portals } = await (supabase.from('portal_config') as any)
    .select('id, slug, display_name, min_photos')
    .eq('country_code', 'DE')
    .eq('is_active', true)
    .order('display_name') as { data: PortalRow[] | null }

  const { data: portalStatuses } = await (supabase.from('listing_portal_status') as any)
    .select('portal_id, status, external_id, error_message, last_sync_at')
    .eq('listing_id', id) as { data: PortalStatusRow[] | null }

  // TODO: Replace with Supabase query when free_channel_registry table exists
  // const { data: freeChannels } = await (supabase.from('free_channel_registry') as any)
  //   .select('id, slug, display_name, country_code, max_active, listing_duration_days, repost_interval_days, is_default_selected')
  //   .eq('country_code', listing.country_code ?? 'DE')
  //   .eq('is_active', true)
  //   .order('display_name') as { data: FreeChannel[] | null }
  //
  // const { data: channelStatuses } = await (supabase.from('listing_free_channels') as any)
  //   .select('channel_id, is_enabled, status, external_url, posted_at, expires_at, next_repost_at, repost_count, last_error')
  //   .eq('listing_id', id) as { data: ChannelStatus[] | null }

  const countryCode = (listing as Record<string, unknown>).country_code as string | undefined

  const mockFreeChannelsDE: FreeChannel[] = [
    { id: 'fc-de-ebay', slug: 'ebay-kleinanzeigen', display_name: 'eBay Kleinanzeigen', country_code: 'DE', max_active: 1, listing_duration_days: 30, repost_interval_days: 30, is_default_selected: true },
    { id: 'fc-de-wggesucht', slug: 'wg-gesucht', display_name: 'WG-Gesucht', country_code: 'DE', max_active: 1, listing_duration_days: 14, repost_interval_days: 14, is_default_selected: true },
    { id: 'fc-de-immowelt', slug: 'immowelt-free', display_name: 'Immowelt (Free)', country_code: 'DE', max_active: 1, listing_duration_days: 14, repost_interval_days: 14, is_default_selected: true },
    { id: 'fc-de-kalaydo', slug: 'kalaydo', display_name: 'Kalaydo', country_code: 'DE', max_active: 1, listing_duration_days: 30, repost_interval_days: 30, is_default_selected: false },
    { id: 'fc-de-meinestadt', slug: 'meinestadt', display_name: 'meinestadt.de', country_code: 'DE', max_active: 1, listing_duration_days: 30, repost_interval_days: 30, is_default_selected: false },
  ]

  const mockFreeChannelsGB: FreeChannel[] = [
    { id: 'fc-gb-gumtree', slug: 'gumtree', display_name: 'Gumtree', country_code: 'GB', max_active: 1, listing_duration_days: 30, repost_interval_days: 30, is_default_selected: true },
    { id: 'fc-gb-openrent', slug: 'openrent-free', display_name: 'OpenRent (Free)', country_code: 'GB', max_active: 1, listing_duration_days: 30, repost_interval_days: 30, is_default_selected: true },
    { id: 'fc-gb-spareroom', slug: 'spareroom', display_name: 'SpareRoom', country_code: 'GB', max_active: 1, listing_duration_days: 28, repost_interval_days: 28, is_default_selected: true },
    { id: 'fc-gb-facebook', slug: 'facebook-marketplace', display_name: 'Facebook Marketplace', country_code: 'GB', max_active: 1, listing_duration_days: 7, repost_interval_days: 7, is_default_selected: true },
    { id: 'fc-gb-friday', slug: 'friday-ad', display_name: 'Friday-Ad', country_code: 'GB', max_active: 1, listing_duration_days: 30, repost_interval_days: 30, is_default_selected: false },
  ]

  const resolvedCountry = countryCode ?? 'DE'
  const freeChannels = resolvedCountry === 'GB' ? mockFreeChannelsGB : mockFreeChannelsDE

  // Mock channel statuses — empty for now (no posts yet)
  const channelStatuses: ChannelStatus[] = []

  return (
    <ListingEditForm
      listing={listing}
      photos={(listing.listing_media as unknown as import('./photos').PhotoRow[]) ?? []}
      portals={portals ?? []}
      portalStatuses={portalStatuses ?? []}
      freeChannels={freeChannels}
      channelStatuses={channelStatuses}
      countryCode={resolvedCountry}
    />
  )
}
