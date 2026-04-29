import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireAgreement } from '@/lib/agreements'

export default async function OwnerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Guest visitors: send to listings page where they see the example card
  // and can explore the dashboard freely before signing in.
  if (!user) {
    redirect('/owner/listings')
  }

  // Agreement gate — redirects to /owner/agreement if not signed
  await requireAgreement(user.id, 'owner')

  // Fetch owner's listings — we need slug/place_id for single-listing redirect
  const { data: listings } = await (supabase as any)
    .from('listings')
    .select('id, place_id, slug, status')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (!listings || listings.length === 0) {
    redirect('/owner/listings')
  }

  if (listings.length === 1) {
    const listing = listings[0]
    const identifier = listing.slug || listing.place_id || listing.id
    redirect(`/p/${identifier}`)
  }

  redirect('/owner/listings')
}
