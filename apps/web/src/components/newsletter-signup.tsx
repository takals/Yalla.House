'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Mail, Loader2, CheckCircle2 } from 'lucide-react'

type Props = {
  source?: string
  role?: string
  className?: string
}

/**
 * Quick, no-account newsletter sign-up. Double opt-in: on submit we send a
 * confirm email, so the UI shows a "check your inbox" state rather than an
 * instant success. Reusable across the site via `source`/`role`.
 */
export function NewsletterSignup({ source = 'agent_info', role = 'agent', className = '' }: Props) {
  const t = useTranslations('newsletter')
  const locale = useLocale()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'pending' | 'already' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setState('busy')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), locale, source, role }),
      })
      const data = await res.json()
      if (!res.ok) { setState('error'); return }
      setState(data.status === 'already_subscribed' ? 'already' : 'pending')
    } catch {
      setState('error')
    }
  }

  if (state === 'pending' || state === 'already') {
    return (
      <div className={`rounded-xl border border-green-300 bg-green-50 px-5 py-4 flex items-start gap-3 ${className}`}>
        <CheckCircle2 size={18} className="text-green-700 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-green-800">
          {state === 'already' ? t('alreadySubscribed') : t('checkInbox')}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className={className}>
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('placeholder')}
            className="w-full bg-white border border-border-default rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <button
          type="submit"
          disabled={state === 'busy'}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-bold text-sm rounded-lg transition-colors"
        >
          {state === 'busy' && <Loader2 size={15} className="animate-spin" />}
          {t('subscribe')}
        </button>
      </div>
      {state === 'error' && <p className="text-sm text-red-600 mt-2">{t('error')}</p>}
      <p className="text-[11.5px] text-text-secondary mt-2">{t('consent')}</p>
    </form>
  )
}
