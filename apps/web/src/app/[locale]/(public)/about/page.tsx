import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="bg-[#FAFAFA]">
      {/* HERO SECTION */}
      <section className="bg-[#FAFAFA] py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-[clamp(3rem,7vw,5.5rem)] font-extrabold tracking-tighter text-[#0F1117] mb-6">
            Immobilienverkauf, der fair,{' '}
            <span className="text-[#FFD400]">klar</span> und Ihrer ist.
          </h1>
          <p className="text-lg md:text-xl text-[#656565] max-w-3xl mx-auto leading-relaxed">
            Yalla.House wurde auf einem einzigen Gedanken gebaut: Eigentümer verdienen bessere Werkzeuge und faire Bedingungen. Keine versteckten Gebühren. Keine Geheimnisse. Nur dein Haus, deine Bedingungen, dein Erfolg.
          </p>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-white py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            {/* Stat 1 */}
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-extrabold text-[#FFD400] mb-3">
                €0
              </div>
              <p className="text-sm text-[#656565] font-medium leading-relaxed">
                Provision — du behältst 100% deines Verkaufspreises
              </p>
            </div>

            {/* Stat 2 */}
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-extrabold text-[#0F1117] mb-3">
                48h
              </div>
              <p className="text-sm text-[#656565] font-medium leading-relaxed">
                Ø Zeit bis zur Veröffentlichung auf IS24 & Immowelt
              </p>
            </div>

            {/* Stat 3 */}
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-extrabold text-[#0F1117] mb-3">
                69%
              </div>
              <p className="text-sm text-[#656565] font-medium leading-relaxed">
                der Verkäufer wollen wöchentliche automatisierte Updates
              </p>
            </div>

            {/* Stat 4 */}
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-extrabold text-[#0F1117] mb-3">
                €8k+
              </div>
              <p className="text-sm text-[#656565] font-medium leading-relaxed">
                Ø Ersparnis ggü. traditionellem Makler bei €400k-Verkauf
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY SECTION */}
      <section className="bg-[#FAFAFA] py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-[#FFFBE0] text-[#7A5F00] mb-6">
              Warum wir das gebaut haben
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-start">
            {/* Left Text */}
            <div>
              <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-6 leading-tight">
                Provisionen sind das Relikt einer Zeit, in der Verkäufer keine andere Wahl hatten.
              </h2>
              <p className="text-base md:text-lg text-[#656565] leading-relaxed">
                Die Branche hat sich gegen Verkäufer verschworen — intransparente Gebühren, lange Vertragsbindungen und ein System, das den Makler belohnt, nicht den Eigentümer. Wir haben uns gefragt: Was würde ein Verkäufer selbst bauen wollen? Das ist Yalla.House.
              </p>
            </div>

            {/* Right Cards */}
            <div className="space-y-4">
              {/* Card 1 */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-bold text-[#0F1117] mb-3">Transparenz</h3>
                <p className="text-sm md:text-base text-[#656565] leading-relaxed">
                  Keine versteckten Gebühren. Keine Überraschungen. Alles offen einsehbar.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-bold text-[#0F1117] mb-3">Kontrolle</h3>
                <p className="text-sm md:text-base text-[#656565] leading-relaxed">
                  Sie bestimmen den Preis, die Zeitplanung und die Bedingungen — wir geben Ihnen die Werkzeuge dafür.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-bold text-[#0F1117] mb-3">Technologie</h3>
                <p className="text-sm md:text-base text-[#656565] leading-relaxed">
                  Automatisierte Updates, sofortige Portal-Veröffentlichung und ein Dashboard, das für Sie arbeitet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-[#FFFBE0] text-[#7A5F00] mb-6">
              Wie es funktioniert
            </span>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Deine komplette Verkäuferreise — an einem Ort
            </h2>
            <p className="text-base md:text-lg text-[#656565] max-w-2xl mx-auto">
              Starte mit Yalla.House, bevor du sonst irgendetwas tust...
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Step 1 */}
            <div className="bg-[#FAFAFA] rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FFD400] text-[#0F1117] font-extrabold text-xl flex items-center justify-center">
                  1
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#0F1117] mb-2">Immobilien-Analyse</h3>
              <p className="text-sm text-[#656565]">
                Dein Haus wird analysiert, um dir einen Readiness-Score und erste Empfehlungen zu geben.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#FAFAFA] rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FFD400] text-[#0F1117] font-extrabold text-xl flex items-center justify-center">
                  2
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#0F1117] mb-2">Route wählen</h3>
              <p className="text-sm text-[#656565]">
                Entscheide dich für Solo, Hybrid oder Vollservice – je nachdem, wie viel Unterstützung du brauchst.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#FAFAFA] rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FFD400] text-[#0F1117] font-extrabold text-xl flex items-center justify-center">
                  3
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#0F1117] mb-2">Angebot erstellen</h3>
              <p className="text-sm text-[#656565]">
                Fotos hochladen, Preis setzen und mit unserem KI-gestützten Assistent eine ansprechende Beschreibung verfassen.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#FAFAFA] rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FFD400] text-[#0F1117] font-extrabold text-xl flex items-center justify-center">
                  4
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#0F1117] mb-2">Auf Portalen live</h3>
              <p className="text-sm text-[#656565]">
                Dein Inserat wird innerhalb von 48 Stunden auf IS24 und Immowelt veröffentlicht — automatisch.
              </p>
            </div>

            {/* Step 5 */}
            <div className="bg-[#FAFAFA] rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FFD400] text-[#0F1117] font-extrabold text-xl flex items-center justify-center">
                  5
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#0F1117] mb-2">Anfragen verwalten</h3>
              <p className="text-sm text-[#656565]">
                Alle Anfragen, Besichtigungen und Angebote laufen zentral über dein Dashboard — keine E-Mail-Verwirrtheit.
              </p>
            </div>

            {/* Step 6 */}
            <div className="bg-[#FAFAFA] rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-[#FFD400] text-[#0F1117] font-extrabold text-xl flex items-center justify-center">
                  6
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#0F1117] mb-2">Abschluss</h3>
              <p className="text-sm text-[#656565]">
                Vertrag, Notar, Übergabe – wir haben Experten in unserem Netzwerk, um alles zu unterstützen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* THREE WAYS TO SELL */}
      <section className="bg-[#FAFAFA] py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-[#FFFBE0] text-[#7A5F00] mb-6">
              Drei Wege zu verkaufen
            </span>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Du wählst. Wir passen uns an.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Solo Mode */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="h-2 bg-[#FFD400]"></div>
              <div className="p-8">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-lg font-bold text-[#0F1117] mb-4">Solo</h3>
                <p className="text-sm text-[#656565] mb-6">
                  Du machst es selbst — wir geben dir die Werkzeuge und den Support.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-[#656565]">
                    <span className="text-[#10B981] font-bold mt-0.5">✓</span>
                    <span>Automatisierte Portal-Veröffentlichung</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[#656565]">
                    <span className="text-[#10B981] font-bold mt-0.5">✓</span>
                    <span>Anfrage-Management Dashboard</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[#656565]">
                    <span className="text-[#10B981] font-bold mt-0.5">✓</span>
                    <span>Wöchentliche Marktberichte</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[#656565]">
                    <span className="text-[#10B981] font-bold mt-0.5">✓</span>
                    <span>Email & Chat Support</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Hybrid Mode */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="h-2 bg-[#6366F1]"></div>
              <div className="p-8">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-lg font-bold text-[#0F1117] mb-4">Hybrid</h3>
                <p className="text-sm text-[#656565] mb-6">
                  Du behältst die Kontrolle — wir handle die schwierigen Parts.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-[#656565]">
                    <span className="text-[#10B981] font-bold mt-0.5">✓</span>
                    <span>Alles aus Solo, plus:</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[#656565]">
                    <span className="text-[#10B981] font-bold mt-0.5">✓</span>
                    <span>Professionelle Fotos & Video</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[#656565]">
                    <span className="text-[#10B981] font-bold mt-0.5">✓</span>
                    <span>Vertragsentwürfe & Rechtsprüfung</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[#656565]">
                    <span className="text-[#10B981] font-bold mt-0.5">✓</span>
                    <span>Telefonischer Kundenservice</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Vollservice Mode */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="h-2 bg-[#10B981]"></div>
              <div className="p-8">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-lg font-bold text-[#0F1117] mb-4">Vollservice</h3>
                <p className="text-sm text-[#656565] mb-6">
                  Sagen Sie uns, wann fertig ist — wir machen den ganzen Job.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-[#656565]">
                    <span className="text-[#10B981] font-bold mt-0.5">✓</span>
                    <span>Alles aus Hybrid, plus:</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[#656565]">
                    <span className="text-[#10B981] font-bold mt-0.5">✓</span>
                    <span>Dedicated Account Manager</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[#656565]">
                    <span className="text-[#10B981] font-bold mt-0.5">✓</span>
                    <span>Notariatstermine arrangieren</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-[#656565]">
                    <span className="text-[#10B981] font-bold mt-0.5">✓</span>
                    <span>End-to-End-Unterstützung</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES / WHAT SETS US APART */}
      <section className="bg-white py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-[#FFFBE0] text-[#7A5F00] mb-6">
              Was uns unterscheidet
            </span>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Gebaut auf Klarheit, nicht auf Provisionen
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Value 1 */}
            <div className="bg-[#FAFAFA] rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-4xl mb-4">🏷️</div>
              <h3 className="text-lg font-bold text-[#0F1117] mb-3">Keine Provision</h3>
              <p className="text-sm text-[#656565] leading-relaxed">
                0% Provision — du zahlst nur eine transparente Festgebühr, abhängig von der Route, die du wählst. Alles hängt von dir ab, nicht vom Makler.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-[#FAFAFA] rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-4xl mb-4">📡</div>
              <h3 className="text-lg font-bold text-[#0F1117] mb-3">Echte Portal-Reichweite</h3>
              <p className="text-sm text-[#656565] leading-relaxed">
                Dein Inserat erscheint auf IS24 und Immowelt — nicht auf irgendwelchen "Portalen", sondern da, wo Käufer wirklich suchen.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-[#FAFAFA] rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-4xl mb-4">🌊</div>
              <h3 className="text-lg font-bold text-[#0F1117] mb-3">Automatisierte Updates</h3>
              <p className="text-sm text-[#656565] leading-relaxed">
                Wöchentliche Berichte, Aktivitäten-Tracking und Marktdaten direkt in dein Dashboard — ohne dich zu nerven, ohne zu viel.
              </p>
            </div>

            {/* Value 4 */}
            <div className="bg-[#FAFAFA] rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-bold text-[#0F1117] mb-3">Keine Vertragsbindung</h3>
              <p className="text-sm text-[#656565] leading-relaxed">
                Kein Exklusivvertrag mit uns. Du kannst jederzeit deine Angebote selbst veröffentlichen oder wechseln — völlige Freiheit.
              </p>
            </div>

            {/* Value 5 */}
            <div className="bg-[#FAFAFA] rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-4xl mb-4">🧑‍💼</div>
              <h3 className="text-lg font-bold text-[#0F1117] mb-3">Experten auf Abruf</h3>
              <p className="text-sm text-[#656565] leading-relaxed">
                Fotografen, Makler, Anwälte — unser Netzwerk ist für dich da, wenn du sie brauchst. Kein verpflichtender Vertrag, nur gute Handwerk.
              </p>
            </div>

            {/* Value 6 */}
            <div className="bg-[#FAFAFA] rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-lg font-bold text-[#0F1117] mb-3">Dashboard-first</h3>
              <p className="text-sm text-[#656565] leading-relaxed">
                Alles an einem Ort — keine Dutzend verschiedener Systeme, keine Verwirrtheit. Ein Dashboard, das für dich arbeitet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-[#FAFAFA] py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-[#FFFBE0] text-[#7A5F00] mb-6">
              Services
            </span>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Alles, was du zum Verkaufen brauchst
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {/* Service 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 text-center">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-lg font-bold text-[#0F1117]">Inserats-Erstellung</h3>
            </div>

            {/* Service 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 text-center">
              <div className="text-5xl mb-4">📸</div>
              <h3 className="text-lg font-bold text-[#0F1117]">Professionelle Fotos</h3>
            </div>

            {/* Service 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 text-center">
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-lg font-bold text-[#0F1117]">Dokumente & Compliance</h3>
            </div>

            {/* Service 4 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-lg font-bold text-[#0F1117]">Marktpreis-Analyse</h3>
            </div>

            {/* Service 5 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 text-center">
              <div className="text-5xl mb-4">👁️</div>
              <h3 className="text-lg font-bold text-[#0F1117]">Besichtigungsmanagement</h3>
            </div>

            {/* Service 6 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-lg font-bold text-[#0F1117]">Angebotsmanagement</h3>
            </div>
          </div>
        </div>
      </section>

      {/* CODE OF CLARITY */}
      <section className="bg-white py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-[#FFFBE0] text-[#7A5F00] mb-6">
              Unsere Standards
            </span>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Der Yalla-Klarheits-Kodex
            </h2>
          </div>

          <div className="space-y-8">
            {/* Standard 1 */}
            <div className="flex gap-6 pb-8 border-b border-[#E2E4EB]">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#FFD400] text-[#0F1117] font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F1117] mb-2">Dein Preis, deine Entscheidung</h3>
                <p className="text-base text-[#656565]">
                  Wir beraten, aber du entscheidest. Kein Makler darf dir sagen, dass dein Preis zu hoch ist — das ist deine Wahl.
                </p>
              </div>
            </div>

            {/* Standard 2 */}
            <div className="flex gap-6 pb-8 border-b border-[#E2E4EB]">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#FFD400] text-[#0F1117] font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F1117] mb-2">Gebühren offen & im Voraus</h3>
                <p className="text-base text-[#656565]">
                  Keine Überraschungen. Du weißt genau, was Yalla.House kostet, bevor du dich anmeldest — nicht danach.
                </p>
              </div>
            </div>

            {/* Standard 3 */}
            <div className="flex gap-6 pb-8 border-b border-[#E2E4EB]">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#FFD400] text-[#0F1117] font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F1117] mb-2">Verkäufer-Vorrang</h3>
                <p className="text-base text-[#656565]">
                  Unsere Plattform arbeitet für dich, nicht gegen dich. Jede Funktion, jede Gebühr, jede Entscheidung ist vom Verkäufer weg gedacht.
                </p>
              </div>
            </div>

            {/* Standard 4 */}
            <div className="flex gap-6 pb-8 border-b border-[#E2E4EB]">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#FFD400] text-[#0F1117] font-bold">
                  4
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F1117] mb-2">Keine Lock-in-Verträge</h3>
                <p className="text-base text-[#656565]">
                  Jederzeit kündbar. Wenn Yalla.House nicht für dich funktioniert, gehen wir auseinander — keine Strafen, kein Drama.
                </p>
              </div>
            </div>

            {/* Standard 5 */}
            <div className="flex gap-6 pb-8 border-b border-[#E2E4EB]">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#FFD400] text-[#0F1117] font-bold">
                  5
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F1117] mb-2">Echte Daten, keine leeren Versprechen</h3>
                <p className="text-base text-[#656565]">
                  Jede Zahl, die wir zitieren — Durchschnittspreis, durchschnittliche Verkaufszeit, Provisionsersparnis — ist belegbar und von uns transparent gemacht.
                </p>
              </div>
            </div>

            {/* Standard 6 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-[#FFD400] text-[#0F1117] font-bold">
                  6
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0F1117] mb-2">Menschliche Hilfe, wenn du sie brauchst</h3>
                <p className="text-base text-[#656565]">
                  Technologie zuerst, aber immer ein Mensch da, wenn du ihn brauchst. Keine Warteschlangen, keine KI-Runaround.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[#FAFAFA] py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-[#FFFBE0] text-[#7A5F00] mb-6">
              Was andere sagen
            </span>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Die Erfahrung spricht für sich
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex gap-1 mb-4">
                <span className="text-[#F59E0B]">★</span>
                <span className="text-[#F59E0B]">★</span>
                <span className="text-[#F59E0B]">★</span>
                <span className="text-[#F59E0B]">★</span>
                <span className="text-[#F59E0B]">★</span>
              </div>
              <p className="text-base text-[#0F1117] leading-relaxed mb-6">
                "Yalla.House hat mir Tausende von Euro gespart und mein Haus in weniger als 6 Wochen verkauft. Das Dashboard ist fantastisch, und das Team wusste immer, was zu tun war. Ich hätte mein Geld nicht besser investieren können."
              </p>
              <p className="text-sm font-semibold text-[#0F1117]">— M.K., Berlin</p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="flex gap-1 mb-4">
                <span className="text-[#F59E0B]">★</span>
                <span className="text-[#F59E0B]">★</span>
                <span className="text-[#F59E0B]">★</span>
                <span className="text-[#F59E0B]">★</span>
                <span className="text-[#F59E0B]">★</span>
              </div>
              <p className="text-base text-[#0F1117] leading-relaxed mb-6">
                "Ich war skeptisch, ein Immobilien-Startup mit meinem Haus zu vertrauen. Aber Yalla.House war transparent, effizient und respektvoll von Anfang an. Keine versteckten Gebühren, kein Quetschspiel. Nur ehrliche Hilfe."
              </p>
              <p className="text-sm font-semibold text-[#0F1117]">— S.L., München</p>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="bg-white py-24 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-[#FFFBE0] text-[#7A5F00] mb-6">
              Das Team
            </span>
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-[#0F1117] mb-4">
              Gebaut von Menschen, die selbst genug von Maklern hatten.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Team Member 1 */}
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-[#FFD400] flex items-center justify-center mx-auto mb-4 font-extrabold text-2xl text-[#0F1117]">
                TA
              </div>
              <h3 className="text-lg font-bold text-[#0F1117] mb-2">Tarek Al-Saleh</h3>
              <p className="text-sm text-[#656565]">Gründer & CEO</p>
              <p className="text-xs text-[#999999] mt-2">Strategie & Vision</p>
            </div>

            {/* Team Member 2 */}
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-[#FFD400] flex items-center justify-center mx-auto mb-4 font-extrabold text-2xl text-[#0F1117]">
                DV
              </div>
              <h3 className="text-lg font-bold text-[#0F1117] mb-2">Daisy Voelker</h3>
              <p className="text-sm text-[#656565]">Leitung Entwicklung</p>
              <p className="text-xs text-[#999999] mt-2">Plattform & Integrationen</p>
            </div>

            {/* Team Member 3 */}
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-[#FFD400] flex items-center justify-center mx-auto mb-4 font-extrabold text-2xl text-[#0F1117]">
                LM
              </div>
              <h3 className="text-lg font-bold text-[#0F1117] mb-2">Laura Müller</h3>
              <p className="text-sm text-[#656565]">Rechtsberatung</p>
              <p className="text-xs text-[#999999] mt-2">Notar & Compliance</p>
            </div>

            {/* Team Member 4 */}
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-[#FFD400] flex items-center justify-center mx-auto mb-4 font-extrabold text-2xl text-[#0F1117]">
                JR
              </div>
              <h3 className="text-lg font-bold text-[#0F1117] mb-2">Jan Richter</h3>
              <p className="text-sm text-[#656565]">Operations</p>
              <p className="text-xs text-[#999999] mt-2">Kundenerfolg & Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="relative bg-[#0F1117] py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Radial gradient glow pseudo-element */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10"
               style={{
                 background: 'radial-gradient(circle, #FFD400 0%, transparent 70%)'
               }}>
          </div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-white mb-6">
            Bereit, die Kontrolle über Ihren Verkauf zu übernehmen?
          </h2>
          <p className="text-lg text-white/60 mb-12 max-w-2xl mx-auto">
            Starten Sie noch heute mit Yalla.House. Kein Makler. Keine Provisionen. Nur Sie und Ihre Immobilie.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/list">
              <button className="px-8 py-4 bg-[#FFD400] text-[#0F1117] font-bold rounded-full hover:bg-[#E6C200] transition-all duration-300 will-change-transform hover:shadow-lg">
                Immobilie inserieren →
              </button>
            </Link>
            <Link href="/services">
              <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-full hover:bg-white/10 transition-all duration-300 will-change-transform">
                Services & Preise
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
