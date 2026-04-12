import { Resend } from 'resend'
import { getCountryConfig, formatCurrency, DEFAULT_COUNTRY } from './country-config'

// Lazy-init: Resend throws if API key is missing, which breaks `next build` in CI
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env['RESEND_API_KEY'] ?? 'placeholder')
  }
  return _resend
}
const FROM = process.env['RESEND_FROM_EMAIL'] ?? 'Yalla.House <noreply@yalla.house>'
const BASE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://yalla.house'

const EMAIL_TRANSLATIONS = {
  'en-GB': {
    ownerBriefSubject: 'New Owner Brief',
    ownerBriefGreeting: (name: string) => name ? `Hi ${name},` : 'Hi,',
    ownerBriefIntro: (city: string, postcode: string) =>
      `A property owner in ${city || postcode} has sent you an Owner Brief via Yalla.House. They're looking for competing proposals from local agents.`,
    ownerBriefArea: 'Area',
    ownerBriefType: 'Type',
    ownerBriefPrice: 'Price',
    ownerBriefBeds: 'Bedrooms',
    ownerBriefCta: 'View Brief & Respond',
    ownerBriefFooter: (city: string, postcode: string) =>
      `You're receiving this because you're listed as an agent in ${city || postcode}. Owner contact details are not shared until you're instructed.`,
    hunterBriefSubject: (firstName: string, intent: string, areas: string) =>
      `New Search Brief — ${firstName} wants to ${intent} in ${areas}`,
    hunterBriefGreeting: (name: string) => name ? `Hi ${name},` : 'Hi,',
    hunterBriefIntro: (firstName: string, intent: string, areas: string) =>
      `A home hunter (${firstName}) is looking to ${intent} in ${areas} and has been matched with you on Yalla.House.`,
    hunterBriefLookingTo: 'Looking to',
    hunterBriefAreas: 'Areas',
    hunterBriefBudget: 'Budget',
    hunterBriefTypes: 'Types',
    hunterBriefBeds: 'Min. bedrooms',
    hunterBriefTimeline: 'Timeline',
    hunterBriefCta: 'View Brief & Respond',
    hunterBriefFooter: 'You\'re receiving this because your coverage area matches this hunter\'s search. Contact details are not shared until the hunter chooses to connect.',
    newViewingSubject: (title: string) => `New viewing request — ${title}`,
    newViewingGreeting: (name: string) => name ? `Hello ${name},` : 'Hello,',
    newViewingIntro: (title: string, city: string) =>
      `Someone has requested a viewing for your listing ${title} in ${city}.`,
    newViewingName: 'Name',
    newViewingEmail: 'Email',
    newViewingPhone: 'Phone',
    newViewingMessage: 'Message',
    newViewingCta: 'View Request',
    newViewingFooter: 'Reply directly to the buyer via email or phone, or confirm the request in your dashboard.',
    viewingConfirmedSubject: (title: string) => `Viewing confirmed — ${title}`,
    viewingConfirmedGreeting: (name: string) => name ? `Hello ${name},` : 'Hello,',
    viewingConfirmedIntro: (title: string, city: string) =>
      `Good news! The owner has confirmed your viewing request for ${title} in ${city}.`,
    viewingConfirmedBody: 'The owner will contact you shortly to arrange a specific time.',
    viewingConfirmedCta: 'View My Requests',
    viewingConfirmedFooter: 'If you have questions, you can reply directly to the owner\'s email.',
    viewingDeclinedSubject: (title: string) => `Your viewing request for ${title}`,
    viewingDeclinedGreeting: (name: string) => name ? `Hello ${name},` : 'Hello,',
    viewingDeclinedIntro: (title: string) =>
      `Unfortunately, the owner of the listing ${title} cannot offer a viewing at this time.`,
    viewingDeclinedBody: 'Check out more listings — perhaps you\'ll find the right one.',
    viewingDeclinedCta: 'View More Listings',
    agentInviteSubject: (type: string, city: string) => `New instruction opportunity — ${type} in ${city}`,
    agentInviteGreeting: (name: string) => name ? `Hi ${name},` : 'Hi,',
    agentInviteIntro: (city: string, postcode: string) =>
      `A property owner in ${city} (${postcode}) is looking for competing proposals from local agents.`,
    agentInviteArea: 'Area',
    agentInviteType: 'Type',
    agentInvitePrice: 'Asking Price',
    agentInviteBeds: 'Bedrooms',
    agentInviteDescription: 'Yalla.House connects motivated sellers with local agents — no upfront fees, no lock-in. The owner reviews proposals side by side and picks the best fit.',
    agentInviteCta: 'View Brief & Submit Your Proposal',
    agentInviteFooter: (postcode: string) =>
      `You're receiving this because you're listed as an estate agent covering ${postcode}. If this isn't relevant, simply ignore this email.`,
    viewingReminderSubject: (title: string, when: string) => `Viewing reminder — ${title} (${when})`,
    viewingReminderGreeting: (name: string) => name ? `Hello ${name},` : 'Hello,',
    viewingReminderHunterIntro: (title: string, date: string) =>
      `Just a reminder: your viewing at ${title} is scheduled for ${date}.`,
    viewingReminderOwnerIntro: (title: string, date: string) =>
      `A viewing for ${title} is scheduled for ${date}.`,
    viewingReminderBody: 'Make sure you\'re ready. You can manage this viewing from your dashboard.',
    viewingReminderCta: 'View My Dashboard',
    viewingCheckInSubject: (title: string) => `How was the viewing? — ${title}`,
    viewingCheckInGreeting: (name: string) => name ? `Hello ${name},` : 'Hello,',
    viewingCheckInIntro: (title: string) =>
      `We hope your viewing at ${title} went well! Let us know what you thought.`,
    viewingCheckInBody: 'Your feedback helps us improve the experience for everyone — and helps the owner understand your interest.',
    viewingCheckInCta: 'Leave Feedback',
    buy: 'buy',
    rent: 'rent',
    sale: 'For Sale',
    rental: 'To Rent',
    saleBoth: 'Sale & Rental',
    priceOnApplication: 'Price on application',
    rentOnApplication: 'Rent on application',
    pcm: 'pcm',
    welcomeSubject: 'Welcome to Yalla.House',
    welcomeGreeting: (name: string) => name ? `Hi ${name},` : 'Hi,',
    welcomeIntro: 'Your account is ready. Here\'s what you can do next.',
    welcomeQuickStart: 'Quick start guide',
    welcomeStep1: 'Post your property directly on Rightmove and Zoopla',
    welcomeStep2: 'Set your asking price (or let the market tell you)',
    welcomeStep3: 'Get offers from local agents',
    welcomeStep4: 'Keep every pound of your sale',
    welcomeDashboardLabel: 'Go to Your Dashboard',
    welcomeFooter: 'Questions? We\'re here to help.',
    assignmentSubject: (address: string) => `Assignment confirmed — ${address}`,
    assignmentGreeting: (name: string) => name ? `Hi ${name},` : 'Hi,',
    assignmentIntro: (agentName: string, address: string) =>
      `Good news! ${agentName} has accepted your instruction to sell ${address}.`,
    assignmentNextSteps: 'What happens next',
    assignmentStep1: 'Your agent will arrange a valuation visit',
    assignmentStep2: 'Property details and photos will be uploaded to portals',
    assignmentStep3: 'You\'ll start receiving buyer enquiries',
    assignmentStep4: 'Your agent handles negotiations and viewings',
    assignmentCommission: 'Commission',
    assignmentTerms: 'Terms',
    assignmentDashboard: 'View Assignment',
    assignmentFooter: 'You\'re in control — cancel anytime.',
  },
  'de-DE': {
    ownerBriefSubject: 'Neuer Eigentümer-Brief',
    ownerBriefGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    ownerBriefIntro: (city: string, postcode: string) =>
      `Ein Immobilieneigentümer in ${city || postcode} hat dir über Yalla.House einen Eigentümer-Brief gesendet. Er sucht konkurrierende Angebote von lokalen Maklern.`,
    ownerBriefArea: 'Gebiet',
    ownerBriefType: 'Immobilientyp',
    ownerBriefPrice: 'Preis',
    ownerBriefBeds: 'Schlafzimmer',
    ownerBriefCta: 'Brief ansehen & antworten',
    ownerBriefFooter: (city: string, postcode: string) =>
      `Du erhältst diese E-Mail, weil du als Makler in ${city || postcode} registriert bist. Kontaktdaten des Eigentümers werden erst nach der Beauftragung weitergegeben.`,
    hunterBriefSubject: (firstName: string, intent: string, areas: string) =>
      `Neuer Such-Brief — ${firstName} möchte ${intent} in ${areas}`,
    hunterBriefGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    hunterBriefIntro: (firstName: string, intent: string, areas: string) =>
      `Ein Immobiliensuchender (${firstName}) möchte ${intent} in ${areas} und wurde mit dir bei Yalla.House abgeglichen.`,
    hunterBriefLookingTo: 'Sucht nach',
    hunterBriefAreas: 'Gebiete',
    hunterBriefBudget: 'Budget',
    hunterBriefTypes: 'Typen',
    hunterBriefBeds: 'Min. Schlafzimmer',
    hunterBriefTimeline: 'Zeitrahmen',
    hunterBriefCta: 'Brief ansehen & antworten',
    hunterBriefFooter: 'Du erhältst diese E-Mail, weil dein Abdeckungsgebiet zur Suche dieses Interessenten passt. Kontaktdaten werden erst nach Zustimmung weitergegeben.',
    newViewingSubject: (title: string) => `Neue Besichtigungsanfrage — ${title}`,
    newViewingGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    newViewingIntro: (title: string, city: string) =>
      `Jemand hat eine Besichtigung für dein Inserat ${title} in ${city} angefordert.`,
    newViewingName: 'Name',
    newViewingEmail: 'E-Mail',
    newViewingPhone: 'Telefon',
    newViewingMessage: 'Nachricht',
    newViewingCta: 'Anfrage ansehen',
    newViewingFooter: 'Antworte direkt dem Interessenten per E-Mail oder Telefon, oder bestätige die Anfrage in deinem Dashboard.',
    viewingConfirmedSubject: (title: string) => `Besichtigung bestätigt — ${title}`,
    viewingConfirmedGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    viewingConfirmedIntro: (title: string, city: string) =>
      `Gute Neuigkeiten! Der Eigentümer hat deine Besichtigungsanfrage für ${title} in ${city} bestätigt.`,
    viewingConfirmedBody: 'Der Eigentümer wird sich in Kürze direkt bei dir melden, um einen Termin zu vereinbaren.',
    viewingConfirmedCta: 'Meine Anfragen ansehen',
    viewingConfirmedFooter: 'Falls du Fragen hast, kannst du direkt auf die E-Mail des Eigentümers antworten.',
    viewingDeclinedSubject: (title: string) => `Deine Besichtigungsanfrage für ${title}`,
    viewingDeclinedGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    viewingDeclinedIntro: (title: string) =>
      `Leider kann der Eigentümer des Inserats ${title} zum aktuellen Zeitpunkt keine Besichtigung anbieten.`,
    viewingDeclinedBody: 'Schau dir weitere Inserate an — vielleicht ist das Passende dabei.',
    viewingDeclinedCta: 'Weitere Inserate ansehen',
    agentInviteSubject: (type: string, city: string) => `Neue Beauftragungsmöglichkeit — ${type} in ${city}`,
    agentInviteGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    agentInviteIntro: (city: string, postcode: string) =>
      `Ein Immobilieneigentümer in ${city} (${postcode}) sucht nach konkurrierenden Angeboten von lokalen Maklern.`,
    agentInviteArea: 'Gebiet',
    agentInviteType: 'Immobilientyp',
    agentInvitePrice: 'Angebotspreis',
    agentInviteBeds: 'Schlafzimmer',
    agentInviteDescription: 'Yalla.House verbindet motivierte Verkäufer mit lokalen Maklern — keine Vorabkosten, keine Bindung. Der Eigentümer vergleicht Angebote nebeneinander und wählt den besten aus.',
    agentInviteCta: 'Brief ansehen & dein Angebot einreichen',
    agentInviteFooter: (postcode: string) =>
      `Du erhältst diese E-Mail, weil du als Immobilienmakler in ${postcode} registriert bist. Falls das nicht relevant ist, ignoriere diese E-Mail einfach.`,
    viewingReminderSubject: (title: string, when: string) => `Besichtigungserinnerung — ${title} (${when})`,
    viewingReminderGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    viewingReminderHunterIntro: (title: string, date: string) =>
      `Kurze Erinnerung: deine Besichtigung bei ${title} ist für ${date} geplant.`,
    viewingReminderOwnerIntro: (title: string, date: string) =>
      `Eine Besichtigung für ${title} ist für ${date} geplant.`,
    viewingReminderBody: 'Stell sicher, dass du bereit bist. Du kannst diese Besichtigung in deinem Dashboard verwalten.',
    viewingReminderCta: 'Mein Dashboard ansehen',
    viewingCheckInSubject: (title: string) => `Wie war die Besichtigung? — ${title}`,
    viewingCheckInGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    viewingCheckInIntro: (title: string) =>
      `Wir hoffen, dass deine Besichtigung bei ${title} gut gelaufen ist! Lass uns wissen, was du davon hältst.`,
    viewingCheckInBody: 'Dein Feedback hilft uns, das Erlebnis für alle zu verbessern — und hilft dem Eigentümer, dein Interesse besser einzuschätzen.',
    viewingCheckInCta: 'Feedback geben',
    buy: 'kaufen',
    rent: 'mieten',
    sale: 'Zum Verkauf',
    rental: 'Zur Miete',
    saleBoth: 'Verkauf & Miete',
    priceOnApplication: 'Preis auf Anfrage',
    rentOnApplication: 'Miete auf Anfrage',
    pcm: 'p. M.',
    welcomeSubject: 'Willkommen bei Yalla.House',
    welcomeGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    welcomeIntro: 'Dein Konto ist bereit. Hier erfährst du, was du als Nächstes tun kannst.',
    welcomeQuickStart: 'Schnellstartanleitung',
    welcomeStep1: 'Stelle deine Immobilie direkt auf Immobilienportale',
    welcomeStep2: 'Lege deinen Angebotspreis fest (oder lasse den Markt sprechen)',
    welcomeStep3: 'Erhalte Angebote von lokalen Maklern',
    welcomeStep4: 'Behalte jeden Euro aus deinem Verkauf',
    welcomeDashboardLabel: 'Gehe zu deinem Dashboard',
    welcomeFooter: 'Fragen? Wir sind da, um dir zu helfen.',
    assignmentSubject: (address: string) => `Beauftragung bestätigt — ${address}`,
    assignmentGreeting: (name: string) => name ? `Hallo ${name},` : 'Hallo,',
    assignmentIntro: (agentName: string, address: string) =>
      `Gute Neuigkeiten! ${agentName} hat deine Beauftragung für den Verkauf von ${address} angenommen.`,
    assignmentNextSteps: 'Was kommt als Nächstes',
    assignmentStep1: 'Dein Makler wird einen Besichtigungstermin vereinbaren',
    assignmentStep2: 'Immobiliendetails und Fotos werden auf Portalen hochgeladen',
    assignmentStep3: 'Du erhältst Anfragen von potenziellen Käufern',
    assignmentStep4: 'Dein Makler kümmert sich um Verhandlungen und Besichtigungen',
    assignmentCommission: 'Provision',
    assignmentTerms: 'Bedingungen',
    assignmentDashboard: 'Beauftragung anzeigen',
    assignmentFooter: 'Du hast die Kontrolle — du kannst jederzeit kündigen.',
  },
}

