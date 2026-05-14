# Yalla.House — Weekly Strategy Check-in

**Week of April 27, 2026** | Auto-generated April 27, 2026

> ⚠️ Notion MCP still returning 401 unauthorized (broken since Apr 12 email migration). This check-in is saved as a local file in the workspace folder + Drive sync — Notion phase-gate task could not be updated automatically.

---

## Current Phase: MVP (Pre–Phase 1)

**Phase 1 trigger:** 10 owner sign-ups + 5 agent responses · Target: May 2026

Phase gate has not flipped — the product is still in build mode and there are no live owner sign-ups or agent responses recorded yet.

---

## Progress Since Last Check-in (Apr 13 → Apr 27)

133 commits across 9 active build days. Heaviest sprint days: Apr 15 (27 commits), Apr 18 (25 commits), Apr 16 (20 commits). Two-week summary by theme:

**Booking & viewings (core differentiator)**
- Calendly-style viewing calendar with month picker + WhatsApp automation flow
- Dedicated owner calendar page with sidebar nav
- Owner batch availability slots + hunter viewings page
- Smart Booking Shortcut hardened — shareable listings via dual URL routing + QR codes
- Jitsi video integration into viewings calendar v2
- Buyer qualification prompt on contact form

**Owner workspace**
- Listing page redesigned into premium portal layout
- Owner inbox redesigned as communication + contact intelligence workspace
- Listings lifecycle (draft → active → sold) implemented
- Inline editing across owner listings
- Activation wizard with live preview + guided paths
- Listing form UX overhaul (postcode lookup, AI descriptions, RLS fixes)
- Floor plan + EPC document upload sections
- Hero photo selection + photo lightbox
- Owner analytics page with KPIs, funnels, lead sources, activity feed
- Free listing channels — per-listing distribution UI + strategy doc

**Agent side**
- Agent inbox + agent settings shipped
- Notification bell wired
- Offer management UI + structured commission quoting
- Universal agreement system — click-wrap signing for all 4 roles
- Role-based routing + route protection
- Smart role landings + role switcher + first-login picker

**Cross-cutting platform work**
- Full multi-country compliance sweep (DB migrations, schema rename, dateLocale rollout, all hardcoded country logic removed)
- Notification system — Twilio SMS, dispatch pipeline, preferences UI, template customisation
- Country-aware wizard with region dropdown + geo-detection
- Share menu with copy link, WhatsApp, email, native share
- All hardcoded i18n strings + locale ternaries eliminated codebase-wide
- Open info pages to unauthenticated visitors (explore-before-signup)
- Marketplace browse page + provider onboarding + API
- FAQ page with accordion + schema.org
- About page rewrite (SaaS platform positioning)
- Passport plumbing — situation step, readiness score, tiered early access
- Sign In link added to landing hero for returning visitors
- Admin user management
- Four QA rounds (i18n, accessibility, SEO, design tokens, mobile nav, loading skeletons)

**Compliance & content**
- All German-market references replaced with UK equivalents
- German legal pages replaced with UK equivalents
- Role-tabbed pricing tables on services pages

---

## Phase Gate Assessment

| Gate | Trigger | Status |
|------|---------|--------|
| 🚩 MVP → Phase 1 | 10 owners + 5 agent responses | **Not met** — product near-complete, but no live user acquisition yet |
| 🚩 Phase 1 → Phase 2 | 50 hunters + 30 agents active | Not started |
| 🚩 Phase 2 → Phase 3 | 200 hunters + 100 agents + first revenue | Not started |
| 🚩 Phase 3 → Phase 4 | 1,000 hunters + 500 agents + unit economics | Not started |

No phase gate triggers are met. The MVP build has substantively delivered Stage 1 (owner workflow + booking + communication) and significant chunks of Stage 2 (agent inbox, scheduling, signing, offers/quotes). What's missing is **live users**, not features.

---

## Blockers

1. **Notion MCP still disconnected** (16 days, since Apr 12) — strategy tasks, To-Do List, and phase-gate task updates inaccessible. Reconnecting Notion auth is the highest-leverage unblock for ongoing tracking. Until then all check-ins land as local files.
2. **Stripe blocked** — company registration prerequisite still outstanding. Cannot create products / price IDs, which gates any monetisation step in Phase 1.
3. **Reapit Foundations application** — not yet submitted. Critical-path for Phase 1 agent portal integration; was flagged for Sprint Zero Day 1 in the last check-in and remains unactioned.
4. **Sprint Zero start date** — still not locked. This is the trigger for Reapit, agent outreach, and first-owner pilot.

---

## Recommendations Going Into Next Week

The product is now in a state where the bottleneck has shifted from build to go-to-market. Suggested priorities, in order:

1. **Reconnect Notion** — restore the strategy + task system before more context drifts off into local files.
2. **Lock Sprint Zero kickoff date** — this single decision unblocks Reapit application, agent outreach, and pilot owner recruitment.
3. **Submit Reapit Foundations application** — long lead time; should not wait for full Sprint Zero plan.
4. **Resolve company registration** — unblocks Stripe → unblocks any pricing-page → checkout test.
5. **Recruit first 3 pilot owners** — manual, hand-held, founder-led. The product can support them now. This is the only path to the Phase 1 trigger.
6. **Light QA pass on the new viewing-calendar + agreement flow** — the highest-volume code change of the past two weeks; worth one focused walkthrough before pilot owners see it.

---

## Summary

The two-week build window has been extraordinarily productive — viewing calendar, agreement signing, offer management, multi-country compliance, marketplace, and the full listing-page redesign all shipped. The Stage 1 product surface is essentially complete and meaningful Stage 2 capability is in place. The May 2026 Phase 1 target remains achievable, but only if focus shifts decisively from feature work to user acquisition (Reapit, Sprint Zero, pilot owners) this coming week. Notion auth reconnection is the meta-blocker — once restored the phase-gate task can be updated directly and these check-ins can resume their normal cadence.

---

*Sources: git log on apps/web (Apr 13–27), local memory files, prior check-in (strategy-checkin-2026-04-13.md). Notion data source 1d7efd0e-74fe-4813-9d17-5fd7c4f16399 inaccessible due to 401 auth error.*
