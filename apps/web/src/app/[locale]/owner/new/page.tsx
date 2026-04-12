import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { ListingWizard } from './wizard'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function NewListingPage({ params }: Props) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  return (
    <ListingWizard ownerId={userId} locale={locale} />
  )
}
