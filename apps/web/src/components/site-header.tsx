import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export async function SiteHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Preview phase: dashboards are open. Default the CTA to the owner dashboard
  // unless a real signed-in user clearly looks like a hunter.
  let accountHref = '/owner'
  if (user) {
    const { count } = await supabase
      .from('listings')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id)
    if ((count ?? 0) === 0) accountHref = '/hunter'
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-[#E2E4EB]">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-extrabold text-lg text-[#0F1117] tracking-tight flex-shrink-0"
        >
          Yalla.House
        </Link>

        <nav className="flex items-center gap-5">
          <Link
            href="/listings"
            className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] transition-colors hidden sm:block"
          >
            Inserate
          </Link>
          <Link
            href="/services"
            className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] transition-colors hidden sm:block"
          >
            Services &amp; Preise
          </Link>
          <Link
            href="/about"
            className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] transition-colors hidden sm:block"
          >
            Über uns
          </Link>
          <Link
            href={accountHref}
            className="text-sm font-bold text-[#0F1117] bg-brand hover:bg-brand-hover px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
          >
            {user ? 'Mein Konto' : 'Dashboards ansehen'}
          </Link>
        </nav>
      </div>
    </header>
  )
}
