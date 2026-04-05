import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface RawAssignment {
  id: string
  status: string
  data_scope: string
  connected_at: string | null
  created_at: string
  hunter_user: { full_name: string | null; email: string } | null
  hunter_profile: {
    intent: string | null
    budget_min: number | null
    budget_max: number | null
    target_areas: string[] | null
    property_types: string[] | null
    finance_status: string | null
    brief_updated_at: string | null
  } | null
}

export default async function AgentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/agent')

  const [profileResult, assignmentsResult] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('agent_profiles') as any)
      .select('agency_name, license_number, coverage_areas, property_types, verified_at, subscription_tier')
      .eq('user_id', user.id)
      .maybeSingle(),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('agent_hunter_assignments') as any)
      .select(`
        id, status, data_scope, connected_at, created_at,
        hunter_user:users!hunter_id(full_name, email),
        hunter_profile:hunter_profiles!hunter_id(intent, budget_min, budget_max, target_areas, property_types, finance_status, brief_updated_at)
      `)
      .eq('agent_id', user.id)
      .neq('status', 'disconnected')
      .order('created_at', { ascending: false }),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userResult = await (supabase.from('users') as any)
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  const agentProfile = profileResult.data
  const assignments: RawAssignment[] = assignmentsResult.data ?? []
  const agentUser = userResult.data

  const firstName = agentUser?.full_name?.split(' ')[0] ?? 'dort'
  const activeCount = assignments.filter(a => a.status === 'active').length
  const pendingCount = assignments.filter(a => a.status === 'invited').length
  const passportCount = assignments.filter(a => a.status === 'active' && a.hunter_profile?.brief_updated_at).length

  const STATUS_LABEL: Record<string, string> = {
    invited: 'Eingeladen',
    active: 'Verbunden',
    paused: 'Pausiert',
    ignored: 'Ignoriert',
  }
  const STATUS_STYLE: Record<string, string> = {
    invited: 'bg-[#FFFBE0] text-[#7A5F00] border-[#FFD400]',
    active: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
    paused: 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]',
    ignored: 'bg-[#F1F5F9] text-[#94A3B8] border-[#E2E8F0]',
  }

  const FINANCE_LABEL: Record<string, string> = {
    cash: '💰 Cash',
    mortgage_approved: '✓ Hypothek (Zusage)',
    mortgage_pending: '⏳ Hypothek (laufend)',
    not_specified: '—',
  }

  const modules = [
    { href: '/agent/hunters', title: 'Verbundene Käufer', subtitle: 'Home Passports deiner zugewiesenen Käufer', icon: '🛂' },
    { href: '/agent/profile', title: 'Mein Profil', subtitle: 'Agenturname, Tätigkeitsgebiete und Typen', icon: '🏢' },
  ]

  return (
    <div className="max-w-3xl">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-1">Hallo, {firstName}</h1>
            <p className="text-[#5E6278] text-sm">{agentUser?.email}</p>
          </div>
          {agentProfile?.agency_name && (
            <div className="bg-surface rounded-xl px-4 py-2 border border-[#E2E4EB] text-sm">
              <span className="font-semibold">{agentProfile.agency_name}</span>
              {agentProfile.verified_at && (
                <span className="ml-2 text-green-700 text-xs font-bold">✓ Verifiziert</span>
              )}
            </div>
          )}
        </div>

        {/* Profile setup nudge */}
        {!agentProfile?.agency_name && (
          <div className="mb-6 bg-[#FFFBE0] border border-[#FFD400] rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-sm">Profil einrichten</p>
              <p className="text-xs text-[#7A5F00] mt-0.5">Trag deinen Agenturname und deine Tätigkeitsgebiete ein, damit Käufer dich finden können.</p>
            </div>
            <Link
              href="/agent/profile"
              className="flex-shrink-0 bg-brand hover:bg-brand-hover text-[#0F1117] font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Jetzt einrichten →
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-surface rounded-card p-4">
            <p className="text-2xl font-bold">{activeCount}</p>
            <p className="text-xs text-[#5E6278] mt-0.5">Verbundene Käufer</p>
          </div>
          <div className="bg-surface rounded-card p-4">
            <p className={`text-2xl font-bold ${pendingCount > 0 ? 'text-brand' : ''}`}>{pendingCount}</p>
            <p className="text-xs text-[#5E6278] mt-0.5">Ausstehend</p>
          </div>
          <div className="bg-surface rounded-card p-4">
            <p className="text-2xl font-bold">{passportCount}</p>
            <p className="text-xs text-[#5E6278] mt-0.5">Passports erhalten</p>
          </div>
        </div>

        {/* Module nav */}
        <div className="grid gap-3 mb-10">
          {modules.map(mod => (
            <Link
              key={mod.href}
              href={mod.href}
              className="bg-surface rounded-card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
            >
              <span className="text-2xl">{mod.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#0F1117] group-hover:text-brand transition-colors">{mod.title}</p>
                <p className="text-sm text-[#5E6278] mt-0.5">{mod.subtitle}</p>
              </div>
              <span className="text-[#999] text-lg">→</span>
            </Link>
          ))}
        </div>

        {/* Connected hunters */}
        <h2 className="text-lg font-bold mb-4">Meine Käufer-Verbindungen</h2>

        {assignments.length === 0 ? (
          <div className="bg-surface rounded-card p-10 text-center">
            <p className="text-[#5E6278] text-sm mb-2">Noch keine Verbindungen.</p>
            <p className="text-xs text-[#999]">Käufer können deinen Passport anfragen — oder du kannst ihnen eine Einladung senden.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map(a => {
              const name = a.hunter_user?.full_name ?? a.hunter_user?.email ?? 'Anonymer Käufer'
              const profile = a.hunter_profile
              const budget = profile?.budget_max
                ? `bis €${Math.round(profile.budget_max / 100).toLocaleString('de-DE')}`
                : null
              const areas = profile?.target_areas?.slice(0, 2).join(', ') ?? null
              const finance = profile?.finance_status ? FINANCE_LABEL[profile.finance_status] : null
              const hasPassport = !!profile?.brief_updated_at

              return (
                <div key={a.id} className="bg-surface rounded-2xl p-5 border border-[#E2E4EB] flex gap-4 items-start">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#EDEEF2] flex items-center justify-center text-sm font-bold text-[#5E6278] flex-shrink-0">
                    {name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-sm">{name}</p>
                      <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[a.status] ?? 'bg-[#F1F5F9] text-[#64748B]'}`}>
                        {STATUS_LABEL[a.status] ?? a.status}
                      </span>
                      {hasPassport && (
                        <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full border bg-[rgba(74,222,128,0.12)] text-[#166534] border-[#BBF7D0]">
                          🛂 Passport
                        </span>
                      )}
                    </div>

                    {a.status === 'active' && profile ? (
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-[#5E6278]">
                        {budget && <span>{budget}</span>}
                        {areas && <span>{areas}</span>}
                        {finance && <span>{finance}</span>}
                      </div>
                    ) : (
                      <p className="text-xs text-[#999]">
                        {a.status === 'invited' ? 'Einladung ausstehend — Käufer hat noch nicht zugestimmt' : 'Kein Passport-Zugang'}
                      </p>
                    )}
                  </div>

                  {a.status === 'active' && (
                    <Link
                      href={`/agent/hunters`}
                      className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E2E4EB] text-[#5E6278] hover:border-[#C8CCD6] transition-colors"
                    >
                      Passport →
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
  )
}
