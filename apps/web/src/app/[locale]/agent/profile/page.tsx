import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { ProfileForm } from './profile-form'

export default async function AgentProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase.from('agent_profiles') as any)
    .select('agency_name, license_number, property_types, focus, verified_at, subscription_tier')
    .eq('user_id', userId)
    .maybeSingle()

  return (
    <div className="max-w-2xl">

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Mein Profil</h1>
          <p className="text-[#5E6278] text-sm">Richte dein Makler-Profil ein, damit Käufer dich finden können.</p>
        </div>

        <ProfileForm profile={profile} />

      </div>
  )
}
