import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Home, Search, Briefcase } from 'lucide-react'

export default async function WelcomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // If user already has roles, skip this page
  const { data: roles } = await (supabase.from('user_roles') as any)
    .select('role')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (roles && roles.length > 0) {
    const roleSet = new Set(roles.map((r: { role: string }) => r.role))
    if (roleSet.has('admin')) redirect('/admin')
    if (roleSet.has('agent')) redirect('/agent')
    if (roleSet.has('owner')) redirect('/owner')
    redirect('/hunter')
  }

  const t = await getTranslations('welcome')

  const paths = [
    {
      key: 'owner',
      href: '/owner',
      icon: Home,
      color: 'bg-brand/10 text-brand',
    },
    {
      key: 'hunter',
      href: '/hunter',
      icon: Search,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      key: 'agent',
      href: '/agent',
      icon: Briefcase,
      color: 'bg-green-50 text-green-600',
    },
  ]

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary mb-3">
          {t('title')}
        </h1>
        <p className="text-text-secondary mb-8">
          {t('subtitle')}
        </p>

        <div className="space-y-4">
          {paths.map(({ key, href, icon: Icon, color }) => (
            <Link
              key={key}
              href={href}
              className="flex items-center gap-4 bg-surface border border-border-default rounded-2xl p-5 hover:border-brand/30 hover:shadow-md transition-all will-change-transform hover:-translate-y-0.5 text-left"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-text-primary text-base">
                  {t(`${key}Title`)}
                </h3>
                <p className="text-sm text-text-secondary mt-0.5">
                  {t(`${key}Desc`)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
