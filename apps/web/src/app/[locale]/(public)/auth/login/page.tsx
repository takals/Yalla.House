'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const t = useTranslations('auth')
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get('error')
  const storedReturn = typeof window !== 'undefined' ? localStorage.getItem('yalla_auth_return') : null
  const next = searchParams.get('next') ?? storedReturn ?? '/hunter'

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSaved, setEmailSaved] = useState('')

  useEffect(() => {
    // Load previously used email from localStorage
    const saved = localStorage.getItem('yalla_last_email')
    if (saved) {
      setEmailSaved(saved)
      setEmail(saved)
    }

    // Handle error from callback
    if (errorParam) {
      setError(t('errorAuthFailed'))
    }
  }, [errorParam, t])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate email
    if (!email.trim()) {
      setError(t('errorEmailRequired'))
      setLoading(false)
      return
    }

    // Save email for next time
    localStorage.setItem('yalla_last_email', email)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  function handleClearEmail() {
    localStorage.removeItem('yalla_last_email')
    setEmailSaved('')
    setEmail('')
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="bg-surface rounded-card p-8 max-w-sm w-full text-center shadow-sm border border-border-light">
          <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center mx-auto mb-4 flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2 text-text-primary">{t('checkEmail')}</h2>
          <p className="text-text-secondary mb-6">{t('magicLinkSent')}</p>
          <button
            onClick={() => setSent(false)}
            className="text-sm text-brand hover:text-brand-hover font-medium"
          >
            {t('continueButton')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <Link href="/" className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium">
            ← Back to home
          </Link>
        </div>

        <div className="bg-surface rounded-card p-8 shadow-sm border border-border-light">
          <h1 className="text-2xl font-bold mb-6 text-text-primary">{t('loginTitle')}</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-sm"
              />
              {emailSaved && emailSaved === email && (
                <p className="text-xs text-text-secondary mt-1.5">
                  {emailSaved !== '' && (
                    <button
                      type="button"
                      onClick={handleClearEmail}
                      className="text-brand hover:text-brand-hover underline"
                    >
                      Clear saved email
                    </button>
                  )}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {loading ? t('sendingMagicLink') : t('sendMagicLink')}
            </button>
          </form>

          <p className="text-xs text-text-muted mt-4 text-center">
            No account yet? We'll create one when you sign in.
          </p>
        </div>
      </div>
    </div>
  )
}
