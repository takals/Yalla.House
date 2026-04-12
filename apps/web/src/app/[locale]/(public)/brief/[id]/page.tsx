import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Home, MapPin, Banknote, BedDouble, Calendar, ArrowRight } from 'lucide-react'
import type { Database } from '@/types/database'

type Listing = Database['public']['Tables']['listings']['Row']

interface Props {
  params: { id: string; locale: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = params
  const supabase = await createClient()

  const { data: listing } = await (supabase as any)
    .from('listings')
    .select('title_de, title, description_de, description, city, postcode')
    .eq('id', id)
    .single()

  if (!listing) {
    return {
      title: locale === 'de' ? 'Brief nicht gefunden' : 'Brief not found',
    }
  }

  const title = locale === 'de'
    ? (listing.title_de ?? listing.title ?? 'Immobilien-Brief')
    : (listing.title ?? listing.title_de ?? 'Property Brief')
  
  const description = locale === 'de'
    ? (listing.description_de ?? listing.description ?? '')
    : (listing.description ?? listing.description_de ?? '')

  return {
    title: `${title} | Brief für Makler | Yalla.House`,
    description: description.slice(0, 160),
  }
}

export default async function BriefLandingPage({ params }: Props) {
  const supabase = await createClient()

  // Fetch the listing (owner brief) — select all, expose only safe fields in template
  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .single() as { data: Listing | null }

  if (!listing) notFound()

  const isSale = listing.intent === 'sale' || listing.intent === 'both'
  const isRent = listing.intent === 'rent' || listing.intent === 'both'
  const price = isSale
    ? listing.sale_price
      ? `£${(listing.sale_price / 100).toLocaleString('en-GB')}`
      : 'Price on application'
    : listing.rent_price
      ? `£${(listing.rent_price / 100).toLocaleString('en-GB')} pcm`
      : 'Rent on application'

  const intentLabel = listing.intent === 'both'
    ? 'Sale & Rental'
    : isSale
      ? 'For Sale'
      : 'To Rent'

  const propertyTypes: Record<string, string> = {
    house: 'House',
    flat: 'Flat',
    apartment: 'Apartment',
    villa: 'Villa',
    commercial: 'Commercial',
    land: 'Land',
    other: 'Property',
  }

  const typeName = propertyTypes[listing.property_type] ?? 'Property'

  return (
    <main className="bg-page-dark min-h-screen">

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand/10 text-brand text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-pill mb-6">
            Owner Brief
          </div>
          <h1 className="text-title-1 text-white mb-4">
            A property owner in {listing.city || listing.postcode} wants to hear from you.
          </h1>
          <p className="text-lede text-text-on-dark-secondary max-w-xl mx-auto">
            Review the brief below. Sign in to your Yalla agent dashboard to submit your proposal and win this instruction.
          </p>
        </div>
      </section>

      {/* ── BRIEF CARD ─────────────────────────────────────────────── */}
      <section className="pb-16 px-4">
        <div className="max-w-lg mx-auto bg-surface-dark rounded-card p-8 border border-white/[0.06]">
          <h2 className="text-lg font-bold text-white mb-6">Brief Summary</h2>

          <div className="grid grid-cols-2 gap-5">
            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-card-dark bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <div className="text-xs text-text-on-dark-muted mb-0.5">Area</div>
                <div className="text-sm font-semibold text-white">
                  {listing.city || listing.postcode}
                </div>
              </div>
            </div>

            {/* Property type */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-card-dark bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                <Home size={18} />
              </div>
              <div>
                <div className="text-xs text-text-on-dark-muted mb-0.5">Type</div>
                <div className="text-sm font-semibold text-white">{typeName}</div>
              </div>
            </div>

            {/* Price / Intent */}
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-card-dark bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                <Banknote size={18} />
              </div>
              <div>
                <div className="text-xs text-text-on-dark-muted mb-0.5">{intentLabel}</div>
                <div className="text-sm font-semibold text-white">{price}</div>
              </div>
            </div>

            {/* Bedrooms */}
            {listing.bedrooms != null && (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-card-dark bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                  <BedDouble size={18} />
                </div>
                <div>
                  <div className="text-xs text-text-on-dark-muted mb-0.5">Bedrooms</div>
                  <div className="text-sm font-semibold text-white">{listing.bedrooms}</div>
                </div>
              </div>
            )}
          </div>

          {/* Date */}
          <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center gap-2 text-xs text-text-on-dark-muted">
            <Calendar size={14} />
            Brief sent {new Date(listing.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ────────────────────────────────────────────── */}
      <section className="pb-24 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-title-2 text-white mb-3">
            Ready to respond?
          </h2>
          <p className="text-sm text-text-on-dark-secondary mb-8 max-w-sm mx-auto">
            Sign in to your agent dashboard to view the full brief and submit your proposal. Don&apos;t have an account? It takes 2 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/auth/login?next=/agent/briefs`}
              className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-semibold px-8 py-3.5 rounded-lg transition-[background-color] duration-300 text-base"
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              Respond to this brief
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/agent"
              className="text-text-on-dark-secondary hover:text-white font-medium transition-[color] duration-300 text-sm"
            >
              Learn about Yalla for agents →
            </Link>
          </div>

          {/* Trust signals */}
          <div className="mt-12 flex items-center justify-center gap-8 text-xs text-text-on-dark-muted">
            <span>Free to join</span>
            <span className="w-1 h-1 rounded-full bg-text-on-dark-muted" />
            <span>No commission</span>
            <span className="w-1 h-1 rounded-full bg-text-on-dark-muted" />
            <span>Win on merit</span>
          </div>
        </div>
      </section>

    </main>
  )
}
