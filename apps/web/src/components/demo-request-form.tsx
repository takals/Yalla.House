'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface DemoFormTranslations {
  formTitle: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  role: string
  roleOwner: string
  roleHunter: string
  roleAgent: string
  roleOther: string
  message: string
  messagePlaceholder: string
  submit: string
  submitting: string
  successTitle: string
  successBody: string
  errorInvalid: string
  errorGeneric: string
  privacyNote: string
}

interface Props {
  locale: 'de' | 'en'
  translations: DemoFormTranslations
}

type Role = 'owner' | 'hunter' | 'agent' | 'other'

export function DemoRequestForm({ locale, translations: t }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    role: 'owner' as Role,
    message: '',
    website: '', // honeypot
  })

  function update<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/leads/demo-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          locale,
          market: 'DE',
        }),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const json = await res.json().catch(() => ({}))
        setError(json?.error === 'invalid_payload' ? t.errorInvalid : t.errorGeneric)
      }
    } catch {
      setError(t.errorGeneric)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{t.successTitle}</h3>
        <p className="text-sm text-text-on-dark-secondary">{t.successBody}</p>
      </div>
    )
  }

  const inputClass =
    'w-full bg-page-dark border border-white/[0.08] rounded-card-dark px-4 py-2.5 text-sm text-white placeholder:text-text-on-dark-muted focus:outline-none focus:border-brand/40 transition-[border-color] duration-200'
  const labelClass =
    'block text-xs font-semibold text-text-on-dark-muted uppercase tracking-wider mb-1.5'

  const roleOptions: { value: Role; label: string }[] = [
    { value: 'owner', label: t.roleOwner },
    { value: 'hunter', label: t.roleHunter },
    { value: 'agent', label: t.roleAgent },
    { value: 'other', label: t.roleOther },
  ]

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h3 className="text-lg font-bold text-white mb-6">{t.formTitle}</h3>

      <div className="space-y-4">
        {/* Honeypot — hidden from humans, irresistible to bots */}
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => update('website', e.target.value)}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t.firstName}</label>
            <input
              type="text"
              required
              autoComplete="given-name"
              value={form.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t.lastName}</label>
            <input
              type="text"
              autoComplete="family-name"
              value={form.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>{t.email}</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className={inputClass}
            placeholder="anna@example.com"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t.phone}</label>
            <input
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>{t.company}</label>
            <input
              type="text"
              autoComplete="organization"
              value={form.company}
              onChange={(e) => update('company', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>{t.role}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {roleOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update('role', opt.value)}
                className={[
                  'px-3 py-2.5 rounded-card-dark text-sm font-medium border transition-colors duration-200',
                  form.role === opt.value
                    ? 'bg-brand/10 border-brand/40 text-white'
                    : 'bg-page-dark border-white/[0.08] text-text-on-dark-secondary hover:border-white/20',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelClass}>{t.message}</label>
          <textarea
            rows={4}
            value={form.message}
            onChange={(e) => update('message', e.target.value)}
            className={inputClass}
            placeholder={t.messagePlaceholder}
          />
        </div>

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !form.email || !form.firstName}
          className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-card-dark transition-colors duration-200"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitting ? t.submitting : t.submit}
        </button>

        <p className="text-xs text-text-on-dark-muted text-center">{t.privacyNote}</p>
      </div>
    </form>
  )
}
