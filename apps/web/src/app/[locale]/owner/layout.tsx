import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_EMAIL, PREVIEW_USER_ID } from '@/lib/preview-user'
import { DashboardShell, ownerNav } from '@/components/dashboard/shell'
import { fetchNotifications, getNotificationLabels } from '@/lib/notifications'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID
  const t = await getTranslations('notif')

  const [profileResult, notifData] = await Promise.all([
    user
      ? (supabase.from('users') as any).select('full_name').eq('id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    fetchNotifications(supabase, userId),
  ])

  return (
    <DashboardShell
      navItems={ownerNav}
      section="owner"
      userEmail={user?.email ?? PREVIEW_USER_EMAIL}
      userName={profileResult.data?.full_name ?? null}
      notifications={notifData.notifications}
      unreadCount={notifData.unreadCount}
      notificationLabels={getNotificationLabels(t)}
    >
      {children}
    </DashboardShell>
  )
}
