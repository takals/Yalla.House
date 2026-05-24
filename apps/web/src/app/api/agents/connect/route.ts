import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

/**
 * POST /api/agents/connect
 *
 * Allows a hunter to request connections with one or more agents.
 * Creates agent_hunter_assignments rows with status='invited' and initiated_by='hunter'.
 */
export async function POST(request: NextRequest) {
  // Auth gate
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const body = await request.json()
  const agentProfileIds: string[] = body.agentProfileIds ?? []

  if (!agentProfileIds.length) {
    return NextResponse.json({ error: 'No agents specified' }, { status: 400 })
  }

  const supabase = createServiceClient()
  let connected = 0
  let failed = 0

  // Create assignment rows — one per agent
  const rows = agentProfileIds.map(agentId => ({
    hunter_id: user.id,
    agent_id: agentId,
    status: 'invited',
    initiated_by: 'hunter',
    data_scope: 'full',
  }))

  // Upsert to avoid duplicates (hunter_id + agent_id is unique)
  const { data, error } = await (supabase as any)
    .from('agent_hunter_assignments')
    .upsert(rows, { onConflict: 'hunter_id,agent_id', ignoreDuplicates: true })
    .select('id')

  if (error) {
    console.error('Agent connect error:', error)
    return NextResponse.json({ error: 'Failed to connect agents' }, { status: 500 })
  }

  connected = data?.length ?? 0
  failed = agentProfileIds.length - connected

  return NextResponse.json({ connected, failed, total: agentProfileIds.length })
}
