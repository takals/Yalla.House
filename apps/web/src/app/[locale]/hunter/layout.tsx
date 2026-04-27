import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_EMAIL } from '@/lib/preview-user'
import { DashboardShell, hunterNav } from '@/components/dashboard/shell'
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

export default async function HunterLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Public info pages: middleware only allows unauthenticated access to /hunter/info,
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

  // Fetch profile + notifications + roles in parallel
  const [profileResult, notifData, userRoles] = await Promise.all([
    (supabase.from('users') as any).select('full_name').eq('id', userId).maybeSingle(),
    fetchNotifications(supabase, userId),
    fetchUserRoles(supabase, userId),
  ])

  const fullName = profileResult.data?.full_name ?? null

  const shellLabels: Record<string, string> = {
    collapse: tShell('collapse'),
    expandSidebar: tShell('expandSidebar'),
    collapseSidebar: tShell('collapseSidebar'),
    signOut: tShell('signOut'),
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
