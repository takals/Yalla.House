import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { PropertyWorkspace } from './workspace-client'

export default async function WorkspacePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const t = await getTranslations('workspace')

  // Fetch user's most recent draft listing (if any)
  const { data: drafts } = await (supabase.from('listings') as any)
    .select(`
      id, status, intent, property_type,
      address_line1, address_line2, city, postcode,
      title_de, title, description_de,
      size_sqm, bedrooms, bathrooms, floor, total_floors,
      construction_year, sale_price, rent_price,
      listing_media(id, url, thumb_url, is_primary, sort_order, type)
    `)
    .eq('owner_id', userId)
    .eq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(1)

  const listing = drafts?.[0] ?? null

  const labels = {
    pageTitle: t('pageTitle'),
    draftBadge: t('draftBadge'),
    progressLabel: t('progressLabel'),
    coverPhotoLabel: t('coverPhotoLabel'),
    coverPhotoHint: t('coverPhotoHint'),
    titlePlaceholder: t('titlePlaceholder'),
    addressPlaceholder: t('addressPlaceholder'),
    saleLabel: t('saleLabel'),
    rentLabel: t('rentLabel'),
    photosTitle: t('photosTitle'),
    photosHint: t('photosHint'),
    uploadPhotos: t('uploadPhotos'),
    exampleLabel: t('exampleLabel'),
    detailsTitle: t('detailsTitle'),
    bedroomsLabel: t('bedroomsLabel'),
    bathroomsLabel: t('bathroomsLabel'),
    sizeLabel: t('sizeLabel'),
    typeLabel: t('typeLabel'),
    yearLabel: t('yearLabel'),
    descriptionTitle: t('descriptionTitle'),
    descriptionPlaceholder: t('descriptionPlaceholder'),
    documentsTitle: t('documentsTitle'),
    floorPlanLabel: t('floorPlanLabel'),
    epcLabel: t('epcLabel'),
    titleDeedsLabel: t('titleDeedsLabel'),
    uploadLabel: t('uploadLabel'),
    visibilityTitle: t('visibilityTitle'),
    visibilityDraft: t('visibilityDraft'),
    visibilityComingSoon: t('visibilityComingSoon'),
    visibilityInviteAgents: t('visibilityInviteAgents'),
    visibilityPublic: t('visibilityPublic'),
    agentsTitle: t('agentsTitle'),
    agentsHint: t('agentsHint'),
    inviteAgents: t('inviteAgents'),
    priceTitle: t('priceTitle'),
    pricePlaceholder: t('pricePlaceholder'),
    createDraft: t('createDraft'),
    saving: t('saving'),
    saved: t('saved'),
    newWorkspace: t('newWorkspace'),
    newWorkspaceDesc: t('newWorkspaceDesc'),
  }

  return (
    <PropertyWorkspace
      listing={listing}
      labels={labels}
      isGuest={!user}
    />
  )
}
