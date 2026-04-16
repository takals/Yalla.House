import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations } from 'next-intl/server'
import { OffersClient } from './offers-client'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isEnglish = locale === 'en'

  return {
    title: isEnglish ? 'Offers | Yalla.House' : 'Angebote | Yalla.House',
    description: isEnglish
      ? 'Review and manage offers on your properties.'
      : 'Angebote f\u00FCr Ihre Immobilien pr\u00FCfen und verwalten.',
    robots: { index: false, follow: false },
  }
}

export default async function OwnerOffersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('ownerOffers')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Get owner's listing IDs and fetch offers with related data
  let offers: any[] = []
  try {
    const { data: listings } = await (supabase.from('listings') as any)
      .select('id')
      .eq('owner_id', userId)

    const listingIds = ((listings as any[]) ?? []).map((l: any) => l.id)

    if (listingIds.length > 0) {
      const { data: offersData } = await (supabase.from('offers') as any)
        .select('*')
        .in('listing_id', listingIds)
        .order('created_at', { ascending: false })

      if (offersData) {
        // Enrich with listing and hunter info
        const hunterIds = [...new Set(offersData.map((o: any) => o.hunter_id))]

        const [listingsResult, usersResult] = await Promise.all([
          supabase.from('listings').select('id, title, title_de, city, postcode').in('id', listingIds),
          hunterIds.length > 0
            ? (supabase.from('users') as any).select('id, full_name, email').in('id', hunterIds)
            : Promise.resolve({ data: [] }),
        ])

        const listingsMap = new Map((listingsResult.data ?? []).map((l: any) => [l.id, l]))
        const usersMap = new Map(((usersResult.data as any[]) ?? []).map((u: any) => [u.id, u]))

        offers = offersData.map((o: any) => {
          const listing = listingsMap.get(o.listing_id) as any
          const hunter = usersMap.get(o.hunter_id) as any
          return {
            ...o,
            listing_title: listing?.title_de ?? listing?.title ?? null,
            listing_city: listing?.city ?? null,
            listing_postcode: listing?.postcode ?? null,
            hunter_name: hunter?.full_name ?? null,
            hunter_email: hunter?.email ?? null,
          }
        })
      }
    }
  } catch (err) {
    console.error('Failed to load owner offers data:', err)
  }

  // Build translations record for client component
  const tRecord: Record<string, string> = {}
  const keys = [
    'pageTitle', 'subtitle', 'filterAll', 'filterActive', 'filterResolved',
    'noOffers', 'amount', 'from', 'submitted', 'type', 'typeSale', 'typeRental',
    'finance', 'financeCash', 'financeMortgageApproved', 'financeMortgagePending',
    'financeNotSpecified', 'conditions', 'message', 'moveInDate', 'accept', 'decline',
    'statusSubmitted', 'statusUnderReview', 'statusAccepted', 'statusDeclined',
    'statusWithdrawn', 'statusExpired',
  ]
  keys.forEach(k => { tRecord[k] = t(k) })

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-1">{t('pageTitle')}</h1>
        <p className="text-text-secondary text-sm">{t('subtitle')}</p>
      </div>

      <OffersClient offers={offers} t={tRecord} locale={locale} />
    </div>
  )
}
