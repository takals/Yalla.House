import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ListingEditForm } from './edit-form'
import type { PortalRow, PortalStatusRow } from './portals'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditListingPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/auth/login?next=/owner/${id}`)

  const { data: listing } = await (supabase as any)
    .from('listings')
    .select(`
      id, place_id, status, intent, property_type,
      address_line1, address_line2, city, region, postcode,
      size_sqm, bedrooms, bathrooms, floor, total_floors, construction_year,
      sale_price, rent_price, price_qualifier, nebenkosten, kaution,
      title_de, description_de, country_fields, created_at,
      listing_media(id, url, thumb_url, is_primary, sort_order, type)
    `)
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!listing) redirect('/owner')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: portals } = await (supabase.from('portal_config') as any)
    .select('id, slug, display_name, min_photos')
    .eq('country_code', 'DE')
    .eq('is_active', true)
    .order('display_name') as { data: PortalRow[] | null }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: portalStatuses } = await (supabase.from('listing_portal_status') as any)
    .select('portal_id, status, external_id, error_message, last_sync_at')
    .eq('listing_id', id) as { data: PortalStatusRow[] | null }

  return (
    <ListingEditForm
      listing={listing}
      photos={(listing.listing_media as unknown as import('./photos').PhotoRow[]) ?? []}
      portals={portals ?? []}
      portalStatuses={portalStatuses ?? []}
    />
  )
}
