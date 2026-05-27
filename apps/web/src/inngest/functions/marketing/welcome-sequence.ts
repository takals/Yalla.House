/**
 * Welcome sequence: 5 emails over 14 days, persona-aware, locale-aware.
 *
 * Triggered by `marketing/welcome.start` event from the auth callback the
 * first time a user signs up. Each email is sent via Resend; copy is in the
 * brand voice (see docs/Yalla_Brand_Voice.md).
 *
 * Why a single Inngest function with sleeps instead of 5 scheduled events:
 *   - Easier to reason about the user state once
 *   - Inngest retries the whole sequence atomically per step
 *   - If a user unsubscribes mid-sequence we can short-circuit (TODO)
 */

import { inngest } from '@/lib/inngest/client'
import { Resend } from 'resend'

// Lazy-init Resend so missing key in CI doesn't break next build
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env['RESEND_API_KEY'] ?? 'placeholder')
  return _resend
}
const FROM = process.env['RESEND_FROM_EMAIL'] ?? 'Yalla.House <noreply@yalla.house>'
const SITE = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://yalla.house'

// ───────────────────────────────────────────────────────────────────────────────
// Copy — German first, English fallback. Persona-aware where it matters.
// All copy follows docs/Yalla_Brand_Voice.md: direct, clear, confident.
// ───────────────────────────────────────────────────────────────────────────────

type Persona = 'owner' | 'hunter' | 'agent' | 'partner' | 'referrer' | 'admin' | 'other'
type Locale = 'de' | 'en'

interface Email {
  subject: string
  preheader: string
  html: string
}

function firstLine(firstName: string | null, locale: Locale): string {
  if (!firstName) return locale === 'de' ? 'Hallo,' : 'Hi,'
  return locale === 'de' ? `Hallo ${firstName},` : `Hi ${firstName},`
}

function wrap(subject: string, preheader: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${subject}</title></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1F2933;">
  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${preheader}</span>
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06);">
    <div style="background:#D4764E;padding:18px 32px;">
      <span style="font-size:20px;font-weight:800;color:#fff;letter-spacing:-.02em;">Yalla.House</span>
    </div>
    <div style="padding:32px;line-height:1.55;font-size:15px;color:#1F2933;">
      ${bodyHtml}
    </div>
    <div style="padding:18px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;font-size:11px;color:#64748B;">
      Yalla.House — Ihre Immobilie. Ihre Regeln.
      <br><a href="${SITE}/unsubscribe" style="color:#64748B;">Abmelden</a> ·
      <a href="${SITE}" style="color:#64748B;">yalla.house</a>
    </div>
  </div>
</body></html>`
}

function btn(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;margin-top:18px;padding:12px 22px;background:#D4764E;color:#fff;font-weight:700;font-size:14px;text-decoration:none;border-radius:10px;">${label} →</a>`
}

// ─────── Email content by persona × locale × day ───────

