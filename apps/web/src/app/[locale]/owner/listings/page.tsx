import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Home, ExternalLink } from 'lucide-react'
import { fromMinorUnits } from '@yalla/integrations'
import { getTranslations } from 'next-intl/server'
import type { Database } from '@/types/database'

type Listing = Database['public']['Tables']['listings']['Row']

export default async function OwnerListingsPage() {
  const t = await getTranslations('ownerListings')
  const ts = await getTranslations('statusLabels')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }
  const userId = user.id

  let allListings: Listing[] = []
  try {
    const { data: listingsData } = await supabase
      .from('listings')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    allListings = listingsData ?? []
  } catch (err) {
    console.error('Failed to load owner listings data:', err)
  }

  // Single listing shortcut: if owner has exactly 1 listing, go straight to it
  if (allListings.length === 1) {
    const only = allListings[0]!
    const isPublic = only.status === 'active' || only.status === 'under_offer'
    redirect(isPublic ? `/p/${only.slug ?? only.place_id}` : `/owner/${only.id}`)
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
          href="/owner/new"
          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-text-primary font-bold px-5 py-2.5 rounded-lg transition-colors will-change-transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          {t('newListing')}
        </Link>
      </div>

      {/* Listings grid */}
      {allListings.length === 0 ? (
        <div className="bg-surface rounded-card border border-border-default py-16 text-center">
          <p className="text-text-secondary mb-4">{t('noListingsCreated')}</p>
          <Link
            href="/owner/new"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-text-primary font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('createFirstListing')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {allListings.map(listing => {
            const price = listing.intent === 'sale' ? listing.sale_price : listing.rent_price
            const currency = listing.currency || 'EUR'
            const formattedPrice = price
              ? new Intl.NumberFormat('de-DE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(fromMinorUnits(price, currency))
              : null

            // Live/under_offer listings link to the public page; others to the owner edit page
            const isPublic = listing.status === 'active' || listing.status === 'under_offer'
            const href = isPublic ? `/p/${listing.slug ?? listing.place_id}` : `/owner/${listing.id}`

            return (
              <Link
                key={listing.id}
                href={href}
                className="bg-surface rounded-card border border-border-default overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all will-change-transform group relative"
              >
                {/* Placeholder image area */}
                <div className="h-40 bg-bg flex items-center justify-center relative">
                  <Home size={48} className="text-[#D9DCE4]" />
                  {/* Public link indicator for live listings */}
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
                    <span className="text-xs text-text-muted">{listing.place_id}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-text-primary text-[0.9375rem] mb-1 group-hover:text-brand-dark transition-colors">
                    {listing.title_de ?? listing.title ?? listing.place_id}
                  </h3>

                  {/* Location */}
                  <p className="text-xs text-text-secondary mb-3">
                    {listing.postcode} {listing.city}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-text-primary">
                      {formattedPrice ?? '—'}
                      {listing.intent === 'rent' && formattedPrice && (
                        <span className="text-xs font-normal text-text-secondary">/Mo</span>
                      )}
                    </span>
                    <div className="flex gap-3 text-xs text-text-secondary">
                      {listing.size_sqm && <span>{listing.size_sqm} m²</span>}
                      {listing.bedrooms && <span>{listing.bedrooms} Zi.</span>}
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const isLive = status === 'active'

  const styles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    under_offer: 'bg-blue-100 text-blue-700',
    sold: 'bg-purple-100 text-purple-700',
    let: 'bg-purple-100 text-purple-700',
    archived: 'bg-gray-100 text-gray-400',
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
      {t(status) ?? status}
    </span>
  )
}
