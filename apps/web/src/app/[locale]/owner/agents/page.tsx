import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import type { Database } from '@/types/database'
import { InviteAgentForm } from './invite-form'

type ListingRow = Database['public']['Tables']['listings']['Row']
type AssignmentRow = Database['public']['Tables']['listing_agent_assignments']['Row']
type UserRow = Database['public']['Tables']['users']['Row']

interface AssignmentWithDetails extends AssignmentRow {
  listing?: ListingRow | null
  agent?: UserRow | null
}

export default async function OwnerAgentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Fetch listings first
  const { data: listingsData } = await supabase
    .from('listings')
    .select('id, address_line1, city, postcode, status')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)

  const listings: (Pick<ListingRow, 'id' | 'address_line1' | 'city' | 'postcode' | 'status'> | null)[] = listingsData ?? []
  const listingIds = listings.filter(Boolean).map(l => l!.id)

  // Parallel fetch: assignments and agent details
  const [assignmentsResult, agentsResult] = await Promise.all([
    listingIds.length > 0
      ? supabase
          .from('listing_agent_assignments')
          .select('*')
          .eq('owner_id', userId)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as AssignmentRow[], error: null }),

    // Fetch all agents (will be used to populate agent details for assignments)
    supabase
      .from('users')
      .select('id, full_name, email')
      .limit(500),
  ])

  const assignments: AssignmentRow[] = assignmentsResult.data ?? []
  const allAgents: UserRow[] = agentsResult.data ?? []

  // Map assignments with listing and agent details
  const assignmentsWithDetails: AssignmentWithDetails[] = assignments.map(assignment => {
    const listing = listings.find(l => l?.id === assignment.listing_id)
    const agent = allAgents.find(a => a.id === assignment.agent_id)
    return {
      ...assignment,
      listing: listing ?? null,
      agent: agent ?? null,
    }
  })

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F1117] mb-2">Agent Collaboration</h1>
        <p className="text-[#5E6278]">Invite agents to help manage your listings</p>
      </div>

      {/* Sub-nav tabs */}
      <div className="flex gap-6 mb-8 border-b border-[#E2E4EB]">
        <a
          href="/owner"
          className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors"
        >
          Übersicht
        </a>
        <a
          href="/owner/listings"
          className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors"
        >
          Inserate
        </a>
        <a
          href="/owner/agents"
          className="text-sm font-semibold text-[#0F1117] pb-3 border-b-2 border-brand -mb-px"
        >
          Agent Collaboration
        </a>
      </div>

      {/* Assignments List */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-[#0F1117] mb-4">Current Assignments</h2>
        {assignmentsWithDetails.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-[#E2E4EB] p-8 text-center">
            <p className="text-[#5E6278] mb-4">No agent assignments yet. Invite an agent below to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignmentsWithDetails.map(assignment => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        )}
      </div>

      {/* Invite Form */}
      <div className="bg-surface rounded-2xl border border-[#E2E4EB] p-6">
        <h2 className="text-lg font-bold text-[#0F1117] mb-6">Invite an Agent</h2>
        <InviteAgentForm
          listings={listings
            .filter(Boolean)
            .map(l => ({
              id: l!.id,
              address_line1: l!.address_line1,
              city: l!.city,
              postcode: l!.postcode,
            }))}
        />
      </div>
    </div>
  )
}

// ========== Components ==========

function AssignmentCard({ assignment }: { assignment: AssignmentWithDetails }) {
  if (!assignment.listing) return null

  const statusBadgeClass = {
    invited: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    accepted: 'bg-blue-50 text-blue-700 border border-blue-200',
    active: 'bg-green-50 text-green-700 border border-green-200',
    paused: 'bg-gray-50 text-gray-700 border border-gray-200',
    revoked: 'bg-red-50 text-red-700 border border-red-200',
  }[assignment.status] || 'bg-gray-50 text-gray-700'

  const statusLabels = {
    invited: 'Invited',
    accepted: 'Accepted',
    active: 'Active',
    paused: 'Paused',
    revoked: 'Revoked',
  }

  const tierBadgeClass = {
    advisory: 'bg-blue-50 text-blue-700',
    assisted: 'bg-purple-50 text-purple-700',
    managed: 'bg-brand-solid-bg text-brand-badge-text',
  }[assignment.tier] || 'bg-gray-50 text-gray-700'

  const tierLabels = {
    advisory: 'Advisory',
    assisted: 'Assisted',
    managed: 'Managed',
  }

  return (
    <div className="bg-surface rounded-2xl border border-[#E2E4EB] p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[#0F1117] mb-1">
            {assignment.listing.address_line1}
          </h3>
          <p className="text-sm text-[#5E6278]">
            {assignment.listing.postcode} {assignment.listing.city}
          </p>
        </div>
        <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full border whitespace-nowrap ${statusBadgeClass}`}>
          {statusLabels[assignment.status as keyof typeof statusLabels] || assignment.status}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-[#5E6278] uppercase tracking-wider mb-1">Agent</p>
          <p className="font-medium text-[#0F1117]">{assignment.agent?.full_name || 'Unknown'}</p>
          <p className="text-sm text-[#999]">{assignment.agent?.email}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#5E6278] uppercase tracking-wider mb-1">Tier</p>
          <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${tierBadgeClass}`}>
            {tierLabels[assignment.tier as keyof typeof tierLabels] || assignment.tier}
          </span>
        </div>
      </div>

      {/* Permissions Summary */}
      <div className="mt-4 pt-4 border-t border-[#E2E4EB]">
        <p className="text-xs font-semibold text-[#5E6278] uppercase tracking-wider mb-2">Permissions</p>
        <ul className="text-sm text-[#0F1117] space-y-1">
          {assignment.can_edit_listing && <li className="flex items-center gap-2">✓ Can edit listing</li>}
          {assignment.can_manage_viewings && <li className="flex items-center gap-2">✓ Can manage viewings</li>}
          {assignment.can_negotiate && <li className="flex items-center gap-2">✓ Can negotiate offers</li>}
          {assignment.can_message_buyers && <li className="flex items-center gap-2">✓ Can message buyers</li>}
        </ul>
      </div>

      {assignment.notes && (
        <div className="mt-4 pt-4 border-t border-[#E2E4EB]">
          <p className="text-xs font-semibold text-[#5E6278] uppercase tracking-wider mb-1">Notes</p>
          <p className="text-sm text-[#5E6278]">{assignment.notes}</p>
        </div>
      )}
    </div>
  )
}
