import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations, getLocale } from 'next-intl/server'
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
    .select('id, title_de, title, city, postcode, property_type, intent, status, photos, owner_id')
    .eq('id', id)
    .single()

  if (!listing || listing.owner_id !== user.id) {
    redirect('/owner')
  }

  const t = await getTranslations('activate')

  // Gather translations for the client component
  const translations = {
    congratsTitle: t('congratsTitle'),
    congratsSubtitle: t('congratsSubtitle'),
    congratsBody: t('congratsBody'),
    letsGo: t('letsGo'),
    stepPhotos: t('stepPhotos'),
    stepPhotosDesc: t('stepPhotosDesc'),
    stepCalendar: t('stepCalendar'),
    stepCalendarDesc: t('stepCalendarDesc'),
    stepEmail: t('stepEmail'),
    stepEmailDesc: t('stepEmailDesc'),
    stepAgents: t('stepAgents'),
    stepAgentsDesc: t('stepAgentsDesc'),
    stepPortals: t('stepPortals'),
    stepPortalsDesc: t('stepPortalsDesc'),
    stepQR: t('stepQR'),
    stepQRDesc: t('stepQRDesc'),
    stepSpread: t('stepSpread'),
    stepSpreadDesc: t('stepSpreadDesc'),
    skipForNow: t('skipForNow'),
    complete: t('complete'),
    goToDashboard: t('goToDashboard'),
    activationProgress: t('activationProgress'),
    stepsComplete: t('stepsComplete'),
    allDone: t('allDone'),
    allDoneBody: t('allDoneBody'),
    viewListing: t('viewListing'),
  }

  const listingTitle = listing.title_de || listing.title || `${listing.postcode} ${listing.city}`
  const hasPhotos = Array.isArray(listing.photos) && listing.photos.length > 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <ActivationWizard
        listingId={id}
        listingTitle={listingTitle}
        hasPhotos={hasPhotos}
        translations={translations}
        locale={locale}
      />
    </div>
  )
}
