import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ListingWizard } from './wizard'

export default async function NewListingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/owner/new')

  return (
    <ListingWizard ownerId={user.id} />
  )
}
