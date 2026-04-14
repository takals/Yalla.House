'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'

interface AuthGateModalProps {
  open: boolean
  onClose: () => void
  locale?: string
}

export function AuthGateModal({ open, onClose, locale = 'de' }: AuthGateModalProps) {
  const t = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      // Preserve current page so user returns here after auth
      const returnTo = window.location.pathname + window.location.search
      localStorage.setItem('yalla_auth_return', returnTo)
      // Set cookie so the server-side callback can read it
      document.cookie = `yalla_auth_return=${encodeURIComponent(returnTo)};path=/;max-age=600;SameSite=Lax`
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(returnTo)}`,
        },
      })

      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }

      setSubmitted(true)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  function handleClose() {
    setEmail('')
    setError('')
    setSubmitted(false)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-auto px-6 bg-white rounded-xl shadow-lg">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-text-primary hover:text-brand transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="pt-10 pb-8">
          {!submitted ? (
            <>
              {/* Logo/Brand */}
              <div className="mb-8 text-center">
                <div className="text-2xl font-bold text-brand mb-2">Yalla.House</div>
              </div>

              {/* Heading */}
              <h2 className="text-xl font-bold text-text-primary mb-3 text-center">
                {t('heading')}
              </h2>

              {/* Subtext */}
              <p className="text-sm text-text-secondary text-center mb-6">
                {t('subtext')}
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email input */}
                <input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                  }}
                  className="w-full px-4 py-3 bg-bg border border-brand-light rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-colors"
                  disabled={loading}
                />

                {/* Error message */}
                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-brand hover:bg-brand-hover text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('sendingMagicLink') : t('continueWithEmail')}
                </button>
              </form>

              {/* Bottom text */}
              <p className="text-xs text-text-muted text-center mt-6">
                {t('bottomText')}
              </p>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">✉️</div>
                <h2 className="text-xl font-bold text-text-primary mb-2">
                  {t('checkInbox')}
                </h2>
              </div>

              <p className="text-sm text-text-secondary text-center mb-2">
                {t('sentMessage')}
              </p>

              <p className="text-xs text-text-muted text-center font-mono bg-bg p-3 rounded-lg mb-6">
                {email}
              </p>

              <p className="text-xs text-text-muted text-center">
                {locale === 'en' ? t('didNotReceiveEN') : t('didNotReceiveDE')}
                {' '}
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setEmail('')
                  }}
                  className="text-brand hover:text-brand-hover font-semibold"
                >
                  {locale === 'en' ? t('tryAnotherEmailEN') : t('tryAnotherEmailDE')}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
