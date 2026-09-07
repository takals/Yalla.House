'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Users, Search, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react'

/** Shown when the passport intake completes. Before this the chat just logged to the console. */
export function PassportNextSteps() {
  const t = useTranslations('hunterPassportNext')
  const items = [
    { href: '/hunter/agents',       icon: Users,       title: t('agentsTitle'), body: t('agentsBody') },
    { href: '/hunter/search',       icon: Search,      title: t('searchTitle'), body: t('searchBody') },
    { href: '/hunter/verification', icon: ShieldCheck, title: t('verifyTitle'), body: t('verifyBody') },
  ]
  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="flex items-center gap-2 text-green-700 mb-2">
        <CheckCircle2 size={20} />
        <h2 className="text-lg font-bold text-text-primary">{t('title')}</h2>
      </div>
      <p className="text-sm text-text-secondary mb-6">{t('intro')}</p>
      <div className="grid gap-3">
        {items.map(i => (
          <Link key={i.href} href={i.href}
                className="group flex items-start gap-4 bg-white rounded-2xl border border-border-default p-5 hover:border-brand hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center flex-shrink-0">
              <i.icon size={18} className="text-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-text-primary">{i.title}</p>
              <p className="text-sm text-text-secondary mt-0.5">{i.body}</p>
            </div>
            <ArrowRight size={16} className="text-brand mt-1 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ))}
      </div>
      <p className="text-xs text-text-muted mt-5">{t('editNote')}</p>
    </div>
  )
}
