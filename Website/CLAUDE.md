# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Project memory, style guide, and development rules for the Yalla.House marketing + app website.

---

## 1. Project Overview

**Yalla.House** is a UK flat-fee property selling platform. No commission, no agent. Sellers list directly on Rightmove & Zoopla, control their own process, and keep every pound of their sale price.

**Tech stack**: Vanilla HTML5 · CSS3 custom properties · Vanilla JS (ES5 compat) · Lucide icons (CDN)
**Font**: Plus Jakarta Sans (Google Fonts — 300/400/500/600/700/800)
**Icon library**: Lucide v0.475.0 — `https://unpkg.com/lucide@0.475.0/dist/umd/lucide.min.js`

---

## 2. File Structure

```
Website/
├── CLAUDE.md              ← This file (project memory + rules)
├── style.css              ← Single global stylesheet (all design tokens here)
├── app.js                 ← Shared JS for owner dashboard only (showView, toast, interactions)
│
├── index.html             ← Public landing page
├── services.html          ← Services & Pricing page
├── about.html             ← About / Mission page
├── list.html              ← Property listing wizard (4-step, standalone)
│
└── dashboards/            ← All user workspaces
    ├── dashboard.html     ← Owner / Seller (uses app.js)
    ├── buyer.html         ← Home Hunter (inline script)
    ├── admin.html         ← Yalla Admin (inline script)
    └── agent.html         ← Field Agent (inline script)
```

**Path rules inside `dashboards/`:**
- Assets: `href="../style.css"`, `src="../app.js"`
- Public pages: `href="../index.html"`, `href="../list.html"`
- Sibling dashboards: `href="dashboard.html"` (no prefix)

---

## 3. Design Tokens (`style.css :root`)

### Colours
| Token | Value | Usage |
|---|---|---|
| `--brand` | `#FFD400` | Yalla Yellow — primary accent, CTAs, active states |
| `--brand-hover` | `#E6C200` | Button hover |
| `--brand-light` | `rgba(255,212,0,.12)` | Focus rings, active sidebar bg |
| `--brand-light2` | `rgba(255,212,0,.18)` | Stronger brand tint |
| `--brand-solid-bg` | `#FFFBE0` | Soft yellow tint — card icons, featured cards |
| `--bg` | `#EDEEF2` | Page background — cool grey (clearly not white) |
| `--bg-soft` | `#E6E8EE` | Alt sections, sidebar bg |
| `--bg-muted` | `#D9DCE4` | Hover states, muted fills |
| `--bg-subtle` | `#CDD1DA` | Dividers, subtle highlights |
| `--surface` | `#ffffff` | Cards, panels, inputs — pop off the grey bg |
| `--border-light` | `#E2E4EB` | Subtle dividers |
| `--border` | `#D8DBE5` | Default borders |
| `--border-dark` | `#C8CCD6` | Hover border states |
| `--text-primary` | `#000000` | Body text, headings |
| `--text-secondary` | `#656565` | Supporting text, labels |
| `--text-muted` | `#999999` | Placeholders, meta text |

### Shadows (layered dual-shadow system)
| Token | Value |
|---|---|
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)` |
| `--shadow` | `0 2px 8px rgba(0,0,0,.08), 0 1px 3px rgba(0,0,0,.05)` |
| `--shadow-md` | `0 6px 20px rgba(0,0,0,.09), 0 2px 6px rgba(0,0,0,.05)` |
| `--shadow-lg` | `0 12px 40px rgba(0,0,0,.11), 0 4px 12px rgba(0,0,0,.06)` |

### Radii
| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `6px` | Buttons, inputs, small chips |
| `--radius` | `10px` | Cards, badges |
| `--radius-lg` | `14px` | Section cards, panels |
| `--radius-xl` | `20px` | Pricing cards, large modals |

### Layout
| Token | Value |
|---|---|
| `--sidebar-w` | `240px` |
| `--header-h` | `60px` |
| `--section-pad-x` | `48px` |
| `--transition` | `0.15s ease` |

---

## 4. Style Guide

### Typography hierarchy
```
Page H1 (hero):   clamp(2.25rem, 5.5vw, 3.875rem) · weight 800 · tracking -.035em
Section H2:       clamp(1.625rem, 3vw, 2.25rem)   · weight 800 · tracking -.03em
Card H3:          .9375rem                         · weight 700 · tracking -.01em
Label / nav:      .875rem                          · weight 600
Body text:        .9375rem                         · weight 400 · line-height 1.65
Small / meta:     .8125rem                         · weight 400–600 · color --text-secondary
Tiny / badge:     .7rem or .75rem                  · weight 700 · uppercase + tracking
```

### Buttons
- **Primary** (`.btn-primary`): Brand yellow bg, black text. Hover: lift `translateY(-1px)` + yellow glow shadow
- **Secondary** (`.btn-secondary`): Grey bg, dark border. Hover: lift + subtle shadow
- **Outline** (`.btn-outline`): Transparent + border. Hover: border darkens + lift
- **Ghost** (`.btn-ghost`): No bg, muted text. Hover: grey bg fill
- All buttons: `will-change: transform`, `:active` resets to `translateY(0)`
- Sizes: default (`.btn`), large (`.btn-lg`), small (`.btn-sm`)

### Cards
- All cards: `--surface` bg, `--border-light` border, `--radius-lg` radius
- Hover: `translateY(-3px)` + `--shadow-md` — applies to `.card`, `.pricing-card`, `.testimonial`
- `.card-icon`: 44×44px, `--brand-solid-bg` background with brand border tint

### Testimonials
- `.testimonial::before` renders a large `"` quote mark in brand yellow (Georgia, 3.75rem)
- `.testimonial-stars`: amber `#F59E0B` five-star row, placed before the quote text in HTML
- Left border `3px solid transparent` animates to `var(--brand)` on hover

