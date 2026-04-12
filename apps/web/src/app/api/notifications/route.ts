import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse query params
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '50', 10),
      100
    )

    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Apply status filter if provided
    if (status === 'unread') {
      query = query.eq('status', 'unread')
    }

    const { data: notifications, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Count unread notifications
    const { count: unreadCount, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'unread')

    if (countError) {
      return NextResponse.json(
        { error: countError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: unreadCount || 0
    })
  } catch (error) {
    console.error('GET /api/notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    // Auth check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { ids, markAllRead } = body

    const now = new Date().toISOString()

    let updateQuery = (supabase as any)
      .from('notifications')
      .update({ status: 'read', read_at: now })
      .eq('user_id', user.id)

    if (markAllRead) {
      // Mark all unread as read
      updateQuery = updateQuery.eq('status', 'unread')
    } else if (ids && Array.isArray(ids) && ids.length > 0) {
      // Mark specific ones
      updateQuery = updateQuery.in('id', ids)
    } else {
      return NextResponse.json(
        { error: 'Must provide either ids or markAllRead' },
        { status: 400 }
      )
    }

    const { error, count } = await updateQuery

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      updated: count || 0
    })
  } catch (error) {
    console.error('PATCH /api/notifications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
