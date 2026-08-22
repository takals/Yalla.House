import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /r/:code — referral link target.
 *
 * Drops the referrer's code in a cookie and sends the visitor to the homepage.
 * Attribution happens on their first sign-in (see /api/auth/callback), because
 * that is the first moment there is a user to attribute to.
 */

/** How long a click stays credited. Long enough to cover a property decision. */
const COOKIE_MAX_AGE = 90 * 24 * 60 * 60

/** Codes are generated from an unambiguous uppercase alphabet. */
const CODE_PATTERN = /^[A-Z0-9]{4,32}$/

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const normalised = code.trim().toUpperCase()

  const destination = new URL('/', request.url)
  const response = NextResponse.redirect(destination)

  // Ignore anything that isn't shaped like one of our codes rather than
  // writing arbitrary visitor-supplied values into a cookie.
  if (!CODE_PATTERN.test(normalised)) return response

  // First touch wins — don't overwrite an existing attribution.
  if (!request.cookies.get('yalla_ref')) {
    response.cookies.set('yalla_ref', normalised, {
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    // Read by the HubSpot sync on sign-in.
    response.cookies.set('yalla_referral_source', `referral:${normalised}`, {
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  return response
}
