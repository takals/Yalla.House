import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { ShieldCheck, Building2, Banknote, CheckCircle, Clock } from 'lucide-react'
import { dateLocaleFromLocale } from '@/lib/country-config'

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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('agentDashboard')

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function AgentPage() {
  const t = await getTranslations('agentDashboard')
  const locale = await getLocale()
  const dateLocale = dateLocaleFromLocale(locale)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  let agentProfile: any = null
  let assignments: RawAssignment[] = []
  let agentUser: any = null
  try {
    const [profileResult, assignmentsResult] = await Promise.all([
      (supabase.from('agent_profiles') as any)
        .select('agency_name, license_number, coverage_areas, property_types, verified_at, subscription_tier')
        .eq('user_id', userId)
        .maybeSingle(),

      (supabase.from('agent_hunter_assignments') as any)
        .select(`
          id, status, data_scope, connected_at, created_at,
          hunter_user:users!hunter_id(full_name, email),
          hunter_profile:hunter_profiles!hunter_id(intent, budget_min, budget_max, target_areas, property_types, finance_status, brief_updated_at)
        `)
        .eq('agent_id', userId)
        .neq('status', 'disconnected')
        .order('created_at', { ascending: false }),
    ])

    const userResult = await (supabase.from('users') as any)
      .select('full_name, email')
      .eq('id', userId)
      .maybeSingle()

    agentProfile = profileResult.data
    assignments = assignmentsResult.data ?? []
    agentUser = userResult.data
  } catch (err) {
    console.error('Failed to load agent dashboard data:', err)
  }

  const firstName = agentUser?.full_name?.split(' ')[0] ?? 'dort'
  const activeCount = assignments.filter(a => a.status === 'active').length
  const pendingCount = assignments.filter(a => a.status === 'invited').length
  const passportCount = assignments.filter(a => a.status === 'active' && a.hunter_profile?.brief_updated_at).length

  const STATUS_LABEL: Record<string, string> = {
    invited: t('invited'),
    active: t('connected'),
    paused: t('paused'),
    ignored: t('ignored'),
  }
  const STATUS_STYLE: Record<string, string> = {
    invited: 'bg-brand-solid-bg text-brand-badge-text border-brand',
    active: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
    paused: 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]',
    ignored: 'bg-[#F1F5F9] text-[#94A3B8] border-[#E2E8F0]',
  }

  const FINANCE_LABEL: Record<string, { label: string; icon: React.ReactNode }> = {
    cash: { label: t('cash'), icon: <Banknote size={14} className="inline mr-1" /> },
    mortgage_approved: { label: t('mortgageApproved'), icon: <CheckCircle size={14} className="inline mr-1 text-green-600" /> },
    mortgage_pending: { label: t('mortgagePending'), icon: <Clock size={14} className="inline mr-1" /> },
    not_specified: { label: '—', icon: null },
  }

  const modules = [
    { href: '/agent/hunters', title: t('myBuyers'), subtitle: t('buyersSubtitle'), icon: <ShieldCheck size={24} /> },
    { href: '/agent/profile', title: t('myProfile'), subtitle: t('profileSubtitle'), icon: <Building2 size={24} /> },
  ]

  return (
    <div className="max-w-3xl">

        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold mb-1">{t('hello', { name: firstName })}</h1>
            <p className="text-text-secondary text-sm">{agentUser?.email}</p>
          </div>
          {agentProfile?.agency_name && (
            <div className="bg-surface rounded-xl px-4 py-2 border border-border-default text-sm">
              <span className="font-semibold">{agentProfile.agency_name}</span>
              {agentProfile.verified_at && (
                <span className="ml-2 text-green-700 text-xs font-bold">{t('verified')}</span>
              )}
            </div>
          )}
        </div>

        {/* Sub-nav tabs */}
        <div className="flex gap-6 mb-8 border-b border-border-default">
          <Link href="/agent/info" className="text-sm font-semibold text-text-secondary hover:text-text-primary pb-3 transition-colors">
            Info
          </Link>
          <Link href="/agent/overview" className="text-sm font-semibold text-text-primary pb-3 border-b-2 border-brand -mb-px">
            Dashboard
          </Link>
          <Link href="/agent/briefs" className="text-sm font-semibold text-text-secondary hover:text-text-primary pb-3 transition-colors">
            Briefs
          </Link>
          <Link href="/agent/assignments" className="text-sm font-semibold text-text-secondary hover:text-text-primary pb-3 transition-colors">
            Assignments
          </Link>
        </div>

        {/* Profile setup nudge */}
        {!agentProfile?.agency_name && (
          <div className="mb-6 bg-brand-solid-bg border border-brand rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-sm">{t('setupProfile')}</p>
              <p className="text-xs text-brand-badge-text mt-0.5">{t('setupProfileDesc')}</p>
            </div>
            <Link
              href="/agent/profile"
              className="flex-shrink-0 bg-brand hover:bg-brand-hover text-text-primary font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              {t('setupNow')}
            </Link>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-surface rounded-card p-4">
            <p className="text-2xl font-bold">{activeCount}</p>
            <p className="text-xs text-text-secondary mt-0.5">{t('connectedBuyers')}</p>
          </div>
          <div className="bg-surface rounded-card p-4">
            <p className={`text-2xl font-bold ${pendingCount > 0 ? 'text-brand' : ''}`}>{pendingCount}</p>
            <p className="text-xs text-text-secondary mt-0.5">{t('pending')}</p>
          </div>
          <div className="bg-surface rounded-card p-4">
            <p className="text-2xl font-bold">{passportCount}</p>
            <p className="text-xs text-text-secondary mt-0.5">{t('passportsReceived')}</p>
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
              <div className="text-brand flex-shrink-0">{mod.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-text-primary group-hover:text-brand transition-colors">{mod.title}</p>
                <p className="text-sm text-text-secondary mt-0.5">{mod.subtitle}</p>
              </div>
              <span className="text-text-muted text-lg">→</span>
            </Link>
          ))}
        </div>

        {/* Connected hunters */}
        <h2 className="text-lg font-bold mb-4">{t('myConnections')}</h2>

        {assignments.length === 0 ? (
          <div className="bg-surface rounded-card p-10 text-center">
            <p className="text-text-secondary text-sm mb-2">{t('noConnections')}</p>
            <p className="text-xs text-text-muted">{t('noConnectionsDesc')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map(a => {
              const name = a.hunter_user?.full_name ?? a.hunter_user?.email ?? t('anonymousBuyer')
              const profile = a.hunter_profile
              const budget = profile?.budget_max
                ? `bis €${Math.round(profile.budget_max / 100).toLocaleString(dateLocale)}`
                : null
              const areas = profile?.target_areas?.slice(0, 2).join(', ') ?? null
              const finance = profile?.finance_status ? FINANCE_LABEL[profile.finance_status] : null
              const hasPassport = !!profile?.brief_updated_at

              return (
                <div key={a.id} className="bg-surface rounded-2xl p-5 border border-border-default flex gap-4 items-start">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-bg flex items-center justify-center text-sm font-bold text-text-secondary flex-shrink-0">
                    {name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-semibold text-sm">{name}</p>
                      <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLE[a.status] ?? 'bg-[#F1F5F9] text-[#64748B]'}`}>
                        {STATUS_LABEL[a.status] ?? a.status}
                      </span>
                      {hasPassport && (
                        <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full border bg-[rgba(74,222,128,0.12)] text-[#166534] border-[#BBF7D0] inline-flex items-center gap-1">
                          <ShieldCheck size={11} /> Passport
                        </span>
                      )}
                    </div>

                    {a.status === 'active' && profile ? (
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-text-secondary">
                        {budget && <span>{budget}</span>}
                        {areas && <span>{areas}</span>}
                        {finance && profile.finance_status && (
                          <span className="inline-flex items-center gap-1">
                            {FINANCE_LABEL[profile.finance_status]?.icon}
                            <span>{FINANCE_LABEL[profile.finance_status]?.label}</span>
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-text-muted">
                        {a.status === 'invited' ? t('invitationPending') : t('noPassportAccess')}
                      </p>
                    )}
                  </div>

                  {a.status === 'active' && (
                    <Link
                      href={`/agent/hunters`}
                      className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-border-default text-text-secondary hover:border-[#C8CCD6] transition-colors"
                    >
                      {t('viewPassport')}
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
