import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="bg-white min-h-[calc(100vh-64px)]">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="pt-20 pb-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-[clamp(2.5rem,6vw,4.25rem)] font-extrabold tracking-tight text-[#0F1117] leading-[1.08] mb-5">
            Dein Immobilien-<br />
            <span className="text-[#FFD400]">Dashboard.</span>
          </h1>
          <p className="text-lg text-[#656565] leading-relaxed max-w-xl mx-auto">
            Plane, starte und manage deinen Immobilienverkauf — alles an einem Ort. Wähle deine Rolle und leg los.
          </p>
        </div>
      </section>

      {/* ── ROLE SELECTOR ────────────────────────────────────────────────────── */}
      <section className="pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <Link href="/owner" className="group relative bg-[#FAFAFA] hover:bg-white rounded-2xl border border-[#E2E4EB] hover:border-[#FFD400] p-6 transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,.08)]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF8D6] flex items-center justify-center text-2xl flex-shrink-0">🏡</div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-[#0F1117] text-base mb-1 group-hover:text-black">Eigentümer / Verkäufer</h2>
                  <p className="text-sm text-[#999] leading-snug">Inserate verwalten, Besichtigungen koordinieren, Angebote vergleichen</p>
                </div>
              </div>
              <div className="mt-4 text-xs font-semibold text-[#FFD400] opacity-0 group-hover:opacity-100 transition-opacity">
                Dashboard öffnen →
              </div>
            </Link>

            <Link href="/hunter" className="group relative bg-[#FAFAFA] hover:bg-white rounded-2xl border border-[#E2E4EB] hover:border-[#6366F1] p-6 transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,.08)]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#EDF4FF] flex items-center justify-center text-2xl flex-shrink-0">🔍</div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-[#0F1117] text-base mb-1 group-hover:text-black">Home Hunter</h2>
                  <p className="text-sm text-[#999] leading-snug">Objekte durchsuchen, Besichtigungen buchen, Angebote abgeben</p>
                </div>
              </div>
              <div className="mt-4 text-xs font-semibold text-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity">
                Dashboard öffnen →
              </div>
            </Link>

            <Link href="/agent" className="group relative bg-[#FAFAFA] hover:bg-white rounded-2xl border border-[#E2E4EB] hover:border-[#0EA5E9] p-6 transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,.08)]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] flex items-center justify-center text-2xl flex-shrink-0">📍</div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-[#0F1117] text-base mb-1 group-hover:text-black">Makler</h2>
                  <p className="text-sm text-[#999] leading-snug">Jobs annehmen, Besichtigungen durchführen, Berichte erstellen</p>
                </div>
              </div>
              <div className="mt-4 text-xs font-semibold text-[#0EA5E9] opacity-0 group-hover:opacity-100 transition-opacity">
                Dashboard öffnen →
              </div>
            </Link>

            <Link href="/admin" className="group relative bg-[#FAFAFA] hover:bg-white rounded-2xl border border-[#E2E4EB] hover:border-[#22c55e] p-6 transition-all duration-200 hover:shadow-[0_12px_40px_rgba(0,0,0,.08)]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] flex items-center justify-center text-2xl flex-shrink-0">⚙️</div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-[#0F1117] text-base mb-1 group-hover:text-black">Admin</h2>
                  <p className="text-sm text-[#999] leading-snug">Plattformverwaltung, Nutzer & Übersicht</p>
                </div>
              </div>
              <div className="mt-4 text-xs font-semibold text-[#22c55e] opacity-0 group-hover:opacity-100 transition-opacity">
                Dashboard öffnen →
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ── NEW LISTING CTA ──────────────────────────────────────────────────── */}
      <section className="pb-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="border-t border-[#E2E4EB] pt-10">
            <p className="text-sm text-[#656565] mb-5">Noch kein Inserat? Starte in unter 5 Minuten.</p>
            <Link href="/owner/new" className="inline-flex items-center bg-[#FFD400] hover:bg-[#E6C200] text-[#0F1117] font-bold px-8 py-3.5 rounded-xl transition-colors text-base">
              Kostenlose Immobilien-Analyse →
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST LINE ───────────────────────────────────────────────────────── */}
      <section className="border-t border-[#E2E4EB] bg-[#FAFAFA] py-6 px-4">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-center gap-6 text-sm text-[#999]">
          <span>Auf <strong className="text-[#333]">IS24</strong> &amp; <strong className="text-[#333]">Immowelt</strong> gelistet</span>
          <span className="w-px h-4 bg-[#D8DBE5] hidden sm:block"></span>
          <span>Keine Provision</span>
          <span className="w-px h-4 bg-[#D8DBE5] hidden sm:block"></span>
          <span>DSGVO-konform</span>
          <span className="w-px h-4 bg-[#D8DBE5] hidden sm:block"></span>
          <Link href="/about" className="text-[#FFD400] hover:text-[#E6C200] font-semibold transition-colors">
            Mehr erfahren →
          </Link>
        </div>
      </section>

    </main>
  )
}