type EmailLocale = 'en-GB' | 'de-DE'

function emailWrapper(content: string, countryCode: string = DEFAULT_COUNTRY): string {
  const config = getCountryConfig(countryCode)

  return `<!DOCTYPE html>
<html lang="${config.default_locale}">
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
        ${config.legal_entity} &mdash; ${config.legal_tagline}
      </p>
    </div>
  </div>
</body>
</html>`
}

function ctaButton(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:#D4764E;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;">${label}</a>`
}

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
  countryCode?: string
  locale?: EmailLocale
}): Promise<void> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale] ?? EMAIL_TRANSLATIONS['en-GB']
  const config = getCountryConfig(countryCode)

  const greeting = t.ownerBriefGreeting(opts.agentName?.split(' ')[0] ?? '')

  const isSale = opts.intent === 'sale' || opts.intent === 'both'
  const priceValue = isSale
    ? opts.salePrice
      ? formatCurrency(opts.salePrice, config.currency, locale)
      : t.priceOnApplication
    : opts.rentPrice
      ? `${formatCurrency(opts.rentPrice, config.currency, locale)} ${t.pcm}`
      : t.rentOnApplication

  const intentLabel = opts.intent === 'both'
    ? t.saleBoth
    : isSale ? t.sale : t.rental

  const bedroomsRow = opts.bedrooms != null
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.ownerBriefBeds}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.bedrooms}</td></tr>`
    : ''

  const typeLabels: Record<string, Record<string, string>> = {
    'en-GB': { house: 'House', flat: 'Flat', apartment: 'Apartment', villa: 'Villa', commercial: 'Commercial', land: 'Land', other: 'Property' },
    'de-DE': { house: 'Haus', flat: 'Wohnung', apartment: 'Apartment', villa: 'Villa', commercial: 'Gewerbe', land: 'Grundstück', other: 'Immobilie' },
  }

  const typeLabel = ((typeLabels[locale] ?? typeLabels['en-GB']) ?? {})[opts.propertyType] ?? 'Property'

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${t.ownerBriefIntro(opts.city, opts.postcode)}
    </p>

    <div style="background:#F5F5FA;border-radius:10px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.ownerBriefArea}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.city}${opts.postcode ? `, ${opts.postcode}` : ''}</td></tr>
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.ownerBriefType}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${typeLabel}</td></tr>
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${intentLabel}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${priceValue}</td></tr>
        ${bedroomsRow}
      </table>
    </div>

    <p style="margin:0 0 4px;font-size:15px;color:#5E6278;">
      Sign in to your Yalla agent dashboard to view the full brief and submit your proposal. The owner will compare responses side by side.
    </p>

    ${ctaButton(t.ownerBriefCta, `${BASE_URL}/brief/${opts.listingId}`)}

    <p style="margin-top:24px;font-size:13px;color:#999;">
      ${t.ownerBriefFooter(opts.city, opts.postcode)}
    </p>
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.agentEmail,
      subject: `${t.ownerBriefSubject} — ${typeLabel} in ${opts.city || opts.postcode}`,
      html,
    })
  } catch (err) {
    console.error('sendOwnerBriefEmail failed:', err)
  }
}

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
  countryCode?: string
  locale?: EmailLocale
}): Promise<void> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale] ?? EMAIL_TRANSLATIONS['en-GB']
  const config = getCountryConfig(countryCode)

  const greeting = t.hunterBriefGreeting(opts.agentName?.split(' ')[0] ?? '')

  const areaNames = (opts.areas ?? [])
    .map((a) => a.name)
    .filter(Boolean)
    .join(', ') || (locale === 'en-GB' ? 'your area' : 'dein Gebiet')

  const intentLabel = opts.intent === 'rent' ? t.rent : t.buy

  const formatBudget = (val: number | null): string => {
    if (!val) return '—'
    return formatCurrency(val, opts.currency, locale)
  }

  const budgetRow = (opts.budgetMin || opts.budgetMax)
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.hunterBriefBudget}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${formatBudget(opts.budgetMin)} – ${formatBudget(opts.budgetMax)}</td></tr>`
    : ''

  const typesRow = opts.propertyTypes && opts.propertyTypes.length > 0
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.hunterBriefTypes}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.propertyTypes.join(', ')}</td></tr>`
    : ''

  const bedsRow = opts.bedroomsMin != null
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.hunterBriefBeds}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.bedroomsMin}+</td></tr>`
    : ''

  const timelineRow = opts.timeline
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.hunterBriefTimeline}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.timeline}</td></tr>`
    : ''

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${t.hunterBriefIntro(opts.hunterFirstName, intentLabel, areaNames)}
    </p>

    <div style="background:#F5F5FA;border-radius:10px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.hunterBriefLookingTo}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${intentLabel === t.rent ? (locale === 'en-GB' ? 'Rent' : 'Miete') : (locale === 'en-GB' ? 'Buy' : 'Kauf')}</td></tr>
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.hunterBriefAreas}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${areaNames}</td></tr>
        ${budgetRow}
        ${typesRow}
        ${bedsRow}
        ${timelineRow}
      </table>
    </div>

    <p style="margin:0 0 4px;font-size:15px;color:#5E6278;">
      Sign in to your agent dashboard to view the full brief and respond with suitable properties.
    </p>

    ${ctaButton(t.hunterBriefCta, `${BASE_URL}/agent/briefs`)}

    <p style="margin-top:24px;font-size:13px;color:#999;">
      ${t.hunterBriefFooter}
    </p>
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.agentEmail,
      subject: t.hunterBriefSubject(opts.hunterFirstName, intentLabel, areaNames),
      html,
    })
  } catch (err) {
    console.error('sendHunterBriefEmail failed:', err)
  }
}

export async function sendNewViewingRequestEmail(opts: {
  ownerEmail: string
  ownerName: string | null
  listingTitle: string
  listingCity: string
  buyerName: string
  buyerEmail: string
  buyerPhone: string | null
  buyerMessage: string | null
  countryCode?: string
  locale?: EmailLocale
}): Promise<void> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale]

  const greeting = t.newViewingGreeting(opts.ownerName?.split(' ')[0] ?? '')

  const phoneRow = opts.buyerPhone
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.newViewingPhone}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.buyerPhone}</td></tr>`
    : ''

  const messageBlock = opts.buyerMessage
    ? `<div style="margin-top:20px;padding:16px;background:#F5F5FA;border-radius:10px;font-size:14px;color:#5E6278;font-style:italic;">&ldquo;${opts.buyerMessage}&rdquo;</div>`
    : ''

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${t.newViewingIntro(opts.listingTitle, opts.listingCity)}
    </p>

    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.newViewingName}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.buyerName}</td></tr>
      <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.newViewingEmail}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;"><a href="mailto:${opts.buyerEmail}" style="color:#0F1117;">${opts.buyerEmail}</a></td></tr>
      ${phoneRow}
    </table>

    ${messageBlock}

    ${ctaButton(t.newViewingCta, `${BASE_URL}/owner/viewings`)}

    <p style="margin-top:24px;font-size:13px;color:#999;">
      ${t.newViewingFooter}
    </p>
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.ownerEmail,
      subject: t.newViewingSubject(opts.listingTitle),
      html,
    })
  } catch (err) {
    console.error('sendNewViewingRequestEmail failed:', err)
  }
}

