import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function verifyAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await (supabase.from('user_roles') as any)
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .eq('is_active', true)
    .maybeSingle()
  return !!data
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!(await verifyAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { userId, role } = await request.json()
    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role required' }, { status: 400 })
    }

    const validRoles = ['owner', 'hunter', 'agent', 'admin']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const service = createServiceClient()

    // Check if role already exists (active or inactive)
    const { data: existing } = await (service.from('user_roles') as any)
      .select('id, is_active')
      .eq('user_id', userId)
      .eq('role', role)
      .maybeSingle()

    if (existing) {
      // Reactivate if inactive
      if (!existing.is_active) {
        await (service.from('user_roles') as any)
          .update({ is_active: true, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      }
    } else {
      // Insert new role
      const { error } = await (service.from('user_roles') as any)
        .insert({
          user_id: userId,
          role,
          is_active: true,
          assigned_by: user.id,
        })

      if (error) {
        console.error('add role error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/admin/user-roles error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!(await verifyAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { userId, role } = await request.json()
    if (!userId || !role) {
      return NextResponse.json({ error: 'userId and role required' }, { status: 400 })
    }

    // Prevent removing own admin role
    if (userId === user.id && role === 'admin') {
      return NextResponse.json({ error: 'Cannot remove your own admin role' }, { status: 400 })
    }

    const service = createServiceClient()

    const { error } = await (service.from('user_roles') as any)
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('role', role)

    if (error) {
      console.error('remove role error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/user-roles error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
