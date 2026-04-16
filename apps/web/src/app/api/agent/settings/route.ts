import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { fullName, phone, agencyName, agencyAddress } = body

    // Update users table
    const { error: userError } = await (supabase.from('users') as any)
      .update({
        full_name: fullName || null,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (userError) {
      console.error('agent settings user update error:', userError)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // Update agent_profiles table (upsert)
    const { error: agentError } = await (supabase.from('agent_profiles') as any)
      .update({
        agency_name: agencyName || null,
        office_address: agencyAddress || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (agentError) {
      console.error('agent settings profile update error:', agentError)
      // Non-fatal — agent_profiles row might not exist yet
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/agent/settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
