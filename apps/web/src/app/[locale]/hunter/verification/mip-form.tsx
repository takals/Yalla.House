'use client'

import { useRef, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { useAuthGate } from '@/components/auth-gate-provider'
import { useAuthAction } from '@/lib/use-auth-action'
import { saveMipAction, type MipState } from './actions'

export interface MipInitial {
  lender: string | null
  amountMinor: number | null
  currency: string | null
  issuedAt: string | null
  expiresAt: string | null
  documentPath: string | null
  verifiedAt: string | null
  referralConsent: boolean
}

const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp'
const MAX_BYTES = 10 * 1024 * 1024

export function MipForm({ initial, userId }: { initial: MipInitial | null; userId: string | null }) {
  const t = useTranslations('hunterVerification')
  const { isAuthenticated, showAuthGate } = useAuthGate()
  const { handleAuthRequired } = useAuthAction()
  const [state, setState] = useState<MipState>({})
  const [isPending, startTransition] = useTransition()

  const [lender, setLender] = useState(initial?.lender ?? '')
  const [amount, setAmount] = useState(initial?.amountMinor ? String(Math.round(initial.amountMinor / 100)) : '')
  const [currency, setCurrency] = useState(initial?.currency ?? 'GBP')
  const [issuedAt, setIssuedAt] = useState(initial?.issuedAt ?? '')
  const [expiresAt, setExpiresAt] = useState(initial?.expiresAt ?? '')
  const [documentPath, setDocumentPath] = useState(initial?.documentPath ?? '')
  const [consent, setConsent] = useState(initial?.referralConsent ?? false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Uploading is the first "real action" — it is where a guest meets sign-in.
  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    if (!isAuthenticated || !userId) { showAuthGate(); e.target.value = ''; return }
    if (file.size > MAX_BYTES) { setUploadError(t('errTooLarge')); e.target.value = ''; return }

    setUploading(true)
    try {
      const ext = (file.name.split('.').pop() ?? 'pdf').toLowerCase().replace(/[^a-z0-9]/g, '') || 'pdf'
      // Own prefix only: the storage policy and save_hunter_mip both enforce it.
      const path = `${userId}/mip-${Date.now()}.${ext}`
      const supabase = createClient()
      const { error } = await supabase.storage
        .from('hunter-verification')
        .upload(path, file, { contentType: file.type, upsert: false })
      if (error) throw error
      setDocumentPath(path)
    } catch (err) {
      console.error('MIP upload failed', err)
      setUploadError(t('errUploadFailed'))
      e.target.value = ''
    } finally {
      setUploading(false)
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await saveMipAction({}, fd)
      if (handleAuthRequired(result)) return
      setState(result)
    })
  }

  const inputCls = 'w-full border border-border-default rounded-lg px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-brand'
  const labelCls = 'block text-xs font-medium text-text-secondary mb-1'

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="mip_document_path" value={documentPath} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="mip_lender">{t('lender')}</label>
          <input id="mip_lender" name="mip_lender" value={lender} onChange={e => setLender(e.target.value)}
                 className={inputCls} placeholder={t('lenderPlaceholder')} required maxLength={120} />
        </div>
        <div>
          <label className={labelCls} htmlFor="mip_amount">{t('amount')}</label>
          <div className="flex gap-2">
            <select name="mip_currency" value={currency} onChange={e => setCurrency(e.target.value)}
                    className={`${inputCls} w-24 flex-none`} aria-label={t('currency')}>
              <option value="GBP">GBP</option>
              <option value="EUR">EUR</option>
            </select>
            <input id="mip_amount" name="mip_amount" inputMode="numeric" value={amount}
                   onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                   className={inputCls} placeholder="350000" required />
          </div>
        </div>
        <div>
          <label className={labelCls} htmlFor="mip_issued_at">{t('issuedAt')}</label>
          <input id="mip_issued_at" name="mip_issued_at" type="date" value={issuedAt}
                 onChange={e => setIssuedAt(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="mip_expires_at">{t('expiresAt')}</label>
          <input id="mip_expires_at" name="mip_expires_at" type="date" value={expiresAt}
                 onChange={e => setExpiresAt(e.target.value)} className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="mip_file">{t('document')}</label>
        <input id="mip_file" ref={fileRef} type="file" accept={ACCEPT} onChange={onFileChange}
               className="block w-full text-sm text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-brand-hover" />
        <p className="mt-1 text-xs text-text-muted">{t('documentHint')}</p>
        {uploading && <p className="mt-1 text-xs text-text-secondary">{t('uploading')}</p>}
        {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
        {documentPath && !uploading && (
          <p className="mt-1 text-xs text-green-700">
            {initial?.verifiedAt && documentPath === initial.documentPath ? t('documentVerified') : t('documentAttached')}
          </p>
        )}
      </div>

      <label className="flex items-start gap-3 rounded-lg border border-border-default bg-hover-bg p-4 cursor-pointer">
        <input type="checkbox" name="referral_consent" checked={consent} onChange={e => setConsent(e.target.checked)}
               className="mt-0.5 h-4 w-4 accent-brand" />
        <span className="text-sm">
          <span className="font-medium text-text-primary">{t('consentTitle')}</span>
          <span className="block text-text-secondary mt-0.5">{t('consentBody')}</span>
        </span>
      </label>

      {state.error && <p className="text-sm text-red-600">{t(`err_${state.error}` as any)}</p>}
      {state.success && <p className="text-sm text-green-700">{t('saved')}</p>}

      <button type="submit" disabled={isPending || uploading}
              className="inline-flex items-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60">
        {isPending ? t('saving') : t('save')}
      </button>
    </form>
  )
}
