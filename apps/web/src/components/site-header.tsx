import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Home } from 'lucide-react'

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

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-[12px]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
    >
      <div className="max-w-6xl mx-auto px-8 h-14 flex items-center justify-between gap-4">
        {/* LEFT — Brand */}
        <Link
          href="/"
          className="font-bold text-xl text-brand hover:text-brand transition-colors flex-shrink-0 flex items-center gap-2"
        >
          <Home size={20} className="text-brand" />
          Yalla.House
        </Link>

        {/* CENTER + RIGHT — Nav + CTA */}
        <nav className="flex items-center gap-8">
          <Link
            href="/services"
            className="text-[0.95rem] text-white hover:text-brand-hover transition-[color] duration-[400ms] hidden sm:block"
            style={{ transitionTimingFunction: 'cubic-bezier(0.44, 0, 0.56, 1)' }}
          >
            {t('services')}
          </Link>
          <Link
            href="/agents"
            className="text-[0.95rem] text-white hover:text-brand-hover transition-[color] duration-[400ms] hidden sm:block"
            style={{ transitionTimingFunction: 'cubic-bezier(0.44, 0, 0.56, 1)' }}
          >
            {t('agents')}
          </Link>
          <Link
            href="/about"
            className="text-[0.95rem] text-white hover:text-brand-hover transition-[color] duration-[400ms] hidden sm:block"
            style={{ transitionTimingFunction: 'cubic-bezier(0.44, 0, 0.56, 1)' }}
          >
            {t('about')}
          </Link>
          <Link
            href={user ? accountHref : '/auth/login'}
            className={user
              ? 'text-[0.95rem] font-semibold text-white bg-brand hover:bg-brand-hover px-6 py-2.5 rounded-lg transition-[background-color] duration-300 whitespace-nowrap'
              : 'text-[0.95rem] font-semibold text-white hover:text-brand-hover transition-[color] duration-[400ms] whitespace-nowrap'
            }
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            {user ? t('dashboard') : t('login')}
          </Link>
        </nav>
      </div>
    </header>
  )
}
