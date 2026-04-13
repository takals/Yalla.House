import { createClient } from '@/lib/supabase/server'

export type AuthResult =
  | { authenticated: true; userId: string; email: string }
  | { authenticated: false; authRequired: true }

/**
 * Requires authentication for server actions that perform write operations.
 * Returns { authRequired: true } if user is not authenticated.
 *
 * Use in server actions to prevent PREVIEW_USER_ID fallback for writes.
 */
export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { authenticated: false, authRequired: true }
  }

  return { authenticated: true, userId: user.id, email: user.email ?? '' }
}