export async function sendViewingConfirmedEmail(opts: {
  buyerEmail: string
  buyerName: string | null
  listingTitle: string
  listingCity: string
  countryCode?: string
  locale?: EmailLocale
}): Promise<void> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale]

  const greeting = t.viewingConfirmedGreeting(opts.buyerName?.split(' ')[0] ?? '')

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${t.viewingConfirmedIntro(opts.listingTitle, opts.listingCity)}
    </p>
    <p style="margin:0;font-size:15px;color:#5E6278;">
      ${t.viewingConfirmedBody}
    </p>

    ${ctaButton(t.viewingConfirmedCta, `${BASE_URL}/hunter`)}

    <p style="margin-top:24px;font-size:13px;color:#999;">
      ${t.viewingConfirmedFooter}
    </p>
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.buyerEmail,
      subject: t.viewingConfirmedSubject(opts.listingTitle),
      html,
    })
  } catch (err) {
    console.error('sendViewingConfirmedEmail failed:', err)
  }
}

export async function sendViewingDeclinedEmail(opts: {
  buyerEmail: string
  buyerName: string | null
  listingTitle: string
  countryCode?: string
  locale?: EmailLocale
}): Promise<void> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale]

  const greeting = t.viewingDeclinedGreeting(opts.buyerName?.split(' ')[0] ?? '')

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${t.viewingDeclinedIntro(opts.listingTitle)}
    </p>
    <p style="margin:0;font-size:15px;color:#5E6278;">
      ${t.viewingDeclinedBody}
    </p>

    ${ctaButton(t.viewingDeclinedCta, `${BASE_URL}/listings`)}
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.buyerEmail,
      subject: t.viewingDeclinedSubject(opts.listingTitle),
      html,
    })
  } catch (err) {
    console.error('sendViewingDeclinedEmail failed:', err)
  }
}

