'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuthAction } from '@/lib/use-auth-action'
import { signAgreement, type AgreementType } from '@/lib/agreements'
import { FileDown } from 'lucide-react'

interface AgreementSection {
  titleKey: string
  contentKey: string
}

interface AgreementPageProps {
  agreementType: AgreementType
  namespace: string
  sections: AgreementSection[]
  version: string
  locale: string
  countryCode: string
  countryName: string
  /** Already-signed state */
  signedAt?: string | null
  signedName?: string | null
  /** Optional extra field (e.g. agency name for agents) */
  extraLabel?: string
  extraValue?: string
}

export function AgreementPage({
  agreementType,
  namespace,
  sections,
  version,
  locale,
  countryCode,
  countryName,
  signedAt,
  signedName,
  extraLabel,
  extraValue,
}: AgreementPageProps) {
  const t = useTranslations(namespace)
  const [agreed, setAgreed] = useState(false)
  const [signatoryName, setSignatoryName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { handleAuthRequired } = useAuthAction()

  const alreadySigned = !!signedAt

  async function handleSign(e: React.FormEvent) {
    e.preventDefault()
    if (!agreed || !signatoryName.trim()) return
    setSubmitting(true)
    setError(null)

    const result = await signAgreement({
      agreementType,
      signatoryName: signatoryName.trim(),
      locale,
      countryCode,
    })

    if (handleAuthRequired(result)) {
      setSubmitting(false)
      return
    }
    setSubmitting(false)

    if (result && 'error' in result) {
      setError((result as { error: string }).error)
    }
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">{t('pageTitle')}</h1>
        <p className="text-text-secondary text-sm">{t('pageSubtitle')}</p>
      </div>

      {/* Already signed banner */}
      {alreadySigned && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-green-800">{t('alreadySigned')}</p>
            {signedAt && (
              <p className="text-xs text-green-600 mt-0.5">
                {t('signedOn', {
                  date: new Date(signedAt).toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  }),
                })}
                {signedName ? ` — ${signedName}` : ''}
              </p>
            )}
          </div>
          <a
            href={`/api/agreements/pdf?type=${agreementType}&locale=${locale}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-900 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            {t('downloadPdfButton')}
          </a>
        </div>
      )}

      {/* Agreement intro */}
      <div className="bg-surface rounded-2xl border border-border-default overflow-hidden mb-6">
        {/* Intro paragraph */}
        <div className="p-6 border-b border-border-default">
          <p className="text-sm text-text-secondary">{t('intro')}</p>
        </div>

        {/* Sections */}
        {sections.map((section, idx) => (
          <div
            key={section.titleKey}
            className={`p-6 ${idx < sections.length - 1 ? 'border-b border-border-default' : ''}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-xs font-bold text-text-primary">
                {idx + 1}
              </div>
              <h2 className="text-base font-bold">{t(section.titleKey)}</h2>
            </div>
            <p className="text-sm text-text-secondary">
              {t(section.contentKey, { country: countryName, referralPercent: '15' })}
            </p>
          </div>
        ))}
      </div>

      {/* Version notice */}
      <p className="text-xs text-text-muted mb-4">
        {t('versionLabel')} {version}
      </p>

      {/* Signing form (only if not already signed) */}
      {!alreadySigned && (
        <form onSubmit={handleSign} className="bg-surface rounded-2xl p-6 border border-border-default space-y-4">
          {/* Optional extra field (e.g. agency name) */}
          {extraLabel && extraValue && (
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">{extraLabel}</label>
              <p className="text-sm font-medium">{extraValue}</p>
            </div>
          )}

          {/* Signatory name */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1">
              {t('signatoryNameLabel')}
            </label>
            <input
              type="text"
              required
              value={signatoryName}
              onChange={e => setSignatoryName(e.target.value)}
              placeholder={t('signatoryNamePlaceholder')}
              className="w-full px-3 py-2 text-sm border border-border-default rounded-xl bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>

          {/* Agreement checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 accent-brand w-4 h-4"
            />
            <span className="text-sm text-text-secondary">
              {t('checkboxLabel')}
            </span>
          </label>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !agreed || !signatoryName.trim()}
            className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-text-primary font-bold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {submitting && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {submitting ? t('signingButton') : t('signButton')}
          </button>
        </form>
      )}

      {/* Download button (always visible) */}
      {alreadySigned && (
        <div className="mt-4 text-center">
          <a
            href={`/api/agreements/pdf?type=${agreementType}&locale=${locale}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
          >
            <FileDown className="w-4 h-4" />
            {t('downloadPdfButton')}
          </a>
        </div>
      )}
    </div>
  )
}
