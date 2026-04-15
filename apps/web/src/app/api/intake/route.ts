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

  // 3. For hunter-passport flow: sync data to hunter_profiles + preference tags
  if (flowId === 'hunter-passport') {
    // Upsert hunter_profiles
    const budgetMin = data.budget_min ? Number(data.budget_min) * 100 : null
    const budgetMax = data.budget_max ? Number(data.budget_max) * 100 : null
    const minBeds = data.min_bedrooms
      ? (data.min_bedrooms === 'studio' ? 0 : data.min_bedrooms === '4plus' ? 4 : Number(data.min_bedrooms))
      : null

    await (supabase as any).from('hunter_profiles').upsert({
      user_id: user.id,
      intent: data.intent || null,
      budget_min: budgetMin,
      budget_max: budgetMax,
      target_areas: data.target_areas || [],
      property_types: data.property_types || [],
      min_bedrooms: minBeds,
      must_haves: data.must_haves || [],
      dealbreakers: data.dealbreakers || [],
      finance_status: data.finance_status || null,
      timeline: data.timeline || null,
      agent_assistance_consented: true,
      brief_updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    // Ensure hunter role
    await (supabase as any).from('user_roles').upsert(
      { user_id: user.id, role: 'hunter', is_active: true },
      { onConflict: 'user_id,role' }
    )

    // Save preference_tags to hunter_preference_tags junction table
    const preferenceTags = data.preference_tags as Array<{ slug: string; sentiment: string }> | undefined
    if (preferenceTags && preferenceTags.length > 0) {
      // Look up tag IDs from slugs
      const slugs = preferenceTags.map(t => t.slug)
      const { data: tagRows } = await (supabase as any)
        .from('property_tags')
        .select('id, slug')
        .in('slug', slugs)

      if (tagRows && tagRows.length > 0) {
        const slugToId = Object.fromEntries(
          (tagRows as Array<{ id: number; slug: string }>).map(r => [r.slug, r.id])
        )

        // Delete existing preference tags for this user, then insert new ones
        await (supabase as any)
          .from('hunter_preference_tags')
          .delete()
          .eq('user_id', user.id)

        const tagInserts = preferenceTags
          .filter(t => slugToId[t.slug])
          .map(t => ({
            user_id: user.id,
            tag_id: slugToId[t.slug],
            sentiment: t.sentiment,
            source: 'intake',
          }))

        if (tagInserts.length > 0) {
          await (supabase as any)
            .from('hunter_preference_tags')
            .insert(tagInserts)
        }
      }
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
