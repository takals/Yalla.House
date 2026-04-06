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
// test
