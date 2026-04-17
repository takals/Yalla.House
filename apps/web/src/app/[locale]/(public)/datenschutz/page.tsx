import type { Metadata } from 'next'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isEnglish = locale === 'en'

  return {
    title: isEnglish ? 'Privacy Policy | Yalla.House' : 'Datenschutzerklärung | Yalla.House',
    description: isEnglish
      ? 'Privacy policy and data protection information for Yalla.House.'
      : 'Datenschutzerklärung und Datenschutzrichtlinien von Yalla.House.',
  }
}

export default function DataProtectionPage() {
  const lastUpdated = '01.04.2026'

  return (
    <main className="bg-bg">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-brand mb-4">
            Datenschutzrichtlinie
          </div>
          <h1 className="text-[clamp(2.25rem,5.5vw,3.875rem)] font-extrabold tracking-tight text-text-primary leading-[1.1] mb-4">
            Datenschutz bei Yalla.House
          </h1>
          <p className="text-base text-text-muted">
            Zuletzt aktualisiert: {lastUpdated}
          </p>
        </div>
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Verantwortliche Stelle */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Verantwortliche Stelle
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>
                <strong>Yalla.House GmbH</strong><br />
                [Adresse wird ergänzt]<br />
                Deutschland
              </p>
              <p>
                <strong>E-Mail:</strong> support@yalla.house<br />
                <strong>Telefon:</strong> [Telefonnummer wird ergänzt]
              </p>
            </div>
          </div>

          {/* Erhobene Daten */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Welche Daten wir erheben
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <div>
                <h3 className="font-bold text-text-primary mb-2">Persönliche Daten</h3>
                <p>
                  Wenn Sie sich registrieren oder ein Konto erstellen, erheben wir Ihren Namen, E-Mail-Adresse, Telefonnummer und Kontaktinformationen.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Listing-Daten</h3>
                <p>
                  Für Immobilienangebote erheben wir Beschreibungen, Fotos, Preise, Standortdaten und weitere Informationen, die Sie bereitstellen.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Nutzungsdaten</h3>
                <p>
                  Wir erfassen Informationen über Ihre Interaktionen mit der Plattform, einschließlich IP-Adressen, Browser-Informationen und Zugriffsmuster.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Cookies</h3>
                <p>
                  Wir verwenden Cookies und ähnliche Technologien für Authentifizierung, Sitzungsverwaltung und Analyse. Weitere Details finden Sie in unserer Cookie-Richtlinie.
                </p>
              </div>
            </div>
          </div>

          {/* Zweck der Datenverarbeitung */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Zweck der Datenverarbeitung
            </h2>
            <ul className="space-y-3 text-text-muted leading-relaxed">
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>Kontoverwaltung:</strong> Kontoerstellung, Authentifizierung und Verwaltung Ihres Profils</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>Listing-Verwaltung:</strong> Veröffentlichung und Synchronisierung von Angeboten auf Portal-Plattformen (IS24, Immowelt)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>Kommunikation:</strong> Kontaktaufnahme, Support-Anfragen und Benachrichtigungen</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>Zahlungsabwicklung:</strong> Verarbeitung von Transaktionen über Stripe</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>Analytics:</strong> Anonyme Nutzungsstatistiken zur Verbesserung unserer Services</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>Rechtliche Verpflichtungen:</strong> Compliance mit geltenden Gesetzen</span>
              </li>
            </ul>
          </div>

          {/* Rechtsgrundlage */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Rechtliche Grundlagen (DSGVO)
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>
                Die Verarbeitung Ihrer Daten erfolgt gemäß Artikel 6 DSGVO auf folgenden Grundlagen:
              </p>
              <ul className="space-y-2 ml-4">
                <li><strong>Art. 6 Abs. 1 Buchstabe a:</strong> Ihre Einwilligung (z.B. für Marketing)</li>
                <li><strong>Art. 6 Abs. 1 Buchstabe b:</strong> Vertragserfüllung (z.B. Kontoöffnung, Listing-Verwaltung)</li>
                <li><strong>Art. 6 Abs. 1 Buchstabe c:</strong> Erfüllung rechtlicher Verpflichtungen</li>
                <li><strong>Art. 6 Abs. 1 Buchstabe f:</strong> Berechtigte Interessen (z.B. Sicherheit, Fraud-Prävention)</li>
              </ul>
            </div>
          </div>

          {/* Datenweitergabe */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Datenweitergabe an Dritte
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p>
                Ihre Daten werden nur an folgende Verarbeiter weitergegeben:
              </p>
              <div className="bg-brand-solid-bg border border-brand rounded-lg p-4 space-y-2">
                <p><strong>Supabase (PostgreSQL Hosting):</strong> EU-Region (Frank­reich). Datensicherheitsvereinbarung unterzeichnet.</p>
                <p><strong>Stripe (Zahlungsabwicklung):</strong> EU-konform. Zusätzliche Informationen in den Stripe-Datenschutzrichtlinien.</p>
                <p><strong>Immoscout24 & Immowelt:</strong> Listing-Daten werden synchronisiert, um Ihre Angebote zu veröffentlichen.</p>
                <p><strong>Vercel (Hosting):</strong> Die Plattform wird über CDN/Hosting in EU-Regionen bereitgestellt.</p>
              </div>
              <p>
                Wir verkaufen Ihre Daten nicht an Marketingunternehmen oder andere kommerzielle Dritte.
              </p>
            </div>
          </div>

          {/* Ihre Rechte */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Ihre Datenschutzrechte
            </h2>
            <p className="text-text-muted leading-relaxed mb-4">
              Sie haben folgende Rechte unter der DSGVO:
            </p>
            <ul className="space-y-3 text-text-muted leading-relaxed">
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>Auskunftsrecht (Art. 15):</strong> Sie können jederzeit erfahren, welche Daten wir über Sie speichern</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>Berichtigungsrecht (Art. 16):</strong> Sie können falsche oder unvollständige Daten korrigieren</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>Löschungsrecht (Art. 17):</strong> Sie können die Löschung Ihrer Daten verlangen (unter bestimmten Bedingungen)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>Einschränkungsrecht (Art. 18):</strong> Sie können die Verarbeitung einschränken</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>Datenübertragungsrecht (Art. 20):</strong> Sie können Ihre Daten in einem strukturierten Format erhalten</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>Widerspruchsrecht (Art. 21):</strong> Sie können der Verarbeitung widersprechen</span>
              </li>
            </ul>
            <p className="text-text-muted leading-relaxed mt-4">
              Kontaktieren Sie uns unter <strong>support@yalla.house</strong>, um diese Rechte auszuüben.
            </p>
          </div>

          {/* Kontakt & Beschwerde */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Kontakt & Datenschutzbeschwerden
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p>
                Für Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte kontaktieren Sie uns:
              </p>
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <p><strong>E-Mail:</strong> support@yalla.house</p>
                <p><strong>Adresse:</strong> [Adresse wird ergänzt]</p>
              </div>
              <p>
                Sie haben auch das Recht, sich bei einer Datenschutzbehörde zu beschweren. Für Deutschland ist dies der Bundesbeauftragte für den Datenschutz und die Informationsfreiheit (BfDI).
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ── BACK LINK ────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 border-t border-border-default">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-brand font-semibold hover:text-brand-hover transition-colors"
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </section>
    </main>
  )
}