function email1Welcome(firstName: string | null, role: Persona, locale: Locale): Email {
  if (locale === 'de') {
    const subject = 'Willkommen bei Yalla.House'
    const body = role === 'owner'
      ? `<p>${firstLine(firstName, locale)}</p>
<p>Schön, dass Sie da sind. Sie sind jetzt einen Schritt näher dran, Ihre Immobilie <strong>ohne Maklerprovision</strong> zu verkaufen.</p>
<p>So geht es los:</p>
<ol style="padding-left:18px;color:#1F2933;">
  <li>Inserat in Ihrem Dashboard anlegen — Adresse, Fotos, Preis.</li>
  <li>Wir veröffentlichen es auf ImmoScout24 und Immowelt.</li>
  <li>Sie sprechen direkt mit Interessenten.</li>
</ol>
<p>Sie behalten jeden Euro.</p>
${btn('Zum Dashboard', `${SITE}/owner`)}
<p style="margin-top:24px;color:#64748B;font-size:13px;">Diese Woche schicke ich Ihnen eine kurze Serie mit den Schritten, die Eigentümer in Deutschland am häufigsten übersehen — von der Wohnflächenberechnung bis zum Notartermin.</p>`
      : role === 'hunter'
      ? `<p>${firstLine(firstName, locale)}</p>
<p>Willkommen bei Yalla.House. Sie suchen direkt bei Eigentümern — ohne Maklerprovision, ohne Umwege.</p>
<p>Ihre nächsten drei Schritte:</p>
<ol style="padding-left:18px;color:#1F2933;">
  <li>Such-Pass anlegen (Budget, Gebiet, Immobilientyp).</li>
  <li>Passende Inserate direkt im Dashboard sehen.</li>
  <li>Besichtigung in einem Klick anfragen.</li>
</ol>
${btn('Such-Pass anlegen', `${SITE}/hunter`)}`
      : `<p>${firstLine(firstName, locale)}</p>
<p>Willkommen bei Yalla.House.</p>
<p>Wir bauen die Plattform, auf der Eigentümer, Suchende und Makler ohne Provision zusammenarbeiten. Wenn Sie Fragen haben — antworten Sie einfach auf diese E-Mail.</p>
${btn('Zum Dashboard', SITE)}`
    return { subject, preheader: 'Drei Schritte. Keine Provision. Volle Kontrolle.', html: wrap(subject, 'Drei Schritte. Keine Provision. Volle Kontrolle.', body) }
  }
  // English
  const subject = 'Welcome to Yalla.House'
  const body = role === 'owner'
    ? `<p>${firstLine(firstName, locale)}</p>
<p>Glad you're here. You're one step closer to selling your property <strong>without paying commission</strong>.</p>
<p>Here's how it works:</p>
<ol style="padding-left:18px;color:#1F2933;">
  <li>Create your listing — address, photos, asking price.</li>
  <li>We publish it on ImmoScout24 and Immowelt.</li>
  <li>You talk to interested buyers directly.</li>
</ol>
<p>You keep every euro.</p>
${btn('Open dashboard', `${SITE}/en/owner`)}`
    : `<p>${firstLine(firstName, locale)}</p>
<p>Welcome to Yalla.House. Three quick steps to get going:</p>
<ol style="padding-left:18px;color:#1F2933;">
  <li>Set your search criteria (budget, area, type).</li>
  <li>Get matched with listings instantly.</li>
  <li>Book viewings in one click.</li>
</ol>
${btn('Open dashboard', `${SITE}/en/hunter`)}`
  return { subject, preheader: 'Three steps. No commission. Full control.', html: wrap(subject, 'Three steps. No commission. Full control.', body) }
}

function email2Day3(firstName: string | null, role: Persona, locale: Locale): Email {
  const isOwner = role === 'owner'
  if (locale === 'de') {
    const subject = isOwner ? 'Die 3 Fehler beim privaten Verkauf' : 'So finden Sie schneller das richtige Zuhause'
    const body = isOwner
      ? `<p>${firstLine(firstName, locale)}</p>
<p>Was Eigentümer, die ohne Makler verkaufen, am häufigsten falsch machen:</p>
<ol style="padding-left:18px;color:#1F2933;">
  <li><strong>Falsche Wohnflächenberechnung.</strong> Berücksichtigen Sie Balkone (50 %), Terrassen (25–50 %), Dachschrägen (50 % unter 2 m).</li>
  <li><strong>Schlechte Fotos.</strong> Querformat, Tageslicht, alle Räume — kein Smartphone-Hochformat.</li>
  <li><strong>Preis zu hoch starten.</strong> Sie verlieren die ersten 2–3 Wochen Aufmerksamkeit; danach gilt das Inserat als &bdquo;hängengeblieben&ldquo;.</li>
</ol>
<p>Wir haben eine kostenlose Checkliste, die alle drei abdeckt.</p>
${btn('Checkliste öffnen', `${SITE}/blog/private-verkauf-fehler`)}`
      : `<p>${firstLine(firstName, locale)}</p>
<p>Drei Dinge, die Suchende beschleunigen:</p>
<ol style="padding-left:18px;color:#1F2933;">
  <li>Such-Pass vollständig ausfüllen — Algorithmus filtert Inserate besser.</li>
  <li>Bonität vorab prüfen lassen (Schufa-BonitätsAuskunft, 29,95 €).</li>
  <li>Bei neuen Inseraten in den ersten 24 h reagieren.</li>
</ol>
${btn('Such-Pass öffnen', `${SITE}/hunter`)}`
    return { subject, preheader: 'Konkret. Mit Zahlen.', html: wrap(subject, 'Konkret. Mit Zahlen.', body) }
  }
  const subject = isOwner ? '3 mistakes private sellers make' : 'Faster ways to land the right home'
  const body = `<p>${firstLine(firstName, locale)}</p>
<p>Three things we keep seeing — and how to avoid them.</p>
${btn('Read the post', `${SITE}/en/blog/private-sale-mistakes`)}`
  return { subject, preheader: '', html: wrap(subject, '', body) }
}

