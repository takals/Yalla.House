/**
 * POST /api/leads/demo-request
 *
 * Public endpoint behind the /demo form. Creates (or updates) a HubSpot
 * contact tagged as a Marketing Qualified Lead, with persona, market, and
 * referral attribution from the form payload.
 *
 * Returns 200 on success even if HubSpot fails — the goal is to never lose
 * a lead. Failures are logged for the operator to follow up.
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { hubspot } from '@yalla/integrations'

const RoleEnum = z.enum(['owner', 'hunter', 'agent', 'other'])
const LocaleEnum = z.enum(['de', 'en'])
const SourceEnum = z
  .enum([
    'organic',
    'direct',
    'paid_search',
    'paid_social',
    'content',
    'referrer',
    'partner',
    'outbound',
    'other',
  ])
  .optional()

const Body = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().max(80).optional(),
  email: z.string().trim().email(),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(120).optional(),
  role: RoleEnum,
  message: z.string().trim().max(2000).optional(),
  market: z.enum(['DE', 'UK']).default('DE'),
  locale: LocaleEnum.default('de'),
  referralSource: SourceEnum,
  // Honeypot — if filled, treat as spam
  website: z.string().max(0).optional(),
})

export async function POST(req: NextRequest) {
  let payload: z.infer<typeof Body>
  try {
    const json = await req.json()
    payload = Body.parse(json)
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: 'invalid_payload', detail: String(err) },
      { status: 400 },
    )
  }

  // Honeypot triggered — accept silently so the bot thinks it worked
  if (payload.website && payload.website.length > 0) {
    return NextResponse.json({ ok: true })
  }

  // Best-effort HubSpot upsert. We always 200 the user even on failure,
  // then log so an operator can backfill manually.
  if (!process.env.HUBSPOT_PRIVATE_APP_TOKEN) {
    console.warn('[demo-request] HUBSPOT_PRIVATE_APP_TOKEN missing — lead dropped on the floor:', payload.email)
    return NextResponse.json({ ok: true })
  }

  try {
    const client = new hubspot.HubSpotClient()
    const now = new Date()
    await hubspot.upsertContact(client, {
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      role: payload.role === 'other' ? 'other' : payload.role,
      market: payload.market,
      locale: payload.locale,
      referralSource: payload.referralSource ?? 'direct',
      signupAt: now,
      lastActiveAt: now,
    })

    // If the visitor wrote a message, attach it as a Note on the contact
    // via a follow-up call. (Notes API requires the contactId; we'd need to
    // fetch it back. Skipped here for simplicity — wire up if needed.)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[demo-request] HubSpot upsert failed:', err, 'email:', payload.email)
    // Still 200 — we don't want the user to see an error after submitting
    return NextResponse.json({ ok: true })
  }
}
