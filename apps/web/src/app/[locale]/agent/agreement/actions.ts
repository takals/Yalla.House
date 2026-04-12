'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PREVIEW_USER_ID } from '@/lib/preview-user'

const AGREEMENT_VERSION = '1.0'

export async function signAgreementAction(data: { signatoryName: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  if (!data.signatoryName.trim()) {
    return { error: 'Please enter your full name.' }
  }

  // Upsert — agent might not have a profile row yet
  const { error } = await (supabase as any)
    .from('agent_profiles')
    .upsert(
      {
        user_id: userId,
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
