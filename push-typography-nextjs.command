#!/bin/bash
# ─────────────────────────────────────────────────────────────
# Push Next.js typography port to a new branch
# Creates typography/nextjs-port branch with only apps/web/ changes
# ─────────────────────────────────────────────────────────────

set -e
cd "$(dirname "$0")"

echo "📍 Working directory: $(pwd)"
echo ""

# Make sure we're on main and up to date
echo "→ Checking out main and pulling latest…"
git checkout main
git pull origin main

echo ""
echo "→ Creating new branch: typography/nextjs-port"
git checkout -b typography/nextjs-port 2>/dev/null || git checkout typography/nextjs-port

echo ""
echo "→ Staging Next.js typography files…"
git add apps/web/tailwind.config.ts
git add apps/web/src/app/globals.css
git add "apps/web/src/app/[locale]/(public)/page.tsx"
git add "apps/web/src/app/[locale]/(public)/about/page.tsx"
git add "apps/web/src/app/[locale]/(public)/services/page.tsx"

echo ""
echo "→ Status:"
git status --short

echo ""
echo "→ Committing…"
git commit -m "feat(web): port Apple-grade typography scale to Next.js public pages

Mirrors the Website/style.css token scale into apps/web/:

- tailwind.config.ts: add display/title-1/title-2/lede/body/small
  fontSize tokens with optical letter-spacing, line-height, and
  font-weight tuples. Add tracking-display + spacing.section-top.
- globals.css: optimizeLegibility, kern/liga/ss01 font-features,
  antialiased smoothing, h1-h3 text-wrap: balance.
- (public)/page.tsx (home): HERO uses text-display + text-lede +
  pt-section-top; brand yellow via text-brand token.
- (public)/about/page.tsx: HERO + all section H2s migrated to
  text-title-1, lede paragraphs use text-lede, stat values get
  tabular-nums + tracking-display.
- (public)/services/page.tsx: HERO uses text-display + text-lede +
  pt-section-top; section H2s use text-title-2; lede paragraphs
  use text-lede.

All hardcoded clamp()/tracking values replaced with tokens so the
scale can be tuned from tailwind.config.ts in one place."

echo ""
echo "→ Pushing to origin…"
git push -u origin typography/nextjs-port

echo ""
echo "✅ Done. Branch 'typography/nextjs-port' is on GitHub."
echo ""
echo "Next step: open a PR on https://github.com/takals/Yalla.House"
echo "Vercel will build a preview automatically — click 'View deployment'"
echo "on the PR to see the typography live on a preview URL."
echo ""
echo "Press any key to close…"
read -n 1
