import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AgentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Guest visitors: show the live briefs board with its sample/empty state so
  // an agent can see what they'd be working with before creating an account.
  // The Partner Agreement is asked for when they send their first proposal.
  if (!user) {
    redirect('/agent/assignments')
  }

  // Check agent profile completeness
  const { data: profile } = await (supabase as any)
    .from('agent_profiles')
    .select('agency_name, license_number')
    .eq('user_id', user.id)
    .maybeSingle()

  // Profile incomplete → profile setup
  if (!profile?.agency_name) {
    redirect('/agent/profile')
  }

  // Fully set up → overview/assignments
  redirect('/agent/assignments')
}
