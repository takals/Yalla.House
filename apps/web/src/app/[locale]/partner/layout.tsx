import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_EMAIL } from '@/lib/preview-user'
import { DashboardShell, partnerNav } from '@/components/dashboard/shell'
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

  // Preview phase: no auth gate. Render the shell even when there's no user.
  let fullName: string | null = null
  if (user) {
    const { data: profile } = await (supabase.from('users') as any)
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()
    fullName = profile?.full_name ?? null
  }

  const shellLabels: Record<string, string> = {
    collapse: tShell('collapse'),
    expandSidebar: tShell('expandSidebar'),
    collapseSidebar: tShell('collapseSidebar'),
    signOut: tShell('signOut'),
  }

  return (
    <DashboardShell
      navItems={partnerNav}
      section="partner"
      userEmail={user?.email ?? PREVIEW_USER_EMAIL}
      userName={fullName}
      shellLabels={shellLabels}
    >
      {children}
    </DashboardShell>
  )
}
