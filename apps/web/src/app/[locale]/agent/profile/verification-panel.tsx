'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ShieldAlert, ShieldCheck, FileUp, Loader2, Mail, ChevronDown } from 'lucide-react'

type VProps = {
  canInstant: boolean
  accountEmail: string | null
  lastReason?: string | null
}

export function VerificationPanel({ canInstant, accountEmail, lastReason }: VProps) {
  const t = useTranslations('agentProfile')
  const router = useRouter()

  const [busy, setBusy] = useState<null | 'instant' | 'send' | 'confirm' | 'doc'>(null)
  const [error, setError] = useState<string | null>(null)
  const [approved, setApproved] = useState(false)

  // company-email OTP state
  const [email, setEmail] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [code, setCode] = useState('')

  // document fallback state
  const [showDoc, setShowDoc] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [licence, setLicence] = useState('')
  const [docReason, setDocReason] = useState<string | null>(null)

  function done() {
    setApproved(true)
    setTimeout(() => router.refresh(), 1500)
  }

  async function verifyInstant() {
    setBusy('instant'); setError(null)
    try {
      const res = await fetch('/api/agent/verify-email/instant', { method: 'POST' })
      const data = await res.json()
      if (data.status === 'approved') return done()
      setError(data.error === 'domain_mismatch' ? t('verifyDomainMismatch') : (data.error ?? t('verifyError')))
    } catch { setError(t('verifyError')) } finally { setBusy(null) }
  }

  async function sendCode() {
    if (!email.trim()) { setError(t('verifyEnterEmail')); return }
    setBusy('send'); setError(null)
    try {
      const res = await fetch('/api/agent/verify-email/start', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (data.sent) { setCodeSent(true); return }
      setError(data.error === 'free_email' ? t('verifyFreeEmail') : (data.error ?? t('verifyError')))
    } catch { setError(t('verifyError')) } finally { setBusy(null) }
  }

  async function confirmCode() {
    if (!/^\d{6}$/.test(code.trim())) { setError(t('verifyEnterCode')); return }
    setBusy('confirm'); setError(null)
    try {
      const res = await fetch('/api/agent/verify-email/confirm', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      })
      const data = await res.json()
      if (data.status === 'approved') return done()
      setError(data.error ?? t('verifyError'))
    } catch { setError(t('verifyError')) } finally { setBusy(null) }
  }

  async function submitDoc() {
    const file = fileRef.current?.files?.[0]
    if (!file) { setError(t('verifyNoFile')); return }
    setBusy('doc'); setError(null); setDocReason(null)
    try {
      const fd = new FormData()
      fd.append('document', file)
      if (licence.trim()) fd.append('licence_number', licence.trim())
      const res = await fetch('/api/agent/verify', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? t('verifyError')); return }
      if (data.status === 'approved') return done()
      setDocReason(data.reason ?? t('verifyRetryHint'))
    } catch { setError(t('verifyError')) } finally { setBusy(null) }
  }

  if (approved) {
    return (
      <div className="mb-6 rounded-2xl border border-green-300 bg-green-50 p-6 flex items-start gap-4">
        <ShieldCheck size={24} className="text-green-700 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-green-900 mb-1">{t('verifyApprovedTitle')}</h3>
          <p className="text-sm text-green-800">{t('verifyApprovedBody')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-2xl border-2 border-brand bg-brand-solid-bg p-6">
      <div className="flex items-start gap-3 mb-5">
        <ShieldAlert size={22} className="text-brand flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-text-primary">{t('verifyGateTitle')}</h3>
          <p className="text-sm text-text-secondary mt-1">{t('verifyGateBody')}</p>
        </div>
      </div>

      {/* PRIMARY: company email */}
      <div className="bg-white rounded-xl border border-border-default p-5">
        <div className="flex items-center gap-2 mb-3">
          <Mail size={16} className="text-brand" />
          <h4 className="font-bold text-sm text-text-primary">{t('verifyEmailTitle')}</h4>
        </div>

        {canInstant && accountEmail ? (
          <>
            <p className="text-sm text-text-secondary mb-4">{t('verifyInstantBody')} <span className="font-semibold text-text-primary">{accountEmail}</span></p>
            <button
              onClick={verifyInstant}
              disabled={busy !== null}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-bold text-sm rounded-lg transition-colors"
            >
              {busy === 'instant' && <Loader2 size={15} className="animate-spin" />}
              {t('verifyInstantButton')}
            </button>
          </>
        ) : !codeSent ? (
          <>
            <p className="text-sm text-text-secondary mb-3">{t('verifyEmailBody')}</p>
            <div className="flex flex-wrap gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t('verifyEmailPlaceholder')}
                className="flex-1 min-w-[220px] bg-white border border-border-default rounded-lg px-3 py-2.5 text-sm"
              />
              <button
                onClick={sendCode}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-bold text-sm rounded-lg transition-colors"
              >
                {busy === 'send' && <Loader2 size={15} className="animate-spin" />}
                {t('verifySendCode')}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-text-secondary mb-3">{t('verifyCodeSent')} <span className="font-semibold text-text-primary">{email}</span></p>
            <div className="flex flex-wrap gap-2">
              <input
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-32 bg-white border border-border-default rounded-lg px-3 py-2.5 text-sm tracking-[4px] font-semibold"
              />
              <button
                onClick={confirmCode}
                disabled={busy !== null}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-bold text-sm rounded-lg transition-colors"
              >
                {busy === 'confirm' && <Loader2 size={15} className="animate-spin" />}
                {t('verifyConfirm')}
              </button>
              <button
                onClick={() => { setCodeSent(false); setCode(''); setError(null) }}
                className="px-3 py-2.5 text-sm text-text-secondary hover:text-text-primary"
              >
                {t('verifyUseDifferent')}
              </button>
            </div>
          </>
        )}
      </div>

      {/* SECONDARY: document upload (AI) */}
      <button
        onClick={() => setShowDoc(v => !v)}
        className="mt-4 flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
      >
        <ChevronDown size={15} className={showDoc ? 'rotate-180 transition-transform' : 'transition-transform'} />
        {t('verifyDocToggle')}
      </button>

      {showDoc && (
        <div className="mt-3 bg-white rounded-xl border border-border-default p-5">
          <p className="text-sm text-text-secondary mb-4">{t('verifyDocBody')}</p>
          {docReason && (
            <div className="bg-brand-solid-bg border border-brand-light rounded-lg px-4 py-3 mb-4 text-sm text-text-primary">
              <span className="font-semibold">{t('verifyFailedTitle')}</span> {docReason} <span className="text-text-secondary">{t('verifyRetryHint')}</span>
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">{t('verifyLicenceLabel')}</label>
              <input
                type="text" value={licence} onChange={e => setLicence(e.target.value)}
                placeholder={t('verifyLicencePlaceholder')}
                className="w-full bg-white border border-border-default rounded-lg px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">{t('verifyUploadLabel')}</label>
              <button
                type="button" onClick={() => fileRef.current?.click()}
                className="w-full bg-white border border-dashed border-brand rounded-lg px-3 py-2.5 text-sm text-left text-text-secondary hover:bg-brand-light transition-colors flex items-center gap-2"
              >
                <FileUp size={15} className="text-brand flex-shrink-0" />
                <span className="truncate">{fileName ?? t('verifyUploadPlaceholder')}</span>
              </button>
              <input
                ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden"
                onChange={e => setFileName(e.target.files?.[0]?.name ?? null)}
              />
            </div>
          </div>
          <button
            onClick={submitDoc} disabled={busy !== null}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-bold text-sm rounded-lg transition-colors"
          >
            {busy === 'doc' && <Loader2 size={15} className="animate-spin" />}
            {busy === 'doc' ? t('verifyChecking') : t('verifyButton')}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
      {(lastReason && !docReason && !error) && (
        <p className="text-xs text-text-secondary mt-3">{t('verifyPrivacyNote')}</p>
      )}
      {!lastReason && <p className="text-xs text-text-secondary mt-3">{t('verifyPrivacyNote')}</p>}
    </div>
  )
}
