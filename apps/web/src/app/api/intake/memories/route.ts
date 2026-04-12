import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface MemoryRecord {
  value: unknown
  source: string
  confidence: number
  updated_at: string
}

/**
 * GET /api/intake/memories?flowId=xxx
 * Retrieve user's saved memories for a specific intake flow.
 * Returns { memories: Record<fieldName, { value, source, confidence, updatedAt }> }
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const flowId = request.nextUrl.searchParams.get('flowId')

  if (!flowId) {
    return NextResponse.json(
      { error: 'flowId query parameter is required' },
      { status: 400 }
    )
  }

  // Fetch all non-deleted memories for this user + flow
  const { data: memories, error } = await (supabase as any)
    .from('intake_memories')
    .select('field, value, source, confidence, updated_at')
    .eq('user_id', user.id)
    .eq('flow_id', flowId)
    .is('deleted_at', null) // exclude soft-deleted

  if (error) {
    return NextResponse.json(
      { error: `Failed to fetch memories: ${error.message}` },
      { status: 500 }
    )
  }

  // Transform to Record<fieldName, MemoryRecord>
  const result: Record<string, MemoryRecord> = {}
  if (memories && Array.isArray(memories)) {
    memories.forEach((mem: { field: string; value: unknown; source: string; confidence: number; updated_at: string }) => {
      result[mem.field] = {
        value: mem.value,
        source: mem.source,
        confidence: mem.confidence,
        updated_at: mem.updated_at,
      }
    })
  }

  return NextResponse.json({ memories: result })
}

/**
 * DELETE /api/intake/memories
 * Soft-delete a specific memory field.
 * Body: { flowId, field }
 * Sets deleted_at = now()
 */
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: { flowId: string; field: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { flowId, field } = body

  if (!flowId || !field) {
    return NextResponse.json(
      { error: 'flowId and field are required' },
      { status: 400 }
    )
  }

  // Soft-delete: set deleted_at = now()
  const { error: deleteError } = await (supabase as any)
    .from('intake_memories')
    .update({ deleted_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('flow_id', flowId)
    .eq('field', field)
    .is('deleted_at', null) // only soft-delete if not already deleted

  if (deleteError) {
    return NextResponse.json(
      { error: `Failed to delete memory: ${deleteError.message}` },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, flowId, field })
}
