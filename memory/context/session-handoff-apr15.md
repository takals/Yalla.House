# Session Handoff — April 15, 2026

## What was done this session
1. **Auth fixes**: Magic link + Google OAuth redirect now uses cookie-based return URL (survives PKCE chain). Fixed viewings feedback redirect.
2. **Partners page**: New /partners page with 4 partner tracks (agents, photographers, solicitors, referrers)
3. **About page rewrite**: EN/DE locale-aware, agent-friendly tone, no fake team, honest "one founder + AI" story
4. **Dashboard Info tabs**: All 3 dashboards (owner/hunter/agent) now have an Info tab as the default landing
5. **Header nav**: "Agents" → "Partners", "I'm an agent →" link added to homepage hero
6. **Agent info rewrite**: Outcome-focused (less admin, more deals), calendar, inbox, verified hunters, CRM sync, branding, 3-tier pricing (Starter free / Pro £49 / Agency £149), gatekeeper callout
7. **Owner info rewrite**: Removed false Rightmove/Zoopla claim, 3-tier pricing (Starter free / Sell Smart £19/mo / Home Passport £5/mo), solicitor = free directory not paid referral, Home Passport = bookable services marketplace
8. **Hunter info rewrite**: Passport-centred, readiness badges, "17K registered" not "verified", special requirements (wheelchair, soundproof), 2-tier pricing, shared search coming soon
9. **Pricing strategy saved**: memory/context/pricing-strategy.md
10. **Homepage hunter links**: Now go to /hunter/info instead of /hunter/passport

## What's next — Passport page rebuild
The hunter passport page (/hunter/passport) needs a major rebuild:

### Quick fixes needed
- **Country-aware options**: Areas are hardcoded (Berlin neighborhoods in DE i18n, London in form code). Need dynamic options based on user's country/locale.
- **Back button**: Can't go back between steps currently
- **Select all**: No "select all" option on multi-select chip fields
- **Rent vs sale wording**: Some labels are sale-only

### Split-screen rebuild
- **Left side**: Live passport form that fills in as the conversation progresses. Editable at any time.
- **Right side**: Yalla AI chat that walks the user through passport creation conversationally. Pre-fills the form with smart defaults.
- Current implementation has two separate modes (chat OR form toggle). Needs to become one unified split-screen view.

### Readiness badges
- Greyed-out badges on the passport page: Mortgage in Principle, Identity Verified, Profile Complete, Renter Ready
- Each badge needs a "verify" CTA that explains how to earn it
- Mortgage badge → connect with broker (referral revenue)
- Identity badge → ID verification flow (future)
- Profile Complete → auto-calculated from passport completeness
- Renter Ready → references + deposit confirmation
- Need DB columns: `hunter_profiles.badge_mortgage`, `badge_identity`, `badge_profile_complete`, `badge_renter_ready`

### Key files
- `apps/web/src/app/[locale]/hunter/passport/page.tsx` — server component, fetches data
- `apps/web/src/app/[locale]/hunter/passport/passport-page-client.tsx` — client wrapper (133 lines)
- `apps/web/src/app/[locale]/hunter/passport/passport-form.tsx` — the actual form (486 lines)
- `apps/web/src/components/intake/hunter-passport-intake.tsx` — chat mode (174 lines)
- `apps/web/src/app/[locale]/hunter/passport/actions.ts` — server actions for save
- `apps/web/messages/en.json` + `de.json` — i18n keys (hunterPassport namespace)

### Also parked from this session
- Notion auth still broken (needs reconnect)
- Stripe still blocked on company registration
- Reapit Foundations application not submitted
- Listing scraping from free platforms (OpenRent, Gumtree) — feasibility + frequency
- Shared home search / living community feature (beta)
