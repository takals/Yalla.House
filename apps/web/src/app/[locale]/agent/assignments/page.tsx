'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { ChevronDown, Check, X } from 'lucide-react'
import AssignmentActions from './assignment-actions'
import { PREVIEW_USER_ID } from '@/lib/preview-user'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Assignment {
  id: string
  status: string
  created_at: string
  tier: string
  can_edit_listing: boolean
  can_manage_viewings: boolean
  can_negotiate: boolean
  can_message_buyers: boolean
  listing: {
    id: string
    title: string
    address: string
    price: number
  }
  owner: {
    id: string
    name: string
    email: string
  }
}

export default function AgentAssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [expandPast, setExpandPast] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      const agentId = authUser?.id ?? PREVIEW_USER_ID

      // Preview phase: no auth gate. Show empty state if there's no real user.
      setUser(authUser ?? { id: PREVIEW_USER_ID })

      // Fetch listing agent assignments
      const { data } = await supabase
        .from('listing_agent_assignments')
        .select(`
          id,
          status,
          created_at,
          tier,
          can_edit_listing,
          can_manage_viewings,
          can_negotiate,
          can_message_buyers,
          listing:listings(id, title, address, price),
          owner:users(id, name, email)
        `)
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })

      setAssignments((data ?? []) as any)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl">
        <div className="h-32 bg-surface rounded-lg border border-[#E2E4EB] animate-pulse" />
      </div>
    )
  }

  const pending = assignments.filter(a => a.status === 'invited')
  const active = assignments.filter(a => ['accepted', 'active'].includes(a.status))
  const past = assignments.filter(a => ['revoked', 'paused'].includes(a.status))

  const TierBadge = ({ tier }: { tier: string }) => {
    const config = {
      advisory: { bg: '#DBEAFE', text: '#1E40AF', label: 'Advisory' },
      assisted: { bg: '#FFF5EE', text: '#8B4513', label: 'Assisted' },
      managed: { bg: '#DCFCE7', text: '#166534', label: 'Managed' },
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
      invited: { bg: '#FFF5EE', text: '#8B4513', label: 'Invitation Pending' },
      accepted: { bg: '#DCFCE7', text: '#166534', label: 'Active' },
      active: { bg: '#DCFCE7', text: '#166534', label: 'Active' },
      revoked: { bg: '#FEE2E2', text: '#991B1B', label: 'Revoked' },
      paused: { bg: '#E5E7EB', text: '#4B5563', label: 'Paused' },
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
      { label: 'Edit Listing', value: can_edit_listing },
      { label: 'Manage Viewings', value: can_manage_viewings },
      { label: 'Negotiate', value: can_negotiate },
      { label: 'Message Buyers', value: can_message_buyers },
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
        <h1 className="text-2xl font-bold mb-1">Listing Assignments</h1>
        <p className="text-[#5E6278] text-sm">
          Collaborate on listings from property owners
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-surface rounded-lg p-4 border border-[#E2E4EB] text-center">
          <p className="text-2xl font-bold">{assignments.length}</p>
          <p className="text-xs text-[#5E6278]">Total assignments</p>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-[#E2E4EB] text-center">
          <p className="text-2xl font-bold text-brand">{pending.length}</p>
          <p className="text-xs text-[#5E6278]">Pending invitations</p>
        </div>
        <div className="bg-surface rounded-lg p-4 border border-[#E2E4EB] text-center">
          <p className="text-2xl font-bold text-[#166534]">{active.length}</p>
          <p className="text-xs text-[#5E6278]">Active assignments</p>
        </div>
      </div>

      {/* Pending invitations */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand" />
            Invitation Pending ({pending.length})
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
                        from {a.owner.name}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold text-brand">
                      £{(a.listing.price / 100).toLocaleString()}
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
                  <AssignmentActions assignmentId={a.id} status={a.status} />
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
            Active Assignments ({active.length})
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
                        since {new Date(a.created_at).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold">
                      £{(a.listing.price / 100).toLocaleString()}
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
                  View Assignment →
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
              Past Assignments ({past.length})
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
          <p className="text-[#5E6278] font-medium mb-2">No listing assignments yet</p>
          <p className="text-xs text-[#999]">
            When property owners invite you to collaborate on their listings,
            the invitations will appear here.
          </p>
        </div>
      )}
    </div>
  )
}
