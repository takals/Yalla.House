import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="bg-[#EDEEF2]">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs font-bold uppercase tracking-widest text-[#FFD400] mb-4">
            Unsere Mission
          </div>
          <h1 className="text-[clamp(2.25rem,5.5vw,3.875rem)] font-extrabold tracking-tight text-[#0F1117] leading-[1.1] mb-6">
            Immobilienverkauf, der fair, klar und Ihrer ist.
          </h1>
          <p className="text-lg text-[#656565] leading-relaxed max-w-2xl mx-auto">
            Yalla.House wurde auf einem einfachen Prinzip gebaut: Der Verkauf Ihres Hauses sollte nicht Tausende Euro an Provision kosten. Wir haben das alte Modell abgeschafft — und durch Transparenz, Technologie und wirklich hilfreiche Tools ersetzt.
          </p>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────────────────────── */}
      <section className="py-10 px-4 bg-white border-y border-[#E2E4EB]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { icon: '🏛', label: 'Registriert in Deutschland' },
              { icon: '🔒', label: 'DSGVO-konform' },
              { icon: '🌍', label: 'Auf IS24 & Immowelt gelistet' },
              { icon: '⭐', label: '5-Sterne Verkäuferzufriedenheit' },
              { icon: '💛', label: 'Keine Provision. Niemals.' },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-3 text-center">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-sm font-semibold text-[#0F1117]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SECTION ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <div className="text-xs font-bold uppercase tracking-widest text-[#FFD400] mb-3">Warum Yalla.House</div>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Der Immobilienmarkt war kaputt. Also haben wir ihn repariert.
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Left Column */}
            <div className="space-y-5">
              <p className="text-[#656565] leading-relaxed">
                Traditionelle Makler verlangen 3–6% Provision — oft €12.000+ bei einer durchschnittlichen Immobilie. In vielen Fällen kennen Verkäufer nicht einmal, wofür sie bezahlen.
              </p>
              <p className="text-[#656565] leading-relaxed">
                Gleichzeitig jagten Verkäufer ihren Maklern für Updates hinterher, Käufer wurden ignoriert und Angebote verschwanden in E-Mail-Ketten. Jeder verlor Zeit.
              </p>
              <p className="text-[#656565] leading-relaxed">
                Yalla.House ändert das. Wir haben die Tools gebaut, damit jeder Verkäufer — DIY, hybrid oder maklergeführt — die volle Kontrolle behält.
              </p>
            </div>

            {/* Right Column — Pain Point Cards */}
            <div className="space-y-4">
              {[
                '67% der Käufer nennen langsame oder keine Antwort als #1-Frustration',
                '58% stießen auf "Geister-Inserate" — als verfügbar gelistet, aber bereits reserviert',
                '57% der Verkäufer fühlten sich jede Woche "im Dunkeln"',
                '44% der Verkäufer konnten den Stand ihrer Angebote nicht einsehen',
              ].map((pain, i) => (
                <div key={i} className="bg-[#FEE2E2] border border-[#FECACA] rounded-2xl p-4">
                  <p className="text-sm font-semibold text-[#991B1B]">{pain}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES SECTION ───────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-bold uppercase tracking-widest text-[#656565] mb-3">Was uns unterscheidet</div>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Gebaut auf Klarheit, nicht auf Provision
            </h2>
            <p className="text-[#656565] max-w-2xl mx-auto">
              Jedes Feature beantwortet dieselbe Frage: Macht es das Leben von Verkäufern oder Käufern messbar besser?
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                emoji: '💰',
                title: 'Festpreise, immer',
                desc: 'Kein Prozentsatz. Keine gestaffelten Provisionen. Sie zahlen einmal und behalten jeden Euro Ihres Verkaufspreises.',
              },
              {
                emoji: '📊',
                title: 'Wöchentliche Updates, automatisch',
                desc: 'Jeder Verkäufer erhält ein automatisches wöchentliches Update: Anfragen, Besichtigungen, Feedback, nächste Schritte.',
              },
              {
                emoji: '📅',
                title: 'Live-Besichtigungsbuchung',
                desc: 'Sie legen fest, wann Sie verfügbar sind. Käufer buchen bestätigte Slots — kein E-Mail-Pingpong.',
              },
              {
                emoji: '📋',
                title: 'Transparentes Angebotsmanagement',
                desc: 'Jedes Angebot wird mit Zeitstempel, Käuferstatus und Finanzierungsnachweis protokolliert.',
              },
              {
                emoji: '🔄',
                title: 'Echtzeit-Portal-Sync',
                desc: 'Statusänderungen werden automatisch auf IS24, Immowelt und ImmoNet aktualisiert — keine Geister-Inserate.',
              },
              {
                emoji: '🔒',
                title: 'Sicher & DSGVO-konform',
                desc: 'Alle Daten werden EU-DSGVO-konform verarbeitet. Regulierte Zahlungspartner. KYC/KYB-Verifizierung.',
              },
            ].map((value, i) => (
              <div key={i} className="bg-[#EDEEF2] rounded-2xl border border-[#E2E4EB] p-6 hover:-translate-y-1 transition-transform duration-200">
                <div className="text-3xl mb-4">{value.emoji}</div>
                <h3 className="font-bold text-[#0F1117] mb-2">{value.title}</h3>
                <p className="text-sm text-[#656565] leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CODE OF CLARITY ──────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-bold uppercase tracking-widest text-[#FFD400] mb-3">Unsere Standards</div>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Der Yalla-Klarheits-Kodex
            </h2>
            <p className="text-[#656565]">
              Jedes Inserat auf Yalla.House unterliegt diesen Verpflichtungen — messbar, automatisch, ohne Ausnahmen.
            </p>
          </div>

          <div className="space-y-5">
            {[
              {
                num: 1,
                title: 'Erste-Antwort-SLA',
                desc: 'Alle Anfragen werden innerhalb von 2 Geschäftsstunden bestätigt. Automatisch in der Plattform gemessen.',
              },
              {
                num: 2,
                title: 'Genauer Status',
                desc: 'Reserviert/Verkauft-Status wird innerhalb von 4 Stunden aktualisiert — auf allen Portalen synchronisiert.',
              },
              {
                num: 3,
                title: 'Besichtigungs-Klarheit',
                desc: 'Live-Besichtigungsslots oder drei konkrete Zeitvorschläge innerhalb von 24 Stunden.',
              },
              {
                num: 4,
                title: 'Angebots-Transparenz',
                desc: 'Jedes Angebot wird mit Finanzierungsnachweis und Bestätigungszeitstempel protokolliert.',
              },
              {
                num: 5,
                title: 'Wöchentliches Verkäufer-Update',
                desc: 'Automatisch alle 7 Tage gesendet: Anfragen, Besichtigungen, Feedback, nächste Schritte.',
              },
            ].map((item) => (
              <div key={item.num} className="flex gap-6 items-start bg-white rounded-2xl border border-[#E2E4EB] p-6">
                <div className="w-10 h-10 rounded-full bg-[#FFD400] flex items-center justify-center text-[#0F1117] font-extrabold flex-shrink-0">
                  {item.num}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#0F1117] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#656565] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM SECTION ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-xs font-bold uppercase tracking-widest text-[#656565] mb-3">Das Team</div>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Gebaut von Menschen, die selbst Immobilien verkauft haben
            </h2>
            <p className="text-[#656565] max-w-xl mx-auto">
              Wir kennen die Frustrationen aus erster Hand.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { initials: 'YH', role: 'Gründer', specialty: 'Immobilien & Strategie' },
              { initials: 'PT', role: 'Produktleitung', specialty: 'UX & Plattform-Design' },
              { initials: 'DV', role: 'Leitung Entwicklung', specialty: 'Plattform & Integrationen' },
              { initials: 'LM', role: 'Rechtsberatung', specialty: 'Notar & Compliance' },
            ].map((member, i) => (
              <div key={i} className="bg-[#EDEEF2] rounded-2xl border border-[#E2E4EB] p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#FFD400] flex items-center justify-center text-[#0F1117] font-extrabold text-xl mx-auto mb-4">
                  {member.initials}
                </div>
                <div className="font-bold text-[#0F1117] mb-1">{member.role}</div>
                <div className="text-sm text-[#656565]">{member.specialty}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────────────────────────── */}
      <div className="bg-[#0d0d0d] relative overflow-hidden py-16 px-4">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(255,212,0,0.13) 0%, transparent 70%)' }} />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-white mb-4">
            Bereit, die Kontrolle über Ihren Verkauf zu übernehmen?
          </h2>
          <p className="text-[rgba(255,255,255,0.62)] mb-8 leading-relaxed">
            Schließen Sie sich den Verkäufern an, die bereits Tausende gespart haben. Ihre Immobilie. Ihre Bedingungen. Ihr Preis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/owner/new" className="inline-flex items-center justify-center bg-[#FFD400] hover:bg-[#E6C200] text-[#0F1117] font-bold px-8 py-4 rounded-xl transition-colors text-base">
              Immobilie inserieren →
            </Link>
            <Link href="/services" className="inline-flex items-center justify-center bg-transparent hover:bg-white/10 text-white font-bold px-8 py-4 rounded-xl transition-colors text-base border border-white/30 hover:border-white/50">
              Services & Preise
            </Link>
          </div>
        </div>
      </div>

    </main>
  )
}
