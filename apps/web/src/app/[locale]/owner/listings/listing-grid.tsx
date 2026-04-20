'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Home, ExternalLink, Archive, Trash2, RotateCcw } from 'lucide-react'
import { fromMinorUnits } from '@yalla/integrations'
import { bulkStatusAction } from '../[id]/actions'
import { dateLocaleFromLocale } from '@/lib/country-config'

interface Listing {
  id: string
  status: string
  title: string | null
  title_de: string | null
  place_id: string | null
  slug: string | null
  postcode: string | null
  city: string | null
  intent: string | null
  sale_price: number | null
  rent_price: number | null
  currency: string | null
  size_sqm: number | null
  bedrooms: number | null
}

interface ListingGridProps {
  listings: Listing[]
  translations: Record<string, string>
  statusTranslations: Record<string, string>
  locale: string
}

function StatusBadge({ status, t }: { status: string; t: Record<string, string> }) {
  const isLive = status === 'active'

  const styles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    under_offer: 'bg-blue-100 text-blue-700',
    sold: 'bg-purple-100 text-purple-700',
    let: 'bg-purple-100 text-purple-700',
    archived: 'bg-gray-100 text-gray-400',
    deleted: 'bg-red-100 text-red-600',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
        styles[status] ?? styles['draft']
      }`}
    >
      {isLive && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
      )}
      {t[status] ?? status}
    </span>
  )
}

export default function ListingGrid({
  listings,
  translations: t,
  statusTranslations: ts,
  locale,
}: ListingGridProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleAll = () => {
    if (selected.size === listings.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(listings.map((l) => l.id)))
    }
  }

  const handleBulkAction = (targetStatus: string) => {
    const ids = Array.from(selected)
    if (!ids.length) return

    if (targetStatus === 'deleted' && !window.confirm(t['confirmDelete'] ?? 'Are you sure?')) {
      return
    }
    if (
      targetStatus === 'archived' &&
      !window.confirm(
        (t['confirmArchive'] ?? 'Archive {count} listing(s)?').replace(
          '{count}',
          String(ids.length)
        )
      )
    ) {
      return
    }

    startTransition(async () => {
      const result = await bulkStatusAction(ids, targetStatus)
      if ('success' in result) {
        setSelected(new Set())
        // Force page refresh to reflect updated data
        window.location.reload()
      }
    })
  }

  const hasSelection = selected.size > 0
  // Determine which bulk actions are relevant based on selected listings
  const selectedListings = listings.filter((l) => selected.has(l.id))
  const canArchive = selectedListings.some((l) =>
    ['active', 'paused', 'under_offer', 'sold', 'let'].includes(l.status)
  )
  const canDelete = selectedListings.some((l) => l.status === 'archived')
  const canRelist = selectedListings.some((l) => l.status === 'archived')

  const formatPrice = (listing: Listing) => {
    const price = listing.intent === 'sale' ? listing.sale_price : listing.rent_price
    const currency = listing.currency || 'EUR'
    if (!price) return null
    return new Intl.NumberFormat(dateLocaleFromLocale(locale), {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(fromMinorUnits(price, currency))
  }

  return (
    <div>
      {/* Bulk action bar */}
      {hasSelection && (
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-[#0F1117] px-4 py-3 text-white">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={selected.size === listings.length}
              onChange={toggleAll}
              className="rounded border-white/30"
            />
            {t['selectAll']}
          </label>

          <span className="text-sm text-white/70 ml-2">
            {(t['selected'] ?? '{count} selected').replace(
              '{count}',
              String(selected.size)
            )}
          </span>

          <div className="ml-auto flex gap-2">
            {canRelist && (
              <button
                onClick={() => handleBulkAction('active')}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {t['relistSelected']}
              </button>
            )}
            {canArchive && (
              <button
                onClick={() => handleBulkAction('archived')}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
              >
                <Archive className="w-3.5 h-3.5" />
                {t['archiveSelected']}
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => handleBulkAction('deleted')}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t['deleteSelected']}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Select-all row when no selection */}
      {!hasSelection && listings.length > 1 && (
        <div className="mb-4 flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={false}
              onChange={toggleAll}
              className="rounded border-border-default"
            />
            {t['selectAll']}
          </label>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {listings.map((listing) => {
          const isPublic =
            listing.status === 'active' || listing.status === 'under_offer'
          const href = isPublic
            ? `/p/${listing.slug ?? listing.place_id}`
            : `/owner/${listing.id}`
          const formattedPrice = formatPrice(listing)
          const isSelected = selected.has(listing.id)

          return (
            <div
              key={listing.id}
              className={`bg-surface rounded-card border overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all will-change-transform group relative ${
                isSelected
                  ? 'border-brand ring-2 ring-brand/20'
                  : 'border-border-default'
              }`}
            >
              {/* Checkbox */}
              <div
                className="absolute top-3 left-3 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(listing.id)}
                  className="w-4 h-4 rounded border-white/40 bg-white/80 backdrop-blur-sm cursor-pointer"
                />
              </div>

              <Link href={href}>
                {/* Placeholder image area */}
                <div className="h-40 bg-bg flex items-center justify-center relative">
                  <Home size={48} className="text-[#D9DCE4]" />
                  {isPublic && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                      <ExternalLink size={14} className="text-text-secondary" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  {/* Status badge */}
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge status={listing.status} t={ts} />
                    <span className="text-xs text-text-muted">
                      {listing.place_id}
                    </span>
                  </div>

                  {/* Title — locale-aware */}
                  <h3 className="font-bold text-text-primary text-[0.9375rem] mb-1 group-hover:text-brand-dark transition-colors">
                    {locale === 'de'
                      ? (listing.title_de ?? listing.title ?? listing.place_id)
                      : (listing.title ?? listing.title_de ?? listing.place_id)}
                  </h3>

                  {/* Location */}
                  <p className="text-xs text-text-secondary mb-3">
                    {listing.postcode} {listing.city}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">
                      {formattedPrice ?? '\u2014'}
                      {listing.intent === 'rent' && formattedPrice && (
                        <span className="text-xs font-normal text-text-secondary">
                          {t['perMonth'] ?? '/mo'}
                        </span>
                      )}
                    </span>
                    <div className="flex gap-3 text-xs text-text-secondary">
                      {listing.size_sqm && (
                        <span>{listing.size_sqm} {t['unitSqm'] ?? 'm²'}</span>
                      )}
                      {listing.bedrooms && (
                        <span>{listing.bedrooms} {t['unitRooms'] ?? 'beds'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
