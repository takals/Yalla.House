import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { ActivationWizard } from './activation-wizard'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Activate Your Listing | Yalla.House',
    robots: { index: false, follow: false },
  }
}

interface Props {
  params: Promise<{ id: string; locale: string }>
}

export default async function ActivatePage({ params }: Props) {
  const { id, locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch the listing to show details in the wizard
  const { data: listing } = await (supabase
    .from('listings') as any)
    .select('id, slug, place_id, title_de, title, city, postcode, property_type, intent, status, photos, owner_id')
    .eq('id', id)
    .single()

  if (!listing || listing.owner_id !== user.id) {
    redirect('/owner')
  }

  const t = await getTranslations('activate')

  // Collect all translation keys the client component needs
  const keys = [
    'congratsTitle', 'congratsSubtitle', 'congratsBody', 'seeYourPage', 'skipForNow',
    'yourPageIsReady', 'yourPageIsReadyDesc', 'toggleLive', 'toggleDraft',
    'statusLive', 'statusDraft', 'photosLoaded', 'noPhotosYet',
    'previewNote', 'openFullPage', 'copyLink', 'copied', 'whatsNext',
    'pathsTitle', 'pathsSubtitle',
    'pathShareTitle', 'pathShareDesc', 'pathShareCta',
    'pathAgentTitle', 'pathAgentDesc', 'pathAgentCta',
    'goToDashboard', 'back',
    'shareTitle', 'shareSubtitle',
    'shareWhatsapp', 'shareFacebook', 'shareTwitter', 'shareEmail',
    'shareQR', 'sharePortals',
    'nudgeAgentTitle', 'nudgeAgentDesc', 'nudgeAgentCta',
    'agentTitle', 'agentSubtitle',
    'agentStep1Title', 'agentStep1Desc', 'agentStep1Cta',
    'agentStep2Title', 'agentStep2Desc',
    'agentStep3Title', 'agentStep3Desc', 'agentStep3Cta',
    'nudgeShareTitle', 'nudgeShareDesc', 'nudgeShareCta',
  ]

  const translations: Record<string, string> = {}
  for (const key of keys) {
    translations[key] = t(key as any)
  }

  const listingTitle = listing.title_de || listing.title || `${listing.postcode} ${listing.city}`
  const listingSlug = listing.slug ?? listing.place_id ?? id
  const hasPhotos = Array.isArray(listing.photos) && listing.photos.length > 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <ActivationWizard
        listingId={id}
        listingSlug={listingSlug}
        listingTitle={listingTitle}
        listingCity={listing.city ?? ''}
        listingPostcode={listing.postcode ?? ''}
        hasPhotos={hasPhotos}
        translations={translations}
        locale={locale}
      />
    </div>
  )
}
