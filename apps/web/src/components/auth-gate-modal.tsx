'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'

interface AuthGateModalProps {
  open: boolean
  onClose: () => void
  locale?: string
}

const translations = {
  de: {
    heading: 'Konto erstellen oder anmelden',
    subtext: 'Um deine Daten zu speichern, erstelle ein kostenloses Konto oder melde dich an.',
    emailPlaceholder: 'deine@email.com',
    submitButton: 'Weiter mit E-Mail',
    bottomText: 'Wir senden dir einen Magic Link — kein Passwort nötig.',
    checkInbox: 'Prüfe dein Postfach',
    sentMessage: 'Wir haben einen Magic Link an deine E-Mail gesendet.',
  },
  en: {
    heading: 'Create an account or sign in',
    subtext: 'To save your data, create a free account or sign in.',
    emailPlaceholder: 'your@email.com',
    submitButton: 'Continue with Email',
    bottomText: 'We\'ll send you a magic link — no password needed.',
    checkInbox: 'Check your inbox',
    sentMessage: 'We\'ve sent a magic link to your email.',
  },
}

export function AuthGateModal({ open, onClose, locale = 'de' }: AuthGateModalProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const lang = (locale === 'en' ? translations.en : translations.de)

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
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
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
                {lang.heading}
              </h2>

              {/* Subtext */}
              <p className="text-sm text-text-secondary text-center mb-6">
                {lang.subtext}
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email input */}
                <input
                  type="email"
                  placeholder={lang.emailPlaceholder}
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
                  {loading ? 'Wird gesendet...' : lang.submitButton}
                </button>
              </form>

              {/* Bottom text */}
              <p className="text-xs text-text-muted text-center mt-6">
                {lang.bottomText}
              </p>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="text-center mb-8">
                <div className="text-5xl mb-4">✉️</div>
                <h2 className="text-xl font-bold text-text-primary mb-2">
                  {lang.checkInbox}
                </h2>
              </div>

              <p className="text-sm text-text-secondary text-center mb-2">
                {lang.sentMessage}
              </p>

              <p className="text-xs text-text-muted text-center font-mono bg-bg p-3 rounded-lg mb-6">
                {email}
              </p>

              <p className="text-xs text-text-muted text-center">
                {locale === 'en'
                  ? 'Didn\'t receive it? Check your spam folder or'
                  : 'Erhalten nicht? Prüfe deinen Spam-Ordner oder'}
                {' '}
                <button
                  onClick={() => {
                    setSubmitted(false)
                    setEmail('')
                  }}
                  className="text-brand hover:text-brand-hover font-semibold"
                >
                  {locale === 'en' ? 'try another email' : 'versuche eine andere E-Mail'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
