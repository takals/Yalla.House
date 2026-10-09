import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role client that is safe to import from middleware (Edge runtime).
 *
 * `@/lib/supabase/server` pulls in next/headers at module scope, which is not
 * available in middleware. This one has no such dependency. It is service-role
 * because the security_* tables have RLS enabled with no policies and no
 * anon/authenticated GRANTs — deliberately (see CLAUDE.md).
 */
let cached: SupabaseClient | null = null

export function edgeServiceClient(): SupabaseClient {
  if (cached) return cached
  cached = createClient(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['SUPABASE_SERVICE_ROLE_KEY']!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
  return cached
}
