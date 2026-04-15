'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { requestViewingAction, checkAuthAction } from './actions'

export function ContactCard({
  listingId,
}: {
  listingId: string
}) {
  const t = useTranslations('listingPage')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    checkAuthAction().then(result => {
      setIsLoggedIn(result.authenticated)
      if (result.userName) setName(result.userName)
      if (result.userEmail) setEmail(result.userEmail)
    })
  }, [])

  // Loading state
  if (isLoggedIn === null) {
    return (
      <div className="bg-surface rounded-card p-6 shadow-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-10 bg-gray-200 rounded" />
          <div className="h-10 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  // Not logged in — show account creation gate
  if (!isLoggedIn) {
    return (
      <div className="bg-surface rounded-card p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#0F1117] mb-2">
          {t('contactTitle')}
        </h2>
        <p className="text-sm text-[#5E6278] mb-4">
          {t('contactGateText')}
        </p>

        <div className="space-y-2">
          <a
            href={`/api/auth/callback?redirect=/p/${listingId}`}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-[#0F1117] font-bold py-2.5 rounded-lg transition-colors text-sm"
          >
            {t('contactCreateAccount')}
          </a>
          <a
            href={`/api/auth/callback?redirect=/p/${listingId}`}
            className="w-full flex items-center justify-center gap-2 bg-bg hover:bg-[#D9DCE4] text-[#0F1117] font-semibold py-2.5 rounded-lg transition-colors text-sm border border-[#E2E4EB]"
          >
            {t('contactSignIn')}
          </a>
        </div>

        <div className="mt-4 pt-3 border-t border-[#E2E4EB]">
          <div className="flex items-start gap-2">
            <svg className="w-3.5 h-3.5 text-[#5E6278] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-xs text-[#5E6278]">
              {t('contactPrivacy')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Success state
  if (done) {
    return (
      <div className="bg-surface rounded-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-[#0F1117]">
              {t('contactThankYou')}
            </p>
            <p className="text-sm text-[#5E6278] mt-1">
              {t('contactOwnerInTouch')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Logged in — show contact form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const result = await requestViewingAction(listingId, {
      name,
      email,
      ...(phone ? { phone } : {}),
      ...(message ? { message } : {}),
    })

    setSubmitting(false)

    if ('error' in result) {
      setError(result.error)
    } else {
      setDone(true)
    }
  }

  return (
    <div className="bg-surface rounded-card p-6 shadow-sm">
      <h2 data-contact-card className="text-lg font-bold text-[#0F1117] mb-4">
        {t('contactRequestViewing')}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[#5E6278] mb-1">
            {t('contactName')} *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('contactNamePlaceholder')}
            className="w-full px-3 py-2 text-sm border border-[#E2E4EB] rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#5E6278] mb-1">
            {t('contactEmail')} *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('contactEmailPlaceholder')}
            className="w-full px-3 py-2 text-sm border border-[#E2E4EB] rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#5E6278] mb-1">
            {t('contactPhone')} <span className="font-normal text-[#999999]">({t('contactOptional')})</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+44 ..."
            className="w-full px-3 py-2 text-sm border border-[#E2E4EB] rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#5E6278] mb-1">
            {t('contactMessage')} <span className="font-normal text-[#999999]">({t('contactOptional')})</span>
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={t('contactMessagePlaceholder')}
            className="w-full px-3 py-2 text-sm border border-[#E2E4EB] rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-[#0F1117] font-bold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {t('contactSendRequest')}
        </button>
      </form>
    </div>
  )
}
