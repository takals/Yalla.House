'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

type ErrorCode = 'invalid_link' | 'expired_link' | 'already_used' | 'auth_failed' | 'invalid_email' | 'unknown'

const errorMessages: Record<ErrorCode, { titleKey: string; messageKey: string }> = {
  invalid_link: { titleKey: 'errorInvalidLink', messageKey: 'errorInvalidLink' },
  expired_link: { titleKey: 'errorExpiredLink', messageKey: 'errorExpiredLink' },
  already_used: { titleKey: 'errorAlreadyUsed', messageKey: 'errorAlreadyUsed' },
  auth_failed: { titleKey: 'errorAuthFailed', messageKey: 'errorAuthFailed' },
  invalid_email: { titleKey: 'errorInvalidEmail', messageKey: 'errorInvalidEmail' },
  unknown: { titleKey: 'errorAuthFailed', messageKey: 'errorAuthFailed' },
}

export default function AuthErrorPage() {
  const t = useTranslations('auth')
  const searchParams = useSearchParams()
  const errorCode = (searchParams.get('code') || 'unknown') as ErrorCode

  const messages = errorMessages[errorCode] || errorMessages.unknown

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium">
            ← Back to home
          </Link>
        </div>

        <div className="bg-surface rounded-card p-8 shadow-sm border border-red-200">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-text-primary text-center">
            Sign In Failed
          </h1>
          <p className="text-text-secondary text-center mb-6">
            {t(messages.messageKey)}
          </p>

          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="block w-full bg-brand hover:bg-brand-hover text-white font-bold py-3 rounded-lg transition-colors text-center"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="block w-full bg-bg-soft hover:bg-bg-muted text-text-primary font-bold py-3 rounded-lg transition-colors text-center border border-border"
            >
              Back to Home
            </Link>
          </div>

          <p className="text-xs text-text-muted mt-4 text-center">
            Error code: {errorCode}
          </p>
        </div>
      </div>
    </div>
  )
}