### Icons (Lucide)
- Dashboard sidebar: `<i data-lucide="name" class="sidebar-icon">` — 15×15px, `stroke: currentColor`
- Active sidebar: icon inherits `color: var(--brand)` via `.sidebar-link.active .sidebar-icon`
- Content icons (service cards, about page): emoji is fine — decorative, not UI

### Badges
```css
.badge-green   → #DCFCE7 / #166534   (active, live, confirmed)
.badge-yellow  → brand-solid-bg / #7A5F00  (pending, under review)
.badge-blue    → #DBEAFE / #1E40AF   (info, in-progress)
.badge-red     → #FEE2E2 / #991B1B   (urgent, error, declined)
.badge-gray    → --bg-muted / --text-secondary  (inactive, draft)
```

### Pricing feature checkmarks
`.pricing-features li::before` — 17px circle, `#D1FAE5` bg, `#059669` green tick.

### CTA Band
`.cta-band` — dark `#0d0d0d` background with a `radial-gradient` yellow glow via `::before`. Headline is `#ffffff`, body text is `rgba(255,255,255,.62)`. Not soft yellow — dark and dramatic.

### Portal Logos Strip
`.portal-logo` — pill badge style: white bg, `var(--border)` border, `border-radius: 100px`. Not faded plain text.

### Public Header (`.site-header`)
- Sticky glass: `background: rgba(237,238,242,.88)` + `backdrop-filter: blur(14px)`
  *(matches `--bg` value — update both if background changes)*
- Nav links: underline slide-in animation on hover via `::after`
- Right of nav: `.user-menu` dropdown (see below) + "List Your Place" primary btn
- Nav items: `[Services & Pricing]` `[About]` — no Contact in nav

### User Menu Dropdown (`.user-menu`) — all 3 public pages
The "Sign In ▾" button opens a dropdown with 4 role cards linking to each dashboard. Used on `index.html`, `services.html`, `about.html`. Each page has identical inline JS:

```js
toggleUserMenu()   // toggles .open class on #userMenuDropdown
// click-outside closes it
showToast()        // duplicated inline — public pages don't load app.js
```

Structure:
```html
<div class="user-menu" id="userMenu">
  <button ... onclick="toggleUserMenu()">Sign In ▾</button>
  <div class="user-menu-dropdown" id="userMenuDropdown">
    <div class="user-menu-label">Sign in as</div>
    <a href="dashboards/dashboard.html" class="user-menu-option">...</a>
    <!-- Home Hunter, Admin, Field Agent options -->
    <div class="user-menu-divider"></div>
    <button class="user-menu-action" onclick="showToast(...)">⚙ Settings</button>
    <button class="user-menu-action user-menu-signout" ...>↩ Sign Out</button>
  </div>
</div>
```

### Login Role Panel (`.login-panel`) — `index.html` hero
The hero right panel uses `.login-roles` (role cards) instead of email/password. Each `.login-role` card links directly to a dashboard. Bottom bar uses `.login-bottom` with Settings, Sign Out, and Create account links.

### Dashboard Layout
```
.app-root (flex, 100vh)
  ├── .sidebar (240px, flex-col, overflow-y:auto)
  └── .app-main (flex-1, flex-col)
       ├── .app-topbar (60px, fixed height)
       └── .app-content (flex-1, flex)
            ├── .app-canvas (flex-1, overflow-y:auto, padding 1.625rem 1.5rem)
            └── .app-rail (264px — Owner dashboard only, hidden on narrow screens)
```

### Toast System
Call `showToast(message, type)` — `type` is `'success'` (default), `'error'`, or `'info'`.
Defined in `app.js` for `dashboard.html`. **Duplicated inline** in `<script>` for `buyer.html`, `admin.html`, `agent.html`, and all three public pages.

---

## 5. Page-by-Page Notes

