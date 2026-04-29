import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_EMAIL } from '@/lib/preview-user'
import { DashboardShell } from '@/components/dashboard/shell'
import { hunterNav } from '@/components/dashboard/nav-items'

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

  const tShell = await getTranslations('shell')

  const shellLabels: Record<string, string> = {
    collapse: tShell('collapse'),
    expandSidebar: tShell('expandSidebar'),
    collapseSidebar: tShell('collapseSidebar'),
    signOut: tShell('signOut'),
    signIn: tShell('signIn'),
    openSidebar: tShell('openSidebar'),
    closeSidebar: tShell('closeSidebar'),
    switchRole: tShell('switchRole'),
  }

  const navLabels: Record<string, string> = {
    navDashboard: tShell('navDashboard'),
    navSearch: tShell('navSearch'),
    navViewings: tShell('navViewings'),
    navPassport: tShell('navPassport'),
    navAgents: tShell('navAgents'),
    navInbox: tShell('navInbox'),
    navSettings: tShell('navSettings'),
  }

  if (!user) {
    return (
      <DashboardShell
        navItems={hunterNav(navLabels)}
        section="hunter"
        userEmail=""
        userName={null}
        shellLabels={shellLabels}
      >
        {children}
      </DashboardShell>
    )
  }

  const userId = user.id

  const t = await getTranslations('notif')

  // Fetch profile + notifications + roles in parallel
  const [profileResult, notifData, userRoles] = await Promise.all([
    (supabase.from('users') as any).select('full_name').eq('id', userId).maybeSingle(),
    fetchNotifications(supabase, userId),
    fetchUserRoles(supabase, userId),
  ])

  const fullName = profileResult.data?.full_name ?? null

  return (
    <DashboardShell
      navItems={hunterNav(navLabels)}
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
