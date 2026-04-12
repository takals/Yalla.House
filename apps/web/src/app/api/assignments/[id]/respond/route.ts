import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { inngest } from '@/lib/inngest/client'

/**
 * POST /api/assignments/[id]/respond
 * Agent responds to a brief invitation with a proposal.
 * - Verify agent_id matches authenticated user
 * - Verify status === 'invited'
 * - Update status to 'accepted', set fee_type, fee_amount, notes, and accepted_at
 * - Emit Inngest event for owner notification
 */
export async function POST(
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
  const { data: assignment } = await (supabase as any)
    .from('listing_agent_assignments')
    .select('id, owner_id, agent_id, status, listing_id')
    .eq('id', id)
    .single()

  if (!assignment) {
    return NextResponse.json(
      { error: 'Assignment not found' },
      { status: 404 }
    )
  }

  // Verify agent owns this assignment
  if (assignment.agent_id !== user.id) {
    return NextResponse.json(
      { error: 'Not authorised' },
      { status: 403 }
    )
  }

  // Verify status is 'invited'
  if (assignment.status !== 'invited') {
    return NextResponse.json(
      {
        error: `Cannot respond to assignment with status '${assignment.status}'`,
      },
      { status: 409 }
    )
  }

  const body = await request.json()
  const { status, fee_type, fee_amount, notes } = body

  // Validate required fields
  if (status !== 'accepted') {
    return NextResponse.json(
      { error: 'Status must be "accepted"' },
      { status: 400 }
    )
  }

  if (!fee_type || !['flat', 'percentage', 'none'].includes(fee_type)) {
    return NextResponse.json(
      { error: 'Invalid fee_type' },
      { status: 400 }
    )
  }

  if (fee_type !== 'none' && (fee_amount === null || fee_amount === undefined)) {
    return NextResponse.json(
      { error: 'fee_amount is required when fee_type is not "none"' },
      { status: 400 }
    )
  }

  if (!notes || notes.trim().length < 50) {
    return NextResponse.json(
      { error: 'notes must be at least 50 characters' },
      { status: 400 }
    )
  }

  // Update the assignment
  const { data: updated, error } = await (supabase as any)
    .from('listing_agent_assignments')
    .update({
      status: 'accepted',
      fee_type,
      fee_amount: fee_type === 'none' ? null : fee_amount,
      notes,
      accepted_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(
      'id, listing_id, owner_id, agent_id, status, fee_type, fee_amount, accepted_at'
    )
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Emit Inngest event to notify owner
  if (updated) {
    await inngest.send({
      name: 'assignment/agent.responded',
      data: {
        assignmentId: updated.id,
        listingId: updated.listing_id,
        ownerId: updated.owner_id,
        agentId: updated.agent_id,
      },
    })
  }

  return NextResponse.json(updated)
}
