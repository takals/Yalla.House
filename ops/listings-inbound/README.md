# Inbound listings — `listings@yalla.house` setup runbook

Agents paste **listings@yalla.house** into their own property mailouts. We
receive those emails, parse listing candidates, and review/distribute them in
the admin queue at **/admin/listings**.

This is the **free, no-new-vendor** setup: it uses the Google Workspace you
already have, so there is **no SendGrid/Postmark account and no DNS/MX change**
(mail for `yalla.house` already routes to Google Workspace).

## How it flows
```
Agent's mailout ──▶ listings@yalla.house (Google Group)
                        └─▶ Workspace mailbox
                              └─▶ Apps Script (every 5 min)
                                    └─▶ POST /api/inbound/agent-listings   (x-inbound-secret)
                                          ├─ agent_inbound_emails  (raw)
                                          └─ agent_inbound_listings (parsed) ──▶ /admin/listings
```

## One-time setup (~10 min, requires a Google Workspace admin)

1. **Create the address.** Google Admin (admin.google.com) → Directory →
   Groups → Create group **listings@yalla.house**. Add the mailbox that should
   collect the mail as a member (e.g. the founder/ops inbox). Access: allow
   external senders to post (agents email in from outside).

2. **Create the script.** Sign in to that mailbox → https://script.google.com →
   New project → paste `listings-forwarder.gs` from this folder.

3. **Add script properties.** Project Settings (gear) → Script properties → add:
   - `WEBHOOK_URL` = `https://yalla.house/api/inbound/agent-listings`
   - `INBOUND_SECRET` = *the shared secret in the Notion access register*

4. **Set the same secret on Vercel.** Vercel → project → Settings → Environment
   Variables → add `INBOUND_LISTINGS_SECRET` = *same value* → redeploy. Until
   this is set, the webhook safely returns 503 and nothing is lost.

5. **Authorise + schedule.** In the script editor, run `forwardListings` once
   and grant the Gmail + external-request permissions. Then Triggers (clock
   icon) → Add trigger → `forwardListings` → Time-driven → Minutes timer →
   Every 5 minutes.

## Verify
- Send a test email to `listings@yalla.house` with a price + postcode (e.g.
  "3 bed flat, E11 3AA, £575,000, https://rightmove.co.uk/properties/123").
- Within ~5 min it appears in **/admin/listings** as a `new` candidate.
- The thread gets a `yalla-forwarded` Gmail label so it isn't re-sent (the
  server also de-dupes on the Gmail message id, so re-sends are harmless).

## Alternative (if you'd rather not run a script)
**SendGrid Inbound Parse** (free tier) POSTs directly to the same endpoint —
our route already accepts SendGrid's multipart format. It needs a SendGrid
account and an MX record on a subdomain (e.g. `inbound.yalla.house` →
`mx.sendgrid.net`) so the Workspace MX on the root domain stays untouched. More
robust, but adds one vendor. The Apps Script path above avoids that.

## Cost
£0. Google Workspace (already paid), Vercel + Supabase (existing). No per-message
or vendor fees.
