import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_EMAIL, PREVIEW_USER_ID } from '@/lib/preview-user'
import { DashboardShell, hunterNav } from '@/components/dashboard/shell'
import { fetchNotifications, getNotificationLabels } from '@/lib/notifications'
import { fetchUserRoles } from '@/lib/user-roles'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function HunterLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const [t, tShell] = await Promise.all([
    getTranslations('notif'),
    getTranslations('shell'),
  ])

  // Fetch profile + notifications + roles in parallel
  const [profileResult, notifData, userRoles] = await Promise.all([
    user
      ? (supabase.from('users') as any)
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    fetchNotifications(supabase, userId),
    user ? fetchUserRoles(supabase, user.id) : Promise.resolve([]),
  ])

  const fullName = profileResult.data?.full_name ?? null

  const shellLabels: Record<string, string> = {
    collapse: tShell('collapse'),
    expandSidebar: tShell('expandSidebar'),
    collapseSidebar: tShell('collapseSidebar'),
    signOut: tShell('signOut'),
    switchRole: tShell('switchRole'),
  }

  return (
    <DashboardShell
      navItems={hunterNav}
      section="hunter"
      userEmail={user?.email ?? PREVIEW_USER_EMAIL}
      userName={fullName}
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
