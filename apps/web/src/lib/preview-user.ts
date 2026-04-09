/**
 * Preview phase helper.
 *
 * During the public preview, the dashboards are open to anyone — there is
 * no auth gate. When a visitor is not signed in, server components still
 * call `supabase.auth.getUser()` and then fall back to this sentinel UUID.
 *
 * Because no real `users` row has this id, every Supabase query scoped by
 * `user_id` / `owner_id` etc. will return zero rows, and the dashboard
 * renders its empty state. Once we re-introduce an auth gate, swap this
 * back for a `redirect('/auth/login')` in the role layouts.
 */
export const PREVIEW_USER_ID = '00000000-0000-0000-0000-000000000000'
export const PREVIEW_USER_EMAIL = 'preview@yalla.house'
