import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * PATCH /api/search-requests/:id
 * Update a search request or change its status (pause/close).
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

  const body = await request.json()

  // Only allow updating own searches (RLS enforced, but double-check)
  const { data: existing } = await (supabase as any)
    .from('search_requests')
    .select('id, hunter_id')
    .eq('id', id)
    .single()

  if (!existing || existing.hunter_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Build update payload — only allow safe fields
  const allowedFields = [
    'intent', 'areas', 'radius_km', 'budget_min', 'budget_max', 'currency',
    'property_types', 'bedrooms_min', 'bedrooms_max', 'timeline', 'notes',
    'languages', 'status',
  ]
  const update: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) {
      update[key] = body[key]
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await (supabase as any)
    .from('search_requests')
    .update(update)
    .eq('id', id)
    .select('id, status, updated_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
