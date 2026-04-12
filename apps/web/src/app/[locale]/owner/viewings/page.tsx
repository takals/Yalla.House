import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ViewingList, type ViewingRow } from './viewing-list'

interface SlotRow {
  id: string
  listing_id: string
  starts_at: string
  ends_at: string
  is_booked: boolean
}

export default async function ViewingsPage() {
  const t = await getTranslations('ownerViewings')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Step 1: get all listing IDs for this owner
  const { data: myListings } = await (supabase as any)
    .from('listings')
    .select('id, title_de, place_id')
    .eq('owner_id', userId)

  const listingIds = myListings?.map((l: any) => l.id) ?? []

  const listingMap: Record<string, { title_de: string | null; place_id: string }> = {}
  for (const l of myListings ?? [] as any[]) {
    listingMap[l.id] = { title_de: l.title_de, place_id: l.place_id }
  }

  // Step 2: get viewings and availability slots in parallel
  let viewings: ViewingRow[] = []
  let slotCount = 0
  let bookedCount = 0

  if (listingIds.length > 0) {
    const [viewingsResult, slotsResult] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('viewings') as any)
        .select(`
          id, listing_id, status, type, scheduled_at, hunter_notes, created_at,
          hunter:users!hunter_id(full_name, email, phone)
        `)
        .in('listing_id', listingIds)
        .order('created_at', { ascending: false })
        .limit(100) as { data: ViewingRow[] | null },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('availability_slots') as any)
        .select('id, is_booked')
        .in('listing_id', listingIds)
        .gte('starts_at', new Date().toISOString()),
    ])

    viewings = viewingsResult.data ?? []
    const slots: SlotRow[] = slotsResult.data ?? []
    slotCount = slots.length
    bookedCount = slots.filter(s => s.is_booked).length
  }

  const pendingCount = viewings.filter(v => v.status === 'pending').length
  const confirmedCount = viewings.filter(v => v.status === 'confirmed').length

  return (
    <div className="max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
        </div>

        {/* Sub-nav */}
        <div className="flex gap-4 mb-6 border-b border-[#E2E4EB]">
          <Link
            href="/owner"
            className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors"
          >
            {t('listings')}
          </Link>
          <Link
            href="/owner/viewings"
            className="text-sm font-semibold text-[#0F1117] pb-3 border-b-2 border-brand -mb-px"
          >
            {t('viewings')}
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-surface rounded-card p-4">
            <p className="text-2xl font-bold text-brand">{pendingCount}</p>
            <p className="text-xs text-[#5E6278] mt-0.5">{t('pending')}</p>
          </div>
          <div className="bg-surface rounded-card p-4">
            <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
            <p className="text-xs text-[#5E6278] mt-0.5">{t('confirmed')}</p>
          </div>
          <div className="bg-surface rounded-card p-4">
            <p className="text-2xl font-bold">{slotCount}</p>
            <p className="text-xs text-[#5E6278] mt-0.5">{t('totalSlots')}</p>
          </div>
          <div className="bg-surface rounded-card p-4">
            <p className="text-2xl font-bold">{bookedCount}</p>
            <p className="text-xs text-[#5E6278] mt-0.5">{t('booked')}</p>
          </div>
        </div>

        <ViewingList initialViewings={viewings} listingMap={listingMap} />
    </div>
  )
}
