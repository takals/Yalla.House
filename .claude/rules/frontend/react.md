# Frontend / React + Next.js Rules

> Applies to `apps/web/` — the Next.js 14 (App Router) production application.

## Framework

- **Next.js 14** with App Router (`src/app/`)
- **React 18** with Server Components by default
- **TypeScript** — strict mode via `tsconfig.base.json`
- **Tailwind CSS** — all styling via utility classes + brand tokens in `tailwind.config.ts`

## Routing

- All user-facing routes live under `src/app/[locale]/`
- Locale strategy: `as-needed` — German (`de`) is the default and served without prefix
- English routes are prefixed: `/en/owner`, `/en/hunter`, etc.
- Route groups: `(public)` for unauthenticated pages, named folders for role dashboards
- API routes: `src/app/api/` — no locale prefix

## Components

- **Server Components** are the default — only add `'use client'` when you need interactivity, browser APIs, or hooks
- Client Components go in `src/components/` with `'use client'` directive at the top
- Shared dashboard shell: `src/components/dashboard/shell.tsx` — all authenticated pages wrap in `<DashboardShell>`
- Icons: `lucide-react` — import individual icons, never the entire library

## Data Fetching

- Server Components fetch data directly using Supabase server client (`src/lib/supabase/server.ts`)
- Parallel fetching with `Promise.all()` where possible (see `hunter/page.tsx` pattern)
- No `getServerSideProps` / `getStaticProps` — those are Pages Router patterns
- Service-role client (`createServiceClient()`) only for Inngest functions and webhooks

## Authentication

- Supabase Auth with magic link (OTP)
- Session managed via `@supabase/ssr` middleware cookie handling
- Protected routes enforced in `src/middleware.ts` — never rely on client-side redirects alone
- Auth callback at `/api/auth/callback` exchanges code for session + creates `public.users` row

## State Management

- No global state library — use React Server Components for server state, `useState`/`useReducer` for local UI state
- Form state: standard React controlled inputs — no form library yet
- URL state via `searchParams` where appropriate

## Styling Conventions

- Tailwind utility classes only — no CSS modules, no styled-components
- Brand tokens defined in `tailwind.config.ts`:
  - `bg-brand` (#FFD400), `bg-bg` (#EDEEF2), `bg-surface` (#FFFFFF)
  - `rounded-card` (16px)
  - `bg-sidebar-dark` (#0F1117)
- Font: Plus Jakarta Sans (loaded via Next.js font optimization)
- Responsive: mobile-first, use `sm:`, `md:`, `lg:` breakpoints

## i18n

- Library: `next-intl` v3
- Message files: `messages/de.json` and `messages/en.json`
- Use `useTranslations('namespace')` in Client Components
- Use `getTranslations('namespace')` in Server Components
- Always add both DE and EN keys when adding new strings
- German is the primary language — write DE strings first

## Background Jobs

- Inngest for async work (portal sync, referral processing)
- Functions in `src/inngest/functions/`
- Registered in `src/app/api/inngest/route.ts`
- Typed events in `src/lib/inngest/client.ts`

## File Naming

- Route files: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- Components: PascalCase (`SiteHeader.tsx`) — current codebase uses kebab-case (`site-header.tsx`), follow existing convention
- Lib modules: kebab-case (`supabase/server.ts`, `inngest/client.ts`)

## DO

- Use TypeScript `satisfies` for type narrowing where appropriate
- Import database types from `@yalla/db` (shared package)
- Import portal types from `@yalla/integrations`
- Validate env vars via `src/lib/env.ts` (Zod schema)
- Use `fromMinorUnits()` from `@yalla/integrations` for price display

## DON'T

- Don't use Pages Router patterns (`getServerSideProps`, `_app.tsx`, etc.)
- Don't import server-only code in Client Components (Supabase service client, env secrets)
- Don't hardcode hex colours — use Tailwind brand tokens
- Don't add new `'use client'` directives unless truly needed
- Don't use `any` — prefer `unknown` with type narrowing
