'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

export interface MipState {
  success?: boolean
  error?: string
  authRequired?: true
}

/**
 * Saves a hunter's mortgage-in-principle details.
 *
 * Writes go through save_hunter_mip() with the service client, scoped to the
 * authenticated user. buyer_verifications deliberately has no user-level UPDATE
 * policy, and the function itself rejects any document path outside the user's
 * own storage prefix.
 *
 * referral_consent is a separate, explicit opt-in. Introducing a hunter to a
 * mortgage partner is a marketing introduction to a third party, which is
 * consent under GDPR, not legitimate interest. Never infer it from an upload.
 */
export async function saveMipAction(_prev: MipState, formData: FormData): Promise<MipState> {
  const auth = await requireAuth()
  if (!auth.authenticated) return { authRequired: true }

  const lender = ((formData.get('mip_lender') as string) ?? '').trim().slice(0, 120)
  const amountRaw = (formData.get('mip_amount') as string) ?? ''
  const currency = ((formData.get('mip_currency') as string) || 'GBP').toUpperCase().slice(0, 3)
  const issued = (formData.get('mip_issued_at') as string) || null
  const expires = (formData.get('mip_expires_at') as string) || null
  const docPath = ((formData.get('mip_document_path') as string) || '').trim() || null
  const consent = formData.get('referral_consent') === 'on'

  if (!lender) return { error: 'lenderRequired' }
  const amountMajor = Number(amountRaw.replace(/[^0-9.]/g, ''))
  if (!Number.isFinite(amountMajor) || amountMajor <= 0) return { error: 'amountInvalid' }
  if (!['GBP', 'EUR'].includes(currency)) return { error: 'currencyInvalid' }
  if (expires && issued && expires < issued) return { error: 'datesInvalid' }
  if (docPath && !docPath.startsWith(`${auth.userId}/`)) return { error: 'documentInvalid' }

  const db = createServiceClient()
  const { error } = await (db.rpc as any)('save_hunter_mip', {
    p_user_id: auth.userId,
    p_lender: lender,
    p_amount_minor: Math.round(amountMajor * 100),
    p_currency: currency,
    p_issued_at: issued,
    p_expires_at: expires,
    p_document_path: docPath,
    p_referral_consent: consent,
  })
  if (error) {
    console.error('saveMipAction:', error.message)
    return { error: 'saveFailed' }
  }

  revalidatePath('/hunter/overview')
  revalidatePath('/hunter/verification')
  return { success: true }
}
