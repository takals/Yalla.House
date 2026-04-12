import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { validateTwilioSignature } from '@/lib/twilio'

const SMS_INSTRUCTIONS =
  'Yalla.House: Antworten Sie mit dem Referenzcode (z.B. yh_de_abc123) oder fügen Sie den Portal-Link ein.'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const params = Object.fromEntries(form.entries()) as Record<string, string>
  if (!validateTwilioSignature(req, params)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const from = params['From'] ?? ''
  const to = params['To'] ?? ''

  // Send SMS instructions to the caller via Twilio REST API
  await sendOutboundSms(from, SMS_INSTRUCTIONS)

  // Log the call
  await logCommsEvent({
    channel: 'voice',
    from_number: from,
    to_number: to,
    event_type: 'VOICE_CALL_STARTED',
  })

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="de-DE">
    Vielen Dank für Ihren Anruf bei Yalla.House.
    Wir haben Ihnen gerade eine SMS gesendet.
    Bitte antworten Sie darauf mit dem Referenzcode oder dem Portal-Link.
    Auf Wiederhören.
  </Say>
  <Hangup/>
</Response>`

  return new NextResponse(twiml, {
    headers: { 'Content-Type': 'text/xml' },
  })
}

async function sendOutboundSms(to: string, body: string) {
  const accountSid = process.env['TWILIO_ACCOUNT_SID']
  const authToken = process.env['TWILIO_AUTH_TOKEN']
  const from = process.env['TWILIO_PHONE_DE']

  if (!accountSid || !authToken || !from) return

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

  await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }).toString(),
    }
  )
}

async function logCommsEvent(event: {
  channel: string
  from_number: string
  to_number: string
  event_type: string
  message_body?: string
  match_type?: string
  listing_id?: string
}) {
  const db = createServiceClient()
  await (db.from('comms_events') as any).insert(event)
}
