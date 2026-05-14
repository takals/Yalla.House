# Yalla.House UX/UI QA Report

**Date:** 16 April 2026
**Reviewer:** Claude (Senior UX/UI QA)
**Scope:** Full platform audit — public pages, all 4 dashboards, auth flows, mobile, accessibility
**Environment:** Production (yalla.house), Next.js 14 App Router + Supabase

---

## 1. Landing Page (`/en`)

### What works
The hero is clean and focused. The "I'm selling / I'm searching" toggle sets context immediately. The CTA "Create your free dashboard" is prominent and the value proposition (free dashboard, market data, comparable sales) is clear. The stat bar (5,000+ / 69% / 0 / 2 min) builds credibility quickly. Dark theme feels modern and premium.

### Issues found

| Severity | Issue | Why it matters | Fix |
|----------|-------|---------------|-----|
| **Critical** | Hero headline has bad line break: "Your property **\n, under your control.**" — comma starts a new line | First impression is broken typography. Looks like a bug, not a design choice | Fix the i18n string or add a `<br>` / `&nbsp;` to control the wrap point |
| **Critical** | All footer text is hardcoded English — "For You", "Company", "Legal", tagline | German visitors see English footer. Breaks i18n principle entirely | Move all footer strings to `messages/de.json` + `en.json` via `getTranslations('footer')` |
| **High** | No mobile hamburger menu — nav items hidden with `hidden sm:block` but no toggle to reveal them | Mobile users lose access to Services & Pricing, About, Dashboard links | Add a hamburger toggle that reveals a mobile nav drawer |
| **Medium** | "I'm an agent" secondary CTA blends into the background — low contrast ghost link | Agents arriving on the page may miss their entry point | Make it a visible secondary button or underline it |
| **Medium** | No pagination on `/listings` — hard-capped at 48 results | Users can't browse beyond first page. Dead-end flow | Add "Load more" or proper pagination |
| **Low** | Inline `style` attributes for transitions instead of Tailwind config | Inconsistent styling approach; harder to maintain | Extract to `tailwind.config.ts` transition timing |

---

## 2. Services & Pricing (`/en/services`)

### What works
Pricing tiers are clear. The comparison with traditional agent fees creates urgency. Layout is scannable.

### Issues found

| Severity | Issue | Why it matters | Fix |
|----------|-------|---------------|-----|
| **High** | Hardcoded English strings throughout | Same i18n violation as landing page | Extract to message files |
| **Medium** | No structured data (Schema.org Service) | Missed SEO opportunity for rich snippets | Add JSON-LD for service offerings |

---

## 3. About Page (`/en/about`)

### What works
Clean storytelling layout. Mission is clear.

### Issues found

| Severity | Issue | Why it matters | Fix |
|----------|-------|---------------|-----|
| **High** | Link to `/agents` (line ~290) should be `/agent` (singular) | Returns 404. Broken user journey | Fix href to `/agent` |
| **Medium** | Hardcoded hex colors `#5856D6` and `#34C759` for role cards | Bypasses design token system | Use Tailwind brand tokens |

---

## 4. Auth Flow (`/auth/login`)

### What works
Magic link (OTP) is frictionless. Return-URL persistence uses both localStorage and cookies for resilience.

### Issues found

| Severity | Issue | Why it matters | Fix |
|----------|-------|---------------|-----|
| **Critical** | Login page has 6+ hardcoded English strings: "Back to home", "Email Address", "or continue with", "No account yet?" | German users see English auth page | Create `auth` i18n namespace, extract all strings |
| **High** | Error page (`/auth/error`) exposes raw error codes in UI | Confusing for users, potential info leak | Show friendly error messages, log codes server-side |
| **Medium** | No explicit "Create account" button — only a note that one will be created | New users expecting a signup form may be confused | Add clearer onboarding copy or a "Get started" variant |

---

## 5. Owner Dashboard (`/en/owner`)

### What works
Overview page has a solid control-centre feel — stats cards, recent viewings, offers, messages, billing. Listing management with status badges (draft/active/paused) is intuitive. Offer management with accept/reject/counter is complete. Viewing availability with Quick Week batch tool saves time.

### Issues found

