---
paths:
  - "Website/*.html"
---

# Public Pages Rules

## Page Patterns

### index.html — Landing Page
- Hero: `.home-hero` grid (1fr 400px) — left: headline + social proof; right: login role panel
- Login panel: `.login-roles` with 4 `.login-role` cards linking to each dashboard (no email/password form)
- `.login-bottom` bar: Settings, Sign Out, Create account links
- Portals strip: `.portals-strip > .portals-inner` — render logos as pill badges
- Stats: `.stat-strip > .stat-strip-inner` using `.stat-item` (NOT `.stat-card`)
- Sections follow `.section > .section-inner` pattern throughout

### services.html — Services & Pricing
- Three pricing tiers in `.pricing-grid`
- Checkmarks use green (`#D1FAE5` / `#059669`) not brand yellow
- Comparison table for detailed feature breakdown

### about.html — About / Mission
- Mission statement + team section
- Brand story content — keep tone aligned with brand voice guidelines below

### list.html — Listing Wizard (standalone)
- No `.site-header` — uses `.wizard-topbar` instead
- 4 steps: Basics → Details → Plan → Review + success state
- All logic inline: `goStep()`, `selectPlan()`, `populateReview()`, `submitListing()`
- Does **not** load `app.js`

---

## Public Header Checklist
Every public page header must include:
- [ ] `.site-header` with glass blur
- [ ] Nav: `[Services & Pricing]` `[About]` — **no Contact link in nav**
- [ ] `.user-menu` dropdown (identical structure on all 3 pages)
- [ ] "List Your Place" primary CTA button

## Footer Spec (all 3 public pages)
| Column | Content |
|---|---|
| **Brand** | Yalla.House wordmark + tagline + company info |
| **Policies** | Privacy Policy · Terms of Service · Cookie Policy |
| **Legal & Compliance** | GDPR & Safety · Security & Data Protection · Imprint |
| **Contact** | Support (mailto) · WhatsApp |

Footer must always have exactly 4 columns. Contact lives here, not in nav.

---

## Brand Voice
- Direct, confident, and human — no jargon
- Emphasise: no fees, no commission, full control, transparent process
- Tone: helpful friend, not corporate — "your home", "keep every penny"
- CTA copy: **"List Your Place"** (not "property"), **"Home Hunter"** (not "buyer")
