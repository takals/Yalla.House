import Link from 'next/link'

export default function ImpressumPage() {
  const lastUpdated = '01.04.2026'

  return (
    <main className="bg-[#EDEEF2]">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-[#FFD400] mb-4">
            Impressum
          </div>
          <h1 className="text-[clamp(2.25rem,5.5vw,3.875rem)] font-extrabold tracking-tight text-[#0F1117] leading-[1.1] mb-4">
            Impressum gemäß § 5 TMG
          </h1>
          <p className="text-base text-[#656565]">
            Zuletzt aktualisiert: {lastUpdated}
          </p>
        </div>
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Angaben gemäß § 5 TMG */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Angaben gemäß § 5 Telemediengesetz (TMG)
            </h2>
            <div className="space-y-4 text-[#656565] leading-relaxed">
              <div>
                <p className="font-bold text-[#0F1117]">Diensteanbieter:</p>
                <p>
                  Yalla.House GmbH<br />
                  [Straße und Hausnummer wird ergänzt]<br />
                  [Postleitzahl wird ergänzt] [Stadt wird ergänzt]<br />
                  Deutschland
                </p>
              </div>
            </div>
          </div>

          {/* Kontaktinformationen */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Kontaktinformationen
            </h2>
            <div className="space-y-3 text-[#656565] leading-relaxed">
              <div>
                <p><strong>Telefon:</strong> [Telefonnummer wird ergänzt]</p>
                <p><strong>E-Mail:</strong> support@yalla.house</p>
                <p><strong>Website:</strong> www.yalla.house</p>
              </div>
            </div>
          </div>

          {/* Geschäftsführung */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Vertreten durch
            </h2>
            <div className="space-y-3 text-[#656565] leading-relaxed">
              <div>
                <p className="font-bold text-[#0F1117]">Geschäftsführer(in):</p>
                <p>[Name wird ergänzt]</p>
              </div>
            </div>
          </div>

          {/* Handelsregister */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Registereintrag
            </h2>
            <div className="space-y-3 text-[#656565] leading-relaxed">
              <div>
                <p><strong>Registergericht:</strong> [Registergericht wird ergänzt]</p>
                <p><strong>Registernummer:</strong> [Handelsregisternummer wird ergänzt]</p>
              </div>
            </div>
          </div>

          {/* Umsatzsteuer-ID */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Umsatzsteuer-Identifikationsnummer
            </h2>
            <div className="space-y-3 text-[#656565] leading-relaxed">
              <p>
                <strong>Umsatzsteuer-ID gemäß § 27a Umsatzsteuergesetz (UStG):</strong><br />
                [Umsatzsteuer-ID wird ergänzt]
              </p>
            </div>
          </div>

          {/* Verantwortlicher Inhalt */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <div className="space-y-3 text-[#656565] leading-relaxed">
              <p>
                [Name wird ergänzt]<br />
                [Adresse wird ergänzt]<br />
                Deutschland
              </p>
            </div>
          </div>

          {/* Streitschlichtung */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Streitschlichtung
            </h2>
            <div className="space-y-4 text-[#656565] leading-relaxed">
              <p>
                Yalla.House ist bereit, an Streitschlichtungsverfahren teilzunehmen. Die Europäische Union hat eine Online-Plattform für die außergerichtliche Beilegung von Verbraucherbeschwerden eingerichtet:
              </p>
              <p>
                <strong>EU-Streitschlichtungsplattform:</strong> <a href="https://ec.europa.eu/consumers/odr/main/" target="_blank" rel="noopener noreferrer" className="text-[#FFD400] hover:text-[#E6C200] font-semibold">https://ec.europa.eu/consumers/odr/main/</a>
              </p>
              <p>
                Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen. Unseren freiwilligen Streitschlichtungsmechanismus finden Sie unter support@yalla.house.
              </p>
            </div>
          </div>

          {/* Haftungsausschluss - Haftung für Inhalte */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Haftungsausschluss
            </h2>
            <div className="space-y-6 text-[#656565] leading-relaxed">
              <div>
                <h3 className="font-bold text-[#0F1117] mb-3">Haftung für Inhalte (gemäß § 7 Abs. 1 TMG)</h3>
                <p>
                  Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
                </p>
                <p className="mt-3">
                  Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                </p>
                <p className="mt-3">
                  Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen bleiben hiervon unberührt. Diese Haftung ist jedoch nur möglich, ab dem Zeitpunkt, in dem wir von der Rechtswidrigkeit Kenntnis erlangen.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#0F1117] mb-3">Haftung für Links (gemäß § 7 Abs. 1 TMG)</h3>
                <p>
                  Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                </p>
                <p className="mt-3">
                  Wir haben die verlinkten Seiten zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
                </p>
                <p className="mt-3">
                  Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-[#0F1117] mb-3">Urheberrecht</h3>
                <p>
                  Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des Autors oder Urhebers bzw. Seitenbetreibers.
                </p>
                <p className="mt-3">
                  Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht von Yalla.House GmbH stammen, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet.
                </p>
                <p className="mt-3">
                  Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
                </p>
              </div>
            </div>
          </div>

          {/* Datenschutz & Cookies */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Datenschutz und Cookies
            </h2>
            <div className="space-y-4 text-[#656565] leading-relaxed">
              <p>
                Informationen zum Datenschutz und zur Verwendung von Cookies finden Sie in unseren separaten Dokumenten:
              </p>
              <div className="space-y-2">
                <Link
                  href="/datenschutz"
                  className="block text-[#FFD400] hover:text-[#E6C200] font-semibold"
                >
                  → Datenschutzrichtlinie (Datenschutz)
                </Link>
                <Link
                  href="/cookies"
                  className="block text-[#FFD400] hover:text-[#E6C200] font-semibold"
                >
                  → Cookie-Richtlinie
                </Link>
              </div>
            </div>
          </div>

          {/* Kontakt für rechtliche Fragen */}
          <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Kontakt für rechtliche Anfragen
            </h2>
            <div className="space-y-3 text-[#656565] leading-relaxed">
              <p>
                Für Fragen zum Impressum oder zu rechtlichen Angelegenheiten kontaktieren Sie uns:
              </p>
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <p><strong>E-Mail:</strong> legal@yalla.house</p>
                <p><strong>Adresse:</strong> Yalla.House GmbH, [Adresse wird ergänzt]</p>
              </div>
            </div>
          </div>

          {/* Hinweis zum Impressum */}
          <div className="bg-[#DBEAFE] border border-[#BAE6FD] rounded-2xl p-8">
            <p className="text-[#0F1117] leading-relaxed">
              <strong>Hinweis:</strong> Dieses Impressum enthält Platzhalter, die mit aktuellen Informationen der Yalla.House GmbH ergänzt werden müssen, bevor die Website öffentlich zugänglich gemacht wird. Ein unvollständiges Impressum kann zu rechtlichen Problemen führen.
            </p>
          </div>

        </div>
      </section>

      {/* ── BACK LINK ────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 border-t border-[#E2E4EB]">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#FFD400] font-semibold hover:text-[#E6C200] transition-colors"
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </section>
    </main>
  )
}
