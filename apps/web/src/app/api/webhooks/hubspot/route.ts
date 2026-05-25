/**
 * HubSpot webhooks → Yalla.House
 *
 * Receives webhook events from HubSpot (deal stage changes, contact updates,
 * ticket events, etc.) and dispatches them to the appropriate handler.
 *
 * Configure in HubSpot → Private Apps → Yalla.House Backend → Webhooks:
 *   Target URL: https://yalla.house/api/webhooks/hubspot
 *   Subscriptions: contact.creation, contact.propertyChange,
 *                  deal.creation, deal.propertyChange (for hs_pipeline_stage)
 *
 * Security:
 *   - Verifies x-hubspot-signature-v3 header against HUBSPOT_CLIENT_SECRET
 *   - Rejects requests older than 5 minutes (replay protection)
 *   - Returns 401 on verification failure (HubSpot retries with backoff)
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'

const SIGNATURE_VERSION = 'v3'
const MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000 // 5 minutes

interface HubSpotEvent {
  eventId: number
  subscriptionId: number
  portalId: number
  appId: number
  occurredAt: number
  subscriptionType: string
  attemptNumber: number
  objectId: number
  changeSource?: string
  propertyName?: string
  propertyValue?: unknown
}

export async function POST(req: NextRequest) {
  const secret = process.env.HUBSPOT_CLIENT_SECRET
  if (!secret) {
    // Misconfigured — fail closed
    console.error('[hubspot-webhook] HUBSPOT_CLIENT_SECRET not set; rejecting')
    return new NextResponse('Webhook secret not configured', { status: 500 })
  }

  const signature = req.headers.get(`x-hubspot-signature-${SIGNATURE_VERSION}`)
  const timestamp = req.headers.get('x-hubspot-request-timestamp')

  if (!signature || !timestamp) {
    return new NextResponse('Missing signature headers', { status: 401 })
  }

  // Replay protection: reject stale requests
  const ts = Number(timestamp)
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > MAX_TIMESTAMP_AGE_MS) {
    return new NextResponse('Stale request', { status: 401 })
  }

  const body = await req.text()
  const url = req.nextUrl.toString()
  const sigBase = `${req.method}${url}${body}${timestamp}`
  const expected = crypto
    .createHmac('sha256', secret)
    .update(sigBase, 'utf8')
    .digest('base64')

  // Constant-time compare to prevent timing attacks
  const sigBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expected)
  if (
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    return new NextResponse('Invalid signature', { status: 401 })
  }

  // Parse and dispatch
  let events: HubSpotEvent[]
  try {
    events = JSON.parse(body)
    if (!Array.isArray(events)) {
      return new NextResponse('Expected JSON array', { status: 400 })
    }
  } catch {
    return new NextResponse('Invalid JSON', { status: 400 })
  }

  for (const evt of events) {
    try {
      await dispatchEvent(evt)
    } catch (err) {
      // Log per-event failures but ack the batch so HubSpot doesn't retry
      // the whole payload. Production: re-emit failed events to Inngest DLQ.
      console.error('[hubspot-webhook] dispatch failed', evt.eventId, err)
    }
  }

  return NextResponse.json({ received: events.length })
}

/**
 * Route a single HubSpot event to its handler.
 *
 * TODO: replace console.log with real handlers — Inngest events are a good
 * fit, e.g. `inngest.send({ name: 'hubspot/contact.updated', data: { ... } })`.
 */
async function dispatchEvent(evt: HubSpotEvent): Promise<void> {
  switch (evt.subscriptionType) {
    case 'contact.creation':
      console.log('[hubspot] contact created', evt.objectId)
      // TODO: optionally backfill into public.users
      break

    case 'contact.propertyChange':
      console.log(
        '[hubspot] contact property change',
        evt.objectId,
        evt.propertyName,
        '→',
        evt.propertyValue,
      )
      // TODO: react to lifecyclestage changes (e.g. mark customer in DB)
      break

    case 'deal.propertyChange':
      if (evt.propertyName === 'dealstage') {
        console.log(
          '[hubspot] deal stage change',
          evt.objectId,
          '→',
          evt.propertyValue,
        )
        // TODO: when a deal moves to "Completed / Sold", trigger:
        //   - mark listing as SOLD in supabase
        //   - issue referrer payout via Stripe Connect
        //   - send congratulations email via Resend
      }
      break

    default:
      console.log('[hubspot] unhandled event', evt.subscriptionType, evt.objectId)
  }
}
