import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="bg-white">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.8s ease-out both; }
        .fade-up-d1 { animation: fadeUp 0.8s ease-out 0.15s both; }
        .fade-up-d2 { animation: fadeUp 0.8s ease-out 0.3s both; }
        .fade-up-d3 { animation: fadeUp 0.8s ease-out 0.45s both; }
      `}</style>

      {/* HERO */}
      <section className="bg-white pt-40 pb-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="fade-up text-display text-[#1d1d1f]">
            Dein Haus.{' '}
            <span className="text-brand">Deine Regeln.</span>
          </h1>
          <p className="fade-up-d1 mt-6 text-lede text-[#86868b] font-normal max-w-2xl mx-auto">
            Yalla.House gibt Eigentümern die Werkzeuge, die Makler für sich behalten. Null Provision. Volle Kontrolle. Alles transparent.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-[#f5f5f7] py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div className="fade-up text-center">
              <div className="text-5xl md:text-6xl font-extrabold tabular-nums tracking-display text-[#1d1d1f]">€0</div>
              <p className="mt-2 text-sm text-[#86868b]">Provision</p>
            </div>
            <div className="fade-up-d1 text-center">
              <div className="text-5xl md:text-6xl font-extrabold tabular-nums tracking-display text-[#1d1d1f]">48h</div>
              <p className="mt-2 text-sm text-[#86868b]">Bis live auf IS24</p>
            </div>
            <div className="fade-up-d2 text-center">
              <div className="text-5xl md:text-6xl font-extrabold tabular-nums tracking-display text-[#1d1d1f]">100%</div>
              <p className="mt-2 text-sm text-[#86868b]">Dein Verkaufspreis</p>
            </div>
            <div className="fade-up-d3 text-center">
              <div className="text-5xl md:text-6xl font-extrabold tabular-nums tracking-display text-[#1d1d1f]">€8k+</div>
              <p className="mt-2 text-sm text-[#86868b]">Ø Ersparnis</p>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="bg-white py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#86868b] mb-6">Unsere Mission</p>
          <h2 className="text-title-1 text-[#1d1d1f] leading-tight">
            Provisionen sind das Relikt einer Zeit, in der Verkäufer keine andere Wahl hatten.
          </h2>
          <p className="mt-8 text-lede text-[#86868b]">
            Intransparente Gebühren, lange Vertragsbindungen und ein System, das den Makler belohnt — nicht den Eigentümer. Wir haben uns gefragt: Was würde ein Verkäufer selbst bauen? Das ist Yalla.House.
          </p>
        </div>
      </section>

      {/* THREE VALUES */}
      <section className="bg-[#f5f5f7] py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-10 transition-transform duration-300 hover:-translate-y-1">
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-3">Transparenz</h3>
              <p className="text-base text-[#86868b] leading-relaxed">
                Keine versteckten Gebühren. Keine Überraschungen. Du siehst jeden Euro, bevor du dich entscheidest.
              </p>
            </div>
            <div className="bg-white rounded-3xl p-10 transition-transform duration-300 hover:-translate-y-1">
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-3">Kontrolle</h3>
              <p className="text-base text-[#86868b] leading-relaxed">
                Du bestimmst Preis, Zeitplan und Bedingungen. Wir geben dir die Werkzeuge — du triffst die Entscheidungen.
              </p>
            </div>
            <div className="bg-white rounded-3xl p-10 transition-transform duration-300 hover:-translate-y-1">
              <h3 className="text-xl font-bold text-[#1d1d1f] mb-3">Technologie</h3>
              <p className="text-base text-[#86868b] leading-relaxed">
                Automatisierte Updates, sofortige Portal-Veröffentlichung und ein Dashboard, das für dich arbeitet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#86868b] mb-6 text-center">So funktioniert es</p>
          <h2 className="text-title-1 text-[#1d1d1f] leading-tight text-center mb-16">
            Drei Schritte. Null Kompromisse.
          </h2>

          <div className="space-y-16">
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-brand flex items-center justify-center text-[#1d1d1f] font-extrabold text-xl">1</div>
              <div>
                <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">Inserat erstellen</h3>
                <p className="text-base text-[#86868b] leading-relaxed">Fotos hochladen, Preis setzen, Beschreibung mit KI-Unterstützung verfassen. Dein Inserat ist in Minuten fertig.</p>
              </div>
            </div>
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-brand flex items-center justify-center text-[#1d1d1f] font-extrabold text-xl">2</div>
              <div>
                <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">Auf Portalen live</h3>
                <p className="text-base text-[#86868b] leading-relaxed">Innerhalb von 48 Stunden erscheint dein Inserat auf IS24 und Immowelt — automatisch, ohne Umwege.</p>
              </div>
            </div>
            <div className="flex gap-8 items-start">
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-brand flex items-center justify-center text-[#1d1d1f] font-extrabold text-xl">3</div>
              <div>
                <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">Verkauf abschließen</h3>
                <p className="text-base text-[#86868b] leading-relaxed">Anfragen verwalten, Besichtigungen planen, Angebote verhandeln — alles über dein Dashboard.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE ROUTES */}
      <section className="bg-[#f5f5f7] py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#86868b] mb-6 text-center">Drei Wege</p>
          <h2 className="text-title-1 text-[#1d1d1f] leading-tight text-center mb-16">
            Du wählst. Wir passen uns an.
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <div className="h-1.5 bg-brand" />
              <div className="p-10">
                <h3 className="text-xl font-bold text-[#1d1d1f] mb-3">Solo</h3>
                <p className="text-sm text-[#86868b] leading-relaxed mb-6">Du machst es selbst — wir geben dir die Werkzeuge.</p>
                <ul className="space-y-2.5 text-sm text-[#86868b]">
                  <li className="flex gap-2"><span className="text-[#34C759]">✓</span> Portal-Veröffentlichung</li>
                  <li className="flex gap-2"><span className="text-[#34C759]">✓</span> Anfrage-Dashboard</li>
                  <li className="flex gap-2"><span className="text-[#34C759]">✓</span> Marktberichte</li>
                  <li className="flex gap-2"><span className="text-[#34C759]">✓</span> Email-Support</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <div className="h-1.5 bg-[#5856D6]" />
              <div className="p-10">
                <h3 className="text-xl font-bold text-[#1d1d1f] mb-3">Hybrid</h3>
                <p className="text-sm text-[#86868b] leading-relaxed mb-6">Du behältst die Kontrolle — wir übernehmen das Schwierige.</p>
                <ul className="space-y-2.5 text-sm text-[#86868b]">
                  <li className="flex gap-2"><span className="text-[#34C759]">✓</span> Alles aus Solo, plus:</li>
                  <li className="flex gap-2"><span className="text-[#34C759]">✓</span> Professionelle Fotos</li>
                  <li className="flex gap-2"><span className="text-[#34C759]">✓</span> Vertragsprüfung</li>
                  <li className="flex gap-2"><span className="text-[#34C759]">✓</span> Telefon-Support</li>
                </ul>
              </div>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <div className="h-1.5 bg-[#34C759]" />
              <div className="p-10">
                <h3 className="text-xl font-bold text-[#1d1d1f] mb-3">Vollservice</h3>
                <p className="text-sm text-[#86868b] leading-relaxed mb-6">Du sagst uns, wann — wir machen den Rest.</p>
                <ul className="space-y-2.5 text-sm text-[#86868b]">
                  <li className="flex gap-2"><span className="text-[#34C759]">✓</span> Alles aus Hybrid, plus:</li>
                  <li className="flex gap-2"><span className="text-[#34C759]">✓</span> Dedicated Manager</li>
                  <li className="flex gap-2"><span className="text-[#34C759]">✓</span> Notartermine</li>
                  <li className="flex gap-2"><span className="text-[#34C759]">✓</span> End-to-End-Support</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-white py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#86868b] mb-6 text-center">Erfahrungen</p>
          <h2 className="text-title-1 text-[#1d1d1f] leading-tight text-center mb-16">
            Was unsere Verkäufer sagen.
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#f5f5f7] rounded-3xl p-10">
              <div className="flex gap-0.5 mb-4 text-[#FF9500]">★★★★★</div>
              <p className="text-base text-[#1d1d1f] leading-relaxed mb-6">
                Yalla.House hat mir Tausende gespart und mein Haus in 6 Wochen verkauft. Das Dashboard ist fantastisch.
              </p>
              <p className="text-sm font-semibold text-[#1d1d1f]">— M.K., Berlin</p>
            </div>
            <div className="bg-[#f5f5f7] rounded-3xl p-10">
              <div className="flex gap-0.5 mb-4 text-[#FF9500]">★★★★★</div>
              <p className="text-base text-[#1d1d1f] leading-relaxed mb-6">
                Transparent, effizient und respektvoll von Anfang an. Keine versteckten Gebühren, kein Drama. Nur ehrliche Hilfe.
              </p>
              <p className="text-sm font-semibold text-[#1d1d1f]">— S.L., München</p>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="bg-[#f5f5f7] py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#86868b] mb-6">Das Team</p>
          <h2 className="text-title-1 text-[#1d1d1f] leading-tight mb-16">
            Gebaut von Menschen, die genug von Maklern hatten.
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            <div>
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-lg text-[#1d1d1f]" style={{ background: 'linear-gradient(135deg, #D4764E, #BF6840)' }}>TA</div>
              <p className="font-semibold text-[#1d1d1f]">Tarek Al-Saleh</p>
              <p className="text-sm text-[#86868b]">Gründer & CEO</p>
            </div>
            <div>
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-lg text-[#1d1d1f]" style={{ background: 'linear-gradient(135deg, #D4764E, #BF6840)' }}>DV</div>
              <p className="font-semibold text-[#1d1d1f]">Daisy Voelker</p>
              <p className="text-sm text-[#86868b]">Entwicklung</p>
            </div>
            <div>
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-lg text-[#1d1d1f]" style={{ background: 'linear-gradient(135deg, #D4764E, #BF6840)' }}>LM</div>
              <p className="font-semibold text-[#1d1d1f]">Laura Müller</p>
              <p className="text-sm text-[#86868b]">Rechtsberatung</p>
            </div>
            <div>
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-lg text-[#1d1d1f]" style={{ background: 'linear-gradient(135deg, #D4764E, #BF6840)' }}>JR</div>
              <p className="font-semibold text-[#1d1d1f]">Jan Richter</p>
              <p className="text-sm text-[#86868b]">Operations</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative bg-[#1d1d1f] py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #D4764E 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-title-1 text-white leading-tight mb-6">
            Bereit, die Kontrolle zu übernehmen?
          </h2>
          <p className="text-lede text-white/50 mb-10 max-w-xl mx-auto">
            Kein Makler. Keine Provisionen. Nur du und deine Immobilie.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/list">
              <button className="px-8 py-4 bg-brand text-[#1d1d1f] font-semibold rounded-full hover:bg-brand-hover transition-all duration-300">
                Jetzt inserieren
              </button>
            </Link>
            <Link href="/services">
              <button className="px-8 py-4 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300">
                Preise ansehen
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