### `index.html` — Public landing
- Hero: `.home-hero` (grid: 1fr 400px) — left: headline + social proof; right: login role panel
- Login panel: `.login-roles` with 4 `.login-role` cards → each dashboard. No email/password form.
- Portals strip: `.portals-strip > .portals-inner` — portal logos rendered as pill badges
- Stats: `.stat-strip > .stat-strip-inner` (uses `.stat-item`, NOT `.stat-card`)
- Sections: `.section > .section-inner` pattern throughout
- Inline `<script>` at bottom: `toggleUserMenu()`, `showToast()`

### `dashboards/dashboard.html` — Owner/Seller
- **Only dashboard that uses `app.js`** — includes `showView()`, toast, `initDashboardInteractions()`
- Views: dashboard, listings, inquiries, analytics, documents, calendar, settings
- Right rail (`.app-rail`) shown only on dashboard + calendar views
- Hash navigation: `#dashboard`, `#listings`, etc.

### `dashboards/buyer.html` — Home Hunter
- Inline `<script>` (not app.js) — `showView()` and `showToast()` duplicated
- Views: dashboard, search, saved, offers, surveys, inbox, booking, settings
- Inbox: `.msg-thread` with `.msg-bubble.inbound` / `.msg-bubble.outbound`
- Button texts normalised with `.replace(/\s+/g, ' ')` before matching (fixes multiline button text)

### `dashboards/admin.html` — Admin
- Inline `<script>` (not app.js)
- Views: dashboard, activity, owners, hunters, tasks, surveys, support, billing, integrations, sysSettings
- Admin badge on sidebar logo: `<span>ADMIN</span>`

### `dashboards/agent.html` — Field Agent
- Inline `<script>` (not app.js)
- Views: dashboard, schedule, jobs, properties, reports, inbox, settings
- Job type badges: `badge-photo` (blue), `badge-board` (green), `badge-viewing` (orange), `badge-survey` (purple)

### `list.html` — Listing Wizard
- Standalone — no site-header, uses `.wizard-topbar` instead
- 4 steps: Basics → Details → Plan → Review + Success state
- All logic inline: `goStep()`, `selectPlan()`, `populateReview()`, `submitListing()`

---

## 6. Button Interaction Pattern

All 199 interactive elements across the 8 pages are wired. The pattern:

- **Buttons with inline `onclick`**: handled directly
- **Buttons without `onclick`** (dashboard pages): handled via `document.addEventListener('click')` event delegation matching `btn.textContent.trim().replace(/\s+/g, ' ')`
- `dashboard.html`: delegation is in `app.js → initDashboardInteractions()`
- All other dashboards: delegation is in inline `<script>` block

When adding new buttons, either add an `onclick` attribute or add a `txt === 'Button Text'` branch to the delegation handler.

---

## 7. Development Rules

### DO
- Use CSS custom properties (tokens) for all colours, spacing, and radii
- Add `will-change: transform` on elements with `:hover` transforms
- Use `lucide.createIcons()` in `DOMContentLoaded` on every page that uses Lucide
- Wire all interactive buttons to `showToast()` or a `showView()` call
- Keep page-specific styles in an inline `<style>` block in `<head>`
- Use `.section > .section-inner` pattern for all public page content sections
- Use `.section-card > .section-card-header > .section-card-title` for dashboard panels
- Update this file when adding new pages or significant CSS components

### DON'T
- Don't use `!important` — fix specificity instead
- Don't hardcode hex colours outside `:root` — always use `var(--token-name)`
- Don't load external fonts or icon libraries other than the two already set up
- Don't create new JS files — add shared logic to `app.js` or inline scripts
- Don't add a nav `Contact` link (use the footer)
- Don't use `href="#"` — use real hrefs or `onclick="showToast(...)"` for demo actions
- Don't use framework-specific syntax (no React, Vue, Angular)

### Code style
- 2-space indentation in HTML
- BEM-inspired CSS class names: `.block`, `.block-element`, `.block--modifier`
- ES5 compatible JS in inline scripts (avoid arrow functions, `const`/`let` caution)
- Quote all HTML attribute values with double quotes

---

## 8. Footer Spec (all 3 public pages)

| Column | Content |
|---|---|
| **Brand** | Yalla.House wordmark + tagline + company info |
| **Policies** | Privacy Policy · Terms of Service · Cookie Policy |
| **Legal & Compliance** | GDPR & Safety · Security & Data Protection · Imprint |
| **Contact** | Support (mailto) · WhatsApp |

---

## 9. Brand Voice

- Direct, confident, and human — no jargon
- Emphasise: no fees, no commission, full control, transparent process
- Tone: helpful friend, not corporate — "your home", "keep every penny"
- CTA copy: **"List Your Place"** (not "property"), **"Home Hunter"** (not "buyer")

---

*Last updated: Mar 2026 — maintained by Claude Code*
