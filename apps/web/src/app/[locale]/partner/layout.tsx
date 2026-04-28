import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_EMAIL } from '@/lib/preview-user'
import { DashboardShell } from '@/components/dashboard/shell'
import { partnerNav } from '@/components/dashboard/nav-items'
import { fetchUserRoles } from '@/lib/user-roles'
import { getTranslations } from 'next-intl/server'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const tShell = await getTranslations('shell')

  const [profileResult, userRoles] = await Promise.all([
    user
      ? (supabase.from('users') as any).select('full_name').eq('id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
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
    navDashboard: tShell('navDashboard'),
    navRequests: tShell('navRequests'),
  }

  return (
    <DashboardShell
      navItems={partnerNav(navLabels)}
      section="partner"
      userEmail={user?.email ?? PREVIEW_USER_EMAIL}
      userName={profileResult.data?.full_name ?? null}
      shellLabels={shellLabels}
      userRoles={userRoles}
    >
      {children}
    </DashboardShell>
  )
}
