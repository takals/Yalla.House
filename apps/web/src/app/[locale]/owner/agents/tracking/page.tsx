import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import Link from 'next/link'
import { ArrowLeft, Mail, Eye, MousePointerClick, MessageSquare, CheckCircle2, Clock, AlertCircle } from 'lucide-react'

interface Assignment {
  id: string
  status: 'invited' | 'accepted' | 'active' | 'paused' | 'revoked'
  invited_at: string
  accepted_at: string | null
  revoked_at: string | null
  agent: {
    agency_name: string | null
  } | null
}

function formatTimeAgo(isoDate: string, t: (key: string, values?: any) => string): string {
  const now = new Date()
  const date = new Date(isoDate)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return t('justNow')
  if (diffMins < 60) return t('minutesAgo', { count: diffMins })
  if (diffHours < 24) return t('hoursAgo', { count: diffHours })
  if (diffDays < 7) return t('daysAgo', { count: diffDays })

  const weeks = Math.floor(diffDays / 7)
  if (weeks < 4) return t('weeksAgo', { count: weeks })

  const months = Math.floor(diffDays / 30)
  return t('monthsAgo', { count: months })
}

export default async function TrackingPage() {
  const t = await getTranslations('ownerAgents')
  const tc = await getTranslations('comms')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch all assignments for this owner's listings
  let assignments: Assignment[] = []

  const { data } = await (supabase as any)
    .from('listing_agent_assignments')
    .select(`
      id, status, invited_at, accepted_at, revoked_at,
      agent:agent_profiles!listing_agent_assignments_agent_id_fkey(
        agency_name
      )
    `)
    .eq('owner_id', userId)
    .order('invited_at', { ascending: false })

  assignments = data ?? []

  // Calculate tracking states based on assignment status and timestamps
  const trackingData = assignments.map(assignment => {
    const isDelivered = !!assignment.invited_at
    const isOpened = !!assignment.accepted_at || !!assignment.revoked_at
    const isClicked = !!assignment.accepted_at || !!assignment.revoked_at
    const isResponded = !!assignment.accepted_at || !!assignment.revoked_at

    let status = 'delivered'
    if (isResponded) {
      status = assignment.status === 'revoked' ? 'declined' : 'accepted'
    } else if (isOpened) {
      status = 'opened'
    }

    const responseTime = isResponded && (assignment.accepted_at || assignment.revoked_at)
      ? formatTimeAgo(assignment.accepted_at || assignment.revoked_at!, tc)
      : null

    return {
      id: assignment.id,
      agentName: assignment.agent?.agency_name || t('unknownAgent'),
      sentTime: formatTimeAgo(assignment.invited_at, tc),
      status,
      delivered: isDelivered,
      opened: isOpened,
      clicked: isClicked,
      responded: isResponded,
      responseTime,
    }
  })

  // Calculate summary stats
  const totalSent = trackingData.length
  const delivered = trackingData.filter(r => r.delivered).length
  const opened = trackingData.filter(r => r.opened).length
  const accepted = trackingData.filter(r => r.status === 'accepted').length

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
      delivered: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        icon: <Clock size={14} />,
      },
      opened: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        icon: <Eye size={14} />,
      },
      accepted: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        icon: <CheckCircle2 size={14} />,
      },
      declined: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        icon: <Clock size={14} />,
      },
    }
    const cfg = config[status] || config.delivered
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${cfg?.bg || 'bg-gray-50'} ${cfg?.text || 'text-gray-700'}`}>
        {cfg?.icon || null}
        {t(`trackingStatus.${status}`)}
      </div>
    )
  }

  const renderCheckmark = (active: boolean) => {
    return (
      <div className="flex justify-center">
        {active ? (
          <CheckCircle2 size={18} className="text-green-600" />
        ) : (
          <div className="w-4 h-4 rounded-full border-2 border-[#D9DCE4] bg-transparent" />
        )}
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/owner/agents" className="inline-flex items-center gap-2 text-brand font-semibold text-sm mb-4 hover:gap-3 transition-all">
          <ArrowLeft size={16} />
          {t('trackingBackButton')}
        </Link>
        <h1 className="text-3xl font-bold text-text-primary mb-2">{t('trackingPageTitle')}</h1>
        <p className="text-text-secondary">{t('trackingPageDescription')}</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('trackingTotalSent'), value: totalSent.toString(), color: 'border-blue-200 bg-blue-50' },
          { label: t('trackingDelivered'), value: delivered.toString(), color: 'border-green-200 bg-green-50' },
          { label: t('trackingOpened'), value: opened.toString(), color: 'border-purple-200 bg-purple-50' },
          { label: t('trackingProposals'), value: accepted.toString(), color: 'border-amber-200 bg-amber-50' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`rounded-xl border-2 ${stat.color} p-4`}
          >
            <p className="text-xs text-text-secondary font-semibold mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tracking Table */}
      <div className="bg-white rounded-2xl border border-border-default overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 bg-bg px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-border-default">
          <div className="col-span-4">{t('trackingColumnAgent')}</div>
          <div className="col-span-2">{t('trackingColumnSent')}</div>
          <div className="col-span-5 flex justify-between px-2">
            <div className="flex items-center gap-2" title={t('trackingColumnDelivered')}>
              <Mail size={14} />
              <span className="hidden sm:inline">{t('trackingColumnDelivered')}</span>
            </div>
            <div className="flex items-center gap-2" title={t('trackingColumnOpened')}>
              <Eye size={14} />
              <span className="hidden sm:inline">{t('trackingColumnOpened')}</span>
            </div>
            <div className="flex items-center gap-2" title={t('trackingColumnClicked')}>
              <MousePointerClick size={14} />
              <span className="hidden sm:inline">{t('trackingColumnClicked')}</span>
            </div>
            <div className="flex items-center gap-2" title={t('trackingColumnResponded')}>
              <MessageSquare size={14} />
              <span className="hidden sm:inline">{t('trackingColumnResponded')}</span>
            </div>
          </div>
          <div className="col-span-1">{t('trackingColumnStatus')}</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-[#E2E4EB]">
          {trackingData.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-text-secondary">{t('noAssignmentsYet')}</p>
            </div>
          ) : (
            trackingData.map((row) => (
              <div key={row.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-[#FAFBFC] transition-colors">
                <div className="col-span-4">
                  <p className="font-semibold text-text-primary">{row.agentName}</p>
                  <p className="text-xs text-text-secondary">{row.sentTime}</p>
                </div>
                <div className="col-span-2 text-sm text-text-secondary">{row.sentTime}</div>
                <div className="col-span-5 flex justify-between px-2">
                  {renderCheckmark(row.delivered)}
                  {renderCheckmark(row.opened)}
                  {renderCheckmark(row.clicked)}
                  {renderCheckmark(row.responded)}
                </div>
                <div className="col-span-1">
                  {getStatusBadge(row.status)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
          <div className="flex gap-3">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-blue-900 mb-1">{t('trackingInfoTitle')}</p>
              <p className="text-sm text-blue-800">{t('trackingInfoText')}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-2xl border border-green-200 p-6">
          <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">{t('trackingTipLabel')}</p>
          <p className="text-sm text-green-700">{t('trackingTipText')}</p>
        </div>
      </div>
    </div>
  )
}
