'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { revalidatePath } from 'next/cache'

type ActionResult = { success: true } | { error: string } | { authRequired: true }

/**
 * Claim a scraped directory profile.
 *
 * Security model: the caller only nominates a candidate row. The server
 * re-derives eligibility itself — the row must be a scraped directory entry
 * (data_source set), unclaimed, and its contact email must exactly match the
 * authenticated user's email (case-insensitive). Email control is the proof
 * of agency ownership, so the profile keeps its verified status.
 */
export async function claimAgentProfileAction(candidateId: string): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const authEmail = user?.email?.trim().toLowerCase()
  if (!authEmail) {
    return { error: 'No email on your account.' }
  }

  const service = createServiceClient()

  // The claimer must not already have a profile of their own
  const { data: existing } = await (service.from('agent_profiles') as any)
    .select('user_id')
    .eq('user_id', auth.userId)
    .maybeSingle()
  if (existing) {
    return { error: 'Your account already has an agent profile.' }
  }

  // Fetch + re-verify the candidate server-side
  const { data: candidate } = await (service.from('agent_profiles') as any)
    .select('user_id, email, data_source, claimed_at, verified_at')
    .eq('user_id', candidateId)
    .maybeSingle()

  const eligible =
    candidate &&
    candidate.data_source &&
    !candidate.claimed_at &&
    (candidate.email ?? '').trim().toLowerCase() === authEmail

  if (!eligible) {
    return { error: 'This profile can no longer be claimed.' }
  }

  // Re-point the directory row at the real account (user_id is the PK)
  const { error: updateError } = await (service.from('agent_profiles') as any)
    .update({
      user_id: auth.userId,
      claimed_at: new Date().toISOString(),
      verified_at: candidate.verified_at ?? new Date().toISOString(),
    })
    .eq('user_id', candidateId)
    .is('claimed_at', null)

  if (updateError) {
    console.error('claimAgentProfileAction error:', updateError)
    return { error: 'Error claiming. Please try again.' }
  }

  // Ensure agent role exists
  await (service.from('user_roles') as any)
    .upsert({ user_id: auth.userId, role: 'agent', is_active: true }, { onConflict: 'user_id,role' })

  revalidatePath('/agent')
  revalidatePath('/agent/profile')
  return { success: true }
}

export async function saveAgentProfileAction(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { authRequired: true }
  }

  const parseArray = (key: string): string[] => {
    try {
      const raw = formData.get(key)
      if (!raw) return []
      return JSON.parse(raw as string) as string[]
    } catch {
      return []
    }
  }

  const supabase = await createClient()

  const profileData = {
    user_id: auth.userId,
    agency_name: (formData.get('agency_name') as string) || null,
    license_number: (formData.get('license_number') as string) || null,
    property_types: parseArray('property_types'),
    focus: (formData.get('focus') as string) || 'both',
  }

  const { error } = await (supabase.from('agent_profiles') as any)
    .upsert(profileData, { onConflict: 'user_id' })

  if (error) {
    console.error('saveAgentProfileAction error:', error)
    return { error: 'Error saving. Please try again.' }
  }

  // Ensure agent role exists
  await (supabase.from('user_roles') as any)
    .upsert({ user_id: auth.userId, role: 'agent', is_active: true }, { onConflict: 'user_id,role' })

  revalidatePath('/agent')
  revalidatePath('/agent/profile')
  return { success: true }
}
