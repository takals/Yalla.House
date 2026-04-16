import { createClient } from '@/lib/supabase/server'
import { getTranslations } from 'next-intl/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import AssignmentsList from './assignments-list'

export interface Assignment {
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

export default async function AgentAssignmentsPage() {
  const supabase = await createClient()
  const t = await getTranslations('agentAssignments')

  const { data: { user: authUser } } = await supabase.auth.getUser()
  const agentId = authUser?.id ?? PREVIEW_USER_ID

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
    .order('created_at', { ascending: false }) as { data: Assignment[] | null }

  const assignments = data ?? []

  const translations: Record<string, string> = {
    title: t('title'),
    subtitle: t('subtitle'),
    totalAssignments: t('totalAssignments'),
    pendingInvitations: t('pendingInvitations'),
    activeAssignments: t('activeAssignments'),
    invitationPending: t('invitationPending'),
    activeLabel: t('activeLabel'),
    pastAssignments: t('pastAssignments'),
    from: t('from'),
    since: t('since'),
    viewAssignment: t('viewAssignment'),
    noAssignments: t('noAssignments'),
    noAssignmentsDesc: t('noAssignmentsDesc'),
    tierAdvisory: t('tierAdvisory'),
    tierAssisted: t('tierAssisted'),
    tierManaged: t('tierManaged'),
    statusInvited: t('statusInvited'),
    statusActive: t('statusActive'),
    statusRevoked: t('statusRevoked'),
    statusPaused: t('statusPaused'),
    permEditListing: t('permEditListing'),
    permManageViewings: t('permManageViewings'),
    permNegotiate: t('permNegotiate'),
    permMessageBuyers: t('permMessageBuyers'),
    accepting: t('accepting'),
    accept: t('accept'),
    declining: t('declining'),
    decline: t('decline'),
  }

  return <AssignmentsList assignments={assignments} translations={translations} />
}
