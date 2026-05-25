# Yalla.House — Weekly Phase Check-in
**Date:** Mon 2026-05-18
**Run:** automated (scheduled task)

## ⚠️ Notion is still down
The scheduled task tried to update the Notion phase-gate task directly, but the connector returned **401 Unauthorized** on both `notion-fetch` and `notion-search` calls. This matches the existing memory note (`project_notion_down.md`) about the email switch breaking auth. **Action required:** reconnect Notion in Cowork before the next weekly run on Mon 2026-05-25.

Until Notion is restored, weekly check-ins land in this file instead of the Master To-Do List. Path pattern: `scheduled-reports/phase-checkin-YYYY-MM-DD.md`.

## Current phase (inferred from local state)
**MVP → Phase 1** is still the active gate. Triggers: 10 owner sign-ups + 5 agent responses, target **May 2026**.

I can't read live sign-up / response counts without Notion (or an auth'd Supabase query in scope for this task), so this is based on commit activity and memory only. If the counts are already hit, manually flip the 🚩 gate to Done once Notion is back.

## What shipped this week (last 7 days)
Eleven commits to `main` between 2026-05-12 and 2026-05-15 — all squarely on the MVP→Phase 1 critical path:

**Agent invite flow (the "5 agent responses" trigger)**
- `beba82a` Redesign agent brief flow — select all, draft preview, commission notes
- `21cecce` Tier-specific agent invite emails (advisory / assisted / managed)
- `74e70b2` Branded email templates with audience-specific benefit sections
- `4837492` Draft brief preview now matches actual email templates
- `3ecd8b1` `/api/email-preview` route for live email QA
- `5e4a770` Agent invite flow wired end-to-end — select agents, create invites, auth gate
- `8cf8d45` Server-side postcode matching against the 17K agent database
- `d83344d` Case-insensitive postcode search, mobile layout, agent invite tracking

**Property workspace (the "10 owner sign-ups" trigger)**
- `dc3bedb` Property Workspace Phase 1 shell
- `743873a` Property Workspace Phase 2 — real uploads, i18n, address split, currency
- `af3e43c` Example listing now shows the real Yoxley Drive property

**Read:** the MVP→Phase 1 gate is being actively worked. Owner-side + agent-side both moved this week.

## Blockers (from memory, not Notion)
1. **Notion auth** — blocks this scheduled task's primary output. Highest priority to restore.
2. **GitHub PAT expired (2026-05-10)** — `.gh-token` no longer works; pushes are going via GitHub Desktop. Not a phase-gate blocker, but worth refreshing while you're already in account-maintenance mode.
3. **Stripe** — still blocked on company registration. Not on the MVP→Phase 1 critical path (no payments needed to hit the trigger), but it's the long pole for Phase 2 → Phase 3 ("first revenue").

## Suggested next actions
- **Reconnect Notion** so next Monday's check-in can write to the To-Do List as intended.
- **Manually log this week's wins** into the MVP→Phase 1 phase-gate task Notes field once Notion is back — copy the "What shipped this week" section above.
- **Owner sign-up counter** — when Notion's back, add a property to the phase-gate task that pulls the current owner-signup / agent-response counts from Supabase so future weekly runs can auto-evaluate the trigger condition instead of inferring it.
- **Refresh GH PAT** and update `.gh-token` so direct pushes work again.

## Working directory state at run time
- Branch: `main`
- Uncommitted: scheduled-report JSON state files + `apps/web/tsconfig.tsbuildinfo` (build artefacts — safe to ignore or `.gitignore`)
- Untracked: `agent-morning-report-2026-05-17.md`, `morning-reports/`, sibling `scheduled-reports/*.md` (other scheduled-task outputs)

---
*Next scheduled run: Mon 2026-05-25. If Notion is reconnected by then, the next report will write directly into the Master To-Do List and this file won't be created.*
