import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { AgentCard } from './agent-card'

interface Assignment {
  id: string
  agent_id: string
  status: string
  data_scope: string
  agency_name: string | null
  agent_name: string | null
  initiated_by: string
}

export default async function AgentsPage() {
  const t = await getTranslations('hunterAgents')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch assignments with agent profile + user name
  const { data: rawAssignments } = await (supabase.from('agent_hunter_assignments') as any)
    .select(`
      id, agent_id, status, data_scope, initiated_by,
      agent_profile:agent_profiles!agent_id(agency_name),
      agent_user:users!agent_id(full_name)
    `)
    .eq('hunter_id', userId)
    .neq('status', 'disconnected')
    .order('created_at', { ascending: false })

  const assignments: Assignment[] = (rawAssignments ?? []).map((a: {
    id: string
    agent_id: string
    status: string
    data_scope: string
    initiated_by: string | null
    agent_profile: { agency_name: string | null } | null
    agent_user: { full_name: string | null } | null
  }) => ({
    id: a.id,
    agent_id: a.agent_id,
    status: a.status,
    data_scope: a.data_scope,
    initiated_by: a.initiated_by ?? 'hunter',
    agency_name: a.agent_profile?.agency_name ?? null,
    agent_name: a.agent_user?.full_name ?? null,
  }))

  const activeCount = assignments.filter(a => a.status === 'active').length
  const invitedCount = assignments.filter(a => a.status === 'invited').length
  const ignoredCount = assignments.filter(a => a.status === 'ignored').length

  return (
    <div className="max-w-2xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">{t('title')}</h1>
          <p className="text-[#5E6278] text-sm">
            {t('subtitle')}
          </p>
        </div>

        {/* Stats */}
        {assignments.length > 0 && (
          <div className="flex gap-3 mb-6 flex-wrap">
            {[
              { label: t('connected'), count: assignments.length },
              { label: t('active'), count: activeCount },
              { label: t('invited'), count: invitedCount },
              { label: t('ignored'), count: ignoredCount },
            ].map(s => (
              <div key={s.label} className="bg-surface rounded-lg px-4 py-2 text-center">
                <p className="text-lg font-bold">{s.count}</p>
                <p className="text-xs text-[#5E6278]">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Assignments */}
        {assignments.length > 0 ? (
          <div className="grid gap-3 mb-8">
            {assignments.map(a => (
              <AgentCard key={a.id} assignment={a} />
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-card p-10 text-center mb-8">
            <p className="text-[#5E6278] text-sm">
              {t('noAgentsDesc')}
            </p>
          </div>
        )}

        {/* Find agents placeholder */}
        <div className="bg-surface rounded-card p-6 border border-[#E2E4EB]">
          <h3 className="font-semibold mb-1">{t('findAgents')}</h3>
          <p className="text-sm text-[#5E6278] mb-4">
            {t('findAgentsDesc')}
          </p>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-50 text-yellow-800 border border-yellow-200 text-xs font-semibold">
            {t('comingSoon')}
          </span>
        </div>

      </div>
  )
}