export async function sendAgentInviteEmail(opts: {
  agentEmail: string
  agencyName: string
  agentName: string | null
  listingCity: string
  listingPostcode: string
  propertyType: string
  bedrooms: number | null
  askingPrice: number | null
  listingId: string
  countryCode?: string
  locale?: EmailLocale
}): Promise<{ success: boolean; error?: string }> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale] ?? EMAIL_TRANSLATIONS['en-GB']
  const config = getCountryConfig(countryCode)

  const greeting = t.agentInviteGreeting(opts.agentName?.split(' ')[0] ?? '')

  const typeLabels: Record<string, Record<string, string>> = {
    'en-GB': { house: 'House', flat: 'Flat', apartment: 'Apartment', villa: 'Villa', commercial: 'Commercial', land: 'Land', other: 'Property' },
    'de-DE': { house: 'Haus', flat: 'Wohnung', apartment: 'Apartment', villa: 'Villa', commercial: 'Gewerbe', land: 'Grundstück', other: 'Immobilie' },
  }

  const typeLabel = ((typeLabels[locale] ?? typeLabels['en-GB']) ?? {})[opts.propertyType] ?? 'Property'

  const bedroomsRow = opts.bedrooms != null
    ? `<tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.agentInviteBeds}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.bedrooms}</td></tr>`
    : ''

  const priceValue = opts.askingPrice
    ? formatCurrency(opts.askingPrice, config.currency, locale)
    : t.priceOnApplication

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${t.agentInviteIntro(opts.listingCity, opts.listingPostcode)}
    </p>

    <div style="background:#F5F5FA;border-radius:10px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.agentInviteArea}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${opts.listingCity}, ${opts.listingPostcode}</td></tr>
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.agentInviteType}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${typeLabel}</td></tr>
        <tr><td style="padding:4px 0;color:#5E6278;font-size:14px;">${t.agentInvitePrice}</td><td style="padding:4px 0 4px 16px;font-size:14px;font-weight:600;">${priceValue}</td></tr>
        ${bedroomsRow}
      </table>
    </div>

    <p style="margin:0 0 16px;font-size:15px;color:#5E6278;">
      <strong style="color:#0F1117;">Yalla.House</strong> ${t.agentInviteDescription}
    </p>

    ${ctaButton(t.agentInviteCta, `${BASE_URL}/agent/briefs/${opts.listingId}`)}

    <div style="text-align:center;margin-top:12px;">
      <a href="${BASE_URL}/agent/listing/${opts.listingId}" style="display:inline-block;padding:10px 24px;background:#EDEEF2;color:#0F1117;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;border:1px solid #D8DBE5;">
        ${locale === 'en-GB' ? 'View Property Details' : 'Immobiliendetails ansehen'}
      </a>
    </div>

    <p style="margin-top:24px;font-size:13px;color:#999;">
      ${t.agentInviteFooter(opts.listingPostcode)}
    </p>
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.agentEmail,
      subject: t.agentInviteSubject(typeLabel, opts.listingCity),
      html,
    })
    return { success: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to send email'
    console.error('sendAgentInviteEmail failed:', error)
    return { success: false, error }
  }
}

