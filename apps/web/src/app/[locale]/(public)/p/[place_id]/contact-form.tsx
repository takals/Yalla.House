'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { requestViewingAction, checkAuthAction, seedHunterProfileAction } from './actions'
import { Shield, CheckCircle2, Home, Search, Star, Bell, Users, TrendingUp, Lock, ChevronRight, MessageCircle, BadgeCheck } from 'lucide-react'

const BUYER_STATUSES = [
  'mortgage_in_principle',
  'cash_buyer',
  'first_time_buyer',
  'in_chain',
  'selling_to_buy',
  'exploring',
] as const

type BuyerStatus = typeof BUYER_STATUSES[number]

/* ── Passport Upsell (shown after successful inquiry) ─────────────────────── */

function PassportUpsell({ locale }: { locale: string }) {
  const t = useTranslations('listingPage')

  const unlockedBenefits = [
    { icon: CheckCircle2, text: t('passportBenefitInquiry') },
    { icon: Shield, text: t('passportBenefitStatus') },
    { icon: TrendingUp, text: t('passportBenefitBudget') },
  ]

  const lockedBenefits = [
    { icon: Bell, text: t('passportBenefitAlerts') },
    { icon: Users, text: t('passportBenefitAgents') },
    { icon: Star, text: t('passportBenefitPriority') },
    { icon: TrendingUp, text: t('passportBenefitReadiness') },
  ]

  return (
    <div className="mt-6 border-2 border-brand rounded-2xl p-5 bg-brand/[0.03]">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
          <Home size={18} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-text-primary text-sm">{t('passportTitle')}</p>
          <p className="text-xs text-text-secondary">{t('passportSubtitle')}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-border-default mb-4 overflow-hidden">
        <div className="h-full rounded-full bg-brand" style={{ width: '30%' }} />
      </div>

      {/* Benefits */}
      <div className="space-y-2 mb-4">
        {unlockedBenefits.map((b, i) => (
          <div key={i} className="flex items-start gap-2.5 text-xs">
            <b.icon size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
            <span className="text-text-primary leading-snug">{b.text}</span>
          </div>
        ))}
        {lockedBenefits.map((b, i) => (
          <div key={i} className="flex items-start gap-2.5 text-xs">
            <Lock size={14} className="text-text-secondary mt-0.5 flex-shrink-0" />
            <span className="text-text-secondary leading-snug">{b.text}</span>
          </div>
        ))}
      </div>

      <a
        href={`/${locale === 'de' ? '' : locale + '/'}hunter/passport`}
        className="w-full flex items-center justify-center gap-2 border-2 border-brand text-brand font-bold py-2.5 rounded-xl text-sm hover:bg-brand/5 transition-colors"
      >
        {t('passportCta')}
        <ChevronRight size={14} />
      </a>
    </div>
  )
}

/* ── Main Contact / Inquiry Card ──────────────────────────────────────────── */

