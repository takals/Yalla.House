import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_EMAIL } from '@/lib/preview-user'
import { DashboardShell } from '@/components/dashboard/shell'
import { agentNav } from '@/components/dashboard/nav-items'

import { fetchNotifications, getNotificationLabels } from '@/lib/notifications'
import { fetchUserRoles } from '@/lib/user-roles'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const tShell = await getTranslations('shell')

  const shellLabels: Record<string, string> = {
    collapse: tShell('collapse'),
    expandSidebar: tShell('expandSidebar'),
    collapseSidebar: tShell('collapseSidebar'),
    signOut: tShell('signOut'),
    switchRole: tShell('switchRole'),
  }

  const navLabels: Record<string, string> = {
    navAssignments: tShell('navAssignments'),
    navCalendar: tShell('navCalendar'),
    navBriefs: tShell('navBriefs'),
    navHunters: tShell('navHunters'),
    navInbox: tShell('navInbox'),
    navPartnerAgreement: tShell('navPartnerAgreement'),
    navProfile: tShell('navProfile'),
    navSettings: tShell('navSettings'),
  }

  if (!user) {
    return (
      <DashboardShell
        navItems={agentNav(navLabels)}
        section="agent"
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

  const [profileResult, notifData, userRoles] = await Promise.all([
    (supabase.from('users') as any).select('full_name').eq('id', userId).maybeSingle(),
    fetchNotifications(supabase, userId),
    fetchUserRoles(supabase, userId),
  ])

  return (
    <DashboardShell
      navItems={agentNav(navLabels)}
      section="agent"
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
