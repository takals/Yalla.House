import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="bg-[#EDEEF2]">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[clamp(2.25rem,5.5vw,3.875rem)] font-extrabold tracking-tight text-[#0F1117] leading-[1.1] mb-6">
            Immobilienverkauf, der fair,{' '}
            <span className="text-[#FFD400]">klar</span> und Ihrer ist.
          </h1>
          <p className="text-lg text-[#656565] leading-relaxed max-w-2xl mx-auto">
            Yalla.House wurde auf einem einfachen Prinzip gebaut: Der Verkauf Ihres Hauses sollte nicht Tausende Euro an Provision kosten. Wir haben das alte Modell abgeschafft — und durch Transparenz, Technologie und wirklich hilfreiche Tools ersetzt.
          </p>
        </div>
      </section>

      {/* ── STATS STRIP ─────────────────────────────────────────────────────── */}
      <div className="py-10 px-4 bg-white border-y border-[#E2E4EB]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { val: '€0', label: 'Provision — du behältst 100% deines Verkaufspreises', accent: true },
            { val: '48h', label: 'Ø Zeit bis zur Veröffentlichung auf IS24 &amp; Immowelt', accent: false },
            { val: '69%', label: 'der Verkäufer wollen wöchentliche automatisierte Updates', accent: false },
            { val: '€8k+', label: 'Ø Ersparnis ggü. traditionellem Makler bei €400k-Verkauf', accent: false },
          ].map((s, i) => (
            <div key={i} className="bg-[#EDEEF2] rounded-2xl border border-[#E2E4EB] p-5">
              <div className={`text-3xl font-extrabold tracking-tight mb-1.5 ${s.accent ? 'text-[#FFD400]' : 'text-[#0F1117]'}`}>{s.val}</div>
              <div className="text-sm text-[#656565] leading-snug" dangerouslySetInnerHTML={{ __html: s.label }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── WHY SECTION ──────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#FFD400] mb-3">Warum wir das gebaut haben</div>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-6">
              Provisionen sind das Relikt einer Zeit, in der Verkäufer keine andere Wahl hatten
            </h2>
            <p className="text-[#656565] leading-relaxed mb-4">
              Traditionelle Immobilienmakler verlangen 3–6 % Provision — das sind bei einem Haus für €400.000 bis zu €24.000. Dafür bekommst du: unregelmäßige Updates, keine Echtzeitdaten und kaum Kontrolle über den Prozess.
            </p>
            <p className="text-[#656565] leading-relaxed">
              Wir glauben, dass Eigentümer bessere Werkzeuge verdienen. Yalla.House gibt dir ein vollständiges Dashboard, automatische Portal-Veröffentlichung und professionelle Services — zum Festpreis. Kein Prozentsatz. Keine Überraschungen.
            </p>
          </div>
          <div className="space-y-4">
            {[
              'Ich habe erst nach 3 Wochen erfahren, dass mein Inserat online war.',
              'Mein Makler hat mir nie gesagt, wie viele Besichtigungen stattfanden.',
              'Ich habe €18.000 Provision bezahlt und trotzdem alles selbst koordiniert.',
              'Es gab keine Daten — nur "Vertrauen Sie mir".',
            ].map((pain, i) => (
              <div key={i} className="bg-[#FEE2E2] border border-[#FECACA] rounded-2xl p-4">
                <p className="text-sm font-semibold text-[#991B1B]">{pain}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <div className="text-xs font-bold uppercase tracking-widest text-[#FFD400] mb-3">Wie es funktioniert</div>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-3">Deine komplette Verkäuferreise — an einem Ort</h2>
            <p className="text-[#656565] max-w-xl">Starte mit Yalla.House, bevor du sonst irgendetwas tust. Wir begleiten dich durch jeden Schritt — egal wie du verkaufen möchtest.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { n: 1, h: 'Immobilien-Analyse', p: 'Beantworte ein paar Fragen. Erhalte deinen Bereitschafts-Score — Fotos, Preisgestaltung, Rechtsdokumente, Energieausweis — und eine empfohlene Verkaufsroute.' },
              { n: 2, h: 'Route wählen', p: 'DIY, Hybrid oder Maklergeführt. Yalla.House passt sich deiner Wahl an. Wechsle jederzeit, ohne von vorne anzufangen.' },
              { n: 3, h: 'Auf Portalen live gehen', p: 'Dein Inserat geht in 48h auf IS24, Immowelt und mehr live. Status synchronisiert automatisch — keine Geister-Inserate.' },
              { n: 4, h: 'Kommandozentrale', p: 'Anfragen, Besichtigungen, Angebote, Nachrichten — alles in einem Dashboard. Kein WhatsApp-Chaos mehr.' },
              { n: 5, h: 'Performance überwachen', p: 'Wöchentliche Updates, Käufer-Funnel-Daten, Makler-Reaktionszeiten. Sieh genau, was passiert und wann du handeln solltest.' },
              { n: 6, h: 'Deal abschließen', p: 'Dokumente, Meilensteine, rechtliche Übergabe — alles, was du bis zum Notar und Abschluss brauchst.' },
            ].map(s => (
              <div key={s.n} className="bg-[#EDEEF2] rounded-2xl border border-[#E2E4EB] p-6 hover:-translate-y-1 transition-transform duration-200">
                <div className="w-9 h-9 rounded-xl bg-[#FFD400] flex items-center justify-center text-[#0F1117] font-extrabold text-sm mb-4">{s.n}</div>
                <h3 className="font-bold text-[#0F1117] mb-2">{s.h}</h3>
                <p className="text-sm text-[#656565] leading-relaxed">{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THREE WAYS TO SELL ──────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-widest text-[#656565] mb-3">Drei Wege zu verkaufen</div>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-3">Du wählst. Wir passen uns an.</h2>
            <p className="text-[#656565] max-w-xl mx-auto">Yalla.House unterstützt jeden Verkäufer, egal welchen Weg er geht. Ändere deinen Ansatz jederzeit — deine Daten bleiben bei dir.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-[#E2E4EB] border-t-4 border-t-[#FFD400] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#FFF8D6] flex items-center justify-center text-xl">🏠</div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#FFD400]">Modus 1</div>
                  <h3 className="font-bold text-[#0F1117]">DIY</h3>
                </div>
              </div>
              <p className="text-sm text-[#656565] mb-4 leading-relaxed">Volle Kontrolle. Keine Provision. Du führst Besichtigungen durch, verwaltest Anfragen und verhandelst Angebote — Yalla.House kümmert sich um die Verwaltung.</p>
              <ul className="space-y-1.5 text-sm">
                {['Pauschalgebühr ab €199', 'Du managst Besichtigungen', 'Maximale Gebührenersparnis'].map(f => (
                  <li key={f} className="flex gap-2"><span className="text-[#FFD400] font-bold">✓</span>{f}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-[#E2E4EB] border-t-4 border-t-[#6366F1] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#EEF2FF] flex items-center justify-center text-xl">🤝</div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#6366F1]">Modus 2</div>
                  <h3 className="font-bold text-[#0F1117]">Hybrid</h3>
                </div>
              </div>
              <p className="text-sm text-[#656565] mb-4 leading-relaxed">Yalla.House ist deine Kommandozentrale. Hole einen Fotografen, Makler oder Anwalt genau dann dazu, wenn du Unterstützung brauchst.</p>
              <ul className="space-y-1.5 text-sm">
                {['Dein Dashboard, deine Regeln', 'Services à la carte buchen', 'Idealer Mittelweg für die meisten'].map(f => (
                  <li key={f} className="flex gap-2"><span className="text-[#6366F1] font-bold">✓</span>{f}</li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-[#E2E4EB] border-t-4 border-t-[#0EA5E9] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#E0F2FE] flex items-center justify-center text-xl">👁</div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#0EA5E9]">Modus 3</div>
                  <h3 className="font-bold text-[#0F1117]">Maklergeführt, transparent</h3>
                </div>
              </div>
              <p className="text-sm text-[#656565] mb-4 leading-relaxed">Beauftrage einen Makler — aber sieh alles, was er tut. Besichtigungsprotokolle, Reaktionszeiten, Angebotspipeline. Du behältst die Kontrolle.</p>
              <ul className="space-y-1.5 text-sm">
                {['Keine Black Box mehr', 'Gebühren mit Daten verhandeln', 'Jederzeit Makler wechseln'].map(f => (
                  <li key={f} className="flex gap-2"><span className="text-[#0EA5E9] font-bold">✓</span>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES SECTION ──────────────────────────────────────────────────────────────────── */}
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
              { emoji: '💰', title: 'Festpreise, immer', desc: 'Kein Prozentsatz. Keine gestaffelten Provisionen. Sie zahlen einmal und behalten jeden Euro Ihres Verkaufspreises.' },
              { emoji: '📊', title: 'Wöchentliche Updates, automatisch', desc: 'Jeder Verkäufer erhält ein automatisches wöchentliches Update: Anfragen, Besichtigungen, Feedback, nächste Schritte.' },
              { emoji: '📅', title: 'Live-Besichtigungsbuchung', desc: 'Sie legen fest, wann Sie verfügbar sind. Käufer buchen bestätigte Slots — kein E-Mail-Pingpong.' },
              { emoji: '📋', title: 'Transparentes Angebotsmanagement', desc: 'Jedes Angebot wird mit Zeitstempel, Käuferstatus und Finanzierungsnachweis protokolliert.' },
              { emoji: '🔄', title: 'Echtzeit-Portal-Sync', desc: 'Statusänderungen werden automatisch auf IS24, Immowelt und ImmoNet aktualisiert — keine Geister-Inserate.' },
              { emoji: '🔒', title: 'Sicher & DSGVO-konform', desc: 'Alle Daten werden EU-DSGVO-konform verarbeitet. Regulierte Zahlungspartner. KYC/KYB-Verifizierung.' },
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

      {/* ── SERVICES ────────────────────────────────────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-widest text-[#FFD400] mb-3">Services</div>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-3">Alles, was du zum Verkaufen brauchst</h2>
            <p className="text-[#656565]">Wähle genau das, was du brauchst. Keine aufgezwungenen Pakete.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: '📷', h: 'Professionelle Fotografie', p: 'Beeindruckende Fotos von lokalen Profis. Hero-Image-Regeln für maximale Portal-CTR inklusive.' },
              { icon: '🏠', h: '360° Virtuelle Tour', p: 'Interaktiver 3D-Scan — Käufer erkunden dein Zuhause vor der Besichtigung. Weniger verschwendete Termine.' },
              { icon: '📐', h: 'Grundriss-Erstellung', p: 'Genaue, veröffentlichungsreife Grundrisse. Von IS24 für Premium-Platzierung gefordert.' },
              { icon: '📋', h: 'Rechtliche Unterstützung', p: 'Notar-Vermittlung, Dokumentenprüfung und Begleitung an jedem rechtlichen Meilenstein.' },
              { icon: '🧧', h: 'Verkaufsschild', p: 'Marken-Schild geliefert und aufgestellt. Noch immer der #1 lokale Lead-Generator.' },
              { icon: '📊', h: 'Wöchentliche Fortschrittsberichte', p: 'Automatisch generiertes Verkäufer-Update alle 7 Tage — Anfragen, Besichtigungen, Feedback, nächste Schritte.' },
            ].map(s => (
              <div key={s.h} className="bg-white rounded-2xl border border-[#E2E4EB] p-6 hover:-translate-y-1 transition-transform duration-200">
                <div className="w-11 h-11 rounded-xl bg-[#FFFBE0] flex items-center justify-center text-xl mb-4">{s.icon}</div>
                <h3 className="font-bold text-[#0F1117] mb-2">{s.h}</h3>
                <p className="text-sm text-[#656565] leading-relaxed">{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CODE OF CLARITY ──────────────────────────────────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
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
              { num: 1, title: 'Erste-Antwort-SLA', desc: 'Alle Anfragen werden innerhalb von 2 Geschäftsstunden bestätigt. Automatisch in der Plattform gemessen.' },
              { num: 2, title: 'Genauer Status', desc: 'Reserviert/Verkauft-Status wird innerhalb von 4 Stunden aktualisiert — auf allen Portalen synchronisiert.' },
              { num: 3, title: 'Besichtigungs-Klarheit', desc: 'Live-Besichtigungsslots oder drei konkrete Zeitvorschläge innerhalb von 24 Stunden.' },
              { num: 4, title: 'Angebots-Transparenz', desc: 'Jedes Angebot wird mit Finanzierungsnachweis und Bestätigungszeitstempel protokolliert.' },
              { num: 5, title: 'Wöchentliches Verkäufer-Update', desc: 'Automatisch alle 7 Tage gesendet: Anfragen, Besichtigungen, Feedback, nächste Schritte.' },
            ].map((item) => (
              <div key={item.num} className="flex gap-6 items-start bg-[#EDEEF2] rounded-2xl border border-[#E2E4EB] p-6">
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

      {/* ── TESTIMONIALS ───────────────────────────────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-widest text-[#FFD400] mb-3">Was andere sagen</div>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117]">Die Erfahrung spricht für sich</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { q: 'Wenn ich einfach einen Termin buchen könnte, der wirklich existiert, würde ich doppelt so viele Häuser besichtigen. Yalla hat das endlich möglich gemacht.', name: 'Jamie M.', role: 'Home Hunter, 32 — Berlin', init: 'JM' },
              { q: 'Schick mir jeden Sonntag einen Snapshot, damit ich nicht hinterher rennen muss. Genau das will ich. Yalla macht das automatisch — Game Changer.', name: 'Sarah H.', role: 'Verkäuferin, 48 — München', init: 'SH' },
              { q: 'Ich habe über €12.000 an Maklerggebühren gespart. Die Portal-Inserate waren in 48 Stunden live und das Dashboard ist brillant.', name: 'Ravi P.', role: 'Verkäufer, 41 — Frankfurt', init: 'RP' },
            ].map(t => (
              <div key={t.init} className="bg-white rounded-2xl border border-[#E2E4EB] p-6 hover:-translate-y-1 transition-transform duration-200 relative">
                <div className="text-[#F59E0B] text-base tracking-widest mb-3">★★★★★</div>
                <p className="text-sm text-[#333] leading-relaxed mb-5 italic">&ldquo;{t.q}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#FFFBE0] border border-[#FFD400] flex items-center justify-center text-xs font-bold text-[#7A5F00]">{t.init}</div>
                  <div>
                    <div className="font-semibold text-sm text-[#0F1117]">{t.name}</div>
                    <div className="text-xs text-[#999]">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM SECTION ───────────────────────────────────────────────────────────────────────────────────────────────────── */}
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

      {/* ── CTA BAND ──────────────────────────────────────────────────────────────────────────────────────────────────────────────────── */}
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
              Services &amp; Preise
            </Link>
          </div>
        </div>
      </div>

    </main>
  )
}