| Severity | Issue | Why it matters | Fix |
|----------|-------|---------------|-----|
| **Critical** | Owner info page (`/owner/info`) uses inline `isEN ? 'English' : 'German'` ternaries instead of i18n | Violates mandatory i18n rule. Cannot add French/Turkish without code changes | Refactor to `getTranslations('ownerInfo')` |
| **Critical** | Zero error handling on `Promise.all()` fetches — if any Supabase query fails, entire page crashes | One flaky query takes down the whole dashboard | Wrap in try/catch with fallback empty states |
| **High** | Hardcoded German fallback `'dort'` in owner overview (line ~96) | English users see random German word if name parsing fails | Use i18n key for fallback greeting |
| **High** | Date formatting hardcoded to `'de-DE'` locale in message threads | English users see German dates | Use resolved locale from route params |
| **Medium** | `(supabase.from('table') as any)` pattern used 40+ times across owner pages | No compile-time type safety on data queries. Typos silently fail at runtime | Create typed query helpers or generate types from Supabase |
| **Medium** | No loading/skeleton states while fetching | Users see blank page flash before data loads | Add `loading.tsx` files or skeleton components |

---

## 6. Hunter Dashboard (`/en/hunter`)

### What works
Viewings page with stats (All/Upcoming/Confirmed), filter tabs, and cancel action works well. Home Passport is a strong differentiator. Search page connects to listings. Agent directory is useful. Notification bell is visible and functional.

### Issues found

| Severity | Issue | Why it matters | Fix |
|----------|-------|---------------|-----|
| **Critical** | Same `Promise.all()` crash risk — no error handling on overview page (6 parallel queries) | Single query failure kills entire page | Add try/catch with graceful degradation |
| **High** | Budget display: `Math.round(profile.budget_max / 100)` with no validation | If budget_max is null/undefined, page throws NaN error | Add null check: `budget_max ? Math.round(...) : 0` |
| **Medium** | Viewings list has no sorting options | Users can't find specific viewings easily as list grows | Add sort by date/status |
| **Low** | Empty state says "You haven't requested any viewings yet" — could be more actionable | Missed conversion moment | Add "Browse properties near you" with location-based CTA |

---

## 7. Agent Dashboard (`/en/agent`)

### What works
Inbox shows the Yalla email address clearly. Settings form is clean with proper field layout. Sidebar has comprehensive navigation (Dashboard, Assignments, Calendar, Briefs, Hunters, Inbox, Partner Agreement, Profile, Settings).

### Issues found

| Severity | Issue | Why it matters | Fix |
|----------|-------|---------------|-----|
| **Critical** | Assignments page is a `'use client'` component creating its own Supabase client with `process.env.NEXT_PUBLIC_SUPABASE_URL` | Fetches sensitive listing data client-side with anon key. Should be server component | Refactor to Server Component, pass data as props |
| **Critical** | Assignments page has 15+ hardcoded English strings: "Listing Assignments", "Collaborate on listings", "Invitation Pending", "Active Assignments", etc. | German agents see English UI | Create `agentAssignments` i18n namespace |
| **High** | Date formatting hardcoded to `'en-GB'` in assignments | German users see English date format | Use locale from route params |
| **High** | Currency formatting uses `.toLocaleString()` without currency style | Shows `12345` instead of `12,345.00` or `12.345,00` | Use `Intl.NumberFormat` with currency |
| **Medium** | `TierBadge` component uses inline styles with hardcoded colors | Inconsistent with design token system | Use Tailwind classes from config |

---

## 8. Admin Dashboard (`/en/admin`)

### What works
User Management page loads 17,331 users with search and role filter buttons. Role assignment (add/remove) works. Admin check correctly blocks non-admins with a clean "No Access" message. Notification bell present.

### Issues found

| Severity | Issue | Why it matters | Fix |
|----------|-------|---------------|-----|
| **High** | Admin overview fetches 9+ queries in parallel with no error handling | Dashboard crash on any query failure | Add error boundaries |
| **High** | Date formatting hardcoded to `'de-DE'` | English admins see German dates | Use locale |
| **Medium** | Middleware only checks `if (!user)` — no role verification | A logged-in hunter can visit `/admin` URL (page-level check catches it, but defense-in-depth violated) | Add role check in middleware |
| **Medium** | User list limited to 200 users — no pagination | Can't browse beyond first 200 out of 17,000+ | Add pagination or infinite scroll |
| **Low** | Hardcoded status style records instead of design tokens | Maintenance burden | Extract to shared StatusBadge component |