function email3Day7(firstName: string | null, role: Persona, locale: Locale): Email {
  if (locale === 'de') {
    const subject = 'Wie viel hätten Sie an Provision gezahlt?'
    const body = `<p>${firstLine(firstName, locale)}</p>
<p>In Deutschland teilen sich Käufer und Verkäufer die Maklerprovision — meist 3,57 % je Seite. Bei einem Verkaufspreis von 500.000 € sind das <strong>17.857 € pro Seite</strong>, oder 35.714 € insgesamt.</p>
<p>Yalla.House nimmt eine einmalige Pauschale. Pro Verkauf. Egal wie hoch der Verkaufspreis.</p>
${btn('Pauschalpreis ansehen', `${SITE}/preise`)}
<p style="margin-top:24px;color:#64748B;font-size:13px;">Quelle: Bundesverband Deutscher Immobilienmakler, durchschnittliche Maklerprovisionen 2025.</p>`
    return { subject, preheader: '17.857 € pro Seite, bei 500k Verkaufspreis.', html: wrap(subject, '17.857 € pro Seite, bei 500k Verkaufspreis.', body) }
  }
  const subject = 'How much would commission have cost you?'
  const body = `<p>${firstLine(firstName, locale)}</p>
<p>German agent commission averages 3.57% per side. On a €500,000 sale: <strong>€17,857 per side</strong>. Yalla.House is a one-time flat fee.</p>
${btn('See pricing', `${SITE}/en/pricing`)}`
  return { subject, preheader: '€17,857 vs a flat fee.', html: wrap(subject, '€17,857 vs a flat fee.', body) }
}

function email4Day10(firstName: string | null, role: Persona, locale: Locale): Email {
  const isOwner = role === 'owner'
  if (locale === 'de') {
    const subject = isOwner ? 'Notartermin — wie es wirklich abläuft' : 'Direkt vom Eigentümer kaufen — was Sie vorher klären sollten'
    const body = isOwner
      ? `<p>${firstLine(firstName, locale)}</p>
<p>Wenn ein Käufer ein Angebot annimmt, kommt der Notar. Was viele nicht wissen:</p>
<ul style="padding-left:18px;color:#1F2933;">
  <li>Sie können den Notar wählen — meistens schlägt der Käufer einen vor, Sie müssen nicht zustimmen.</li>
  <li>Notarkosten zahlt fast immer der Käufer (in Deutschland Standard).</li>
  <li>Zwischen Angebot und Termin liegen 4–8 Wochen — Sie müssen nichts beschleunigen.</li>
</ul>
${btn('Anleitung lesen', `${SITE}/blog/notartermin-vorbereiten`)}`
      : `<p>${firstLine(firstName, locale)}</p>
<p>Drei Fragen, die Sie vor der Besichtigung stellen sollten — sie sparen später Zeit:</p>
<ol style="padding-left:18px;color:#1F2933;">
  <li>Energieausweis vorhanden (Pflicht seit 2014)?</li>
  <li>Letzte WEG-Versammlungs-Protokolle einsehbar?</li>
  <li>Eigentümer- oder Erbengemeinschaft? Wer entscheidet?</li>
</ol>
${btn('Checkliste öffnen', `${SITE}/blog/besichtigung-checkliste`)}`
    return { subject, preheader: 'Praktisch, nicht theoretisch.', html: wrap(subject, 'Praktisch, nicht theoretisch.', body) }
  }
  const subject = 'Practical guide'
  return { subject, preheader: '', html: wrap(subject, '', `<p>${firstLine(firstName, locale)}</p><p>(English version coming soon — German content is the priority.)</p>`) }
}

