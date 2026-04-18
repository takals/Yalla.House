import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AgentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?next=/agent')
  }

  // Check agent profile: agreement signed + profile complete
  const { data: profile } = await (supabase as any)
    .from('agent_profiles')
    .select('partner_agreement_signed_at, agency_name, license_number')
    .eq('user_id', user.id)
    .maybeSingle()

  // No profile or agreement not signed → agreement page
  if (!profile?.partner_agreement_signed_at) {
    redirect('/agent/agreement')
  }

  // Agreement signed but profile incomplete → profile setup
  if (!profile.agency_name) {
    redirect('/agent/profile')
  }

  // Fully set up → overview/assignments
  redirect('/agent/assignments')
}
