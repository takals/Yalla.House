import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HunterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Guest visitors: send them straight to the passport intake, where they can
  // fill in what they're looking for and see sample matches before signing in.
  // No login wall and no agreement wall — those fire when they save.
  if (!user) {
    redirect('/hunter/passport')
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
