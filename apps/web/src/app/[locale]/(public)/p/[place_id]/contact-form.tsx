'use client'

import { useState } from 'react'
import { requestViewingAction } from './actions'

export function ContactCard({
  listingId,
  locale,
}: {
  listingId: string
  locale: string
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isDE = locale === 'de'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const result = await requestViewingAction(listingId, {
      name,
      email,
      ...(phone ? { phone } : {}),
      ...(message ? { message } : {}),
    })

    setSubmitting(false)

    if ('error' in result) {
      setError(result.error)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <div className="bg-surface rounded-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-[#0F1117]">
              {isDE ? 'Vielen Dank!' : 'Thank you!'}
            </p>
            <p className="text-sm text-[#5E6278] mt-1">
              {isDE
                ? 'Der Eigentümer meldet sich in Kürze bei Ihnen.'
                : 'The owner will be in touch with you shortly.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-card p-6 shadow-sm">
      <h2 className="text-lg font-bold text-[#0F1117] mb-4">
        {isDE ? 'Besichtigung anfragen' : 'Request a viewing'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-[#5E6278] mb-1">
            {isDE ? 'Name' : 'Name'} *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={isDE ? 'Ihr Name' : 'Your name'}
            className="w-full px-3 py-2 text-sm border border-[#E2E4EB] rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#5E6278] mb-1">
            {isDE ? 'E-Mail' : 'Email'} *
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={isDE ? 'ihre@email.de' : 'your@email.com'}
            className="w-full px-3 py-2 text-sm border border-[#E2E4EB] rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#5E6278] mb-1">
            {isDE ? 'Telefon' : 'Phone'} <span className="font-normal text-[#999999]">({isDE ? 'optional' : 'optional'})</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+49 ..."
            className="w-full px-3 py-2 text-sm border border-[#E2E4EB] rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#5E6278] mb-1">
            {isDE ? 'Nachricht' : 'Message'} <span className="font-normal text-[#999999]">({isDE ? 'optional' : 'optional'})</span>
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={isDE ? 'Ihre Nachricht an den Eigentümer …' : 'Your message to the owner…'}
            className="w-full px-3 py-2 text-sm border border-[#E2E4EB] rounded-lg bg-bg focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-[#0F1117] font-bold py-2.5 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {isDE ? 'Anfrage senden' : 'Send request'}
        </button>
      </form>
    </div>
  )
}
