#!/bin/bash
# Vercel deployment sync — pulls recent deploys + latest build logs
# into .claude/vercel-logs/ for Claude to read from the sandbox.
#
# Usage: double-click this file in Finder, or run:
#   ~/Desktop/Yalla.House/.claude/vercel-sync.command
#
# Claude generated this — the sandbox can't reach api.vercel.com,
# but it CAN read whatever this script writes to .claude/vercel-logs/.

set -e
cd "$(dirname "$0")"

TOKEN_FILE="./.vercel-token"
OUT_DIR="./vercel-logs"

if [ ! -f "$TOKEN_FILE" ]; then
  echo "ERROR: token file not found at $TOKEN_FILE" >&2
  exit 1
fi

TOKEN=$(tr -d '[:space:]' < "$TOKEN_FILE")
if [ -z "$TOKEN" ]; then
  echo "ERROR: token file is empty" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"
TS=$(date -u +%Y-%m-%dT%H:%M:%SZ)
AUTH="Authorization: Bearer $TOKEN"

echo "==> Fetching projects…"
curl -sS -H "$AUTH" "https://api.vercel.com/v9/projects?limit=20" \
  > "$OUT_DIR/projects.json"

# Pick the project whose name contains "yalla" (first match).
PROJECT_ID=$(python3 -c "
import json, sys
with open('$OUT_DIR/projects.json') as f:
    data = json.load(f)
for p in data.get('projects', []):
    if 'yalla' in p.get('name', '').lower():
        print(p['id']); break
")

if [ -z "$PROJECT_ID" ]; then
  echo "ERROR: no project with 'yalla' in the name found." >&2
  echo "See $OUT_DIR/projects.json for the full list." >&2
  exit 1
fi
echo "    project id: $PROJECT_ID"

echo "==> Fetching recent deployments…"
curl -sS -H "$AUTH" \
  "https://api.vercel.com/v6/deployments?projectId=$PROJECT_ID&limit=10" \
  > "$OUT_DIR/deployments.json"

LATEST_UID=$(python3 -c "
import json
with open('$OUT_DIR/deployments.json') as f:
    data = json.load(f)
deps = data.get('deployments', [])
if deps:
    print(deps[0]['uid'])
")

if [ -n "$LATEST_UID" ]; then
  echo "    latest deployment: $LATEST_UID"
  echo "==> Fetching deployment detail…"
  curl -sS -H "$AUTH" \
    "https://api.vercel.com/v13/deployments/$LATEST_UID" \
    > "$OUT_DIR/latest-deployment.json"

  echo "==> Fetching build events (logs)…"
  curl -sS -H "$AUTH" \
    "https://api.vercel.com/v3/deployments/$LATEST_UID/events?limit=1000" \
    > "$OUT_DIR/latest-events.json"
fi

# Small summary Claude can read first.
python3 -c "
import json
with open('$OUT_DIR/deployments.json') as f:
    data = json.load(f)
deps = data.get('deployments', [])
summary = {
    'fetched_at': '$TS',
    'project_id': '$PROJECT_ID',
    'count': len(deps),
    'deployments': [
        {
            'uid': d.get('uid'),
            'url': d.get('url'),
            'state': d.get('state') or d.get('readyState'),
            'target': d.get('target'),
            'created': d.get('created'),
            'meta_commit': (d.get('meta') or {}).get('githubCommitSha', '')[:7],
            'meta_msg': (d.get('meta') or {}).get('githubCommitMessage', '')[:80],
        }
        for d in deps
    ],
}
with open('$OUT_DIR/summary.json', 'w') as f:
    json.dump(summary, f, indent=2)
print(json.dumps(summary, indent=2))
"

echo ""
echo "==> Done. Files written to $OUT_DIR/"
echo "    - summary.json           (quick overview)"
echo "    - deployments.json       (full deployment list)"
echo "    - latest-deployment.json (latest deploy detail)"
echo "    - latest-events.json     (build logs)"
echo ""
echo "Press any key to close…"
read -n 1 -s
