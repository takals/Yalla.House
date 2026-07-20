'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type Result = { success: true } | { error: string }

async function requireAdmin(): Promise<{ userId: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: role } = await (supabase.from('user_roles') as any)
    .select('role').eq('user_id', user.id).eq('role', 'admin').eq('is_active', true).maybeSingle()
  return role ? { userId: user.id } : null
}

/**
 * Review an inbound listing candidate.
 * approve → ready to distribute; reject → discard; distribute → sent to clients.
 */
export async function reviewListingAction(
  id: string,
  action: 'approve' | 'reject' | 'distribute'
): Promise<Result> {
  const admin = await requireAdmin()
  if (!admin) return { error: 'Not authorised.' }

  const now = new Date().toISOString()
  const patch: Record<string, unknown> = {
    reviewed_by: admin.userId,
    reviewed_at: now,
    status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'distributed',
  }
  if (action === 'distribute') patch.distributed_at = now

  const service = createServiceClient()
  const { error } = await (service.from('agent_inbound_listings') as any).update(patch).eq('id', id)
  if (error) {
    console.error('reviewListingAction error:', error)
    return { error: 'Could not update. Please try again.' }
  }
  revalidatePath('/admin/listings')
  return { success: true }
}