---

## 9. Shared Components

### Dashboard Shell (`shell.tsx`)

| Severity | Issue | Why it matters | Fix |
|----------|-------|---------------|-----|
| **Critical** | "Collapse" and "Sign out" buttons have hardcoded English text | Breaks i18n for all dashboard users | Pass labels through props from layout |
| **High** | Sidebar toggle button has no `aria-expanded` or `aria-controls` attribute | Screen readers can't determine sidebar state | Add ARIA attributes |
| **High** | Notification dropdown has no keyboard support — no Escape key handler, no focus trap | Keyboard-only users can't dismiss the dropdown | Add Escape handler and focus management |
| **Medium** | No `aria-label` on `<nav>` element | Screen readers announce generic "navigation" | Add `aria-label="Dashboard navigation"` |

### Notification Bell (`notification-bell.tsx`)

| Severity | Issue | Why it matters | Fix |
|----------|-------|---------------|-----|
| **Medium** | Dropdown is a `<div>` with `position: absolute` — not keyboard accessible | Tab key doesn't enter the dropdown | Use `role="menu"` with focus management |

---

## 10. Mobile Responsiveness

### What works
Dashboard sidebar auto-collapses below 1024px to 60px icon-only mode. Public page grids use proper `sm:` / `md:` / `lg:` breakpoints. Stats cards stack vertically. Footer grid is `sm:grid-cols-2 lg:grid-cols-4`.

### Issues found

| Severity | Issue | Why it matters | Fix |
|----------|-------|---------------|-----|
| **Critical** | No mobile hamburger menu on public pages | Mobile users can't access nav links (Services, About, Dashboard) | Add hamburger toggle with slide-out menu |
| **High** | Listings filter bar doesn't adapt to mobile — 6 filters on one row | Horizontal overflow on phones | Use `grid md:grid-cols-3 lg:grid-cols-6` |
| **Medium** | Sidebar at 60px on very small screens (<320px) may still cause horizontal overflow | Rare but breaks on older/budget phones | Add `min-w-0` on main content area |

---

## 11. Accessibility

### Issues found

| Severity | Issue | Why it matters | Fix |
|----------|-------|---------------|-----|
| **Critical** | Only 2 `aria-label` attributes found across entire codebase | Fails WCAG 2.1 Level A. Screen reader experience is broken | Audit all interactive elements, add ARIA labels |
| **Critical** | Gallery images use `alt=""` (empty string) on content images | Listing photos are content, not decorative. Screen readers skip them entirely | Add meaningful alt text: listing title + location |
| **High** | Form inputs have no associated `<label>` elements (editable-field, settings forms) | Screen readers can't identify input purpose | Add `id` + `htmlFor` pairing on all inputs |
| **High** | No visible focus indicators on most interactive elements | Keyboard-only users can't see what's focused | Add global `:focus-visible` ring style |
| **High** | Footer muted text contrast ratio ~3.8:1 (fails WCAG AA for normal text) | Unreadable for users with vision impairments | Lighten to at least #A0A0A0 for 4.5:1 ratio |
| **Medium** | Dropdowns, modals, and popovers have no `role="dialog"` or `aria-modal` | Assistive tech can't announce modal context | Add proper ARIA roles to all overlays |
| **Medium** | Footer section headers use `<div>` instead of `<h3>` / `<h4>` | Broken heading hierarchy for screen readers | Use semantic heading elements |

---

## 12. Design Consistency

| Severity | Issue | Why it matters | Fix |
|----------|-------|---------------|-----|
| **High** | 578+ hardcoded hex values across components despite having Tailwind tokens | Dual source of truth. Changes to brand colors require find-and-replace | Standardize: extend Tailwind config, replace all hardcoded values |
| **Medium** | `globals.css` CSS custom properties duplicate Tailwind config tokens | Two sources of truth for the same colors | Remove CSS vars or align them as a single source |
| **Medium** | Border radius varies: `rounded-lg` (8px), `rounded-xl` (14px), `rounded-2xl` (16px) vs config's `rounded-card` (16px) | Inconsistent visual language | Use config tokens consistently |
| **Low** | Multiple components duplicate StatusBadge / TabNav patterns | DRY violation, maintenance burden | Extract into shared components |

