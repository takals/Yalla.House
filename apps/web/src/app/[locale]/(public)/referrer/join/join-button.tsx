'use client'

import { useState, useTransition } from 'react'
import { ArrowRight } from 'lucide-react'
import { useAuthAction } from '@/lib/use-auth-action'
import { joinReferralProgramAction } from './actions'

interface Props {
  locale: string
  label: string
  workingLabel: string
}

/**
 * Join CTA. Guests press the same button as everyone else — the action returns
 * authRequired and the sign-in modal opens over the page.
 */
export function JoinButton({ locale, label, workingLabel }: Props) {
  const { handleAuthRequired } = useAuthAction()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    setError(null)
    startTransition(async () => {
      const result = await joinReferralProgramAction(locale)
      if (handleAuthRequired(result)) return
      if (result && 'error' in result) setError(result.error)
    })
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-semibold px-8 py-3.5 rounded-lg transition-colors text-base disabled:opacity-50"
      >
        {isPending ? workingLabel : label}
        {!isPending && <ArrowRight size={18} />}
      </button>
      {error && (
        <p className="text-sm text-red-400" role="alert">{error}</p>
      )}
    </div>
  )
}
