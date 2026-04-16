import type { Metadata } from 'next'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isEnglish = locale === 'en'

  return {
    title: isEnglish ? 'Security | Yalla.House' : 'Sicherheit | Yalla.House',
    description: isEnglish
      ? 'Security policies and protection measures for Yalla.House.'
      : 'Sicherheitsrichtlinien und Schutzmaßnahmen bei Yalla.House.',
  }
}

export default function SecurityPage() {
  const lastUpdated = '01.04.2026'

  return (
    <main className="bg-bg">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-brand mb-4">
            Sicherheit & Datenschutz
          </div>
          <h1 className="text-[clamp(2.25rem,5.5vw,3.875rem)] font-extrabold tracking-tight text-text-primary leading-[1.1] mb-4">
            Sicherheit Ihrer Daten ist unsere Priorität
          </h1>
          <p className="text-base text-[#656565]">
            Zuletzt aktualisiert: {lastUpdated}
          </p>
        </div>
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Sicherheitsarchitektur */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Sicherheitsarchitektur
            </h2>
            <div className="space-y-4 text-[#656565] leading-relaxed">
              <p>
                Yalla.House folgt einem <strong>Defense-in-Depth-Ansatz</strong> mit mehreren Sicherheitsebenen:
              </p>
              <ul className="space-y-2 ml-4">
                <li><strong>Netzwerk-Sicherheit:</strong> Firewalls, DDoS-Schutz, WAF (Web Application Firewall)</li>
                <li><strong>Anwendungs-Sicherheit:</strong> Code-Audits, Dependency-Scanning, Rate Limiting</li>
                <li><strong>Daten-Sicherheit:</strong> Verschlüsselung, Zugriffskontrolle, Audit Logs</li>
                <li><strong>Physische Sicherheit:</strong> Hosting bei zertifizierten Rechenzentren in der EU</li>
              </ul>
            </div>
          </div>

          {/* Verschlüsselung */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Verschlüsselung
            </h2>
            <div className="space-y-4 text-[#656565] leading-relaxed">
              <div>
                <h3 className="font-bold text-text-primary mb-2">Transport Layer (TLS 1.3)</h3>
                <p>
                  Alle Kommunikation zwischen Ihrem Browser und unserem Server wird mit <strong>TLS 1.3</strong> verschlüsselt. Dies ist der neueste und sicherste Standard für HTTPS.
                </p>
                <p className="text-sm mt-2">
                  Zertifikat: Let&apos;s Encrypt, automatisch erneuert
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Datenbank-Verschlüsselung (AES-256)</h3>
                <p>
                  Sensitive Daten in der Datenbank werden mit <strong>AES-256</strong> (Advanced Encryption Standard, 256-Bit) verschlüsselt. Dies ist der Standard für militärische Datensicherheit.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Passwort-Sicherheit</h3>
                <p>
                  Passwörter werden niemals im Klartext gespeichert. Wir verwenden <strong>PBKDF2 mit 100.000 Iterationen</strong> zum Hashen von Passwörtern.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Token & Session-Verwaltung</h3>
                <p>
                  Session-Tokens sind kurzlebig (verfallen nach 24 Stunden) und werden mit starken Zufallsgeneratoren erzeugt.
                </p>
              </div>
            </div>
          </div>

          {/* Zugriffskontrollen */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Zugriffskontrollen
            </h2>
            <div className="space-y-4 text-[#656565] leading-relaxed">
              <div>
                <h3 className="font-bold text-text-primary mb-2">Rollenbasierte Zugriffskontrolle (RBAC)</h3>
                <p>
                  Benutzer haben unterschiedliche Rollen (Owner, Hunter, Agent, Admin) mit spezifischen Berechtigungen. Jeder Benutzer kann nur auf Daten zugreifen, die seiner Rolle entsprechen.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Multi-Faktor-Authentifizierung (MFA)</h3>
                <p>
                  Admin-Konten erfordern <strong>Multi-Faktor-Authentifizierung</strong> für erhöhte Sicherheit.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Audit Logging</h3>
                <p>
                  Alle sensiblen Operationen (Datenabfragen, Adminänderungen, Löschungen) werden protokolliert für Nachverfolgbarkeit.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">IP-Whitelist für Admin-Panel</h3>
                <p>
                  Das Admin-Panel ist auf bekannte IP-Adressen beschränkt. Unbekannte IPs werden blockiert.
                </p>
              </div>
            </div>
          </div>

          {/* Infrastruktur */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Infrastruktur & Hosting
            </h2>
            <div className="space-y-4 text-[#656565] leading-relaxed">
              <div>
                <h3 className="font-bold text-text-primary mb-2">EU-Hosting</h3>
                <p>
                  Die gesamte Infrastruktur wird in der Europäischen Union gehostet (Supabase: Frankreich, Vercel: EU-CDN).
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Redundanz & Hochverfügbarkeit</h3>
                <p>
                  Mehrere Replicas der Datenbank an verschiedenen Standorten sorgen für Ausfallsicherheit. Automatische Failover im Notfall.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">DDoS-Schutz</h3>
                <p>
                  Vercel bietet integrierten DDoS-Schutz gegen verteilte Denial-of-Service-Angriffe.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Zertifizierungen</h3>
                <p>
                  Supabase ist SOC 2 Type II zertifiziert. Vercel erfüllt ISO 27001 Standards.
                </p>
              </div>
            </div>
          </div>

          {/* Regelmäßige Überprüfung */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Regelmäßige Überprüfung & Tests
            </h2>
            <div className="space-y-4 text-[#656565] leading-relaxed">
              <div>
                <h3 className="font-bold text-text-primary mb-2">Penetrationstests</h3>
                <p>
                  Monatliche externe Penetrationstests durch spezialisierte Sicherheitsfirmen identifizieren Schwachstellen.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Dependency Audits</h3>
                <p>
                  Automatisierte Tools überprüfen wöchentlich alle verwendeten Bibliotheken und Abhängigkeiten auf bekannte Sicherheitslücken.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Code Reviews</h3>
                <p>
                  Alle Codeänderungen durchlaufen mindestens zwei Sicherheits-Code-Reviews vor dem Deployment.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Vulnerability Scanning</h3>
                <p>
                  Automated Vulnerability Scanning in der CI/CD-Pipeline erkennt bekannte CVEs.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Sicherheits-Updates</h3>
                <p>
                  Kritische Sicherheitsupdates werden innerhalb von 24 Stunden deployed.
                </p>
              </div>
            </div>
          </div>

          {/* Verantwortungsvolle Offenlegung */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Verantwortungsvolle Offenlegung
            </h2>
            <div className="space-y-4 text-[#656565] leading-relaxed">
              <p>
                Wenn Sie eine Sicherheitslücke in Yalla.House entdecken, bitten wir Sie, diese <strong>verantwortungsvoll</strong> an uns zu berichten:
              </p>
              <div className="bg-[#DBEAFE] border border-[#BAE6FD] rounded-lg p-4">
                <p><strong>E-Mail:</strong> security@yalla.house</p>
                <p className="text-sm mt-2">
                  Bitte senden Sie einen detaillierten Bericht mit:
                </p>
                <ul className="list-disc list-inside text-sm ml-2 mt-2 space-y-1">
                  <li>Beschreibung der Schwachstelle</li>
                  <li>Schritte zur Reproduktion</li>
                  <li>Auswirkungen (wie könnte sie ausgenutzt werden?)</li>
                  <li>Mögliche Behebung (optional)</li>
                </ul>
              </div>
              <p className="mt-4">
                Wir werden Ihren Bericht ernst nehmen und Ihnen:
              </p>
              <ul className="list-disc list-inside text-sm ml-2 space-y-1">
                <li>Eine Bestätigung senden innerhalb von 48 Stunden</li>
                <li>Ein Zeitfenster geben, um die Schwachstelle zu beheben (typisch: 90 Tage)</li>
                <li>Sie über den Fix-Status auf dem Laufenden halten</li>
              </ul>
            </div>
          </div>

          {/* Bug Bounty */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Bug Bounty Programm
            </h2>
            <div className="space-y-3 text-[#656565] leading-relaxed">
              <p>
                Yalla.House beteiligt sich an einem Bug Bounty Programm zur Anreizung der verantwortungsvollen Offenlegung von Sicherheitslücken.
              </p>
              <p className="text-sm italic">
                Details zum Bounty-Programm werden in Kürze verfügbar sein. Kontaktieren Sie security@yalla.house für weitere Informationen.
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
