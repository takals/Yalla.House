import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OwnerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/owner')
  }

  // Fetch owner's listings — we need slug/place_id for single-listing redirect
  const { data: listings } = await (supabase as any)
    .from('listings')
    .select('id, place_id, slug, status')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (!listings || listings.length === 0) {
    // No listings → onboarding/info page
    redirect('/owner/info')
  }

  if (listings.length === 1) {
    // Single listing → go straight to the listing's public page (owner view)
    const listing = listings[0]
    const identifier = listing.slug || listing.place_id || listing.id
    redirect(`/p/${identifier}`)
  }

  // Multiple listings → grid overview
  redirect('/owner/listings')
}
