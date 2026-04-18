import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HunterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/hunter')
  }

  // Check if hunter has created a passport (hunter_profiles row with intent set)
  const { data: profile } = await (supabase as any)
    .from('hunter_profiles')
    .select('intent, brief_updated_at')
    .eq('user_id', user.id)
    .maybeSingle()

  // Has completed passport → overview dashboard
  if (profile?.intent) {
    redirect('/hunter/overview')
  }

  // No passport yet → send to passport intake
  redirect('/hunter/passport')
}
