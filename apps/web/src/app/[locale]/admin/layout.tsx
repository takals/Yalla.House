import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_EMAIL } from '@/lib/preview-user'
import { DashboardShell, adminNav } from '@/components/dashboard/shell'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Preview phase: no auth gate. Render the shell even when there's no user.
  let fullName: string | null = null
  if (user) {
    const { data: profile } = await (supabase.from('users') as any)
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()
    fullName = profile?.full_name ?? null
  }

  return (
    <DashboardShell
      navItems={adminNav}
      section="admin"
      userEmail={user?.email ?? PREVIEW_USER_EMAIL}
      userName={fullName}
    >
      {children}
    </DashboardShell>
  )
}
