'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { requestViewingAction, checkAuthAction } from './actions'
import { Shield, CheckCircle2 } from 'lucide-react'

export function ContactCard({
  listingId,
}: {
  listingId: string
}) {
  const t = useTranslations('listingPage')
  const locale = useLocale()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [buyingPosition, setBuyingPosition] = useState('')
  const [financeStatus, setFinanceStatus] = useState('')
  const [timeline, setTimeline] = useState('')
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
      <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-default">
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
      <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-default">
        <h2 className="text-lg font-bold text-text-primary mb-2">
          {t('contactTitle')}
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          {t('contactGateText')}
        </p>

        <div className="space-y-2">
          <a
            href={`/auth/login?next=${encodeURIComponent(`/p/${listingId}`)}`}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
          >
            {t('contactCreateAccount')}
          </a>
          <a
            href={`/auth/login?next=${encodeURIComponent(`/p/${listingId}`)}`}
            className="w-full flex items-center justify-center gap-2 bg-bg hover:bg-hover-muted text-text-primary font-semibold py-2.5 rounded-xl transition-colors text-sm border border-border-default"
          >
            {t('contactSignIn')}
          </a>
        </div>

        <div className="mt-4 pt-3 border-t border-border-default">
          <div className="flex items-start gap-2">
            <Shield size={14} className="text-text-secondary mt-0.5 flex-shrink-0" />
            <p className="text-xs text-text-secondary">
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
      <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-default">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 size={16} className="text-green-600" />
          </div>
          <div>
            <p className="font-bold text-text-primary">
              {t('contactThankYou')}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              {t('contactOwnerInTouch')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Logged in — show qualification + contact form
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const qualMsg = [
      buyingPosition && `Buying position: ${buyingPosition}`,
      financeStatus && `Finance: ${financeStatus}`,
      timeline && `Timeline: ${timeline}`,
      message,
    ].filter(Boolean).join('\n')

    const result = await requestViewingAction(listingId, {
      name,
      email,
      ...(phone ? { phone } : {}),
      ...(qualMsg ? { message: qualMsg } : {}),
    }, locale)

    setSubmitting(false)

    if ('error' in result) {
      setError(result.error)
    } else {
      setDone(true)
    }
  }

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-default">
      <h2 data-contact-card className="text-lg font-bold text-text-primary mb-1">
        {t('contactRequestViewing')}
      </h2>
      <p className="text-xs text-text-secondary mb-4">
        {t('qualifySubtitle')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              {t('contactName')} *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('contactNamePlaceholder')}
              className="w-full px-3 py-2 text-sm border border-border-default rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              {t('contactPhone')} <span className="font-normal text-text-secondary">({t('contactOptional')})</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+44 ..."
              className="w-full px-3 py-2 text-sm border border-border-default rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            {t('contactEmail')} *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('contactEmailPlaceholder')}
            className="w-full px-3 py-2 text-sm border border-border-default rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          />
        </div>

        {/* Qualification section */}
        <div className="pt-3 border-t border-border-default">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wide mb-3">
            {t('qualifyTitle')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Buying position */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                {t('qualifyPosition')}
              </label>
              <select
                value={buyingPosition}
                onChange={e => setBuyingPosition(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border-default rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              >
                <option value="">{t('qualifySelectOption')}</option>
                <option value="first_time">{t('qualifyFirstTime')}</option>
                <option value="moving_up">{t('qualifyMovingUp')}</option>
                <option value="downsizing">{t('qualifyDownsizing')}</option>
                <option value="investor">{t('qualifyInvestor')}</option>
                <option value="renting">{t('qualifyRenting')}</option>
              </select>
            </div>

            {/* Finance */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                {t('qualifyFinance')}
              </label>
              <select
                value={financeStatus}
                onChange={e => setFinanceStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border-default rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              >
                <option value="">{t('qualifySelectOption')}</option>
                <option value="mortgage_approved">{t('qualifyMortgageApproved')}</option>
                <option value="mortgage_pending">{t('qualifyMortgagePending')}</option>
                <option value="cash">{t('qualifyCash')}</option>
                <option value="not_started">{t('qualifyNotStarted')}</option>
              </select>
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                {t('qualifyTimeline')}
              </label>
              <select
                value={timeline}
                onChange={e => setTimeline(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border-default rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              >
                <option value="">{t('qualifySelectOption')}</option>
                <option value="asap">{t('qualifyAsap')}</option>
                <option value="1_3_months">{t('qualify1to3')}</option>
                <option value="3_6_months">{t('qualify3to6')}</option>
                <option value="6_plus">{t('qualify6plus')}</option>
                <option value="just_looking">{t('qualifyJustLooking')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary mb-1">
            {t('contactMessage')} <span className="font-normal text-text-secondary">({t('contactOptional')})</span>
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={t('contactMessagePlaceholder')}
            className="w-full px-3 py-2 text-sm border border-border-default rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
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
