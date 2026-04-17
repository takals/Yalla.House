'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

interface Props {
  categories: { value: string; label: string }[]
  translations: Record<string, string>
}

export function ProviderJoinForm({ categories, translations: t }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    businessName: '',
    email: '',
    phone: '',
    website: '',
    categoryId: '',
    areas: '',
    accreditation: '',
    accreditationRef: '',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/providers/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setSubmitted(true)
      }
    } catch {
      // Silently fail for now — we'll add error handling later
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

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-bold text-white mb-6">{t.formTitle}</h3>

      <div className="space-y-4">
        {/* Business Name */}
        <div>
          <label className="block text-xs font-semibold text-text-on-dark-muted uppercase tracking-wider mb-1.5">
            {t.formBusinessName}
          </label>
          <input
            type="text"
            required
            value={form.businessName}
            onChange={e => update('businessName', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-text-on-dark-muted uppercase tracking-wider mb-1.5">
            {t.formEmail}
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={e => update('email', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-semibold text-text-on-dark-muted uppercase tracking-wider mb-1.5">
            {t.formPhone}
          </label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={e => update('phone', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Website */}
        <div>
          <label className="block text-xs font-semibold text-text-on-dark-muted uppercase tracking-wider mb-1.5">
            {t.formWebsite}
          </label>
          <input
            type="url"
            value={form.website}
            onChange={e => update('website', e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-text-on-dark-muted uppercase tracking-wider mb-1.5">
            {t.formCategory}
          </label>
          <select
            required
            value={form.categoryId}
            onChange={e => update('categoryId', e.target.value)}
            className={inputClass}
          >
            <option value="" disabled>—</option>
            {categories.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Coverage Areas */}
        <div>
          <label className="block text-xs font-semibold text-text-on-dark-muted uppercase tracking-wider mb-1.5">
            {t.formAreas}
          </label>
          <input
            type="text"
            required
            value={form.areas}
            onChange={e => update('areas', e.target.value)}
            placeholder="E1, E7, IG1..."
            className={inputClass}
          />
        </div>

        {/* Accreditation */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-text-on-dark-muted uppercase tracking-wider mb-1.5">
              {t.formAccreditation}
            </label>
            <input
              type="text"
              value={form.accreditation}
              onChange={e => update('accreditation', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-text-on-dark-muted uppercase tracking-wider mb-1.5">
              {t.formAccreditationRef}
            </label>
            <input
              type="text"
              value={form.accreditationRef}
              onChange={e => update('accreditationRef', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full mt-6 bg-brand hover:bg-brand-hover text-white font-semibold px-6 py-3 rounded-lg transition-[background-color] duration-300 text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {submitting ? t.formSubmitting : t.formSubmit}
      </button>
    </form>
  )
}
