'use client'

import { useState, useEffect, useTransition } from 'react'
import { CheckCircle2, MapPin } from 'lucide-react'
import { useAuthAction } from '@/lib/use-auth-action'
import {
  saveDraft, loadDraft, clearDraft,
  savePendingAction, readPendingAction, clearPendingAction,
} from '@/lib/guest-draft'
import { requestQuoteAction } from './actions'

interface Labels {
  formTitle: string
  formHint: string
  postcodeLabel: string
  postcodePlaceholder: string
  detailsLabel: string
  detailsPlaceholder: string
  submit: string
  submitting: string
  successTitle: string
  successBody: string
  errorGeneric: string
}

interface Props {
  category: string
  authenticated: boolean
  labels: Labels
}

/**
 * The one form on the demand side of the marketplace.
 *
 * Guests fill it in without an account. The sign-in modal appears on submit,
 * and the request they'd already written is sent for them when they come back —
 * so signing in costs them one click, not a retyped form.
 */
export function QuoteRequestForm({ category, authenticated, labels }: Props) {
  const { handleAuthRequired } = useAuthAction()
  const [postcode, setPostcode] = useState('')
  const [details, setDetails] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const draftKey = `quote:${category}`

  function submit(values: { postcode: string; details: string }) {
    setError(null)
    startTransition(async () => {
      const result = await requestQuoteAction({
        category,
        postcode: values.postcode,
        description: values.details,
      })

      if (result && 'authRequired' in result) {
        // Keep what they wrote, and remember to send it once they're back.
        savePendingAction('request-quote', category, values)
        saveDraft(draftKey, values)
        handleAuthRequired(result)
        return
      }
      if (result && 'error' in result) {
        setError(result.error || labels.errorGeneric)
        return
      }

      clearDraft(draftKey)
      clearPendingAction()
      setSent(true)
    })
  }

  useEffect(() => {
    // Back from the sign-in email: finish the job rather than making them
    // write the whole thing out again.
    const pending = readPendingAction('request-quote', category)
    if (pending && authenticated) {
      const values = {
        postcode: String(pending.payload['postcode'] ?? ''),
        details: String(pending.payload['details'] ?? ''),
      }
      clearPendingAction()
      if (values.postcode) {
        setPostcode(values.postcode)
        setDetails(values.details)
        submit(values)
        return
      }
    }

    // Still signed out: put their half-finished request back on screen.
    const draft = loadDraft<{ postcode?: string; details?: string }>(draftKey)
    if (draft) {
      setPostcode(draft.postcode ?? '')
      setDetails(draft.details ?? '')
    }
    // Runs once on mount; submit is stable enough for this one-shot replay.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (sent) {
    return (
      <div className="bg-surface-dark rounded-card-dark border border-brand/25 p-8 text-center">
        <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={24} className="text-brand" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{labels.successTitle}</h3>
        <p className="text-sm text-text-on-dark-secondary max-w-md mx-auto leading-relaxed">
          {labels.successBody}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-8">
      <h2 className="text-xl font-bold text-white mb-1">{labels.formTitle}</h2>
      <p className="text-sm text-text-on-dark-secondary mb-6">{labels.formHint}</p>

      <form
        onSubmit={e => { e.preventDefault(); submit({ postcode, details }) }}
        className="space-y-5"
      >
        <label className="block max-w-xs">
          <span className="text-xs font-semibold text-white/70">{labels.postcodeLabel}</span>
          <div className="relative mt-1.5">
            <MapPin
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
            />
            <input
              type="text"
              value={postcode}
              onChange={e => setPostcode(e.target.value)}
              placeholder={labels.postcodePlaceholder}
              autoComplete="postal-code"
              className="w-full bg-white/[0.04] border border-white/[0.12] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand/40"
            />
          </div>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-white/70">{labels.detailsLabel}</span>
          <textarea
            value={details}
            onChange={e => setDetails(e.target.value)}
            rows={4}
            placeholder={labels.detailsPlaceholder}
            className="mt-1.5 w-full bg-white/[0.04] border border-white/[0.12] rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand/40 resize-y"
          />
        </label>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="submit"
            disabled={isPending}
            className="px-7 py-3 bg-brand hover:bg-brand-hover text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {isPending ? labels.submitting : labels.submit}
          </button>
          {error && <span className="text-sm text-red-400" role="alert">{error}</span>}
        </div>
      </form>
    </div>
  )
}
