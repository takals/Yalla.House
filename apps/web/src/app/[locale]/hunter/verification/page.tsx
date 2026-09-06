import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { MipForm, type MipInitial } from './mip-form'

/**
 * /hunter/verification — mortgage-in-principle capture.
 *
 * Kept separate from the AI passport intake on purpose: stating preferences and
 * proving finance are different acts, and a document upload does not belong in a
 * chat. Explore-first: guests see the form; upload and save are the actions that
 * prompt sign-in.
 */
export default async function HunterVerificationPage() {
  const t = await getTranslations('hunterVerification')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // "Users can read own verifications" policy covers this read.
  const { data: row } = await (supabase.from('buyer_verifications') as any)
    .select('mip_lender, mip_amount, mip_currency, mip_issued_at, mip_expires_at, mip_document_path, mip_verified_at, referral_consent')
    .eq('user_id', userId)
    .maybeSingle()

  const initial: MipInitial | null = row ? {
    lender: row.mip_lender ?? null,
    amountMinor: row.mip_amount ?? null,
    currency: row.mip_currency ?? null,
    issuedAt: row.mip_issued_at ?? null,
    expiresAt: row.mip_expires_at ?? null,
    documentPath: row.mip_document_path ?? null,
    verifiedAt: row.mip_verified_at ?? null,
    referralConsent: !!row.referral_consent,
  } : null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">{t('title')}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t('intro')}</p>
      </div>
      <div className="rounded-2xl border border-border-default bg-surface p-6">
        <MipForm initial={initial} userId={user?.id ?? null} />
      </div>
      <p className="text-xs text-text-muted">{t('privacyNote')}</p>
    </div>
  )
}
