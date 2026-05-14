# Yalla.House UX Audit: Ideal Path vs What Actually Happens

> Audited: 18 April 2026 | All roles, all entry points

---

## 1. OWNER (Property Seller)

### Ideal Path
1. Visitor lands on yalla.house → sees Owner hero → clicks "List Your Property"
2. Redirected to login (magic link) → returns to `/owner/new`
3. Multi-step wizard: property type → intent → address → details → pricing
4. Listing created → **activation wizard** shows live page preview with toggle
5. Two guided paths: Share listing (WhatsApp, Facebook, portals) OR Find an agent
6. Owner lands on **dashboard** showing their listing stats, enquiries, viewings
7. Ongoing: manage viewings, review offers, message hunters, track agent proposals

### What Actually Happens
1. **Good:** Landing page has clear Owner CTA → login → redirects back correctly
2. **Good:** Listing wizard works (address autocomplete, validation, AI description)
3. **Good:** Activation wizard (just redesigned) shows live preview + two paths
4. **Problem:** After activation, owner lands on `/owner/info` — a **marketing/info page**, not a real dashboard. It shows benefits, pricing, "How it works" copy. A returning owner with 3 active listings still sees promotional content as their homepage.
5. **Problem:** No state-aware empty state. A new owner with 0 listings sees the same info page as someone with 10 listings. Should show "You have no listings yet — create your first one" vs. a real stats overview.
6. **Gap:** `/owner/overview` exists but isn't the default landing. Owner must manually navigate to Listings, Viewings, etc.
7. **Good:** Single-listing redirect works (1 listing → skips grid, goes to listing page)

### Fix Needed
- **Make `/owner` redirect to `/owner/overview` (or `/owner/listings`) instead of `/owner/info`** for users who have listings
- `/owner/info` should only show for first-time owners with 0 listings (onboarding)
- Or: merge info + overview into one smart page

---

## 2. HUNTER (Home Buyer/Renter)

### Ideal Path
1. Visitor → clicks "Find a Home" → login → lands on Home Passport intake
2. Guided intake: intent, budget, areas, property type, timeline, dealbreakers
3. Passport completed → dashboard shows readiness score, early access tier
4. Browse listings / get agent matches / book viewings
5. Ongoing: view properties, make offers, message owners/agents

### What Actually Happens
1. **Good:** Landing page has Hunter CTA → login works
2. **Problem:** Hunter lands on `/hunter/info` — another **marketing page**. Not the passport, not the dashboard. Shows benefits grid, "What is a Home Passport" explainer.
3. **Problem:** Passport creation is **not forced**. Hunter can navigate around the dashboard seeing 0s everywhere without understanding why nothing works. The overview shows "notCreated" status with a dot, but doesn't block or prominently nudge.
4. **i18n violation:** `/hunter/info` has hardcoded `isEN ? 'English' : 'German'` ternaries instead of using `getTranslations()`
5. **Good:** Once passport IS filled, the overview dashboard is excellent — parallel data fetching, readiness badges, early access, matched agents, viewing history
6. **Good:** Search creation, viewing feedback, agent matching all functional

### Fix Needed
- **First-time hunter should land on Passport intake**, not info page
- Add a prominent "Complete your passport to get started" gate/banner on dashboard
- Fix i18n violations in `/hunter/info`
- Consider: if passport not created, redirect `/hunter` → `/hunter/passport` instead of `/hunter/info`

---

## 3. AGENT (Estate Agent)

### Ideal Path
1. Agent visits yalla.house → sees Agent path → clicks CTA → login
2. Must sign Partner Agreement (data handling, portal rules, platform terms)
3. Complete profile: agency name, license, coverage areas, service types
4. See matched briefs from hunters, assignment requests from owners
5. Ongoing: manage assignments, respond to briefs, schedule viewings, message clients

### What Actually Happens
1. **Good:** Agreement page is a **mandatory gate** — unsigned agents get blocked
2. **Good:** After signing, agent can access dashboard, assignments, briefs
3. **Problem:** Agent also lands on `/agent/info` — another **marketing page**. Same issue as Owner and Hunter. The real work is in `/agent/overview`, `/agent/assignments`, `/agent/briefs`.
4. **Gap:** After signing agreement, there's no profile completion check. Agent can access dashboard with an empty profile (no agency name, no coverage areas). This means they won't appear in agent search results.
5. **Good:** Assignments page shows realistic permission matrix (can_edit_listing, can_manage_viewings, etc.)
6. **Good:** Brief matching and calendar functionality in place

### Fix Needed
- **Post-agreement: force profile completion** before showing dashboard
- Redirect to `/agent/profile` after agreement signing if profile is incomplete
- Same `/info` vs real dashboard landing issue

