'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isEnglish = locale === 'en'

  return {
    title: isEnglish ? 'Sign In | Yalla.House' : 'Anmelden | Yalla.House',
    description: isEnglish
      ? 'Sign in to your owner, home hunter, or agent dashboard.'
      : 'Melden Sie sich in Ihrem Eigentümer-, Suchenden- oder Makler-Dashboard an.',
    openGraph: {
      type: 'website',
      title: isEnglish ? 'Sign In | Yalla.House' : 'Anmelden | Yalla.House',
      description: isEnglish
        ? 'Sign in to your owner, home hunter, or agent dashboard.'
        : 'Melden Sie sich in Ihrem Eigentümer-, Suchenden- oder Makler-Dashboard an.',
      url: isEnglish ? 'https://yalla.house/en/login' : 'https://yalla.house/login',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Yalla.House',
        },
      ],
    },
  }
}

export default function LoginPage() {
  const t = useTranslations('auth')
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/owner'

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

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

  if (sent) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="bg-surface rounded-card p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-brand rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">{t('checkEmail')}</h2>
          <p className="text-[#5E6278]">{t('magicLinkSent')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="bg-surface rounded-card p-8 max-w-sm w-full shadow-sm">
        <h1 className="text-2xl font-bold mb-6">{t('loginTitle')}</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="email">
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              className="w-full px-4 py-2.5 border border-[#E4E6EF] rounded-lg focus:outline-none focus:ring-2 focus:ring-brand text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-hover disabled:opacity-60 text-[#0F1117] font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? '...' : t('sendMagicLink')}
          </button>
        </form>
      </div>
    </div>
  )
}
