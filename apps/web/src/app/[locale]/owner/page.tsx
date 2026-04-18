import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OwnerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/owner')
  }

  // Check if owner has any listings
  const { count } = await supabase
    .from('listings')
    .select('id', { count: 'exact', head: true })
    .eq('owner_id', user.id)

  // Has listings → go to listings overview. No listings → onboarding/info page.
  if (count && count > 0) {
    redirect('/owner/listings')
  }

  redirect('/owner/info')
}
