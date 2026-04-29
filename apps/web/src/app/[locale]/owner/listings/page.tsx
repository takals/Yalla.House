import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Home, Sparkles } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import type { Database } from '@/types/database'
import ListingFilters from './listing-filters'
import ListingGrid from './listing-grid'

type Listing = Database['public']['Tables']['listings']['Row']

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function OwnerListingsPage({ searchParams }: Props) {
  const { status: filterStatus } = await searchParams
  const t = await getTranslations('ownerListings')
  const ts = await getTranslations('statusLabels')
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
            {allListings.length > 0
              ? t('listingCount', { count: allListings.length })
              : t('noListingsCreated')}
          </p>
        </div>
        <Link
          href="/owner/new"
          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-text-primary font-bold px-5 py-2.5 rounded-lg transition-colors will-change-transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          {t('newListing')}
        </Link>
      </div>

      {/* Filter pills — only when there are real listings */}
      {allListings.length > 0 && (
        <ListingFilters counts={counts} translations={translations} />
      )}

      {/* Content */}
      {allListings.length === 0 ? (
        /* ═══ Example listing placeholder — inspiring empty state ═══ */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Example listing card */}
          <div className="relative bg-surface rounded-card border border-border-default overflow-hidden opacity-[0.55] select-none">
            {/* Example badge */}
            <div className="absolute top-3 right-3 z-10 bg-brand text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {t('exampleBadge')}
            </div>

            {/* Photo — realistic property image */}
            <div className="h-44 relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=350&fit=crop&q=80"
                alt="Example property"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            <div className="p-4">
              {/* Status badge */}
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                  <span className="relative flex h-2 w-2">
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </span>
                  {ts('active')}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-text-primary text-[0.9375rem] mb-1">
                {t('exampleTitle')}
              </h3>

              {/* Location */}
              <p className="text-xs text-text-secondary mb-3">
                {t('exampleLocation')}
              </p>

              {/* Meta row */}
              <div className="flex items-center justify-between">
                <span className="font-bold text-text-primary">
                  {t('examplePrice')}
                </span>
                <div className="flex gap-3 text-xs text-text-secondary">
                  <span>{t('exampleSize')} {t('unitSqm')}</span>
                  <span>{t('exampleBeds')} {t('unitRooms')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA card — create your listing */}
          <div className="bg-surface rounded-card border-2 border-dashed border-brand/30 overflow-hidden flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-brand" />
            </div>
            <p className="text-text-secondary text-sm mb-1 max-w-xs">
              {t('exampleHint')}
            </p>
            <Link
              href="/owner/new"
              className="mt-5 inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold px-6 py-3 rounded-lg transition-all will-change-transform hover:-translate-y-0.5 hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              {t('createYourListing')}
            </Link>
          </div>
        </div>
      ) : (
        <ListingGrid
          listings={filteredListings as unknown as Parameters<typeof ListingGrid>[0]['listings']}
          translations={translations}
          statusTranslations={statusTranslations}
          locale={locale}
        />
      )}
    </div>
  )
}
