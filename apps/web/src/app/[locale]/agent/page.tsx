import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { requireAgreement } from '@/lib/agreements'

export default async function AgentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/agent')
  }

  // Agreement gate — redirects to /agent/agreement if not signed
  await requireAgreement(user.id, 'agent')

  // Check agent profile completeness
  const { data: profile } = await (supabase as any)
    .from('agent_profiles')
    .select('agency_name, license_number')
    .eq('user_id', user.id)
    .maybeSingle()

  // Agreement signed but profile incomplete → profile setup
  if (!profile?.agency_name) {
    redirect('/agent/profile')
  }

  // Fully set up → overview/assignments
  redirect('/agent/assignments')
}