export async function sendViewingReminderEmail(opts: {
  recipientEmail: string
  recipientName: string | null
  listingTitle: string
  listingCity: string
  scheduledAt: string
  role: 'hunter' | 'owner'
  countryCode?: string
  locale?: EmailLocale
}): Promise<void> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale]

  const greeting = t.viewingReminderGreeting(opts.recipientName?.split(' ')[0] ?? '')
  const date = new Date(opts.scheduledAt).toLocaleDateString(locale, {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  })
  const when = new Date(opts.scheduledAt).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })

  const intro = opts.role === 'hunter'
    ? t.viewingReminderHunterIntro(opts.listingTitle, date)
    : t.viewingReminderOwnerIntro(opts.listingTitle, date)

  const dashboardUrl = opts.role === 'hunter' ? `${BASE_URL}/hunter` : `${BASE_URL}/owner/viewings`

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${intro}
    </p>
    <p style="margin:0;font-size:15px;color:#5E6278;">
      ${t.viewingReminderBody}
    </p>

    ${ctaButton(t.viewingReminderCta, dashboardUrl)}
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.recipientEmail,
      subject: t.viewingReminderSubject(opts.listingTitle, when),
      html,
    })
  } catch (err) {
    console.error('sendViewingReminderEmail failed:', err)
  }
}

