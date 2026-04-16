import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Home } from 'lucide-react'
import { HeaderNav } from './header-nav'

export async function SiteHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const t = await getTranslations('nav')

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

  const navLinks = [
    { href: '/services', label: t('services') },
    { href: '/partners', label: t('partners') },
    { href: '/about', label: t('about') },
  ]

  const cta = user
    ? { href: accountHref, label: t('dashboard'), isLoggedIn: true }
    : { href: '/auth/login', label: t('login'), isLoggedIn: false }

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-[12px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
    >
      <div className="max-w-6xl mx-auto px-8 h-14 flex items-center justify-between gap-4 relative">
        {/* LEFT — Brand */}
        <Link
          href="/"
          aria-label="Home"
          className="font-bold text-xl text-brand hover:text-brand transition-colors flex-shrink-0 flex items-center gap-2"
        >
          <Home size={20} className="text-brand" />
          Yalla.House
        </Link>

        {/* CENTER + RIGHT — Nav + CTA (with mobile hamburger) */}
        <HeaderNav links={navLinks} cta={cta} />
      </div>
    </header>
  )
}