function email5Day14(firstName: string | null, role: Persona, locale: Locale): Email {
  if (locale === 'de') {
    const subject = 'Bereit, ein Gespräch zu führen?'
    const body = `<p>${firstLine(firstName, locale)}</p>
<p>Sie sind seit zwei Wochen bei Yalla.House. Vielleicht haben Sie schon ein Inserat — vielleicht noch nicht.</p>
<p>Wenn Sie 20 Minuten haben, zeige ich Ihnen persönlich, wie andere Eigentümer in Ihrer Stadt es gemacht haben — und beantworte Ihre Fragen direkt.</p>
${btn('Termin buchen', `${SITE}/demo`)}
<p style="margin-top:24px;color:#64748B;font-size:13px;">Wenn jetzt nicht der richtige Moment ist — kein Problem. Ich bleibe in der Inbox.</p>
<p style="color:#64748B;font-size:13px;">— Tarek, Gründer Yalla.House</p>`
    return { subject, preheader: '20 Minuten. Konkret. Kostenlos.', html: wrap(subject, '20 Minuten. Konkret. Kostenlos.', body) }
  }
  const subject = 'Want a 20-minute walkthrough?'
  const body = `<p>${firstLine(firstName, locale)}</p>
<p>Two weeks in. If you have 20 minutes I'll walk you through how other owners did it.</p>
${btn('Book a slot', `${SITE}/en/demo`)}
<p style="color:#64748B;font-size:13px;">— Tarek, founder</p>`
  return { subject, preheader: '20 minutes. Concrete. Free.', html: wrap(subject, '20 minutes. Concrete. Free.', body) }
}

// ───────────────────────────────────────────────────────────────────────────────
// Inngest function
// ───────────────────────────────────────────────────────────────────────────────

const SEND_INTERVAL = {
  email1: '0s',
  email2: '3d',
  email3: '4d',  // cumulative day 7
  email4: '3d',  // cumulative day 10
  email5: '4d',  // cumulative day 14
}

async function send(to: string, e: Email): Promise<void> {
  if (!process.env['RESEND_API_KEY']) {
    console.log('[welcome-sequence] RESEND_API_KEY missing — skipping send to', to)
    return
  }
  try {
    await getResend().emails.send({ from: FROM, to, subject: e.subject, html: e.html })
  } catch (err) {
    console.error('[welcome-sequence] Resend send failed for', to, err)
  }
}

export const marketingWelcomeSequence = inngest.createFunction(
  { id: 'marketing.welcome-sequence', retries: 2 },
  { event: 'marketing/welcome.start' },
  async ({ event, step }) => {
    const { email, firstName, role, locale } = event.data

    await step.run('email1-welcome', async () =>
      send(email, email1Welcome(firstName, role, locale)))

    await step.sleep('wait-day-3', SEND_INTERVAL.email2)
    await step.run('email2-day3', async () =>
      send(email, email2Day3(firstName, role, locale)))

    await step.sleep('wait-day-7', SEND_INTERVAL.email3)
    await step.run('email3-day7', async () =>
      send(email, email3Day7(firstName, role, locale)))

    await step.sleep('wait-day-10', SEND_INTERVAL.email4)
    await step.run('email4-day10', async () =>
      send(email, email4Day10(firstName, role, locale)))

    await step.sleep('wait-day-14', SEND_INTERVAL.email5)
    await step.run('email5-day14', async () =>
      send(email, email5Day14(firstName, role, locale)))

    return { sent: 5, email }
  },
)
