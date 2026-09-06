import { createServiceClient } from '@/lib/supabase/server'

/**
 * Contact aliases — the Red Thread non-negotiable made concrete.
 *
 * Every published listing gets an address like l-xxxx-direct@in.yalla.house.
 * Portal feeds carry the alias, never the owner's real contact, so every
 * enquiry from every portal lands in the Yalla inbox with its source attached.
 * The address itself identifies listing + portal; nothing is parsed from bodies.
 *
 * Issued at first publish. Idempotent: the DB function returns the existing
 * active alias if there is one. Never throws — publishing must not fail
 * because aliasing did.
 */
export async function ensureContactAlias(
  listingId: string,
  targetUserId: string,
  portalId: string | null = null,
): Promise<string | null> {
  try {
    const db = createServiceClient()
    const { data, error } = await (db.rpc as any)('issue_contact_alias', {
      p_listing_id: listingId,
      p_target_user_id: targetUserId,
      p_portal_id: portalId,
    })
    if (error) { console.error('[contact-alias] issue failed:', error.message); return null }
    return (data?.alias_email as string | undefined) ?? null
  } catch (e) {
    console.error('[contact-alias] issue threw:', e)
    return null
  }
}

/** The listing's direct (non-portal) alias, or null if none has been issued. */
export async function getContactAlias(listingId: string): Promise<string | null> {
  try {
    const db = createServiceClient()
    const { data } = await (db.from('contact_aliases') as any)
      .select('alias_email')
      .eq('listing_id', listingId)
      .is('portal_id', null)
      .eq('is_active', true)
      .maybeSingle()
    return (data?.alias_email as string | undefined) ?? null
  } catch {
    return null
  }
}