---

## UX Verdict

Yalla.House has a strong product skeleton. The dashboard-as-wedge strategy is smart, the four role-based dashboards are structurally complete, and the dark/light dual theme is polished. The core flows (list property, browse, request viewing, manage offers) exist end-to-end.

However, it is **not launch-ready** in its current state. The i18n violations are the most urgent problem — a German-first platform serving hardcoded English across auth, footer, assignments, and shell components will immediately erode trust with the target audience. The complete absence of error handling on server-component data fetching means a single Supabase hiccup takes down entire dashboards. Accessibility is severely lacking (2 ARIA labels across the entire app) and would not pass any audit.

The good news: most issues are systematic, not structural. A focused 2-3 day sprint on i18n extraction, error boundaries, and ARIA attributes would dramatically improve the platform's readiness.

---

## Final Summary

### Top 10 Issues (Priority Order)

1. **i18n violations everywhere** — hardcoded English in auth, footer, shell, assignments, owner info, listings (Critical)
2. **Zero error handling on data fetches** — Promise.all() with no catch across all 4 dashboards (Critical)
3. **No mobile navigation** — hamburger menu missing on public pages (Critical)
4. **Accessibility: 2 ARIA labels in entire codebase** — screen reader experience is non-functional (Critical)
5. **Agent assignments is client-side with anon key** — security concern, should be server component (Critical)
6. **Gallery images have empty alt text** — content images invisible to screen readers (High)
7. **Form inputs missing labels** — fails WCAG, poor screen reader UX (High)
8. **578+ hardcoded hex values** — design token system exists but isn't used (High)
9. **No pagination on listings or admin users** — dead-end flows at scale (High)
10. **Broken link: `/agents` should be `/agent`** — 404 on about page (High)

### Quick Wins (< 1 hour each)

1. Fix `/agents` link to `/agent` in about page
2. Add `aria-label` to sidebar nav, toggle button, notification bell dropdown
3. Add `try/catch` wrappers around Promise.all() in each dashboard page
4. Fix hero headline line break
5. Add `alt` text to gallery images using listing title
6. Add `loading.tsx` skeleton files to dashboard routes
7. Fix hardcoded `'de-DE'` / `'en-GB'` date formatting — use locale from params
8. Add Escape key handler to notification dropdown

### Strategic UX Recommendations

1. **i18n extraction sprint** — create namespaces for auth, footer, shell, agentAssignments, ownerInfo, listings. This is the single highest-impact improvement for German market launch.
2. **Error boundary layer** — create a shared `SafeDataFetch` wrapper or use Next.js `error.tsx` per route segment. Every dashboard needs graceful degradation.
3. **Accessibility pass** — add global focus styles, ARIA attributes to all interactive components, proper form labels. Consider running axe-core automated scans.
4. **Design token consolidation** — eliminate all hardcoded hex values. Add missing semantic tokens to Tailwind config (primary-text, secondary-text, muted-text, surface-border, etc.).
5. **Mobile-first navigation** — implement hamburger menu for public pages and test all flows on 375px viewport.

### Launch Readiness Scores

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Functionality** | 6/10 | Core flows work but no error handling, missing pagination, broken link, client-side data fetching security issue |
| **UX** | 6/10 | Good information architecture and role separation. Empty states exist but are inconsistent. No loading states. Missing mobile nav |
| **UI** | 7/10 | Strong visual design, good dark/light theme. But design tokens underused (578 hardcoded values), inconsistent border radius |
| **Conversion** | 6/10 | Primary CTA is clear. But "I'm an agent" link is too subtle. Listings dead-end at 48 results. Auth page could be warmer |
| **Mobile** | 4/10 | Dashboard sidebar collapses well. But no public page nav on mobile. Filter bar overflows. Not tested end-to-end |
| **Accessibility** | 2/10 | Almost no ARIA attributes. Empty alt text. Missing form labels. No focus indicators. Contrast issues |
| **i18n** | 3/10 | Framework is correct (next-intl) but execution has major gaps. Hardcoded strings throughout |
| **Overall** | **5/10** | Strong foundation, not yet launch-ready. Needs i18n, error handling, accessibility, and mobile nav before going live |
