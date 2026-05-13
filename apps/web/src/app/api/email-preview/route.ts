import { NextRequest, NextResponse } from 'next/server'
import { emailWrapper, type EmailLocale, type EmailAudience } from '@/lib/resend'

/**
 * Email template preview — renders the branded email wrapper with sample content.
 * Usage: /api/email-preview?audience=agent&locale=en-GB
 *        /api/email-preview?audience=owner&locale=de-DE
 *        /api/email-preview?audience=hunter
 *        /api/email-preview?audience=general
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const audience = (searchParams.get('audience') ?? 'agent') as EmailAudience
  const locale = (searchParams.get('locale') ?? 'en-GB') as EmailLocale
  const countryCode = searchParams.get('country') ?? (locale === 'de-DE' ? 'DE' : 'GB')

  // Sample email body content for preview
  const sampleContent = audience === 'agent'
    ? `
      <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">Hi Sarah,</p>
      <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
        A property owner in London SW1A has sent you an Owner Brief via Yalla.House. They're looking for competing proposals from local agents.
      </p>
      <div style="background:#F5F5FA;border-radius:10px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Area</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">London, SW1A 1AA</td></tr>
          <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Type</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">House</td></tr>
          <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Sale</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">£850,000</td></tr>
          <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Bedrooms</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">4</td></tr>
        </table>
      </div>
      <a href="#" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#D4764E;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;">View Brief & Respond</a>
      <p style="margin-top:24px;font-size:13px;color:#999;">
        You're receiving this because you're listed as an agent in London SW1A.
      </p>
    `
    : audience === 'owner'
    ? `
      <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">Hello James,</p>
      <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
        Someone has requested a viewing for your listing <strong>4-Bed Victorian Terrace</strong> in Camden.
      </p>
      <div style="background:#F5F5FA;border-radius:10px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Name</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">Emma Wilson</td></tr>
          <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Email</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">emma@example.com</td></tr>
          <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Preferred date</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">Saturday 17 May, 10:00</td></tr>
        </table>
      </div>
      <a href="#" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#D4764E;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;">View Request</a>
    `
    : audience === 'hunter'
    ? `
      <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">Hi Emma,</p>
      <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
        Great news! Your viewing for <strong>4-Bed Victorian Terrace</strong> in Camden has been confirmed.
      </p>
      <div style="background:#F5F5FA;border-radius:10px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Property</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">4-Bed Victorian Terrace, Camden</td></tr>
          <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Date</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">Saturday 17 May 2026</td></tr>
          <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Time</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">10:00 AM</td></tr>
        </table>
      </div>
      <a href="#" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#D4764E;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;">Add to Calendar</a>
    `
    : `
      <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">Welcome to Yalla.House!</p>
      <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
        Your account has been created. Start exploring your dashboard to manage your property journey.
      </p>
      <a href="#" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#D4764E;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;">Go to Dashboard</a>
    `

  const html = emailWrapper(sampleContent, countryCode, audience, locale)

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
