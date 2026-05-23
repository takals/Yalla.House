import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import type { Database } from '@/types/database'
import ListingFilters from './listing-filters'
import ListingGrid from './listing-grid'
import { OwnerExampleDashboard } from '@/components/owner-example-dashboard'

type Listing = Database['public']['Tables']['listings']['Row']

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function OwnerListingsPage({ searchParams }: Props) {
  const { status: filterStatus } = await searchParams
  const t = await getTranslations('ownerListings')
  const ts = await getTranslations('statusLabels')
  const tEx = await getTranslations('ownerExampleDashboard')
  const locale = await getLocale()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? null

  let allListings: Listing[] = []
  if (userId) {
    try {
      const { data: listingsData } = await supabase
        .from('listings')
        .select('*')
        .eq('owner_id', userId)
        .neq('status', 'deleted')
        .order('created_at', { ascending: false })

      allListings = listingsData ?? []
    } catch (err) {
      console.error('Failed to load owner listings data:', err)
    }

    // Single listing shortcut: if owner has exactly 1 listing, go straight to it
    if (allListings.length === 1) {
      const only = allListings[0]!
      const identifier = only.slug ?? only.place_id
      if (identifier) {
        redirect(`/p/${identifier}`)
      } else {
        redirect(`/owner/${only.id}`)
      }
    }
  }

  // ─── 0 listings: immersive example property dashboard ────────────
  if (allListings.length === 0) {
    // Build translation record for the example dashboard client component
    const exKeys = [
      'exBadge', 'exBannerHint', 'exStartListing', 'exGoLive', 'exChangePhotos',
      'exStatusDraft', 'exPropertyTitle', 'exPropertyLocation', 'exPropertyPrice',
      'exListedDate', 'exBeds', 'exBaths', 'exSize', 'exSizeValue', 'exParking', 'exType', 'exPropertyType',
      'exTitlePlaceholder', 'exLocationPlaceholder', 'exPricePlaceholder',
      'exSectionDescription', 'exDescription', 'exDescriptionPlaceholder', 'exClickToEdit',
      'exSectionFeatures', 'exFeature1', 'exFeature2', 'exFeature3', 'exFeature4', 'exFeature5',
      'exAddFeature', 'exFeaturePlaceholder',
      'exSectionRooms',
      'exRoom1Name', 'exRoom1Size', 'exRoom2Name', 'exRoom2Size',
      'exRoom3Name', 'exRoom3Size', 'exRoom4Name', 'exRoom4Size',
      'exRoom5Name', 'exRoom5Size', 'exRoom6Name', 'exRoom6Size',
      'exRoom7Name', 'exRoom7Size', 'exRoom8Name', 'exRoom8Size',
      'exRoom9Name', 'exRoom9Size', 'exRoom10Name', 'exRoom10Size',
      'exRoom11Name', 'exRoom11Size', 'exRoom12Name', 'exRoom12Size',
      'exRoom13Name', 'exRoom13Size', 'exRoom14Name', 'exRoom14Size',
      'exRoom15Name', 'exRoom15Size', 'exRoom16Name', 'exRoom16Size',
      'exRoom17Name', 'exRoom17Size', 'exRoom18Name', 'exRoom18Size',
      'exAddRoom', 'exRoomNamePlaceholder',
      'exCtaTitle', 'exCtaDesc', 'exCtaButton',
    ] as const
    const exTranslations: Record<string, string> = {}
    for (const key of exKeys) {
      exTranslations[key] = tEx(key)
    }

    return <OwnerExampleDashboard t={exTranslations} locale={locale} />
  }

  // ─── 2+ listings: grid view with filters ─────────────────────────

  // Compute counts per status for filter pills
  const counts: Record<string, number> = { all: allListings.length }
  for (const listing of allListings) {
    counts[listing.status] = (counts[listing.status] ?? 0) + 1
  }

  // Apply filter
  const filteredListings =
    filterStatus && filterStatus !== 'all'
      ? allListings.filter((l) => l.status === filterStatus)
      : allListings

  // Build translation records for client components
  const filterKeys = [
    'filterAll', 'filterLive', 'filterDrafts', 'filterUnderOffer',
    'filterArchived', 'selectAll', 'selected', 'archiveSelected',
    'deleteSelected', 'relistSelected', 'confirmDelete', 'confirmArchive',
    'bulkSuccess', 'bulkError', 'unitSqm', 'unitRooms', 'perMonth',
    'exampleBadge', 'exampleTitle', 'exampleLocation', 'examplePrice',
    'exampleSize', 'exampleBeds', 'exampleHint', 'createYourListing',
    'viewListing', 'propertyDetails',
  ] as const
  const translations: Record<string, string> = {}
  for (const key of filterKeys) {
    translations[key] = t(key)
  }

  const statusKeys = [
    'draft', 'preview', 'active', 'paused', 'under_offer',
    'sold', 'let', 'archived', 'deleted',
  ] as const
  const statusTranslations: Record<string, string> = {}
  for (const key of statusKeys) {
    statusTranslations[key] = ts(key)
  }

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">{t('pageTitle')}</h1>
          <p className="text-sm text-text-secondary mt-1">
            {t('listingCount', { count: allListings.length })}
          </p>
        </div>
        <Link
          href="/owner/workspace"
          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-text-primary font-bold px-5 py-2.5 rounded-lg transition-colors will-change-transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          {t('newListing')}
        </Link>
      </div>

      {/* Filter pills */}
      <ListingFilters counts={counts} translations={translations} />

      {/* Listing grid */}
      <ListingGrid
        listings={filteredListings as unknown as Parameters<typeof ListingGrid>[0]['listings']}
        translations={translations}
        statusTranslations={statusTranslations}
        locale={locale}
      />
    </div>
  )
}
