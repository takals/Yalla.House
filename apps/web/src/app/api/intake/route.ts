import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface IntakeSessionPayload {
  flowId: string
  data: Record<string, unknown>
  messages: Array<{ role: string; content: string; timestamp?: string }>
  voiceUsed: boolean
  fieldsFromMemory: number
  fieldsTotal: number
}

/**
 * POST /api/intake
 * Save conversational intake session + memories for authenticated user.
 * Creates intake_session and upserts intake_memories for each field in data.
 *
 * Body: { flowId, data, messages, voiceUsed, fieldsFromMemory, fieldsTotal }
 * Returns: { sessionId, success, memoryCount }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()

  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  let body: IntakeSessionPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    )
  }

  const { flowId, data, messages, voiceUsed, fieldsFromMemory, fieldsTotal } = body

  if (!flowId || !data || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: 'flowId, data (object), and messages (array) are required' },
      { status: 400 }
    )
  }

  // 1. Create intake_session
  const { data: session, error: sessionError } = await (supabase as any)
    .from('intake_sessions')
    .insert({
      user_id: user.id,
      flow_id: flowId,
      status: 'completed',
      data,
      messages,
      voice_used: voiceUsed,
      fields_from_memory: fieldsFromMemory,
      fields_total: fieldsTotal,
      completed_at: new Date().toISOString(),
      duration_seconds: Math.floor(Date.now() / 1000), // placeholder; client should compute
    })
    .select('id, user_id, flow_id, status, created_at')
    .single()

  if (sessionError) {
    return NextResponse.json(
      { error: `Failed to create session: ${sessionError.message}` },
      { status: 500 }
    )
  }

  // 2. Upsert intake_memories for each field in data
  let memoryCount = 0
  const memoryErrors: string[] = []

  for (const [field, value] of Object.entries(data)) {
    const { error: memError } = await (supabase as any)
      .from('intake_memories')
      .upsert(
        {
          user_id: user.id,
          flow_id: flowId,
          field,
          value,
          source: voiceUsed ? 'voice' : 'text',
          confidence: 0.95,
        },
        { onConflict: 'user_id,flow_id,field' }
      )

    if (memError) {
      memoryErrors.push(`${field}: ${memError.message}`)
    } else {
      memoryCount++
    }
  }

  // Return success even if some memories failed to save
  return NextResponse.json(
    {
      sessionId: session.id,
      success: true,
      memoryCount,
      memoryErrors: memoryErrors.length > 0 ? memoryErrors : undefined,
    },
    { status: 201 }
  )
}
