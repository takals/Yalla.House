import Link from 'next/link'

export default function CookiePolicyPage() {
  const lastUpdated = '01.04.2026'

  return (
    <main className="bg-[#EDEEF2]">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-brand mb-4">
            Cookie-Richtlinie
          </div>
          <h1 className="text-[clamp(2.25rem,5.5vw,3.875rem)] font-extrabold tracking-tight text-[#0F1117] leading-[1.1] mb-4">
            Cookies bei Yalla.House
          </h1>
          <p className="text-base text-[#656565]">
            Zuletzt aktualisiert: {lastUpdated}
          </p>
        </div>
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Was sind Cookies */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Was sind Cookies?
            </h2>
            <div className="space-y-3 text-[#656565] leading-relaxed">
              <p>
                Cookies sind kleine Textdateien, die von Websites auf Ihrem Gerät (Computer, Tablet, Smartphone) gespeichert werden. Sie ermöglichen es uns, Ihre Voreinstellungen zu speichern, Ihre Sitzung zu verwalten und Ihr Browsing-Verhalten zu verfolgen.
              </p>
              <p>
                Cookies können für verschiedene Zwecke verwendet werden: zur Authentifizierung, zur Anpassung der Benutzeroberfläche, zur Leistungsoptimierung und zur Analyse der Nutzung.
              </p>
            </div>
          </div>

          {/* Notwendige Cookies */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Notwendige Cookies
            </h2>
            <div className="space-y-4 text-[#656565] leading-relaxed">
              <p>
                Diese Cookies sind <strong>erforderlich</strong> für die Funktionsfähigkeit der Plattform. Sie können nicht deaktiviert werden.
              </p>
              <div className="bg-brand-solid-bg border border-brand rounded-lg p-4 space-y-3">
                <div>
                  <p><strong>Session Cookies</strong></p>
                  <p className="text-sm">Ermöglichen die Verwaltung Ihrer aktiven Sitzung während Sie die Plattform nutzen.</p>
                </div>
                <div>
                  <p><strong>Authentication Cookies</strong></p>
                  <p className="text-sm">Verwalten Ihre Anmeldeinformationen und halten Ihre Sitzung sicher.</p>
                </div>
                <div>
                  <p><strong>CSRF Protection Cookies</strong></p>
                  <p className="text-sm">Schützen vor Cross-Site-Request-Forgery-Angriffen.</p>
                </div>
                <div>
                  <p><strong>Cookie Preference Cookies</strong></p>
                  <p className="text-sm">Speichern Ihre Cookie-Präferenzen, um Ihre Zustimmung zu respektieren.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analyse-Cookies */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Analyse-Cookies
            </h2>
            <div className="space-y-4 text-[#656565] leading-relaxed">
              <p>
                Wir verwenden Analyse-Cookies, um zu verstehen, wie Benutzer unsere Plattform nutzen. Diese Daten werden <strong>anonymisiert</strong> und helfen uns, unsere Services zu verbessern.
              </p>
              <div className="space-y-3">
                <div>
                  <p><strong>Nutzungsstatistiken</strong></p>
                  <p className="text-sm">Zählen Seitenaufrufe, Absprungrate und durchschnittliche Sitzungsdauer.</p>
                </div>
                <div>
                  <p><strong>Feature-Verbrauch</strong></p>
                  <p className="text-sm">Identifizieren die am häufigsten genutzten Features und Funktionen.</p>
                </div>
                <div>
                  <p><strong>Fehlerberichterstattung</strong></p>
                  <p className="text-sm">Helfen uns, technische Probleme zu erkennen und zu beheben.</p>
                </div>
              </div>
              <p className="text-sm italic">
                Diese Cookies sind <strong>optional</strong>. Sie können sie jederzeit ablehnen oder deaktivieren.
              </p>
            </div>
          </div>

          {/* Marketing-Cookies */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Marketing-Cookies
            </h2>
            <div className="space-y-3 text-[#656565] leading-relaxed">
              <p>
                Yalla.House setzt derzeit <strong>keine Marketing- oder Tracking-Cookies</strong> von Drittanbietern ein.
              </p>
              <p>
                Wir teilen Ihre Browsing-Daten nicht mit sozialen Medien oder Werbeplattformen.
              </p>
            </div>
          </div>

          {/* Cookie-Verwaltung */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Cookie-Verwaltung
            </h2>
            <div className="space-y-4 text-[#656565] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#0F1117] mb-2">Cookies verwalten</h3>
                <p>
                  Sie können optionale Cookies über unser Cookie-Consent-Banner jederzeit akzeptieren oder ablehnen.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0F1117] mb-2">Browser-Einstellungen</h3>
                <p>
                  Die meisten Browser ermöglichen es Ihnen, Cookies zu verwalten:
                </p>
                <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
                  <li><strong>Chrome:</strong> Einstellungen → Datenschutz und Sicherheit → Cookies</li>
                  <li><strong>Firefox:</strong> Einstellungen → Datenschutz → Cookies</li>
                  <li><strong>Safari:</strong> Einstellungen → Datenschutz → Cookies-Einstellungen</li>
                  <li><strong>Edge:</strong> Einstellungen → Datenschutz → Cookies</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[#0F1117] mb-2">Drittanbieter-Cookies deaktivieren</h3>
                <p>
                  In den meisten Browsern können Sie Cookies von Drittanbietern separat deaktivieren. Dies kann jedoch die Funktionalität einiger Websites beeinträchtigen.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0F1117] mb-2">Do-Not-Track</h3>
                <p>
                  Viele Browser bieten eine &quot;Do-Not-Track&quot;-Option. Wir respektieren diese Einstellung, soweit praktisch möglich.
                </p>
              </div>
            </div>
          </div>

          {/* Kontakt */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Fragen zu Cookies?
            </h2>
            <div className="space-y-3 text-[#656565] leading-relaxed">
              <p>
                Wenn Sie Fragen zu unserer Cookie-Richtlinie oder zur Verwendung von Cookies haben, kontaktieren Sie uns bitte:
              </p>
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <p><strong>E-Mail:</strong> support@yalla.house</p>
                <p><strong>Telefon:</strong> [Telefonnummer wird ergänzt]</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── BACK LINK ────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 border-t border-[#E2E4EB]">
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
