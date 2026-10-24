import { createServiceClient } from '@/lib/supabase/server'

/**
 * Join the two halves of the provider model at sign-in.
 *
 * `/providers/join` writes a `providers` row. The dashboard and the job router
 * read `partner_profiles`. Nothing connected them, so a provider signup
 * produced a row nothing read: no account, no dashboard, no jobs — the form
 * said "we'll email you" and that was the end of it.
 *
 * This closes the loop. When someone signs in, any unclaimed `providers` row
 * carrying their email becomes theirs: the row is stamped, the partner role is
 * granted, and `partner_profiles` is seeded with the services and postcodes
 * they already gave us. They arrive on a dashboard that knows who they are.
 *
 * Security model: email control is the proof. The magic link proves they hold
 * the inbox, and the row is only taken if it is unclaimed and the address
 * matches exactly. Same model as the agent directory claim.
 *
 * Best-effort throughout — a provider claim must never stop someone signing
 * in. Every failure is logged and swallowed.
 */
export async function claimProviderProfile(userId: string, email: string | null | undefined): Promise<void> {
  const addr = email?.trim().toLowerCase()
  if (!addr) return

  try {
    const db = createServiceClient()

    // Already a partner? Nothing to claim onto.
    const { data: existingProfile } = await (db.from('partner_profiles') as any)
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    if (existingProfile) return

    const { data: provider } = await (db.from('providers') as any)
      .select('id, business_name')
      .ilike('email', addr)
      .is('user_id', null)
      .is('claimed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (!provider) return

    // Take the row. The `is` guards make a double-claim a no-op rather than a
    // race — two tabs finishing the same magic link would otherwise both win.
    const { error: claimError } = await (db.from('providers') as any)
      .update({ user_id: userId, claimed_at: new Date().toISOString() })
      .eq('id', provider.id)
      .is('user_id', null)
      .is('claimed_at', null)
    if (claimError) {
      console.error('claimProviderProfile claim error:', claimError)
      return
    }

    // Services they signed up to offer, translated from category ids to the
    // slugs partner_profiles.service_types and the router both speak.
    const { data: links } = await (db.from('provider_services') as any)
      .select('category_id')
      .eq('provider_id', provider.id)
    const categoryIds = ((links ?? []) as { category_id: string }[]).map(l => l.category_id)

    let serviceTypes: string[] = []
    if (categoryIds.length > 0) {
      const { data: cats } = await (db.from('service_categories') as any)
        .select('slug')
        .in('id', categoryIds)
      serviceTypes = ((cats ?? []) as { slug: string }[]).map(c => c.slug)
    }

    const { data: areas } = await (db.from('provider_coverage_areas') as any)
      .select('postcode_prefix')
      .eq('provider_id', provider.id)
    const prefixes = Array.from(new Set(
      ((areas ?? []) as { postcode_prefix: string }[])
        .map(a => (a.postcode_prefix ?? '').trim().toUpperCase())
        .filter(Boolean)
    ))

    // Shape must match what route-service-request reads.
    const { error: profileError } = await (db.from('partner_profiles') as any).upsert(
      {
        user_id: userId,
        service_types: serviceTypes,
        coverage_areas: prefixes.length > 0 ? [{ postcode_prefixes: prefixes }] : [],
      },
      { onConflict: 'user_id' }
    )
    if (profileError) console.error('claimProviderProfile profile error:', profileError)

    await (db.from('user_roles') as any).upsert(
      { user_id: userId, role: 'partner', is_active: true },
      { onConflict: 'user_id,role' }
    )
  } catch (err) {
    console.error('claimProviderProfile failed:', err)
  }
}
