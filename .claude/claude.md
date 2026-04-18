# Claude Project Instructions

> Yalla.House — cross-country property platform. Flat-fee selling, no commission. Sellers list directly on portals (Rightmove, Zoopla, ImmoScout24, Immowelt) and keep every pound/euro.

## ⚠️ UNIVERSAL RULE — Multi-Country Architecture
**This is the #1 rule. Every feature MUST follow it.**

- NEVER hardcode country codes (`'DE'`, `'GB'`), currencies, or market logic
- Country resolution: `countryFromLocale(locale)` → `getCountryConfig(code)`
- All market config lives in `lib/country-config.ts` — currencies, portals, postal formats, regions
- All UI strings via `next-intl` — no inline language ternaries
- New country = add config + translations + DB seed rows — zero code changes
- Full spec: see `Yalla-Universal-Requirements.docx` and `rules/code-style.md`

## Tech Stack
**Production app:** Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · Supabase · Inngest · next-intl
**Legacy pages:** Vanilla HTML5 · CSS3 tokens · Vanilla JS · Lucide icons (in `Website/`)

## File Structure
```
apps/web/                  ← Next.js production app
├── src/app/[locale]/      ← All routes (locale-prefixed)
│   ├── owner/             ← Owner dashboard + listing management
│   ├── hunter/            ← Home hunter dashboard + passport
│   ├── agent/             ← Agent dashboard
│   └── admin/             ← Admin panel
├── src/lib/               ← Shared utilities
│   ├── country-config.ts  ← ⭐ Central market config (COUNTRY_CONFIGS)
│   ├── detect-country.ts  ← Locale → country resolution
│   └── supabase/          ← DB client
├── messages/de.json       ← German translations (primary)
├── messages/en.json       ← English translations
Website/                   ← Legacy vanilla HTML pages
├── style.css · app.js     ← Shared styles + JS
├── index.html · services.html · about.html
└── dashboards/            ← Legacy dashboards
```

## Rules Index
| File | Scope | Content |
|---|---|---|
| `rules/code-style.md` | All files | **Multi-country rules**, i18n, DO/DON'T, naming |
| `rules/frontend/react.md` | `apps/web/` | Next.js patterns, components, data fetching |
| `rules/frontend/vanilla.md` | `Website/` | Design tokens, typography, components |
| `rules/dashboards.md` | `dashboards/**` | Legacy dashboard layout |
| `rules/public-pages.md` | Root `*.html` | Legacy public page patterns |
