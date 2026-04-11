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

// ── Owner Brief → agent (invitation to respond) ──────────────────────────────

export async function sendOwnerBriefEmail(opts: {
  agentEmail: string
  agentName: string | null
  listingId: string
  propertyType: string
  intent: string
  city: string
  postcode: string
  bedrooms: number | null
  salePrice: number | null
  rentPrice: number | null
}): Promise<void> {
  const greeting = opts.agentName ? `Hi ${opts.agentName.split(' ')[0]},` : 'Hi,'

  const isSale = opts.intent === 'sale' || opts.intent === 'both'
  const priceValue = isSale
    ? opts.salePrice
      ? `£${(opts.salePrice / 100).toLocaleString('en-GB')}`
      : 'Price on application'
    : opts.rentPrice
      ? `£${(opts.rentPrice / 100).toLocaleString('en-GB')} pcm`
      : 'Rent on application'

  const intentLabel = opts.intent === 'both'
    ? 'Sale & Rental'
    : isSale ? 'For Sale' : 'To Rent'

  const bedroomsRow = opts.bedrooms != null
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Bedrooms</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.bedrooms}</td></tr>`
    : ''

  const typeLabels: Record<string, string> = {
    house: 'House', flat: 'Flat', apartment: 'Apartment',
    villa: 'Villa', commercial: 'Commercial', land: 'Land', other: 'Property',
  }

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      A property owner in <strong style="color:#0F1117;">${opts.city || opts.postcode}</strong> has sent you an Owner Brief via Yalla.House. They're looking for competing proposals from local agents.
    </p>

    <div style="background:#F5F5FA;border-radius:10px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Area</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.city}${opts.postcode ? `, ${opts.postcode}` : ''}</td></tr>
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Type</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${typeLabels[opts.propertyType] ?? 'Property'}</td></tr>
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${intentLabel}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${priceValue}</td></tr>
        ${bedroomsRow}
      </table>
    </div>

    <p style="margin:0 0 4px;font-size:15px;color:#5E6278;">
      Sign in to your Yalla agent dashboard to view the full brief and submit your proposal. The owner will compare responses side by side.
    </p>

    ${ctaButton('View Brief & Respond', `${BASE_URL}/brief/${opts.listingId}`)}

    <p style="margin-top:24px;font-size:13px;color:#999;">
      You're receiving this because you're listed as an agent in ${opts.city || opts.postcode}. Owner contact details are not shared until you're instructed.
    </p>
  `)

  try {
    await resend.emails.send({
      from: FROM,
      to: opts.agentEmail,
      subject: `New Owner Brief — ${typeLabels[opts.propertyType] ?? 'Property'} in ${opts.city || opts.postcode}`,
      html,
    })
  } catch (err) {
    console.error('sendOwnerBriefEmail failed:', err)
  }
}

// ── Hunter Brief → agent (search notification) ───────────────────────────────

export async function sendHunterBriefEmail(opts: {
  agentEmail: string
  agentName: string | null
  hunterFirstName: string
  intent: string
  areas: Array<{ name?: string }> | null
  budgetMin: number | null
  budgetMax: number | null
  currency: string
  propertyTypes: string[] | null
  bedroomsMin: number | null
  timeline: string | null
  matchId: string
}): Promise<void> {
  const greeting = opts.agentName ? `Hi ${opts.agentName.split(' ')[0]},` : 'Hi,'

  const areaNames = (opts.areas ?? [])
    .map((a) => a.name)
    .filter(Boolean)
    .join(', ') || 'your area'

  const intentLabel = opts.intent === 'rent' ? 'rent' : 'buy'

  const formatBudget = (val: number | null): string => {
    if (!val) return '—'
    const symbol = opts.currency === 'GBP' ? '£' : '€'
    return `${symbol}${(val / 100).toLocaleString('en-GB')}`
  }

  const budgetRow = (opts.budgetMin || opts.budgetMax)
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Budget</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${formatBudget(opts.budgetMin)} – ${formatBudget(opts.budgetMax)}</td></tr>`
    : ''

  const typesRow = opts.propertyTypes && opts.propertyTypes.length > 0
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Types</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.propertyTypes.join(', ')}</td></tr>`
    : ''

  const bedsRow = opts.bedroomsMin != null
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Min. bedrooms</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.bedroomsMin}+</td></tr>`
    : ''

  const timelineRow = opts.timeline
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Timeline</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.timeline}</td></tr>`
    : ''

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      A home hunter (<strong style="color:#0F1117;">${opts.hunterFirstName}</strong>) is looking to <strong style="color:#0F1117;">${intentLabel}</strong> in <strong style="color:#0F1117;">${areaNames}</strong> and has been matched with you on Yalla.House.
    </p>

    <div style="background:#F5F5FA;border-radius:10px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Looking to</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${intentLabel === 'rent' ? 'Rent' : 'Buy'}</td></tr>
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">Areas</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${areaNames}</td></tr>
        ${budgetRow}
        ${typesRow}
        ${bedsRow}
        ${timelineRow}
      </table>
    </div>

    <p style="margin:0 0 4px;font-size:15px;color:#5E6278;">
      Sign in to your agent dashboard to view the full brief and respond with suitable properties.
    </p>

    ${ctaButton('View Brief & Respond', `${BASE_URL}/agent/briefs`)}

    <p style="margin-top:24px;font-size:13px;color:#999;">
      You're receiving this because your coverage area matches this hunter's search. Contact details are not shared until the hunter chooses to connect.
    </p>
  `)

  try {
    await resend.emails.send({
      from: FROM,
      to: opts.agentEmail,
      subject: `New Search Brief — ${opts.hunterFirstName} wants to ${intentLabel} in ${areaNames}`,
      html,
    })
  } catch (err) {
    console.error('sendHunterBriefEmail failed:', err)
  }
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
