// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabaseClient = any

export interface NotificationRow {
  id: string
  title: string
  body: string | null
  action_url: string | null
  status: string
  created_at: string
}

/**
 * Fetch latest notifications + unread count for a user.
 * Used by dashboard layouts to populate the notification bell.
 */
export async function fetchNotifications(
  supabase: AnySupabaseClient,
  userId: string
): Promise<{ notifications: NotificationRow[]; unreadCount: number }> {
  try {
    const [notifResult, countResult] = await Promise.all([
      (supabase.from('notifications') as any)
        .select('id, title, body, action_url, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20),

      (supabase.from('notifications') as any)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'unread'),
    ])

    return {
      notifications: notifResult.data ?? [],
      unreadCount: countResult.count ?? 0,
    }
  } catch (error) {
    console.error('fetchNotifications error:', error)
    return { notifications: [], unreadCount: 0 }
  }
}

/** Default notification i18n labels */
export function getNotificationLabels(t: (key: string) => string): Record<string, string> {
  return {
    notifications: t('notifications'),
    markAllRead: t('markAllRead'),
    noNotifications: t('noNotifications'),
  }
}
