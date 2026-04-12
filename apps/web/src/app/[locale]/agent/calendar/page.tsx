import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations } from 'next-intl/server'
import { CalendarManager } from './calendar-manager'

interface SlotRow {
  id: string
  listing_id: string
  starts_at: string
  ends_at: string
  is_booked: boolean
  viewing_id: string | null
}

interface ListingRow {
  id: string
  listing_id: string
  listing: { id: string; title_de: string | null; place_id: string; city: string } | null
}

interface ViewingRow {
  id: string
  listing_id: string
  slot_id: string | null
  scheduled_at: string
  status: string
  type: string
  hunter: { full_name: string | null; email: string; phone: string | null } | null
}

export default async function AgentCalendarPage() {
  const t = await getTranslations('agentCalendar')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Get agent's active listing assignments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assignments } = await (supabase.from('listing_agent_assignments') as any)
    .select(`
      id, listing_id,
      listing:listings!listing_id(id, title_de, place_id, city)
    `)
    .eq('agent_id', userId)
    .eq('status', 'active') as { data: ListingRow[] | null }

  const listingIds = assignments?.map(a => a.listing_id) ?? []

  // Fetch availability slots and viewings for these listings in parallel
  let slots: SlotRow[] = []
  let viewings: ViewingRow[] = []

  if (listingIds.length > 0) {
    const [slotsResult, viewingsResult] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('availability_slots') as any)
        .select('id, listing_id, starts_at, ends_at, is_booked, viewing_id')
        .in('listing_id', listingIds)
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(200),

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('viewings') as any)
        .select(`
          id, listing_id, slot_id, scheduled_at, status, type,
          hunter:users!hunter_id(full_name, email, phone)
        `)
        .in('listing_id', listingIds)
        .in('status', ['pending', 'confirmed'])
        .order('scheduled_at', { ascending: true })
        .limit(200),
    ])

    slots = slotsResult.data ?? []
    viewings = viewingsResult.data ?? []
  }

  // Build listing map for display
  const listingMap: Record<string, { title_de: string | null; place_id: string; city: string }> = {}
  for (const a of assignments ?? []) {
    if (a.listing) {
      listingMap[a.listing_id] = {
        title_de: a.listing.title_de,
        place_id: a.listing.place_id,
        city: a.listing.city,
      }
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-sm text-[#5E6278] mt-1">{t('subtitle')}</p>
        </div>
      </div>

      <CalendarManager
        initialSlots={slots}
        initialViewings={viewings}
        listingMap={listingMap}
        listingIds={listingIds}
        translations={{
          addSlots: t('addSlots'),
          upcoming: t('upcoming'),
          noSlots: t('noSlots'),
          noViewings: t('noViewings'),
          booked: t('booked'),
          available: t('available'),
          pending: t('pending'),
          confirmed: t('confirmed'),
          addAvailability: t('addAvailability'),
          selectListing: t('selectListing'),
          date: t('date'),
          startTime: t('startTime'),
          endTime: t('endTime'),
          save: t('save'),
          cancel: t('cancel'),
          viewings: t('viewingsLabel'),
          slots: t('slotsLabel'),
          inPerson: t('inPerson'),
          virtual: t('virtual'),
          confirm: t('confirm'),
          decline: t('decline'),
          remove: t('remove'),
        }}
      />
    </div>
  )
}
