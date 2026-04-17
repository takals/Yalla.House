import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations } from 'next-intl/server'
import { HunterViewingsList } from './viewings-list'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isEnglish = locale === 'en'

  return {
    title: isEnglish ? 'Viewings | Yalla.House' : 'Besichtigungen | Yalla.House',
    description: isEnglish
      ? 'Track your property viewing requests and confirmed appointments.'
      : 'Verfolge deine Besichtigungsanfragen und best\u00E4tigten Termine.',
    robots: { index: false, follow: false },
  }
}

export default async function HunterViewingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('hunterViewings')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch all viewings for this hunter with listing data
  let viewingsData: any[] | null = null
  try {
    const result = await (supabase.from('viewings') as any)
      .select(`
        id, listing_id, status, scheduled_at, hunter_notes, created_at,
        listing:listings!listing_id(title, title_de, city, postcode, place_id)
      `)
      .eq('hunter_id', userId)
      .order('created_at', { ascending: false })
      .limit(200)
    viewingsData = result.data
  } catch (err) {
    console.error('Failed to load hunter viewings data:', err)
  }

  const viewings = (viewingsData ?? []).map((v: any) => ({
    id: v.id,
    listing_id: v.listing_id,
    status: v.status,
    scheduled_at: v.scheduled_at,
    hunter_notes: v.hunter_notes,
    created_at: v.created_at,
    listing_title: v.listing?.title_de ?? v.listing?.title ?? null,
    listing_city: v.listing?.city ?? null,
    listing_postcode: v.listing?.postcode ?? null,
    place_id: v.listing?.place_id ?? null,
  }))

  const upcomingCount = viewings.filter(
    (v: any) => ['pending', 'confirmed'].includes(v.status)
  ).length
  const confirmedCount = viewings.filter(
    (v: any) => v.status === 'confirmed'
  ).length

  // Build translations record for client component
  const tRecord: Record<string, string> = {}
  const keys = [
    'filterAll', 'filterUpcoming', 'filterPast', 'noViewings', 'browseListings',
    'statusPending', 'statusConfirmed', 'statusCancelled', 'statusCompleted', 'statusNoShow',
    'property', 'requestedOn', 'scheduledFor', 'yourNotes', 'withdraw', 'cancelling',
    'confirmCancel', 'viewListing', 'leaveFeedback', 'confirmationMessage', 'cancelledMessage',
  ]
  keys.forEach(k => { tRecord[k] = t(k) })

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary mb-1">{t('pageTitle')}</h1>
        <p className="text-text-secondary text-sm">{t('subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface rounded-2xl p-4 border border-border-default">
          <p className="text-2xl font-bold text-text-primary">{viewings.length}</p>
          <p className="text-xs text-text-secondary mt-0.5">{t('filterAll')}</p>
        </div>
        <div className="bg-surface rounded-2xl p-4 border border-border-default">
          <p className="text-2xl font-bold text-brand">{upcomingCount}</p>
          <p className="text-xs text-text-secondary mt-0.5">{t('filterUpcoming')}</p>
        </div>
        <div className="bg-surface rounded-2xl p-4 border border-border-default">
          <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
          <p className="text-xs text-text-secondary mt-0.5">{t('statusConfirmed')}</p>
        </div>
      </div>

      <HunterViewingsList viewings={viewings} t={tRecord} locale={locale} />
    </div>
  )
}