export async function sendViewingCheckInEmail(opts: {
  hunterEmail: string
  hunterName: string | null
  listingTitle: string
  viewingId: string
  locale?: EmailLocale
  countryCode?: string
}): Promise<void> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale]

  const greeting = t.viewingCheckInGreeting(opts.hunterName?.split(' ')[0] ?? '')

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${t.viewingCheckInIntro(opts.listingTitle)}
    </p>
    <p style="margin:0;font-size:15px;color:#5E6278;">
      ${t.viewingCheckInBody}
    </p>

    ${ctaButton(t.viewingCheckInCta, `${BASE_URL}/hunter/viewings/${opts.viewingId}/feedback`)}
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.hunterEmail,
      subject: t.viewingCheckInSubject(opts.listingTitle),
      html,
    })
  } catch (err) {
    console.error('sendViewingCheckInEmail failed:', err)
  }
}

export async function sendWelcomeEmail(opts: {
  userEmail: string
  userName: string | null
  userRole: 'owner' | 'hunter' | 'agent'
  countryCode?: string
  locale?: EmailLocale
}): Promise<{ success: boolean; error?: string }> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale] ?? EMAIL_TRANSLATIONS['en-GB']

  const greeting = t.welcomeGreeting(opts.userName?.split(' ')[0] ?? '')

  let dashboardUrl: string
  if (opts.userRole === 'owner') {
    dashboardUrl = `${BASE_URL}/owner`
  } else if (opts.userRole === 'hunter') {
    dashboardUrl = `${BASE_URL}/hunter`
  } else {
    dashboardUrl = `${BASE_URL}/agent`
  }

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${t.welcomeIntro}
    </p>

    <div style="background:#F5F5FA;border-radius:10px;padding:24px;margin-bottom:24px;">
      <h3 style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0F1117;">
        ${t.welcomeQuickStart}
      </h3>
      <ol style="margin:0;padding-left:20px;color:#5E6278;font-size:14px;line-height:1.8;">
        <li style="margin-bottom:8px;">${t.welcomeStep1}</li>
        <li style="margin-bottom:8px;">${t.welcomeStep2}</li>
        <li style="margin-bottom:8px;">${t.welcomeStep3}</li>
        <li>${t.welcomeStep4}</li>
      </ol>
    </div>

    ${ctaButton(t.welcomeDashboardLabel, dashboardUrl)}

    <p style="margin-top:24px;font-size:13px;color:#999;">
      ${t.welcomeFooter}
    </p>
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.userEmail,
      subject: t.welcomeSubject,
      html,
    })
    return { success: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to send welcome email'
    console.error('sendWelcomeEmail failed:', error)
    return { success: false, error }
  }
}

