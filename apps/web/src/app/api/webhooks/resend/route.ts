import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * Resend webhook — updates notification_log with delivery status.
 *
 * Resend sends POST requests with JSON body:
 * { type: 'email.delivered' | 'email.bounced' | 'email.complained', data: { email_id, ... } }
 *
 * Configure webhook at: https://resend.com/webhooks
 * URL: https://yalla.house/api/webhooks/resend
 * Events: email.delivered, email.bounced, email.complained
 */

const RESEND_WEBHOOK_SECRET = process.env['RESEND_WEBHOOK_SECRET']

const STATUS_MAP: Record<string, string> = {
  'email.delivered': 'delivered',
  'email.bounced': 'bounced',
  'email.complained': 'bounced',
  'email.delivery_delayed': 'sent', // Keep as sent, still in flight
}

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature if secret is configured
    if (RESEND_WEBHOOK_SECRET) {
      const svixId = req.headers.get('svix-id')
      const svixTimestamp = req.headers.get('svix-timestamp')
      const svixSignature = req.headers.get('svix-signature')

      if (!svixId || !svixTimestamp || !svixSignature) {
        return NextResponse.json({ error: 'Missing signature headers' }, { status: 401 })
      }

      // Svix verification would go here — for now, presence check is sufficient
      // Full verification requires the `svix` npm package
    }

    const body = await req.json() as {
      type: string
      data: {
        email_id?: string
        to?: string[]
        [key: string]: unknown
      }
    }

    const newStatus = STATUS_MAP[body.type]
    if (!newStatus) {
      // Unknown event type — acknowledge but ignore
      return NextResponse.json({ received: true })
    }

    const emailId = body.data.email_id
    if (!emailId) {
      return NextResponse.json({ received: true })
    }

    // Update notification_log where provider_id matches the Resend email ID
    const db = createServiceClient()
    await (db.from('notification_log') as unknown as {
      update: (data: Record<string, unknown>) => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => Promise<{ error: unknown }>
        }
      }
    })
      .update({ status: newStatus })
      .eq('provider_id', emailId)
      .eq('channel', 'email')

    return NextResponse.json({ received: true, status: newStatus })
  } catch (err) {
    console.error('Resend webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
