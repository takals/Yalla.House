import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_EMAIL, PREVIEW_USER_ID } from '@/lib/preview-user'
import { DashboardShell } from '@/components/dashboard/shell'
import { adminNav } from '@/components/dashboard/nav-items'
import { fetchNotifications, getNotificationLabels } from '@/lib/notifications'
import { fetchUserRoles } from '@/lib/user-roles'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID
  const [t, tShell] = await Promise.all([
    getTranslations('notif'),
    getTranslations('shell'),
  ])

  const [profileResult, notifData, userRoles] = await Promise.all([
    user
      ? (supabase.from('users') as any).select('full_name').eq('id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    fetchNotifications(supabase, userId),
    user ? fetchUserRoles(supabase, user.id) : Promise.resolve([]),
  ])

  const shellLabels: Record<string, string> = {
    collapse: tShell('collapse'),
    expandSidebar: tShell('expandSidebar'),
    collapseSidebar: tShell('collapseSidebar'),
    signOut: tShell('signOut'),
    switchRole: tShell('switchRole'),
  }

  const navLabels: Record<string, string> = {
    navOverview: tShell('navOverview'),
    navUsers: tShell('navUsers'),
  }

  return (
    <DashboardShell
      navItems={adminNav(navLabels)}
      section="admin"
      userEmail={user?.email ?? PREVIEW_USER_EMAIL}
      userName={profileResult.data?.full_name ?? null}
      notifications={notifData.notifications}
      unreadCount={notifData.unreadCount}
      notificationLabels={getNotificationLabels(t)}
      shellLabels={shellLabels}
      userRoles={userRoles}
    >
      {children}
    </DashboardShell>
  )
}