export async function sendAssignmentAcceptedEmail(opts: {
  ownerEmail: string
  ownerName: string | null
  agentName: string
  address: string
  commission: number | null
  currency: string
  listingId: string
  countryCode?: string
  locale?: EmailLocale
}): Promise<{ success: boolean; error?: string }> {
  const countryCode = opts.countryCode ?? DEFAULT_COUNTRY
  const locale = opts.locale ?? 'en-GB'
  const t = EMAIL_TRANSLATIONS[locale] ?? EMAIL_TRANSLATIONS['en-GB']
  const config = getCountryConfig(countryCode)

  const greeting = t.assignmentGreeting(opts.ownerName?.split(' ')[0] ?? '')
  const intro = t.assignmentIntro(opts.agentName, opts.address)

  const commissionRow = opts.commission != null
    ? `<tr><td style="padding:8px 0;color:#5E6278;font-size:14px;">${t.assignmentCommission}</td><td style="padding:8px 0 8px 16px;font-size:14px;font-weight:600;">${formatCurrency(opts.commission, opts.currency, locale)}</td></tr>`
    : ''

  const html = emailWrapper(`
    <p style="margin:0 0 8px;font-size:16px;color:#0F1117;">${greeting}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5E6278;">
      ${intro}
    </p>

    <div style="background:#F5F5FA;border-radius:10px;padding:24px;margin-bottom:24px;">
      <h3 style="margin:0 0 16px;font-size:15px;font-weight:700;color:#0F1117;">
        ${t.assignmentNextSteps}
      </h3>
      <ol style="margin:0;padding-left:20px;color:#5E6278;font-size:14px;line-height:1.8;">
        <li style="margin-bottom:8px;">${t.assignmentStep1}</li>
        <li style="margin-bottom:8px;">${t.assignmentStep2}</li>
        <li style="margin-bottom:8px;">${t.assignmentStep3}</li>
        <li>${t.assignmentStep4}</li>
      </ol>
    </div>

    <div style="background:#F5F5FA;border-radius:10px;padding:20px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#5E6278;font-size:14px;">${t.assignmentTerms}</td><td style="padding:8px 0 8px 16px;font-size:14px;font-weight:600;">${opts.agentName}</td></tr>
        ${commissionRow}
      </table>
    </div>

    ${ctaButton(t.assignmentDashboard, `${BASE_URL}/owner/listings/${opts.listingId}`)}

    <p style="margin-top:24px;font-size:13px;color:#999;">
      ${t.assignmentFooter}
    </p>
  `, countryCode)

  try {
    await getResend().emails.send({
      from: FROM,
      to: opts.ownerEmail,
      subject: t.assignmentSubject(opts.address),
      html,
    })
    return { success: true }
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Failed to send assignment email'
    console.error('sendAssignmentAcceptedEmail failed:', error)
    return { success: false, error }
  }
}
