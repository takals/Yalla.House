'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { countryFromLocale } from '@/lib/detect-country'
import { redirect } from 'next/navigation'

/** Unambiguous alphabet — no 0/O, 1/I/L, so codes survive being read aloud. */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 8

function generateCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('')
}

/**
 * Join the referral programme: create the referrer record and hand back a
 * sharing code. Idempotent — someone who is already a referrer just lands on
 * their dashboard.
 */
export async function joinReferralProgramAction(
  locale: string
): Promise<{ error: string } | { authRequired: true }> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  const supabase = await createClient()
  const countryCode = countryFromLocale(locale)

  // Already a referrer — nothing to create.
  const { data: existing } = await (supabase.from('referrers') as any)
    .select('id')
    .eq('user_id', auth.userId)
    .maybeSingle()

  if (existing) {
    redirect('/referrer')
  }

  // Ensure the public.users row exists — referrers.user_id references it.
  await (supabase.from('users') as any).upsert(
    { id: auth.userId, email: auth.email, country_code: countryCode, language: locale },
    { onConflict: 'id', ignoreDuplicates: true }
  )

  // Codes are unique; retry a few times in the vanishingly unlikely case of a
  // collision rather than handing the user an error.
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await (supabase.from('referrers') as any).insert({
      user_id: auth.userId,
      referrer_code: generateCode(),
      type: 'organic',
      country_code: countryCode,
      status: 'active',
    })

    if (!error) {
      redirect('/referrer')
    }

    const isCollision =
      error.message?.includes('duplicate') || error.message?.includes('unique')
    if (!isCollision) {
      console.error('Referral programme join failed:', error)
      return { error: 'Could not create your referral code. Please try again.' }
    }
  }

  return { error: 'Could not create your referral code. Please try again.' }
}
