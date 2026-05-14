# Agent DB — Morning Report

**Run timestamp:** 2026-05-03T00:11:00Z
**Generated:** 2026-05-03 09:00 (scheduled task)

⚪ **Agent DB: no new agents overnight, enrichment progressing**

- Total agents: **17,014** (no change)
- With email: **9,705** (+11 overnight)
- With phone: **11,110** (+4 overnight)
- With website: 4,536
- With postcode: 16,243

**Pipeline activity**
- Scrape: pages 1-200 of Propertymark re-checked, all duplicates (dedup clean). Next run starts at page 201.
- Enrich (Propertymark): 487 profiles enriched, 272 phones / 114 websites / 472 postcodes found. Next offset: 500.
- Enrich (CF emails): 5 batches of 100, 0 new decodes (first 500 already done). Next offset: 500.

**Errors / notes**
- Phase 3 had cold-start retries on every batch but all recovered after 30s delay — non-blocking.
- **Notion ping skipped: API token returned 401 unauthorized.** Notion auth is still broken from the email switch (memory note `project_notion_down`). This morning report fell back to a local file. Tarek needs to reauth the Notion MCP before scheduled tasks can resume pinging his phone.

**Action needed:** Reauth Notion MCP. Pipeline itself ran cleanly — enrichment is progressing on deeper offsets. Next overnight run targets pages 201+ and enrichment offsets 500+ where new agents and undecoded emails are likelier.
