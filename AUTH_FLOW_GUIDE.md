# Auth Flow Implementation Guide

## Overview

The Yalla.House auth system uses Supabase Auth with OTP (One-Time Password) magic links. This guide explains how the flow works and how to extend it.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  User Flow                                          │
└─────────────────────────────────────────────────────┘

User visits /auth/login
         ↓
Enters email → Click "Send Magic Link"
         ↓
Frontend: supabase.auth.signInWithOtp({
  email,
  options: { emailRedirectTo: '/api/auth/callback?next=/owner' }
})
         ↓
User receives email with magic link
         ↓
User clicks link → Browser navigates to /api/auth/callback?code=...&next=/owner
         ↓
Backend: supabase.auth.exchangeCodeForSession(code)
         ↓
✅ Session established → Redirect to /owner
❌ Error → Redirect to /auth/login?error=auth_failed
         ↓
Dashboard loads (or error page displays)
         ↓
User can logout → POST /api/auth/logout
         ↓
Session cleared → Redirect to home
```

## Key Files

### Public Pages
- **Login:** `src/app/[locale]/(public)/auth/login/page.tsx`
  - Email input form
  - OTP success confirmation
  - Error handling from callback
  - Email persistence (localStorage)

- **Error:** `src/app/[locale]/(public)/auth/error/page.tsx`
  - Displays auth errors with translations
  - Supports error codes: `invalid_link`, `expired_link`, `already_used`, `auth_failed`, `invalid_email`

### API Routes
- **Callback:** `src/app/api/auth/callback/route.ts`
  - Exchanges auth code for session
  - Creates/updates `public.users` row
  - Redirects to appropriate dashboard (or error)
  - Validates `next` param for security

- **Logout:** `src/app/api/auth/logout/route.ts`
  - Calls `supabase.auth.signOut()`
  - Clears session cookies
  - Redirects to homepage

### Components
- **DashboardShell:** `src/components/dashboard/shell.tsx`
  - Calls POST `/api/auth/logout` for sign-out

- **LogoutButton:** `src/components/logout-button.tsx`
  - Reusable component for logout action
  - Two variants: `text` (icon) and `button`

### Translations
- **English:** `messages/en.json` → `auth.*` namespace
- **German:** `messages/de.json` → `auth.*` namespace

### Middleware
- **Route Protection:** `src/middleware.ts`
  - Currently `protectedPaths = []` (all dashboards open)
  - To protect: `protectedPaths = ['/owner', '/hunter', '/agent', '/admin']`

## Translation Keys

All auth translations are under the `auth` namespace:

```json
{
  "auth": {
    "loginTitle": "Sign in to your account",
    "emailPlaceholder": "your@email.com",
    "sendMagicLink": "Send Magic Link",
    "sendingMagicLink": "Sending...",
    "checkEmail": "Check your email",
    "magicLinkSent": "We've sent a magic link to your email...",
    "selectRole": "What best describes you?",
    "selectRoleOwner": "I'm selling a property",
    "selectRoleHunter": "I'm searching for a home",
    "selectRoleAgent": "I'm a real estate agent",
    "continueButton": "Continue",
    "errorAuthFailed": "Sign in failed. The link may have expired...",
    "errorExpiredLink": "This link has expired...",
    "errorInvalidLink": "This link is invalid...",
    "errorAlreadyUsed": "This link has already been used...",
    "errorInvalidEmail": "Please enter a valid email address.",
    "errorEmailRequired": "Email address is required."
  }
}
```

## Using Auth in Components

### Check if User is Authenticated

**Server Component:**
```tsx
import { createClient } from '@/lib/supabase/server'

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Please sign in</div>
  }
  
  return <div>Welcome, {user.email}</div>
}
```

**Client Component:**
```tsx
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MyComponent() {
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])
  
  if (!user) return <div>Loading...</div>
  return <div>Welcome, {user.email}</div>
}
```

### Add Logout Button

```tsx
import { LogoutButton } from '@/components/logout-button'

// Icon only
<LogoutButton variant="text" size="sm" />

// Full button
<LogoutButton variant="button" size="md" />
```

## Enabling Route Protection

When ready to protect dashboards:

1. **Update `src/middleware.ts`:**
   ```ts
   const protectedPaths = ['/owner', '/hunter', '/agent', '/admin']
   ```

2. **Users will be redirected to `/auth/login` if not authenticated**

3. **Add `next` param to login links for return-to-previous-page:**
   ```tsx
   <a href="/auth/login?next=/owner/settings">
     Sign in to access settings
   </a>
   ```

## Future Enhancements

### 1. Role-Based Redirects
In `src/app/api/auth/callback/route.ts`, query user's role and redirect accordingly:

```ts
const { data: userProfile } = await supabase
  .from('users')
  .select('role')
  .eq('id', data.user.id)
  .single()

const roleRoutes = {
  owner: '/owner',
  hunter: '/hunter',
  agent: '/agent',
  admin: '/admin'
}

const redirectUrl = roleRoutes[userProfile.role] || '/owner'
return NextResponse.redirect(`${origin}${redirectUrl}`)
```

### 2. Account Deletion

Create `src/app/api/auth/delete-account/route.ts`:

```ts
export async function DELETE(request: Request) {
  const supabase = await createServerClient(...)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Delete user profile
  await supabase.from('users').delete().eq('id', user.id)
  
  // Delete auth user (admin client required)
  const adminClient = createServiceClient()
  await adminClient.auth.admin.deleteUser(user.id)
  
  return NextResponse.json({ ok: true })
}
```

### 3. Email Verification

Use Supabase's `emailRedirectTo` (already in place) to add email confirmation:

```ts
await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: `${window.location.origin}/api/auth/callback`,
    shouldCreateUser: false  // Don't auto-create, require verification first
  }
})
```

### 4. Rate Limiting

Add to `src/middleware.ts` or `src/app/api/auth/callback/route.ts`:

```ts
// Example using headers
const ip = request.headers.get('x-forwarded-for') || 'unknown'
const attempts = await redis.incr(`auth:otp:${ip}`)
if (attempts > 5) {
  return NextResponse.json(
    { error: 'Too many attempts. Try again later.' },
    { status: 429 }
  )
}
```

## Testing

### Test Magic Link Flow
1. Visit `http://localhost:3000/en/auth/login` (or `/de/auth/login`)
2. Enter test email
3. Check Supabase Auth logs for OTP email
4. Copy magic link from logs
5. Paste in browser → Should redirect to dashboard

### Test Error Handling
1. Visit `/auth/error?code=expired_link`
2. Should show appropriate error message

### Test Logout
1. Sign in
2. Click logout button
3. Should redirect to homepage
4. Refresh dashboard → Should redirect to login

## Security Notes

- Magic links expire after 24 hours (Supabase default)
- Each link can only be used once
- Session cookies are HTTP-only and secure
- Email is required (no anonymous auth)
- Middleware prevents direct dashboard access (when enabled)
- Callback validates redirect URL to prevent open redirects

## Debugging

### Check Auth Session
Browser console:
```js
const supabase = window.supabaseClient
supabase.auth.getSession().then(s => console.log(s))
```

### Check Database User
Supabase Dashboard → Authentication → Users → (select user)

### View Logs
- **Auth logs:** Supabase Dashboard → Auth → Logs
- **API logs:** Supabase Dashboard → API → Request Logs
- **Next.js logs:** `npm run dev` console output