---

## 4. PARTNER (Service Provider — Mortgage, Legal, etc.)

### Ideal Path
1. Provider joins via `/providers/join` or marketplace
2. Creates business profile: name, categories, service area
3. Receives service requests from platform users
4. Manages requests, builds reputation with ratings

### What Actually Happens
1. **Good:** Dashboard fetches real data (active requests, completed jobs, avg rating)
2. **Problem:** No profile completion gate. Partner can see dashboard with empty profile.
3. **i18n violation:** Locale routing uses inline ternary (`locale === 'de' ? '' : '/en'`) instead of i18n utility
4. **Minor:** Works, but lacks the onboarding polish of other roles

---

## 5. PUBLIC → SIGNUP → ROLE SELECTION

### Ideal Path
1. Visitor sees clear role paths on landing page
2. Clicks their path → sees role-specific benefits → clicks CTA → login
3. After login, automatically routed to their intended dashboard
4. First visit: guided onboarding (passport/listing/agreement). Return visit: real dashboard.

### What Actually Happens
1. **Good:** Landing page shows Owner/Hunter toggle with Agent link at top
2. **Good:** Three path cards at bottom (Owner | Hunter | Agent)
3. **Problem:** No explicit role selection at signup. A user who clicks "Login" from the header (not from a specific path) has no way to indicate their role.
4. **Problem:** Auth callback uses **role priority** (admin > agent > owner > hunter) for redirect when no `?next` param. An owner who is also an agent will always land on `/agent`, never `/owner`.
5. **No role switcher in UI.** A multi-role user must manually edit the URL to switch dashboards. There's no dropdown or toggle.
6. **Problem:** First-time users with no roles get routed to `/hunter` by default (fallback). This is confusing if they intended to be an owner.

### Fix Needed
- **Add role switcher** to dashboard shell (dropdown or toggle in sidebar)
- On first login with no roles: show a **"What brings you here?"** role picker
- Respect user intent over role priority when both exist

---

## 6. CROSS-CUTTING ISSUES

### The `/info` Landing Page Pattern
Every role (owner, hunter, agent) has the same anti-pattern:
- `/[role]` redirects to `/[role]/info`
- `/[role]/info` is a **marketing/onboarding page** with benefits, pricing, explainers
- The REAL dashboard is at `/[role]/overview` or `/[role]/listings`
- Returning users with data still see marketing copy as their homepage

**This is the single biggest UX issue.** The fix is simple: make the root redirect context-aware.

### i18n Violations Found
1. `/hunter/info/page.tsx` — hardcoded `isEN ? ... : ...` ternaries
2. `/partner/page.tsx` — hardcoded locale routing ternary
3. Some hardcoded hex colors (`#5856D6`) that should use Tailwind tokens

### Missing Gates/Onboarding
| Role | Has Gate? | What's Missing |
|------|-----------|----------------|
| Owner | No gate | Should check: 0 listings → show onboarding, else → overview |
| Hunter | No gate | Should check: no passport → redirect to passport intake |
| Agent | Agreement gate only | Should also check: profile incomplete → redirect to profile |
| Partner | No gate | Should check: profile incomplete → show setup wizard |

---

## 7. PRIORITY FIXES (Proposed Sprint)

### P0 — Critical Path (Do First)
1. **Smart role landing** — `/owner`, `/hunter`, `/agent` redirects should check user state:
   - New user (no data) → onboarding/info page
   - Returning user (has data) → real dashboard/overview
2. **Hunter passport gate** — if no passport, redirect to passport intake
3. **Fix i18n violations** — hunter/info hardcoded strings, partner locale ternary

### P1 — Important UX
4. **Role switcher in dashboard sidebar** — dropdown showing all user's roles
5. **First-login role picker** — "What brings you here?" screen on first visit
6. **Agent profile completion gate** — after agreement, force profile setup
7. **Partner profile gate** — require business profile before dashboard

### P2 — Polish
8. **Owner info → overview merge** — combine into one smart page
9. **Hunter dashboard empty states** — more prominent passport CTA when incomplete
10. **Consistent onboarding pattern** — every role follows: gate → setup → dashboard

---

## Summary

The **back-end and data layer are solid** — real Supabase queries, proper auth, i18n framework, parallel data fetching. The **core UX flows work** once you're in them (listing creation, passport intake, agent agreement, viewing booking).

The main gap is the **front door experience**: every role lands on a marketing page instead of their actual workspace. A first-time user needs to be hand-held into their first action; a returning user needs to see their data immediately. The fix is a context-aware redirect at each role's root — simple to implement, massive UX improvement.
