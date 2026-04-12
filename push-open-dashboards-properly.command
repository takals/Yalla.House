#!/bin/bash
# Push the "open dashboards properly" change set:
#  - removes page-level auth/login redirects across all role layouts + pages
#  - adds a PREVIEW_USER_ID fallback so server queries don't crash for null user
#  - drops the "Anmelden" CTA in the public header in favour of "Dashboards ansehen"
#
# Only stages files we know are safe — leaves untracked WIP dirs alone.

set -e
cd "$(dirname "$0")"

echo "→ Branch: $(git rev-parse --abbrev-ref HEAD)"

# New helper file
git add apps/web/src/lib/preview-user.ts

# Layouts
git add apps/web/src/app/\[locale\]/admin/layout.tsx
git add apps/web/src/app/\[locale\]/agent/layout.tsx
git add apps/web/src/app/\[locale\]/hunter/layout.tsx
git add apps/web/src/app/\[locale\]/owner/layout.tsx

# Pages (only the ones that already exist on origin/main)
git add apps/web/src/app/\[locale\]/admin/page.tsx
git add apps/web/src/app/\[locale\]/agent/page.tsx
git add apps/web/src/app/\[locale\]/agent/hunters/page.tsx
git add apps/web/src/app/\[locale\]/agent/profile/page.tsx
git add apps/web/src/app/\[locale\]/hunter/page.tsx
git add apps/web/src/app/\[locale\]/hunter/agents/page.tsx
git add apps/web/src/app/\[locale\]/hunter/inbox/page.tsx
git add apps/web/src/app/\[locale\]/hunter/passport/page.tsx
git add apps/web/src/app/\[locale\]/hunter/settings/page.tsx
git add apps/web/src/app/\[locale\]/owner/page.tsx
git add apps/web/src/app/\[locale\]/owner/listings/page.tsx
git add apps/web/src/app/\[locale\]/owner/new/page.tsx
git add apps/web/src/app/\[locale\]/owner/plans/page.tsx
git add apps/web/src/app/\[locale\]/owner/settings/page.tsx
git add apps/web/src/app/\[locale\]/owner/viewings/page.tsx
git add apps/web/src/app/\[locale\]/owner/\[id\]/page.tsx

# Public header
git add apps/web/src/components/site-header.tsx

echo
echo "→ Staged files:"
git diff --cached --name-only
echo

git commit -m "chore(web): drop page-level auth gates across role dashboards

The middleware-only change in PR #2 was a no-op because every dashboard
page had its own server-side redirect to /auth/login. This change strips
those page-level guards across all owner / hunter / agent / admin
pages and layouts, plus the public site-header.

For server queries that previously relied on user.id, a PREVIEW_USER_ID
sentinel keeps Supabase calls valid — they simply return empty result
sets when there is no signed-in user, so the dashboard renders an
empty-state preview rather than 500ing.

The public header's 'Anmelden' CTA is replaced with 'Dashboards ansehen'
pointing at /owner so visitors can land directly in the product."

git push origin HEAD

echo
echo "✓ Pushed. Open the PR in your browser."
read -n 1 -s -r -p "Press any key to close…"
echo
