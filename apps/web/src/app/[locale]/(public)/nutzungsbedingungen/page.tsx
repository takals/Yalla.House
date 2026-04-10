import Link from 'next/link'

export default function TermsOfServicePage() {
  const lastUpdated = '01.04.2026'

  return (
    <main className="bg-[#EDEEF2]">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-brand mb-4">
            Nutzungsbedingungen
          </div>
          <h1 className="text-[clamp(2.25rem,5.5vw,3.875rem)] font-extrabold tracking-tight text-[#0F1117] leading-[1.1] mb-4">
            Bedingungen für die Nutzung von Yalla.House
          </h1>
          <p className="text-base text-[#656565]">
            Zuletzt aktualisiert: {lastUpdated}
          </p>
        </div>
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Geltungsbereich */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Geltungsbereich
            </h2>
            <div className="space-y-3 text-[#656565] leading-relaxed">
              <p>
                Diese Nutzungsbedingungen regeln die Nutzung der Yalla.House-Plattform (Website und Anwendung) durch alle Benutzer. Mit Zugriff auf oder Nutzung der Plattform akzeptieren Sie diese Bedingungen vollständig.
              </p>
              <p>
                Yalla.House wird betrieben von <strong>Yalla.House GmbH</strong>, eingetragen in Deutschland.
              </p>
            </div>
          </div>

          {/* Registrierung & Konto */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Registrierung und Konto
            </h2>
            <div className="space-y-4 text-[#656565] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#0F1117] mb-2">Kontoerstellung</h3>
                <p>
                  Sie müssen sich mit einer gültigen E-Mail-Adresse registrieren und ein Passwort erstellen. Sie sind verantwortlich für die Vertraulichkeit Ihrer Anmeldedaten.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0F1117] mb-2">Authentizität von Informationen</h3>
                <p>
                  Sie versichern, dass alle bei der Registrierung bereitgestellten Informationen wahr, korrekt und aktuell sind.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0F1117] mb-2">Altersanforderung</h3>
                <p>
                  Sie müssen mindestens 18 Jahre alt sein, um die Plattform zu nutzen.
                </p>
              </div>
            </div>
          </div>

          {/* Leistungsbeschreibung */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Leistungsbeschreibung
            </h2>
            <div className="space-y-4 text-[#656565] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#0F1117] mb-2">Plattform-Services</h3>
                <p>
                  Yalla.House bietet eine Plattform zur Verwaltung und Veröffentlichung von Immobilienangeboten auf Portal-Plattformen wie Immoscout24 und Immowelt.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0F1117] mb-2">Portal-Listierung</h3>
                <p>
                  Wir synchronisieren Ihre Angebote mit anderen Portalen, um Ihre Sichtbarkeit zu erhöhen. Keine Garantie auf Platzierung oder Verkauf.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0F1117] mb-2">Keine Verkaufsgarantie</h3>
                <p>
                  Yalla.House stellt keine Garantie dar, dass Ihre Immobilie verkauft oder vermietet wird. Wir bieten Dienstleistungen zur Unterstützung des Verkaufsprozesses, können aber nicht den Erfolg garantieren.
                </p>
              </div>
            </div>
          </div>

          {/* Preise & Zahlung */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Preise und Zahlung
            </h2>
            <div className="space-y-4 text-[#656565] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#0F1117] mb-2">Flat-Fee-Modell</h3>
                <p>
                  Yalla.House arbeitet auf Basis von pauschalen Gebühren (Flat Fees), nicht auf Provisionsbasis. Aktuelle Preise:
                </p>
                <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
                  <li><strong>Basis:</strong> EUR 199 pro Angebot</li>
                  <li><strong>Professional:</strong> EUR 499 pro Angebot</li>
                  <li><strong>Komplett:</strong> EUR 899 pro Angebot</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-[#0F1117] mb-2">Zahlungsverarbeitung</h3>
                <p>
                  Zahlungen werden über Stripe verarbeitet. Mit der Verwendung von Stripe akzeptieren Sie deren Bedingungen.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0F1117] mb-2">Preisänderungen</h3>
                <p>
                  Wir behalten uns das Recht vor, Preise zu ändern. Änderungen werden mindestens 30 Tage im Voraus mitgeteilt.
                </p>
              </div>
            </div>
          </div>

          {/* Pflichten des Nutzers */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Ihre Pflichten
            </h2>
            <div className="space-y-3 text-[#656565] leading-relaxed">
              <p>Sie erklären sich einverstanden, die Plattform nicht zu verwenden für:</p>
              <ul className="space-y-2 ml-4">
                <li><strong>Illegale Aktivitäten</strong> oder Verstöße gegen lokale, nationale oder internationale Gesetze</li>
                <li><strong>Falsche oder betrügerische Angebote</strong> oder Angebote mit irreführenden Informationen</li>
                <li><strong>Diskriminierung</strong> basierend auf Rasse, Ethnizität, Geschlecht, Religion oder sexueller Orientierung</li>
                <li><strong>Belästigung, Bedrohung oder Missbrauch</strong> anderer Benutzer</li>
                <li><strong>Technische Angriffe</strong> auf die Plattform-Infrastruktur (Hacking, DoS, etc.)</li>
                <li><strong>Spam oder Phishing</strong></li>
                <li><strong>Weitergabe von Malware</strong> oder schädlichen Dateien</li>
              </ul>
            </div>
          </div>

          {/* Haftung */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Haftungsbeschränkung
            </h2>
            <div className="space-y-4 text-[#656565] leading-relaxed">
              <p>
                <strong>Soweit gesetzlich zulässig, haften Yalla.House und seine Betreiber nicht für indirekte, zufällige oder Folgeschäden.</strong>
              </p>
              <p>
                Unsere Haftung ist auf die in den letzten 12 Monaten bezahlten Gebühren begrenzt.
              </p>
              <p>
                Yalla.House ist nicht verantwortlich für:
              </p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Datenverlust oder Verderben von Inhalten</li>
                <li>Ausfallzeiten oder Unterbrechungen des Services</li>
                <li>Kommunikation zwischen Käufern und Verkäufern</li>
                <li>Verhalten anderer Benutzer</li>
              </ul>
            </div>
          </div>

          {/* Kündigung */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Kündigung und Kontosperrung
            </h2>
            <div className="space-y-4 text-[#656565] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#0F1117] mb-2">Kündigung durch Nutzer</h3>
                <p>
                  Sie können Ihr Konto jederzeit über die Kontoeinstellungen oder per E-Mail unter support@yalla.house kündigen.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0F1117] mb-2">Sperrung durch Yalla.House</h3>
                <p>
                  Yalla.House behält sich das Recht vor, Konten zu sperren oder zu löschen, wenn Nutzer gegen diese Bedingungen verstoßen, verdächtige oder illegale Aktivitäten durchführen, oder zahlungsrückständig sind.
                </p>
              </div>
            </div>
          </div>

          {/* Schlussbestimmungen */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Schlussbestimmungen
            </h2>
            <div className="space-y-4 text-[#656565] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#0F1117] mb-2">Anwendbares Recht</h3>
                <p>
                  Diese Bedingungen unterliegen den Gesetzen der Bundesrepublik Deutschland. Gerichtsstand ist Berlin.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0F1117] mb-2">Salvatorische Klausel</h3>
                <p>
                  Sollte eine Bestimmung dieser Bedingungen ungültig sein, bleiben die übrigen Bestimmungen gültig.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-[#0F1117] mb-2">Änderungen</h3>
                <p>
                  Yalla.House behält sich das Recht vor, diese Bedingungen zu ändern. Änderungen werden per E-Mail oder auf der Plattform mitgeteilt. Die weitere Nutzung gilt als Akzeptanz.
                </p>
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
