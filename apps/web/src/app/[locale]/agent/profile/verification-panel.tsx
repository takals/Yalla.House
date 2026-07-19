'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ShieldAlert, ShieldCheck, FileUp, Loader2 } from 'lucide-react'

type Result = { status: 'approved' | 'needs_review'; reason?: string } | null

export function VerificationPanel({ lastReason }: { lastReason?: string | null }) {
  const t = useTranslations('agentProfile')
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [licence, setLicence] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<Result>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    const file = fileRef.current?.files?.[0]
    if (!file) { setError(t('verifyNoFile')); return }
    setBusy(true); setError(null); setResult(null)
    try {
      const fd = new FormData()
      fd.append('document', file)
      if (licence.trim()) fd.append('licence_number', licence.trim())
      const res = await fetch('/api/agent/verify', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? t('verifyError')); return }
      setResult(data)
      if (data.status === 'approved') {
        setTimeout(() => router.refresh(), 1500)
      }
    } catch {
      setError(t('verifyError'))
    } finally {
      setBusy(false)
    }
  }

  if (result?.status === 'approved') {
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
      <div className="flex items-start gap-3 mb-4">
        <ShieldAlert size={22} className="text-brand flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-text-primary">{t('verifyGateTitle')}</h3>
          <p className="text-sm text-text-secondary mt-1">{t('verifyGateBody')}</p>
        </div>
      </div>

      {(result?.status === 'needs_review' || lastReason) && !busy && (
        <div className="bg-white border border-border-default rounded-xl px-4 py-3 mb-4 text-sm text-text-primary">
          <span className="font-semibold">{t('verifyFailedTitle')}</span>{' '}
          {result?.reason ?? lastReason}{' '}
          <span className="text-text-secondary">{t('verifyRetryHint')}</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">{t('verifyLicenceLabel')}</label>
          <input
            type="text"
            value={licence}
            onChange={e => setLicence(e.target.value)}
            placeholder={t('verifyLicencePlaceholder')}
            className="w-full bg-white border border-border-default rounded-lg px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-secondary mb-1">{t('verifyUploadLabel')}</label>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full bg-white border border-dashed border-brand rounded-lg px-3 py-2.5 text-sm text-left text-text-secondary hover:bg-brand-light transition-colors flex items-center gap-2"
          >
            <FileUp size={15} className="text-brand flex-shrink-0" />
            <span className="truncate">{fileName ?? t('verifyUploadPlaceholder')}</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={e => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <button
        onClick={submit}
        disabled={busy}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand hover:bg-brand-hover disabled:opacity-60 text-white font-bold text-sm rounded-lg transition-colors"
      >
        {busy && <Loader2 size={15} className="animate-spin" />}
        {busy ? t('verifyChecking') : t('verifyButton')}
      </button>
      <p className="text-xs text-text-secondary mt-3">{t('verifyPrivacyNote')}</p>
    </div>
  )
}
