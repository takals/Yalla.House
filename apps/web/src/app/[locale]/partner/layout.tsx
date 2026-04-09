import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_EMAIL } from '@/lib/preview-user'
import { DashboardShell, partnerNav } from '@/components/dashboard/shell'

export default async function PartnerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Preview phase: no auth gate. Render the shell even when there's no user.
  let fullName: string | null = null
  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase.from('users') as any)
      .select('full_name')
      .eq('id', user.id)
      .maybeSingle()
    fullName = profile?.full_name ?? null
  }

  return (
    <DashboardShell
      navItems={partnerNav}
      section="partner"
      userEmail={user?.email ?? PREVIEW_USER_EMAIL}
      userName={fullName}
    >
      {children}
    </DashboardShell>
  )
}
