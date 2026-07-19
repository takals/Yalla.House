'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { setNewsletterOptInAction } from './actions'

export function NewsletterToggle({ initial }: { initial: boolean }) {
  const t = useTranslations('agentProfile')
  const [checked, setChecked] = useState(initial)
  const [isPending, startTransition] = useTransition()

  function toggle(next: boolean) {
    setChecked(next)
    startTransition(async () => {
      const result = await setNewsletterOptInAction(next)
      if ('error' in result) setChecked(!next)
    })
  }

  return (
    <label className="mb-6 flex items-start gap-3 rounded-2xl border border-border-default bg-white px-5 py-4 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        disabled={isPending}
        onChange={e => toggle(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-[#D4764E]"
      />
      <span className="text-sm text-text-secondary">
        <span className="font-semibold text-text-primary">{t('newsletterTitle')}</span>{' '}
        {t('newsletterBody')}
      </span>
    </label>
  )
}
