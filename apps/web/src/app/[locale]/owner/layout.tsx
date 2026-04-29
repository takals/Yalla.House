import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_EMAIL } from '@/lib/preview-user'
import { DashboardShell } from '@/components/dashboard/shell'
import { ownerNav } from '@/components/dashboard/nav-items'

import { fetchNotifications, getNotificationLabels } from '@/lib/notifications'
import { fetchUserRoles } from '@/lib/user-roles'
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
    navListings: tShell('navListings'),
    navCalendar: tShell('navCalendar'),
    navViewings: tShell('navViewings'),
    navOffers: tShell('navOffers'),
    navAgents: tShell('navAgents'),
    navInbox: tShell('navInbox'),
    navNewListing: tShell('navNewListing'),
    navPlans: tShell('navPlans'),
    navSettings: tShell('navSettings'),
  }

  // Always render inside DashboardShell — even for unauthenticated visitors
  // on /owner/info so the page feels like a real dashboard workspace
  if (!user) {
    return (
      <DashboardShell
        navItems={ownerNav(navLabels)}
        section="owner"
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
      navItems={ownerNav(navLabels)}
      section="owner"
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
