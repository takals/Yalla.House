import type { Metadata } from 'next'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isEnglish = locale === 'en'

  return {
    title: isEnglish ? 'GDPR | Yalla.House' : 'DSGVO | Yalla.House',
    description: isEnglish
      ? 'GDPR policy and data protection officer contact.'
      : 'DSGVO-Richtlinien und Datenschutzbeauftragte Kontakt.',
  }
}

export default function GDPRPage() {
  const lastUpdated = '01.04.2026'

  return (
    <main className="bg-bg">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-brand mb-4">
            DSGVO und Datensicherheit
          </div>
          <h1 className="text-[clamp(2.25rem,5.5vw,3.875rem)] font-extrabold tracking-tight text-text-primary leading-[1.1] mb-4">
            Unser Engagement für DSGVO-Konformität
          </h1>
          <p className="text-base text-text-muted">
            Zuletzt aktualisiert: {lastUpdated}
          </p>
        </div>
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Unser Engagement */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Unser Datenschutz-Engagement
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>
                Yalla.House ist vollständig konform mit der <strong>Datenschutz-Grundverordnung (DSGVO)</strong> der Europäischen Union. Der Schutz Ihrer Daten steht für uns an erster Stelle.
              </p>
              <p>
                Wir folgen dem Prinzip der <strong>Datensparsamkeit</strong> (data minimization) — wir erheben nur die Daten, die wir tatsächlich benötigen, und speichern sie nur so lange wie nötig.
              </p>
            </div>
          </div>

          {/* Technische Maßnahmen */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Technische Maßnahmen
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <div>
                <h3 className="font-bold text-text-primary mb-2">Verschlüsselung in der Übertragung</h3>
                <p>
                  Alle Daten werden über <strong>TLS 1.3 (HTTPS)</strong> übertragen. Dies ist der aktuelle Standard für sichere Internetkommunikation.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Verschlüsselung im Ruhezustand</h3>
                <p>
                  Sensible Daten in unserer Datenbank werden mit <strong>AES-256</strong> verschlüsselt. Passwörter werden mit PBKDF2 gehasht.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Zugriffskontrolle</h3>
                <p>
                  Datenbankzugriffe werden überwacht. Nur autorisierte Systeme und Mitarbeiter können auf sensible Daten zugreifen.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Regelmäßige Audits</h3>
                <p>
                  Wir führen monatliche Sicherheitsaudits und Penetrationstests durch, um Schwachstellen zu identifizieren und zu beheben.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Backup & Disaster Recovery</h3>
                <p>
                  Tägliche Backups an mehreren geografischen Standorten sichern die Verfügbarkeit Ihrer Daten.
                </p>
              </div>
            </div>
          </div>

          {/* Organisatorische Maßnahmen */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Organisatorische Maßnahmen
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <div>
                <h3 className="font-bold text-text-primary mb-2">Zugriffsrechteverwaltung</h3>
                <p>
                  Mitarbeiter haben Zugriff nur auf die Daten, die sie für ihre Aufgaben benötigen (Least Privilege Principle).
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Datenschutz-Schulungen</h3>
                <p>
                  Alle Mitarbeiter erhalten regelmäßige DSGVO- und Datensicherheitsschulung.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Auftragsverarbeitungsverträge (AVV)</h3>
                <p>
                  Mit allen Datenverarbeitern (Supabase, Stripe, Vercel, etc.) haben wir schriftliche Auftragsverarbeitungsverträge abgeschlossen.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Datenschutz Impact Assessment (DPIA)</h3>
                <p>
                  Bei neuen Verarbeitungen führen wir eine DPIA durch, um Risiken zu bewerten und Maßnahmen festzulegen.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">Datenaufbewahrungsrichtlinien</h3>
                <p>
                  Wir speichern personenbezogene Daten nur so lange wie erforderlich. Nach Kontokündigung werden Daten nach [30/60/90] Tagen gelöscht.
                </p>
              </div>
            </div>
          </div>

          {/* Datenverarbeitung in der EU */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Datenverarbeitung in der EU
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p>
                Alle Ihre Daten werden <strong>ausschließlich in der Europäischen Union verarbeitet und gespeichert</strong>. Es gibt keine Datenübertragungen in Länder außerhalb des EWR.
              </p>
              <div className="bg-brand-solid-bg border border-brand rounded-lg p-4 space-y-2">
                <p><strong>Supabase (Datenbank):</strong> EU-Region (Frankreich)</p>
                <p><strong>Vercel (Hosting):</strong> EU-CDN (Deutschland, Niederlande, Finnland)</p>
                <p><strong>Stripe (Payments):</strong> EU-konform, mit Datenschutzvereinbarung</p>
              </div>
            </div>
          </div>

          {/* Auftragsverarbeiter */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Auftragsverarbeiter
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p>
                Folgende Auftragsverarbeiter verarbeiten Daten in unserem Auftrag:
              </p>
              <div className="space-y-3">
                <div className="border-l-4 border-brand pl-4">
                  <p><strong>Supabase</strong> (Datenbank-Hosting)</p>
                  <p className="text-sm">Datenverarbeitungsvereinbarung: Ja</p>
                  <p className="text-sm">Standort: Frankreich (EU)</p>
                </div>
                <div className="border-l-4 border-brand pl-4">
                  <p><strong>Vercel</strong> (Anwendungs-Hosting)</p>
                  <p className="text-sm">Datenverarbeitungsvereinbarung: Ja</p>
                  <p className="text-sm">Standort: EU</p>
                </div>
                <div className="border-l-4 border-brand pl-4">
                  <p><strong>Stripe</strong> (Zahlungsabwicklung)</p>
                  <p className="text-sm">Datenverarbeitungsvereinbarung: Ja</p>
                  <p className="text-sm">Standort: EU-konform</p>
                </div>
                <div className="border-l-4 border-brand pl-4">
                  <p><strong>Immoscout24 & Immowelt</strong> (Portal-Syndikation)</p>
                  <p className="text-sm">Datenverarbeitungsvereinbarung: Ja</p>
                  <p className="text-sm">Standort: Deutschland</p>
                </div>
              </div>
            </div>
          </div>

          {/* Datenschutzbeauftragter */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Datenschutzbeauftragter
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>
                Yalla.House hat einen betrieblichen Datenschutzbeauftragten bestellt. Sie können ihn unter folgenden Kontaktdaten erreichen:
              </p>
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <p><strong>Datenschutzbeauftragter:</strong> [Name wird ergänzt]</p>
                <p><strong>E-Mail:</strong> dpo@yalla.house</p>
              </div>
            </div>
          </div>

          {/* Datenschutzverletzungen */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              Meldung von Datenschutzverletzungen
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p>
                Sollten wir Kenntnis von einer Datenschutzverletzung (Data Breach) erlangen, werden wir:
              </p>
              <ul className="space-y-2 ml-4">
                <li><strong>1. Sie benachrichtigen</strong> — innerhalb von 72 Stunden ohne unangemessene Verzögerung</li>
                <li><strong>2. Die Behörde benachrichtigen</strong> — wenn erforderlich, die zuständige Datenschutzbehörde informieren</li>
                <li><strong>3. Maßnahmen ergreifen</strong> — den Schaden begrenzen und Maßnahmen zur Prävention durchführen</li>
              </ul>
              <p className="mt-4">
                Bei Verdacht auf eine Datenschutzverletzung kontaktieren Sie bitte sofort:
              </p>
              <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-lg p-4">
                <p><strong>E-Mail:</strong> security@yalla.house</p>
                <p><strong>Telefon:</strong> [Nummer wird ergänzt]</p>
              </div>
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
