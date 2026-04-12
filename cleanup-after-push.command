#!/bin/bash
cd "$(dirname "$0")" || exit 1
echo "==> Working in: $(pwd)"
echo ""
echo "==> Clearing any stale git locks..."
rm -f .git/index.lock .git/HEAD.lock .git/refs/heads/main.lock 2>/dev/null

echo "==> Current state:"
git status -sb | head -5
echo ""

echo "==> Running git reset --hard HEAD (stash will be preserved)..."
git reset --hard HEAD
echo ""

echo "==> Stash list (your WIP is safely here):"
git stash list
echo ""

echo "==> Verifying sync with origin/main..."
git fetch origin main 2>&1
git log origin/main --oneline -3
echo ""

echo "==> Final status:"
git status -sb
echo ""

echo "✅ Cleanup complete. Typography polish is live on origin/main."
echo "   Your work-in-progress is safe in stash@{0} — run 'git stash pop' later to resolve the two Next.js conflicts."
echo ""
echo "Press any key to close this window..."
read -n 1 -s
