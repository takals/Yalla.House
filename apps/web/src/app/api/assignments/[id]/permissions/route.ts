import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/assignments/[id]/permissions
 * Get current permissions for an assignment.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Fetch assignment and verify user is owner or agent
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assignment } = await (supabase as any)
    .from('listing_agent_assignments')
    .select(
      'id, owner_id, agent_id, can_edit_listing, can_manage_viewings, can_negotiate, can_message_buyers'
    )
    .eq('id', id)
    .single()

  if (!assignment) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
  }

  const isOwner = assignment.owner_id === user.id
  const isAgent = assignment.agent_id === user.id

  if (!isOwner && !isAgent) {
    return NextResponse.json({ error: 'Not authorised' }, { status: 403 })
  }

  return NextResponse.json({
    id: assignment.id,
    can_edit_listing: assignment.can_edit_listing,
    can_manage_viewings: assignment.can_manage_viewings,
    can_negotiate: assignment.can_negotiate,
    can_message_buyers: assignment.can_message_buyers,
  })
}

/**
 * PATCH /api/assignments/[id]/permissions
 * Owner updates granular permissions for an agent.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Fetch assignment and verify caller is the owner
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assignment } = await (supabase as any)
    .from('listing_agent_assignments')
    .select('id, owner_id')
    .eq('id', id)
    .single()

  if (!assignment) {
    return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
  }

  if (assignment.owner_id !== user.id) {
    return NextResponse.json(
      { error: 'Only the owner can modify permissions' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const {
    can_edit_listing,
    can_manage_viewings,
    can_negotiate,
    can_message_buyers,
  } = body

  // Whitelist allowed permission fields
  const updateData: Record<string, boolean> = {}

  if (can_edit_listing !== undefined) {
    updateData.can_edit_listing = Boolean(can_edit_listing)
  }
  if (can_manage_viewings !== undefined) {
    updateData.can_manage_viewings = Boolean(can_manage_viewings)
  }
  if (can_negotiate !== undefined) {
    updateData.can_negotiate = Boolean(can_negotiate)
  }
  if (can_message_buyers !== undefined) {
    updateData.can_message_buyers = Boolean(can_message_buyers)
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: 'No valid permission fields to update' },
      { status: 400 }
    )
  }

  // Update permissions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: updated, error } = await (supabase as any)
    .from('listing_agent_assignments')
    .update(updateData)
    .eq('id', id)
    .select(
      'id, owner_id, agent_id, can_edit_listing, can_manage_viewings, can_negotiate, can_message_buyers, updated_at'
    )
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(updated)
}
