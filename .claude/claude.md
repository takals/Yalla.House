# Claude Project Instructions

> Yalla.House — UK flat-fee property selling platform. No commission, no agent. Sellers list directly on Rightmove & Zoopla and keep every pound.

## Tech Stack
Vanilla HTML5 · CSS3 custom properties · Vanilla JS (ES5 compat) · Lucide icons v0.475.0 (CDN) · Plus Jakarta Sans (Google Fonts)

## File Structure
```
Website/
├── CLAUDE.md              ← Extended reference (full style guide)
├── style.css              ← Single global stylesheet (all design tokens here)
├── app.js                 ← Shared JS for owner dashboard only
├── index.html             ← Public landing page
├── services.html          ← Services & Pricing
├── about.html             ← About / Mission
├── list.html              ← Listing wizard (4-step, standalone)
└── dashboards/
    ├── dashboard.html     ← Owner/Seller (uses app.js)
    ├── buyer.html         ← Home Hunter (inline script)
    ├── admin.html         ← Yalla Admin (inline script)
    └── agent.html         ← Field Agent (inline script)
```

> Note: The `LandingPage/` directory has been archived to `_archive/LandingPage/` and is no longer part of this build.

## Critical Path Rules (dashboards/)
- Assets: `href="../style.css"`, `src="../app.js"`
- Public pages: `href="../index.html"`, `href="../list.html"`
- Sibling dashboards: `href="dashboard.html"` (no `../` prefix)
- Public pages referencing dashboards: `href="dashboards/dashboard.html"`

## Toast System
`showToast(message, type)` — type is `'success'` (default), `'error'`, `'info'`
- Defined in `app.js` for `dashboard.html`
- **Duplicated inline** in buyer.html, admin.html, agent.html, and all 3 public pages

## Rules Index
| File | Scope | Content |
|---|---|---|
| `rules/code-style.md` | All files | DO/DON'T, indentation, naming, JS style |
| `rules/frontend/vanilla.md` | All HTML/CSS | Design tokens, typography, components |
| `rules/dashboards.md` | `dashboards/**` | Dashboard layout, page-by-page notes |
| `rules/public-pages.md` | Root `*.html` | Public page patterns, footer spec, brand voice |