export function ContactCard({
  listingId,
}: {
  listingId: string
}) {
  const t = useTranslations('listingPage')
  const locale = useLocale()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [intent, setIntent] = useState('')
  const [buyerStatus, setBuyerStatus] = useState<BuyerStatus | ''>('')
  const [timeline, setTimeline] = useState('')
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
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

  // Success state — inquiry sent + passport upsell
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
        <PassportUpsell locale={locale} />
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    // Build structured message with qualification data
    const qualParts = [
      buyerStatus && `Buyer status: ${t(`buyerStatus_${buyerStatus}`)}`,
      intent && `Looking to: ${intent}`,
      (budgetMin || budgetMax) && `Budget: ${budgetMin || '?'} – ${budgetMax || '?'}`,
      timeline && `Timeline: ${t(`qualifyTimeline_${timeline}`)}`,
      message,
    ].filter(Boolean).join('\n')

    const result = await requestViewingAction(listingId, {
      name,
      email,
      ...(qualParts ? { message: qualParts } : {}),
      buyerStatus: buyerStatus || undefined,
      intent: intent || undefined,
      timeline: timeline || undefined,
      budgetMin: budgetMin ? parseInt(budgetMin.replace(/[^0-9]/g, ''), 10) : undefined,
      budgetMax: budgetMax ? parseInt(budgetMax.replace(/[^0-9]/g, ''), 10) : undefined,
    }, locale)

    setSubmitting(false)

    if ('error' in result) {
      setError(result.error)
    } else {
      setDone(true)
    }
  }

  // The form is always visible — guests fill it out pre-auth, submission gates behind auth
  return (
    <div className="bg-surface rounded-2xl p-6 shadow-sm border border-border-default">
      {/* In-app messaging trust banner */}
      <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-green-50 border border-green-200">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <Shield size={16} className="text-green-700" />
        </div>
        <div>
          <p className="text-xs font-bold text-green-800">{t('messagingSecure')}</p>
          <p className="text-[11px] text-green-700">{t('messagingSecureDesc')}</p>
        </div>
      </div>

      <h2 data-contact-card className="text-lg font-bold text-text-primary mb-1">
        {t('inquiryTitle')}
      </h2>
      <p className="text-xs text-text-secondary mb-4">
        {t('inquirySubtitle')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact details — name only (no phone, email only for guests) */}
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

        {!isLoggedIn && (
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
        )}

        {/* Your situation */}
        <div className="pt-3 border-t border-border-default">
          <p className="text-xs font-bold text-brand uppercase tracking-wide mb-3">
            {t('inquirySituationTitle')}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                {t('inquiryIntent')}
              </label>
              <select
                value={intent}
                onChange={e => setIntent(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border-default rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              >
                <option value="">{t('qualifySelectOption')}</option>
                <option value="buy">{t('inquiryIntentBuy')}</option>
                <option value="rent">{t('inquiryIntentRent')}</option>
              </select>
            </div>
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
                <option value="asap">{t('qualifyTimeline_asap')}</option>
                <option value="1_3_months">{t('qualifyTimeline_1_3_months')}</option>
                <option value="3_6_months">{t('qualifyTimeline_3_6_months')}</option>
                <option value="6_plus">{t('qualifyTimeline_6_plus')}</option>
                <option value="just_looking">{t('qualifyTimeline_just_looking')}</option>
              </select>
            </div>
          </div>

          {/* Budget */}
          <div className="mb-3">
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              {t('inquiryBudget')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                inputMode="numeric"
                value={budgetMin}
                onChange={e => setBudgetMin(e.target.value)}
                placeholder={t('inquiryBudgetMin')}
                className="w-full px-3 py-2 text-sm border border-border-default rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
              <input
                type="text"
                inputMode="numeric"
                value={budgetMax}
                onChange={e => setBudgetMax(e.target.value)}
                placeholder={t('inquiryBudgetMax')}
                className="w-full px-3 py-2 text-sm border border-border-default rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
          </div>

          {/* Buyer Status Chips */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-2">
              {t('inquiryBuyerStatus')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BUYER_STATUSES.map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setBuyerStatus(buyerStatus === status ? '' : status)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors ${
                    buyerStatus === status
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-border-default text-text-secondary hover:border-brand'
                  }`}
                >
                  {t(`buyerStatus_${status}`)}
                </button>
              ))}
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
            placeholder={t('inquiryMessagePlaceholder')}
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
          {t('inquirySubmitButton')}
        </button>

        {!isLoggedIn && (
          <p className="text-[11px] text-text-secondary text-center">
            {t('inquiryAuthNote')}
          </p>
        )}

        <div className="pt-2 border-t border-border-default space-y-1.5">
          <div className="flex items-start gap-2">
            <MessageCircle size={13} className="text-brand mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-text-secondary">
              {t('contactInAppOnly')}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Shield size={13} className="text-text-secondary mt-0.5 flex-shrink-0" />
            <p className="text-[11px] text-text-secondary">
              {t('contactPrivacy')}
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}

export type ContactCardProps = { listingId: string }
