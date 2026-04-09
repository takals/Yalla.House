import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { fromMinorUnits } from '@yalla/integrations'
import type { Database } from '@/types/database'

type Listing = Database['public']['Tables']['listings']['Row']

export default async function OwnerListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const { data: listingsData } = await supabase
    .from('listings')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })

  const allListings: Listing[] = listingsData ?? []

  return (
    <div className="max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0F1117]">Meine Inserate</h1>
          <p className="text-sm text-[#5E6278] mt-1">
            {allListings.length} {allListings.length === 1 ? 'Inserat' : 'Inserate'}
          </p>
        </div>
        <Link
          href="/owner/new"
          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-[#0F1117] font-bold px-5 py-2.5 rounded-lg transition-colors will-change-transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          Neues Inserat
        </Link>
      </div>

      {/* Listings grid */}
      {allListings.length === 0 ? (
        <div className="bg-surface rounded-card border border-[#E2E4EB] py-16 text-center">
          <p className="text-[#5E6278] mb-4">Sie haben noch keine Inserate erstellt.</p>
          <Link
            href="/owner/new"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-[#0F1117] font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Erstes Inserat erstellen
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

            return (
              <Link
                key={listing.id}
                href={`/owner/${listing.id}`}
                className="bg-surface rounded-card border border-[#E2E4EB] overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all will-change-transform group"
              >
                {/* Placeholder image area */}
                <div className="h-40 bg-[#EDEEF2] flex items-center justify-center">
                  <span className="text-3xl text-[#D9DCE4]">🏠</span>
                </div>

                <div className="p-4">
                  {/* Status badge */}
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge status={listing.status} />
                    <span className="text-xs text-[#999]">{listing.place_id}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-[#0F1117] text-[0.9375rem] mb-1 group-hover:text-brand-dark transition-colors">
                    {listing.title_de ?? listing.title ?? listing.place_id}
                  </h3>

                  {/* Location */}
                  <p className="text-xs text-[#5E6278] mb-3">
                    {listing.postcode} {listing.city}
                  </p>

                  {/* Meta row */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0F1117]">
                      {formattedPrice ?? '—'}
                      {listing.intent === 'rent' && formattedPrice && (
                        <span className="text-xs font-normal text-[#5E6278]">/Mo</span>
                      )}
                    </span>
                    <div className="flex gap-3 text-xs text-[#5E6278]">
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    active: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    under_offer: 'bg-blue-100 text-blue-700',
    sold: 'bg-purple-100 text-purple-700',
    let: 'bg-purple-100 text-purple-700',
    archived: 'bg-gray-100 text-gray-400',
  }
  const labels: Record<string, string> = {
    draft: 'Entwurf',
    active: 'Aktiv',
    paused: 'Pausiert',
    under_offer: 'Angebot liegt vor',
    sold: 'Verkauft',
    let: 'Vermietet',
    archived: 'Archiviert',
  }

  return (
    <span
      className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
        styles[status] ?? styles['draft']
      }`}
    >
      {labels[status] ?? status}
    </span>
  )
}
