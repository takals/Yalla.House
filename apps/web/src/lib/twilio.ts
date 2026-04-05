import { createHmac } from 'crypto'
import { NextRequest } from 'next/server'

/**
 * Validates that an inbound webhook request genuinely came from Twilio.
 * Uses HMAC-SHA1 over (URL + sorted POST params) signed with TWILIO_AUTH_TOKEN.
 * Returns true in development (no auth token set) so local testing works without Twilio.
 */
export function validateTwilioSignature(
  req: NextRequest,
  params: Record<string, string>,
): boolean {
  const authToken = process.env['TWILIO_AUTH_TOKEN']
  if (!authToken) return true  // dev: skip validation when no token configured

  const signature = req.headers.get('x-twilio-signature') ?? ''
  const pathname = req.nextUrl.pathname.replace(/.*\/api\/twilio/, '/api/twilio')
  const url = `${process.env['NEXT_PUBLIC_SITE_URL']}${pathname}`

  const sortedKeys = Object.keys(params).sort()
  const data = url + sortedKeys.map(k => k + params[k]).join('')

  const expected = createHmac('sha1', authToken).update(data, 'utf8').digest('base64')
  return expected === signature
}
