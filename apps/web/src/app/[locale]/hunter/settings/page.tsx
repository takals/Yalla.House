import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SettingsClient } from './settings-client'

interface RawAssignment {
  id: string
  status: string
  agent_profile: { agency_name: string | null } | null
  agent_user: { full_name: string | null } | null
}

interface RawConsentEvent {
  id: string
  event_type: string
  created_at: string
  agent: { full_name: string | null } | null
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/hunter/settings')

  const [profileResult, assignmentsResult, consentResult] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('users') as any)
      .select('full_name, email, phone')
      .eq('id', user.id)
      .single(),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('agent_hunter_assignments') as any)
      .select(`
        id, status,
        agent_profile:agent_profiles!agent_id(agency_name),
        agent_user:users!agent_id(full_name)
      `)
      .eq('hunter_id', user.id)
      .neq('status', 'disconnected')
      .order('created_at', { ascending: false }),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('hunter_consent_log') as any)
      .select('id, event_type, created_at, agent:users!agent_id(full_name)')
      .eq('hunter_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const profile = profileResult.data ?? { full_name: null, email: user.email ?? '', phone: null }

  const assignments = (assignmentsResult.data ?? []).map((a: RawAssignment) => ({
    id: a.id,
    status: a.status,
    agency_name: a.agent_profile?.agency_name ?? null,
    agent_name: a.agent_user?.full_name ?? null,
  }))

  const consentLog = (consentResult.data ?? []).map((ev: RawConsentEvent) => ({
    id: ev.id,
    event_type: ev.event_type,
    agent_name: ev.agent?.full_name ?? null,
    created_at: ev.created_at,
  }))

  return (
    <div className="max-w-2xl">

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Konto & Datenschutz</h1>
          <p className="text-[#5E6278] text-sm">Profil verwalten und Datenweitergabe kontrollieren.</p>
        </div>

        <SettingsClient
          profile={profile}
          assignments={assignments}
          consentLog={consentLog}
        />

    </div>
  )
}
