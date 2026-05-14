# Tech Stack & Infrastructure

## Frontend
- **Next.js 14** (App Router) at apps/web/ — deployed on Vercel (yalla.house)
- **Tailwind CSS** — all styling via utility classes + brand tokens
- **Vanilla HTML/CSS/JS** — static site at Website/ deployed on GitHub Pages (takals.github.io/Yalla.House)
- **Lucide icons** — both lucide-react (Next.js) and CDN (vanilla)

## Backend
- **Supabase** (project: suchdotsrrlsfxrvsmvy) — Postgres + Auth + Edge Functions + RLS
- **Inngest** — background jobs (portal sync, referral processing)
- **Vercel** — hosting + serverless functions (Hobby plan)

## Key Accounts
- GitHub: takals/Yalla.House (PAT at .claude/.gh-token)
- Vercel: takals-projects/yalla-house (PAT at .claude/.vercel-token, API blocked from sandbox)
- Figma: admin@yalla.house (team 1623588014359894429)
- Supabase: suchdotsrrlsfxrvsmvy
- Domain: yalla.house

## Deployment Flow
1. Push to main → Vercel auto-deploys (40-60s build)
2. GitHub Pages deploys Website/ folder separately
3. CI runs on PRs only (not pushes) — lint, type-check, test, build
4. Push via: `git push https://x-access-token:{PAT}@github.com/takals/Yalla.House.git HEAD:main`

## Brand
- Primary: #D4764E (Terracotta Orange)
- Dark pages: #0D0D0D bg, white text
- Light dashboards: #F8FAFC bg, slate text
- Font: Plus Jakarta Sans (Next.js), Outfit (vanilla)
