'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

/** Set a same-site cookie so the server-side callback can read the return URL.
 *  This survives the full redirect chain (Supabase → Google/email → callback).
 *  Max-age 10 min — more than enough for any auth flow. */
function setAuthReturnCookie(path: string) {
  document.cookie = `yalla_auth_return=${encodeURIComponent(path)};path=/;max-age=600;SameSite=Lax`
}

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

    // Always persist the return URL in a cookie so the server-side
    // callback has it even if Supabase strips the query param.
    if (next && next !== '/hunter') {
      setAuthReturnCookie(next)
    }
  }, [errorParam, t, next])

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

    // Persist return URL in cookie (belt-and-suspenders with query param)
    setAuthReturnCookie(next)
    localStorage.setItem('yalla_auth_return', next)

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
            {t('backToHome')}
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
                {t('emailLabel')}
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
                      {t('clearSavedEmail')}
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

          {/* Social login divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">{t('orContinueWith')}</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={async () => {
                const supabase = createClient()
                setAuthReturnCookie(next)
                localStorage.setItem('yalla_auth_return', next)
                await supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: { redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}` },
                })
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg hover:bg-bg transition-colors text-sm font-medium text-text-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button
              type="button"
              onClick={async () => {
                const supabase = createClient()
                setAuthReturnCookie(next)
                localStorage.setItem('yalla_auth_return', next)
                await supabase.auth.signInWithOAuth({
                  provider: 'facebook',
                  options: { redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}` },
                })
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-lg hover:bg-bg transition-colors text-sm font-medium text-text-primary"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
          </div>

          <p className="text-xs text-text-muted mt-4 text-center">
            {t('noAccountYet')}
          </p>
        </div>
      </div>
    </div>
  )
}
