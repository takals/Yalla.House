import { createClient } from '@/lib/supabase/server'
import { getTranslations, getLocale } from 'next-intl/server'
import { OwnerCalendarView } from './owner-calendar-view'
import { OwnerDemoContent } from '@/components/owner-demo-content'

export default async function OwnerCalendarPage() {
  const t = await getTranslations('ownerCalendar')
  const td = await getTranslations('ownerDemo')
  const locale = await getLocale()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? null

  // Guest → show demo content
  if (!userId) {
    const demoKeys = [
      'demoBadge', 'calendarHint', 'slotAvailable', 'slotBooked',
    ] as const
    const demoT: Record<string, string> = {}
    for (const key of demoKeys) demoT[key] = td(key)

    return (
      <div className="max-w-6xl">
        <OwnerDemoContent section="calendar" t={demoT} />
      </div>
    )
  }

  // Fetch owner's listings
  const { data: myListings } = await (supabase as any)
    .from('listings')
    .select('id, title_de, title_en, place_id, city, postcode')
    .eq('owner_id', userId)

  const listings = (myListings ?? []) as Array<{
    id: string
    title_de: string | null
    title_en: string | null
    place_id: string
    city: string | null
    postcode: string | null
  }>

  const listingIds = listings.map(l => l.id)

  // Fetch all future slots for owner's listings
  let slots: Array<{
    id: string
    listing_id: string
    starts_at: string
    ends_at: string
    is_booked: boolean
  }> = []

  if (listingIds.length > 0) {
    const { data: slotsData } = await (supabase as any)
      .from('availability_slots')
      .select('id, listing_id, starts_at, ends_at, is_booked')
      .in('listing_id', listingIds)
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })

    slots = slotsData ?? []
  }

  return (
    <div className="max-w-6xl">
      <OwnerCalendarView
        listings={listings}
        initialSlots={slots}
        locale={locale}
        translations={{
          title: t('title'),
          subtitle: t('subtitle'),
          upcomingSlots: t('upcomingSlots'),
          noSlots: t('noSlots'),
          noSlotsDesc: t('noSlotsDesc'),
          noListings: t('noListings'),
          noListingsDesc: t('noListingsDesc'),
          allListings: t('allListings'),
          slotsAvailable: t('slotsAvailable'),
          booked: t('booked'),
          free: t('free'),
          addFirstSlot: t('addFirstSlot'),
          viewProperty: t('viewProperty'),
        }}
      />
    </div>
  )
}
