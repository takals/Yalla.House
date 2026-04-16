'use client'

import { useState } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, Check, X } from 'lucide-react'
import type { Assignment } from './page'

interface Props {
  assignments: Assignment[]
  translations: Record<string, string>
}

export default function AssignmentsList({ assignments, translations: t }: Props) {
  const locale = useLocale()
  const dateLocale = locale === 'de' ? 'de-DE' : 'en-GB'
  const [expandPast, setExpandPast] = useState(false)

  const pending = assignments.filter(a => a.status === 'invited')
  const active = assignments.filter(a => ['accepted', 'active'].includes(a.status))
  const past = assignments.filter(a => ['revoked', 'paused'].includes(a.status))

  const TierBadge = ({ tier }: { tier: string }) => {
    const config = {
      advisory: { bg: '#DBEAFE', text: '#1E40AF', label: t.tierAdvisory },
      assisted: { bg: '#FFF5EE', text: '#8B4513', label: t.tierAssisted },
      managed: { bg: '#DCFCE7', text: '#166534', label: t.tierManaged },
    }
    const c = config[tier as keyof typeof config] || config.advisory
    return (
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: c.bg, color: c.text }}
      >
        {c.label}
      </span>
    )
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const config = {
      invited: { bg: '#FFF5EE', text: '#8B4513', label: t.statusInvited },
      accepted: { bg: '#DCFCE7', text: '#166534', label: t.statusActive },
      active: { bg: '#DCFCE7', text: '#166534', label: t.statusActive },
      revoked: { bg: '#FEE2E2', text: '#991B1B', label: t.statusRevoked },
      paused: { bg: '#E5E7EB', text: '#4B5563', label: t.statusPaused },
    }
    const c = config[status as keyof typeof config] || config.accepted
    return (
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: c.bg, color: c.text }}
      >
        {c.label}
      </span>
    )
  }

  const PermissionGrid = ({
    can_edit_listing,
    can_manage_viewings,
    can_negotiate,
    can_message_buyers,
  }: {
    can_edit_listing: boolean
    can_manage_viewings: boolean
    can_negotiate: boolean
    can_message_buyers: boolean
  }) => {
    const permissions = [
      { label: t.permEditListing, value: can_edit_listing },
      { label: t.permManageViewings, value: can_manage_viewings },
      { label: t.permNegotiate, value: can_negotiate },
      { label: t.permMessageBuyers, value: can_message_buyers },
    ]

    return (
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#E2E4EB]">
        {permissions.map((perm) => (
          <div key={perm.label} className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{
                backgroundColor: perm.value ? '#DCFCE7' : '#F3F4F6',
                color: perm.value ? '#166534' : '#D1D5DB',
              }}
            >
              {perm.value ? (
                <Check size={12} />
              ) : (
                <X size={12} />
              )}
            </div>
            <span className="text-xs text-[#5E6278]">{perm.label}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">{t.title}</h1>
        <p className="text-[#5E6278] text-sm">{t.subtitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface rounded-lg p-4 border border-[#E2E4EB] text-center">
          <p className="text-2xl font-bold">{assignments.length}</p>
          <p className="text-xs text-[#5E6278]">{t.totalAssignments}</p>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-[#E2E4EB] text-center">
          <p className="text-2xl font-bold text-brand">{pending.length}</p>
          <p className="text-xs text-[#5E6278]">{t.pendingInvitations}</p>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-[#E2E4EB] text-center">
          <p className="text-2xl font-bold text-[#166534]">{active.length}</p>
          <p className="text-xs text-[#5E6278]">{t.activeAssignments}</p>
        </div>
      </div>

      {/* Pending invitations */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand" />
            {t.invitationPending} ({pending.length})
          </h2>
          <div className="space-y-3">
            {pending.map((a) => (
              <div key={a.id} className="bg-surface rounded-xl border-2 border-brand/40 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold mb-1">{a.listing.title}</p>
                    <p className="text-xs text-[#5E6278] mb-2">{a.listing.address}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <TierBadge tier={a.tier} />
                      <span className="text-xs text-[#5E6278]">
                        {t.from} {a.owner.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold text-brand">
                      {'\u00a3'}{(a.listing.price / 100).toLocaleString()}
                    </p>
                  </div>
                </div>

                <PermissionGrid
                  can_edit_listing={a.can_edit_listing}
                  can_manage_viewings={a.can_manage_viewings}
                  can_negotiate={a.can_negotiate}
                  can_message_buyers={a.can_message_buyers}
                />

                <div className="flex gap-3 mt-4">
                  <AssignmentActionButtons
                    assignmentId={a.id}
                    status={a.status}
                    translations={t}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active assignments */}
      {active.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            {t.activeLabel} ({active.length})
          </h2>
          <div className="space-y-3">
            {active.map((a) => (
              <div key={a.id} className="bg-surface rounded-lg border border-[#E2E4EB] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold mb-1">{a.listing.title}</p>
                    <p className="text-xs text-[#5E6278] mb-2">{a.listing.address}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <TierBadge tier={a.tier} />
                      <StatusBadge status={a.status} />
                      <span className="text-xs text-[#999]">
                        {t.since} {new Date(a.created_at).toLocaleDateString(dateLocale)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold">
                      {'\u00a3'}{(a.listing.price / 100).toLocaleString()}
                    </p>
                  </div>
                </div>

                <PermissionGrid
                  can_edit_listing={a.can_edit_listing}
                  can_manage_viewings={a.can_manage_viewings}
                  can_negotiate={a.can_negotiate}
                  can_message_buyers={a.can_message_buyers}
                />

                <Link
                  href={`/agent/assignments/${a.id}`}
                  className="inline-block mt-4 px-4 py-2 bg-brand text-black text-sm font-bold rounded-lg hover:bg-brand-hover transition"
                >
                  {t.viewAssignment} {'\u2192'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past assignments (collapsible) */}
      {past.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => setExpandPast(!expandPast)}
            className="w-full flex items-center justify-between p-4 bg-surface rounded-lg border border-[#E2E4EB] hover:bg-[#F9F9F9] transition"
          >
            <h2 className="text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#999]" />
              {t.pastAssignments} ({past.length})
            </h2>
            <ChevronDown
              size={16}
              className={`transition-transform ${expandPast ? 'rotate-180' : ''}`}
            />
          </button>

          {expandPast && (
            <div className="mt-3 space-y-2">
              {past.map((a) => (
                <div key={a.id} className="bg-surface rounded-lg border border-[#E2E4EB] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold mb-1">{a.listing.title}</p>
                      <p className="text-xs text-[#5E6278]">{a.listing.address}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {assignments.length === 0 && (
        <div className="bg-surface rounded-xl p-12 text-center border border-[#E2E4EB]">
          <p className="text-[#5E6278] font-medium mb-2">{t.noAssignments}</p>
          <p className="text-xs text-[#999]">{t.noAssignmentsDesc}</p>
        </div>
      )}
    </div>
  )
}

/* ---------- Inline action buttons (replaces separate assignment-actions.tsx) ---------- */

function AssignmentActionButtons({
  assignmentId,
  status,
  translations: t,
}: {
  assignmentId: string
  status: string
  translations: Record<string, string>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [actionType, setActionType] = useState<'accept' | 'decline' | null>(null)

  if (status !== 'invited') return null

  const handleAction = async (action: 'accept' | 'decline') => {
    setLoading(true)
    setActionType(action)

    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action === 'accept' ? 'accepted' : 'revoked',
          revoked_reason: action === 'decline' ? 'Agent declined' : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to process assignment'}`)
        setLoading(false)
        setActionType(null)
        return
      }

      router.push('/agent/assignments')
      router.refresh()
    } catch (error) {
      console.error('Assignment action error:', error)
      alert('An error occurred. Please try again.')
      setLoading(false)
      setActionType(null)
    }
  }

  return (
    <>
      <button
        onClick={() => handleAction('accept')}
        disabled={loading}
        className="flex-1 px-4 py-2 bg-brand text-black text-sm font-bold rounded-lg hover:bg-brand-hover disabled:opacity-50 transition"
      >
        {loading && actionType === 'accept' ? t.accepting : t.accept}
      </button>
      <button
        onClick={() => handleAction('decline')}
        disabled={loading}
        className="flex-1 px-4 py-2 bg-[#F3F4F6] text-[#374151] text-sm font-bold rounded-lg border border-[#E5E7EB] hover:bg-[#E5E7EB] disabled:opacity-50 transition"
      >
        {loading && actionType === 'decline' ? t.declining : t.decline}
      </button>
    </>
  )
}
