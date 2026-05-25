# @yalla/integrations/hubspot

HubSpot CRM integration for Yalla.House.

## What's here

| File | Purpose |
|---|---|
| `client.ts` | Typed `fetch` wrapper. Reads `HUBSPOT_PRIVATE_APP_TOKEN` from env. |
| `contacts.ts` | `upsertContact`, `getContactByEmail`, `deleteContactByEmail`. |
| `events.ts` | Client-side `identifyUser`, `trackEvent`, `trackPageView` for the browser `_hsq` queue. |
| `types.ts` | TypeScript types for Yalla user roles, markets, locales, listing status. |

## Setup

Run the schema bootstrap script once per HubSpot environment (it's idempotent):

```bash
export HUBSPOT_PRIVATE_APP_TOKEN=pat-eu1-...
node scripts/hubspot/setup-schema.mjs
```

This creates the `Yalla.House` property group, 18 custom contact properties, and the `Yalla Owner Pipeline` deal pipeline.

## Required env vars

```
NEXT_PUBLIC_HUBSPOT_PORTAL_ID=148557344     # public — embeds in the tracking script
HUBSPOT_PRIVATE_APP_TOKEN=pat-eu1-...       # server-only, store in secret manager
HUBSPOT_OWNER_PIPELINE_ID=...                # printed by setup-schema.mjs
HUBSPOT_CLIENT_SECRET=...                    # for webhook signature verification
```

## Server-side usage

```ts
import { hubspot } from '@yalla/integrations'

const client = new hubspot.HubSpotClient()

await hubspot.upsertContact(client, {
  email: user.email,
  firstName: user.firstName,
  role: 'owner',
  market: 'DE',
  locale: 'de',
  referralSource: 'organic',
  signupAt: user.createdAt,
  listingCount: 1,
  listingStatus: 'draft',
})
```

Use this in:
- Supabase auth webhook (new signup → create HubSpot contact)
- Inngest functions (listing status changes, payouts)
- API routes that handle form submissions

## Client-side usage

The tracking script is mounted globally in `apps/web/src/app/[locale]/layout.tsx`. From any client component:

```ts
'use client'
import { hubspot } from '@yalla/integrations'

// In an auth callback or login flow:
hubspot.identifyUser({
  email: user.email,
  id: user.id,
  role: 'owner',
  market: 'DE',
  locale: 'de',
})

// In a feature handler:
hubspot.trackEvent(
  process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID!,
  'listing_created',
  { property_type: 'apartment', city: 'Berlin' },
)
```

## Required Private App scopes

When creating the Private App in HubSpot, grant these scopes:

- `crm.objects.contacts.read` / `crm.objects.contacts.write`
- `crm.objects.deals.read` / `crm.objects.deals.write`
- `crm.objects.companies.read` / `crm.objects.companies.write`
- `crm.schemas.contacts.read` / `crm.schemas.contacts.write` (for setup-schema.mjs)
- `crm.schemas.deals.read` / `crm.schemas.deals.write` (for setup-schema.mjs)
- `tickets` (read/write)
- `behavioral_events.send` (for server-side custom events, optional)

## Security

- The Private App token has full CRM access. Store it ONLY in your secret manager (Doppler / Vercel env vars / AWS Secrets Manager).
- Never commit tokens. The `.env.example` placeholder is intentional.
- Rotate every 90 days via HubSpot Settings → Private Apps → Auth → Rotate.
- All server calls go through `HubSpotClient`, which never logs the token.

## GDPR

Yalla.House operates in Germany. For a data subject erasure request, call:

```ts
await hubspot.deleteContactByEmail(client, 'user@example.com')
```

HubSpot will hard-delete the contact and all associated activity within 90 days per their DPA.
