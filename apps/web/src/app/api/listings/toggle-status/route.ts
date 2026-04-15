import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { listingId, status } = await request.json()

  if (!listingId || !['active', 'draft'].includes(status)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Verify ownership
  const { data: listing } = await (supabase as any)
    .from('listings')
    .select('id, owner_id')
    .eq('id', listingId)
    .single()

  if (!listing || listing.owner_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updateData: Record<string, unknown> = { status }
  if (status === 'active') {
    updateData.published_at = new Date().toISOString()
  }

  const { error } = await (supabase as any)
    .from('listings')
    .update(updateData)
    .eq('id', listingId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, status })
}
