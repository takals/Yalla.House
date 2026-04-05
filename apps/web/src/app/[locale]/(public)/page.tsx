import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="bg-[#EDEEF2]">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="pt-16 pb-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white border border-[#E2E4EB] rounded-full px-3.5 py-1.5 mb-6 text-sm font-semibold text-[#333]">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse inline-block"></span>
                Der klügere Weg zur Immobilie in Deutschland
              </div>
              <h1 className="text-[clamp(2.25rem,5.5vw,3.875rem)] font-extrabold tracking-tight text-[#0F1117] leading-[1.1] mb-5">
                Verkaufen oder vermieten —<br />
                mit oder <span className="text-[#FFD400]">ohne</span> Makler.
              </h1>
              <p className="text-lg text-[#656565] leading-relaxed mb-8 max-w-lg">
                Starte hier, bevor du irgendetwas anderes tust. Plane, starte und verwalte deine Immobilie — DIY, hybrid oder maklergeführt. Ein Dashboard. Volle Kontrolle.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#333]">
                <span><strong>400+</strong> Verkäufer in Deutschland</span>
                <span className="w-px h-4 bg-[#D8DBE5]"></span>
                <span>Auf <strong>IS24 &amp; Immowelt</strong> gelistet</span>
                <span className="w-px h-4 bg-[#D8DBE5]"></span>
                <span><strong>5★</strong> Verkäuferzufriedenheit</span>
              </div>
            </div>

            {/* Right — Role Panel */}
            <div className="bg-white rounded-2xl border border-[#E2E4EB] shadow-[0_6px_20px_rgba(0,0,0,.09),0_2px_6px_rgba(0,0,0,.05)] p-5">
              <div className="text-xs font-semibold uppercase tracking-widest text-[#999] mb-4">In Ihr Dashboard einloggen</div>
              <div className="flex flex-col gap-2">
                <Link href="/owner" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F4F5F8] transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF8D6] flex items-center justify-center text-xl flex-shrink-0">🏡</div>
                  <div>
                    <div className="font-semibold text-[#0F1117] text-sm group-hover:text-black">Eigentümer / Verkäufer</div>
                    <div className="text-xs text-[#999]">Inserate, Besichtigungen &amp; Angebote</div>
                  </div>
                </Link>
                <Link href="/hunter" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F4F5F8] transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-[#EDF4FF] flex items-center justify-center text-xl flex-shrink-0">🔍</div>
                  <div>
                    <div className="font-semibold text-[#0F1117] text-sm group-hover:text-black">Home Hunter</div>
                    <div className="text-xs text-[#999]">Objekte durchsuchen &amp; Besichtigungen buchen</div>
                  </div>
                </Link>
                <Link href="/agent" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F4F5F8] transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF7ED] flex items-center justify-center text-xl flex-shrink-0">📍</div>
                  <div>
                    <div className="font-semibold text-[#0F1117] text-sm group-hover:text-black">Makler</div>
                    <div className="text-xs text-[#999]">Jobs, Besichtigungen &amp; Berichte vor Ort</div>
                  </div>
                </Link>
                <Link href="/admin" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F4F5F8] transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center text-xl flex-shrink-0">⚙️</div>
                  <div>
                    <div className="font-semibold text-[#0F1117] text-sm group-hover:text-black">Admin</div>
                    <div className="text-xs text-[#999]">Plattformverwaltung &amp; Übersicht</div>
                  </div>
                </Link>
              </div>
              <div className="border-t border-[#F0F0F0] mt-4 pt-3">
                <Link href="/owner/new" className="block w-full text-center bg-[#FFD400] hover:bg-[#E6C200] text-[#0F1117] font-bold text-sm py-2.5 rounded-xl transition-colors">
                  Kostenlose Immobilien-Analyse starten →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PORTALS STRIP ───────────────────────────────────────────────────── */}
      <div className="bg-white border-y border-[#E2E4EB] py-4 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-3 md:gap-5">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#999]">Gelistet auf</span>
          <div className="w-px h-4 bg-[#D8DBE5]"></div>
          {['ImmobilienScout24', 'Immowelt', 'ImmoNet', 'Kleinanzeigen'].map(p => (
            <span key={p} className="bg-white border border-[#D8DBE5] rounded-full px-3 py-1 text-xs font-semibold text-[#333]">{p}</span>
          ))}
        </div>
      </div>

      {/* ── STATS STRIP ─────────────────────────────────────────────────────── */}
      <div className="py-10 px-4 bg-[#EDEEF2]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { val: '€0', label: 'Provision — du behältst 100% deines Verkaufspreises', accent: true },
            { val: '48h', label: 'Ø Zeit bis zur Veröffentlichung auf IS24 &amp; Immowelt', accent: false },
            { val: '69%', label: 'der Verkäufer wollen wöchentliche automatisierte Updates', accent: false },
            { val: '€8k+', label: 'Ø Ersparnis ggü. traditionellem Makler bei €400k-Verkauf', accent: false },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#E2E4EB] p-5">
              <div className={`text-3xl font-extrabold tracking-tight mb-1.5 ${s.accent ? 'text-[#FFD400]' : 'text-[#0F1117]'}`}>{s.val}</div>
              <div className="text-sm text-[#656565] leading-snug" dangerouslySetInnerHTML={{ __html: s.label }} />
            </div>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
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
              <div key={s.n} className="bg-white rounded-2xl border border-[#E2E4EB] p-6 hover:-translate-y-1 transition-transform duration-200">
                <div className="w-9 h-9 rounded-xl bg-[#FFD400] flex items-center justify-center text-[#0F1117] font-extrabold text-sm mb-4">{s.n}</div>
                <h3 className="font-bold text-[#0F1117] mb-2">{s.h}</h3>
                <p className="text-sm text-[#656565] leading-relaxed">{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THREE WAYS TO SELL ──────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-widest text-[#656565] mb-3">Drei Wege zu verkaufen</div>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-3">Du wählst. Wir passen uns an.</h2>
            <p className="text-[#656565] max-w-xl mx-auto">Yalla.House unterstützt jeden Verkäufer, egal welchen Weg er geht. Ändere deinen Ansatz jederzeit — deine Daten bleiben bei dir.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-[#EDEEF2] rounded-2xl border border-[#E2E4EB] border-t-4 border-t-[#FFD400] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-xl bg-[#FFF8D6] flex items-center justify-center text-xl">🧭</div>
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
            <div className="bg-[#EDEEF2] rounded-2xl border border-[#E2E4EB] border-t-4 border-t-[#6366F1] p-6">
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
            <div className="bg-[#EDEEF2] rounded-2xl border border-[#E2E4EB] border-t-4 border-t-[#0EA5E9] p-6">
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
          <div className="text-center mt-10">
            <Link href="/owner/new" className="inline-flex items-center bg-[#FFD400] hover:bg-[#E6C200] text-[#0F1117] font-bold px-8 py-4 rounded-xl transition-colors text-base">
              Kostenlose Immobilien-Analyse starten
            </Link>
          </div>
        </div>
      </section>

      {/* ── SERVICES ────────────────────────────────────────────────────────── */}
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
              { icon: '🪧', h: 'Verkaufsschild', p: 'Marken-Schild geliefert und aufgestellt. Noch immer der #1 lokale Lead-Generator.' },
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

      {/* ── CLARITY INDEX ───────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-10">
            <div className="text-xs font-bold uppercase tracking-widest text-[#656565] mb-3">Yalla Clarity Index</div>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-3">Was Verkäufer &amp; Käufer wirklich erleben</h2>
            <p className="text-[#656565] max-w-xl">Befragung von 400 deutschen Immobilienkäufern — die Schmerzpunkte, die Yalla.House beseitigt.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { val: '67%', p: 'der Käufer nennen langsame oder keine Antwort als ihre #1-Frustration' },
              { val: '58%', p: 'stießen auf "Ghost Status" — Häuser als verfügbar gelistet, die bereits reserviert waren' },
              { val: '55%', p: 'der Verkäufer fühlten sich "im Dunkeln" darüber, was Woche für Woche passiert' },
              { val: '30–60 min', p: 'pro Verkäufer pro Woche gespart durch automatisierte wöchentliche Updates' },
            ].map((s, i) => (
              <div key={i} className="bg-[#EDEEF2] rounded-2xl border border-[#E2E4EB] p-6">
                <div className="text-3xl font-extrabold tracking-tight text-[#FFD400] mb-2">{s.val}</div>
                <p className="text-sm text-[#656565] leading-relaxed">{s.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
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
              { q: 'Ich habe über €12.000 an Maklergebühren gespart. Die Portal-Inserate waren in 48 Stunden live und das Dashboard ist brillant.', name: 'Ravi P.', role: 'Verkäufer, 41 — Frankfurt', init: 'RP' },
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

      {/* ── CTA BAND ────────────────────────────────────────────────────────── */}
      <div className="bg-[#0d0d0d] relative overflow-hidden py-16 px-4">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(255,212,0,0.13) 0%, transparent 70%)' }} />
        <div className="relative max-w-2xl mx-auto text-center">
          <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-white mb-4">
            Starte mit Yalla.House, bevor du verkaufst oder vermietest.
          </h2>
          <p className="text-[rgba(255,255,255,0.62)] mb-8 leading-relaxed">
            Plane, starte und manage — mit oder ohne Makler. Schließ dich Hunderten deutschen Verkäufern an, die die Kontrolle über ihre Immobilie übernommen haben.
          </p>
          <Link href="/owner/new" className="inline-flex items-center bg-[#FFD400] hover:bg-[#E6C200] text-[#0F1117] font-bold px-8 py-4 rounded-xl transition-colors text-base">
            Kostenlose Immobilien-Analyse starten →
          </Link>
        </div>
      </div>

    </main>
  )
}
