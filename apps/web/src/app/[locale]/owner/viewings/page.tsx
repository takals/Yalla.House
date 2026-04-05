import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ViewingList, type ViewingRow } from './viewing-list'

export default async function ViewingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/owner/viewings')

  // Step 1: get all listing IDs for this owner
  const { data: myListings } = await (supabase as any)
    .from('listings')
    .select('id, title_de, place_id')
    .eq('owner_id', user.id)

  const listingIds = myListings?.map((l: any) => l.id) ?? []

  const listingMap: Record<string, { title_de: string | null; place_id: string }> = {}
  for (const l of myListings ?? [] as any[]) {
    listingMap[l.id] = { title_de: l.title_de, place_id: l.place_id }
  }

  // Step 2: get viewings with hunter info
  let viewings: ViewingRow[] = []
  if (listingIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('viewings') as any)
      .select(`
        id, listing_id, status, type, scheduled_at, hunter_notes, created_at,
        hunter:users!hunter_id(full_name, email, phone)
      `)
      .in('listing_id', listingIds)
      .order('created_at', { ascending: false })
      .limit(100) as { data: ViewingRow[] | null }

    viewings = data ?? []
  }

  return (
    <div className="max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Besichtigungsanfragen</h1>
        </div>

        {/* Sub-nav */}
        <div className="flex gap-4 mb-8 border-b border-[#E2E4EB]">
          <Link
            href="/owner"
            className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors"
          >
            Inserate
          </Link>
          <Link
            href="/owner/viewings"
            className="text-sm font-semibold text-[#0F1117] pb-3 border-b-2 border-brand -mb-px"
          >
            Anfragen
          </Link>
        </div>

        <ViewingList initialViewings={viewings} listingMap={listingMap} />
    </div>
  )
}
