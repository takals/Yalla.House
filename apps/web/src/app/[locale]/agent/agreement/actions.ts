'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { redirect } from 'next/navigation'

const AGREEMENT_VERSION = '1.0'

export async function signAgreementAction(data: { signatoryName: string }) {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  if (!data.signatoryName.trim()) {
    return { error: 'Please enter your full name.' }
  }

  const supabase = await createClient()
  // Upsert — agent might not have a profile row yet
  const { error } = await (supabase as any)
    .from('agent_profiles')
    .upsert(
      {
        user_id: auth.userId,
        partner_agreement_signed_at: new Date().toISOString(),
        partner_agreement_version: AGREEMENT_VERSION,
      },
      { onConflict: 'user_id' }
    )

  if (error) {
    console.error('Failed to sign agreement:', error)
    return { error: 'Failed to save. Please try again.' }
  }

  redirect('/agent')
}
