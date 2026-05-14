# Yalla.House — Weekly Strategy Check-in

**Week of May 4, 2026** | Auto-generated May 4, 2026

> ⚠️ Notion MCP still returning 401 unauthorized (broken since Apr 12 email migration — now 22 days). This check-in is saved as a local file in the workspace folder + Drive sync. Notion phase-gate task could not be updated automatically. Reconnecting Notion auth remains the meta-blocker for ongoing automated tracking.

---

## Current Phase: MVP (Pre–Phase 1)

**Phase 1 trigger:** 10 owner sign-ups + 5 agent responses · Target: May 2026

Phase gate has **not** flipped. The product surface is now essentially feature-complete for the MVP scope — what's missing remains live users, not capability. We are now inside the Phase 1 target month with no live owner sign-ups or agent responses recorded yet.

---

## Progress Since Last Check-in (Apr 27 → May 4)

A focused polish + stabilisation week after the heavy two-week April build sprint. Themes:

**Build stability & deploy**
- Vercel build unblocking sprint on Apr 28 — TypeScript errors resolved, lockfile aligned, inngest pinned to 3.54.0, server/client boundary fixes
- Heavy "fix Vercel build" cluster suggests a deploy scare that's now resolved
- 6 missing Inngest functions registered (Apr 27) — full async pipeline now live (11 functions: intake patterns, auto-invite agents, brief distribution, agent matching, viewing lifecycle, service routing, referrals, notifications, scoring)

**i18n hardening**
- Final pass on hardcoded strings across Hunter, Owner, Partner, Agent journeys
- Sidebar nav translated across all roles
- Platform now genuinely satisfies the "add a translation file = new country" universal rule

**UX & access**
- Mobile sidebar shipped — swipe overlay + always-visible icon strip
- **Guest browsing mode** — new visitors can explore the dashboard before signup (lowers funnel friction)
- Rich demo content for owner tabs (better empty-state for first-touch users)

**Agent search**
- Rebuilt with server-side postcode matching against the 17K-agent UK database
- Removes the previous client-side filter bottleneck — agent discovery is now production-grade

---

## Phase Gate Assessment

| Gate | Trigger | Status |
|------|---------|--------|
| 🚩 MVP → Phase 1 | 10 owners + 5 agent responses | **Not met** — product complete, GTM not yet started |
| 🚩 Phase 1 → Phase 2 | 50 hunters + 30 agents active | Not started |
| 🚩 Phase 2 → Phase 3 | 200 hunters + 100 agents + first revenue | Not started |
| 🚩 Phase 3 → Phase 4 | 1,000 hunters + 500 agents + unit economics | Not started |

No phase gate triggers are met. Phase 1 target (May 2026) is now this month — slippage risk is high unless GTM kicks off this week.

---

## Blockers (carrying forward — none new this week)

1. **Notion MCP still disconnected** (22 days, since Apr 12) — strategy tasks, To-Do List, and phase-gate task updates inaccessible. Highest-leverage unblock; until restored, check-ins continue to land only as local files.
2. **Stripe blocked** — company registration prerequisite still outstanding. Cannot create products / price IDs; gates any monetisation step in Phase 1.
3. **Reapit Foundations application** — still not submitted. Long lead time; was flagged for Sprint Zero Day 1 in both prior check-ins and remains unactioned.
4. **Sprint Zero start date** — still not locked. Triggers Reapit, agent outreach, first-owner pilot.

No `BLOCKED` markers found in code or markdown — codebase is clean. The blockers above are all GTM / business-state items, not engineering.

---

## Recommendations Going Into Next Week

The diagnosis from last week stands and has hardened: bottleneck is GTM, not build. With Phase 1 target month now live, priorities are unchanged but more urgent:

1. **Lock Sprint Zero kickoff date** — single decision that unblocks Reapit, agent outreach, and pilot recruitment. Highest leverage action.
2. **Submit Reapit Foundations application** — does not need to wait for Sprint Zero plan; long lead time.
3. **Reconnect Notion** — strategy tracking has been operating without its primary system for over three weeks.
4. **Resolve company registration** — unblocks Stripe → unblocks pricing checkout test.
5. **Recruit first 3 pilot owners** — manual, founder-led, hand-held. Product can support them today. This is the only path to the Phase 1 gate trigger.
6. **Set a hard Phase 1 trigger review date** — e.g. May 31. If 10 owners + 5 agents not achieved by then, formally re-baseline the Phase 1 target rather than letting it drift.

---

## Summary

A clean stabilisation week — Vercel deploy unblocked, i18n finished, mobile sidebar + guest mode shipped, agent search rebuilt against the live 17K database. The MVP is a real, stable, demonstrable product. The May Phase 1 target remains technically achievable but is at material risk of slipping unless this week is the one where GTM starts: Sprint Zero locked, Reapit submitted, first pilot owners onboarded by hand. Build velocity is no longer the constraint — founder time on distribution is.

---

*Sources: git log on apps/web (Apr 20 → May 4), local memory files, prior check-ins (strategy-checkin-2026-04-13.md, strategy-checkin-2026-04-27.md). Notion data source 1d7efd0e-74fe-4813-9d17-5fd7c4f16399 inaccessible due to 401 auth error.*
