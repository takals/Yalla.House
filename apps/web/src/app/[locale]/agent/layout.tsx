import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_EMAIL } from '@/lib/preview-user'
import { DashboardShell, agentNav } from '@/components/dashboard/shell'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
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

  // Public info pages: middleware only allows unauthenticated access to /agent/info,
  // so if there's no user here it must be the info page — render with public layout
  if (!user) {
    return (
      <div className="bg-bg min-h-screen">
        <SiteHeader />
        <div className="max-w-6xl mx-auto px-4 py-12 pt-28">
          {children}
        </div>
        <SiteFooter />
      </div>
    )
  }

  const userId = user.id

  const [t, tShell] = await Promise.all([
    getTranslations('notif'),
    getTranslations('shell'),
  ])

  const [profileResult, notifData, userRoles] = await Promise.all([
    (supabase.from('users') as any).select('full_name').eq('id', userId).maybeSingle(),
    fetchNotifications(supabase, userId),
    fetchUserRoles(supabase, userId),
  ])

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
