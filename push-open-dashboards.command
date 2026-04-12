#!/bin/bash
# Push: open dashboards (remove auth gate during preview phase)
set -e
cd "$(dirname "$0")"

git checkout main
git pull origin main
git checkout -b chore/open-dashboards 2>/dev/null || git checkout chore/open-dashboards
git add apps/web/src/middleware.ts
git status --short
git commit -m "chore(web): open dashboards during preview phase

Empty protectedPaths so /owner, /hunter, /agent, /admin and /dashboard
no longer redirect to /auth/login. The Supabase middleware machinery is
left in place — re-add paths to protectedPaths to gate them again later."
git push -u origin chore/open-dashboards
echo ""
echo "✅ Pushed. Open the PR: https://github.com/takals/Yalla.House/pull/new/chore/open-dashboards"
read -n 1
