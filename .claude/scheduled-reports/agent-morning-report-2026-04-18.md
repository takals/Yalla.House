# Agent Database — Morning Report

**Date:** 2026-04-18 09:00 UTC
**Status:** 🔴 Collector status unknown — Notion ping failed (auth token invalid)

## Summary (Apple Watch format)

```
🔴 Agent DB: collector status unknown
Total: 16,993 | Email: 9,005 | Phone: 10,932
Website: 4,528 | Postcode: 16,243
Notion auth down — manual review needed.
```

## Detail

### Collector run
- Could not read `/Users/tarekalsaleh/Documents/Claude/Scheduled/agent-collector/last-run.json` — path is outside the Cowork sandbox, so freshness cannot be confirmed from this environment.
- If the scheduled collector did run at midnight, its output JSON is sitting on the user's local disk but isn't reachable from here. Worth checking manually.

### Live DB snapshot (propertymark data source)
| Metric | Count |
|---|---|
| Total agents | 16,993 |
| With email | 9,005 (53%) |
| With phone | 10,932 (64%) |
| With website | 4,528 (27%) |
| With postcode | 16,243 (96%) |

Source: Supabase `agent_profiles` where `data_source = 'propertymark'`.

### Notion ping
- Attempted to search for "Agent Database" page in Notion to post a comment.
- Returned `401 unauthorized — API token is invalid`.
- Matches known issue: "Notion temporarily down — email switch broke auth" from auto-memory.
- Tarek needs to reconnect the Notion MCP token before the daily ping channel works again.

## Action for Tarek
1. Reconnect Notion MCP (token has expired since the email switch).
2. Verify the overnight agent-collector scheduled task ran — check `/Users/tarekalsaleh/Documents/Claude/Scheduled/agent-collector/last-run.json` on your Mac for today's timestamp.
3. Once Notion is back up, this report will post straight to the Apple Watch ping channel again.
