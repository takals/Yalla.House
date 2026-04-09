import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { inngest } from '@/lib/inngest/client'

/**
 * PATCH /api/assignments/[id]
 * Update assignment status or properties.
 * - Agent can: accept (status='accepted'), decline (status='revoked')
 * - Owner can: update tier, revoke (status='revoked' + revoked_reason), pause/resume
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

  // Fetch the assignment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: assignment } = await (supabase as any)
    .from('listing_agent_assignments')
    .select('id, owner_id, agent_id, status, tier')
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

  const body = await request.json()
  const { status, tier, revoked_reason, is_paused } = body

  // Build update object based on role and action
  const updateData: Record<string, unknown> = {}
  let emitEvent = false
  let eventName = ''
  let eventData: Record<string, unknown> = {}

  // Agent actions: accept or decline
  if (isAgent) {
    if (status === 'accepted') {
      if (assignment.status !== 'invited') {
        return NextResponse.json(
          {
            error: `Cannot accept assignment with status '${assignment.status}'`,
          },
          { status: 409 }
        )
      }
      updateData.status = 'accepted'
      emitEvent = true
      eventName = 'assignment/agent.accepted'
      eventData = { assignmentId: assignment.id }
    } else if (status === 'revoked') {
      updateData.status = 'revoked'
      updateData.revoked_reason = revoked_reason ?? 'Agent declined'
      emitEvent = true
      eventName = 'assignment/agent.revoked'
      eventData = { assignmentId: assignment.id }
    } else if (status !== undefined) {
      return NextResponse.json(
        { error: 'Agent can only set status to accepted or revoked' },
        { status: 400 }
      )
    }
  }

  // Owner actions: update tier, revoke, pause/resume
  if (isOwner) {
    if (tier !== undefined) {
      updateData.tier = tier
    }
    if (is_paused !== undefined) {
      updateData.is_paused = is_paused
    }
    if (status === 'revoked') {
      updateData.status = 'revoked'
      updateData.revoked_reason = revoked_reason ?? null
      emitEvent = true
      eventName = 'assignment/owner.revoked'
      eventData = { assignmentId: assignment.id }
    } else if (status !== undefined && status !== 'revoked') {
      return NextResponse.json(
        { error: 'Owner can only set status to revoked' },
        { status: 400 }
      )
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: 'No valid fields to update' },
      { status: 400 }
    )
  }

  // Update the assignment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: updated, error } = await (supabase as any)
    .from('listing_agent_assignments')
    .update(updateData)
    .eq('id', id)
    .select('id, listing_id, owner_id, agent_id, tier, status, is_paused, revoked_reason, updated_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Emit event if status changed to accepted
  if (emitEvent && updated) {
    await inngest.send({
      name: eventName,
      data: eventData,
    })
  }

  return NextResponse.json(updated)
}
