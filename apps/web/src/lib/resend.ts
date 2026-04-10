import { Resend } from 'resend'

const resend = new Resend(process.env['RESEND_API_KEY'])
const FROM = process.env['RESEND_FROM_EMAIL'] ?? 'Yalla.House <noreply@yalla.house>'
const BASE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://yalla.house'

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#EDEEF2;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
    <div style="background:#D4764E;padding:20px 32px;">
      <span style="font-size:20px;font-weight:800;color:#0F1117;letter-spacing:-.02em;">Yalla.House</span>
    </div>
    <div style="padding:32px;">
      ${content}
    </div>
    <div style="padding:20px 32px;background:#F5F5FA;border-top:1px solid #E2E4EB;">
      <p style="margin:0;font-size:12px;color:#999;">
        Yalla.House GmbH &mdash; Immobilie selbst verkaufen ohne Makler.
      </p>
    </div>
  </div>
</body>
</html>`
}

function ctaButton(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#D4764E;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;">${label}</a>`
}

// ── Email 1: New viewing request → owner ─────────────────────────────────────

export async function sendNewViewingRequestEmail(opts: {
  ownerEmail: string
  ownerName: string | null
  listingTitle: string
  listingCity: string
  buyerName: string
  buyerEmail: string
  buyerPhone: string | null
  buyerMessage: string | null
}): Promise<void> {
  const greeting = opts.ownerName ? `Hallo ${opts.ownerName.split(' ')[0]},` : 'Hallo,'

  const phoneRow = opts.buyerPhone
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Telefon</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.buyerPhone}</td></tr>`
    : ''

  const messageBlock = opts.buyerMessage
    ? `<div style="margin-top:20px;padding:16px;background:#F5F5FA;border-radius:10px;font-size:14px;color:#5E6278;font-style:italic;">&ldquo;${opts.buyerMessage}&rdquo;</div>`
    : ''

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      Jemand hat eine Besichtigung für Ihr Inserat <strong style="color:#0F1117;">${opts.listingTitle}</strong> in ${opts.listingCity} angefragt.
    </p>

    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Name</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.buyerName}</td></tr>
      <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">E-Mail</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;"><a href="mailto:${opts.buyerEmail}" style="color:#0F1117;">${opts.buyerEmail}</a></td></tr>
      ${phoneRow}
    </table>

    ${messageBlock}

    ${ctaButton('Anfrage ansehen', `${BASE_URL}/owner/viewings`)}

    <p style="margin-top:24px;font-size:13px;color:#999;">
      Melden Sie sich direkt per E-Mail oder Telefon beim Interessenten, oder bestätigen Sie die Anfrage in Ihrem Dashboard.
    </p>
  `)

  try {
    await resend.emails.send({
      from: FROM,
      to: opts.ownerEmail,
      subject: `Neue Besichtigungsanfrage — ${opts.listingTitle}`,
      html,
    })
  } catch (err) {
    console.error('sendNewViewingRequestEmail failed:', err)
  }
}

// ── Email 2: Viewing confirmed → buyer ────────────────────────────────────────

export async function sendViewingConfirmedEmail(opts: {
  buyerEmail: string
  buyerName: string | null
  listingTitle: string
  listingCity: string
}): Promise<void> {
  const greeting = opts.buyerName ? `Hallo ${opts.buyerName.split(' ')[0]},` : 'Hallo,'

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      Gute Neuigkeiten! Der Eigentümer hat Ihre Besichtigungsanfrage für
      <strong style="color:#0F1117;">${opts.listingTitle}</strong> in ${opts.listingCity} <strong style="color:#166534;">bestätigt</strong>.
    </p>
    <p style="margin:0;font-size:15px;color:#5E6278;">
      Der Eigentümer wird sich in Kürze direkt bei Ihnen melden, um einen konkreten Termin zu vereinbaren.
    </p>

    ${ctaButton('Meine Anfragen ansehen', `${BASE_URL}/hunter`)}

    <p style="margin-top:24px;font-size:13px;color:#999;">
      Falls Sie Fragen haben, können Sie direkt auf die E-Mail des Eigentümers antworten.
    </p>
  `)

  try {
    await resend.emails.send({
      from: FROM,
      to: opts.buyerEmail,
      subject: `Besichtigung bestätigt — ${opts.listingTitle}`,
      html,
    })
  } catch (err) {
    console.error('sendViewingConfirmedEmail failed:', err)
  }
}

// ── Email 3: Viewing declined → buyer ────────────────────────────────────────

export async function sendViewingDeclinedEmail(opts: {
  buyerEmail: string
  buyerName: string | null
  listingTitle: string
}): Promise<void> {
  const greeting = opts.buyerName ? `Hallo ${opts.buyerName.split(' ')[0]},` : 'Hallo,'

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      Leider kann der Eigentümer des Inserats <strong style="color:#0F1117;">${opts.listingTitle}</strong>
      zum aktuellen Zeitpunkt keine Besichtigung anbieten.
    </p>
    <p style="margin:0;font-size:15px;color:#5E6278;">
      Schauen Sie sich weitere Inserate an — vielleicht ist das Passende dabei.
    </p>

    ${ctaButton('Weitere Inserate ansehen', `${BASE_URL}/listings`)}
  `)

  try {
    await resend.emails.send({
      from: FROM,
      to: opts.buyerEmail,
      subject: `Ihre Besichtigungsanfrage für ${opts.listingTitle}`,
      html,
    })
  } catch (err) {
    console.error('sendViewingDeclinedEmail failed:', err)
  }
}
