import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { validateTwilioSignature } from '@/lib/twilio'

/**
 * Twilio StatusCallback webhook — updates notification_log with SMS delivery status.
 *
 * Twilio sends POST with form-urlencoded body containing:
 * MessageSid, MessageStatus (queued, sent, delivered, undelivered, failed), ...
 *
 * Configure as StatusCallback URL when sending SMS, or set at account level.
 * URL: https://yalla.house/api/webhooks/twilio
 */

const TWILIO_STATUS_MAP: Record<string, string> = {
  delivered: 'delivered',
  sent: 'sent',
  queued: 'sent',
  failed: 'failed',
  undelivered: 'failed',
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const params: Record<string, string> = {}
    formData.forEach((value, key) => {
      params[key] = String(value)
    })

    // Validate Twilio signature
    if (!validateTwilioSignature(req, params)) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const messageSid = params['MessageSid']
    const messageStatus = params['MessageStatus']

    if (!messageSid || !messageStatus) {
      return NextResponse.json({ received: true })
    }

    const newStatus = TWILIO_STATUS_MAP[messageStatus]
    if (!newStatus) {
      return NextResponse.json({ received: true })
    }

    // Update notification_log where provider_id matches the Twilio Message SID
    const db = createServiceClient()
    const updateData: Record<string, unknown> = { status: newStatus }

    // If failed, include error info
    if (newStatus === 'failed') {
      const errorCode = params['ErrorCode']
      const errorMessage = params['ErrorMessage']
      if (errorCode || errorMessage) {
        updateData.error_detail = `${errorCode ?? ''}: ${errorMessage ?? 'Unknown error'}`
      }
    }

    await (db.from('notification_log') as unknown as {
      update: (data: Record<string, unknown>) => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => Promise<{ error: unknown }>
        }
      }
    })
      .update(updateData)
      .eq('provider_id', messageSid)
      .eq('channel', 'sms')

    return NextResponse.json({ received: true, status: newStatus })
  } catch (err) {
    console.error('Twilio webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
