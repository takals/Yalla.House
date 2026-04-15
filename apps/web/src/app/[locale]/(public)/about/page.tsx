import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { Check, Star, ArrowRight, Zap, Eye, Users, Shield, Home } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isEnglish = locale === 'en'

  return {
    title: isEnglish ? 'About Us | Yalla.House' : 'Über uns | Yalla.House',
    description: isEnglish
      ? 'Yalla.House connects property owners, home hunters, and local agents on one transparent platform. Better outcomes for everyone.'
      : 'Yalla.House verbindet Eigentümer, Suchende und lokale Makler auf einer transparenten Plattform. Bessere Ergebnisse für alle.',
    openGraph: {
      type: 'website',
      title: isEnglish ? 'About Us | Yalla.House' : 'Über uns | Yalla.House',
      description: isEnglish
        ? 'Yalla.House connects property owners, home hunters, and local agents on one transparent platform.'
        : 'Yalla.House verbindet Eigentümer, Suchende und lokale Makler auf einer transparenten Plattform.',
      url: isEnglish ? 'https://yalla.house/en/about' : 'https://yalla.house/about',
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Yalla.House' }],
    },
  }
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('about')
  const isEN = locale === 'en'

  return (
    <main className="bg-page-dark min-h-screen">
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

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="pt-40 pb-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="fade-up text-display text-white">
            {isEN ? (
              <>Better property decisions.{' '}<span className="text-brand">For everyone.</span></>
            ) : (
              <>Bessere Immobilien-Entscheidungen.{' '}<span className="text-brand">Für alle.</span></>
            )}
          </h1>
          <p className="fade-up-d1 mt-6 text-lede text-text-on-dark-secondary font-normal max-w-2xl mx-auto">
            {isEN
              ? 'Yalla.House is a platform that connects owners, home hunters, and local agents — giving everyone the tools and transparency to get better outcomes.'
              : 'Yalla.House ist eine Plattform, die Eigentümer, Suchende und lokale Makler verbindet — mit Werkzeugen und Transparenz für bessere Ergebnisse.'}
          </p>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────── */}
      <section className="pb-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
              <div className="fade-up text-center">
                <div className="text-4xl md:text-5xl font-extrabold tabular-nums text-brand">17,000+</div>
                <p className="mt-2 text-sm text-text-on-dark-secondary">
                  {isEN ? 'Verified agents' : 'Verifizierte Makler'}
                </p>
              </div>
              <div className="fade-up-d1 text-center">
                <div className="text-4xl md:text-5xl font-extrabold tabular-nums text-white">100+</div>
                <p className="mt-2 text-sm text-text-on-dark-secondary">
                  {isEN ? 'UK areas covered' : 'Gebiete abgedeckt'}
                </p>
              </div>
              <div className="fade-up-d2 text-center">
                <div className="text-4xl md:text-5xl font-extrabold tabular-nums text-white">3</div>
                <p className="mt-2 text-sm text-text-on-dark-secondary">
                  {isEN ? 'Dashboards' : 'Dashboards'}
                </p>
              </div>
              <div className="fade-up-d3 text-center">
                <div className="text-4xl md:text-5xl font-extrabold tabular-nums text-brand">£0</div>
                <p className="mt-2 text-sm text-text-on-dark-secondary">
                  {isEN ? 'To get started' : 'Zum Starten'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MISSION ────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand mb-6">
            {isEN ? 'Our Mission' : 'Unsere Mission'}
          </p>
          <h2 className="text-title-1 text-white leading-tight">
            {isEN
              ? 'Property works best when everyone has the right information at the right time.'
              : 'Immobilien funktionieren am besten, wenn alle die richtigen Informationen zur richtigen Zeit haben.'}
          </h2>
          <p className="mt-8 text-lede text-text-on-dark-secondary">
            {isEN
              ? 'Owners deserve visibility into how their sale is progressing. Home hunters need relevant matches, not hundreds of irrelevant listings. And good agents deserve a platform that rewards quality service with direct connections to serious clients.'
              : 'Eigentümer verdienen Transparenz über den Fortschritt ihres Verkaufs. Suchende brauchen relevante Treffer, nicht Hunderte irrelevanter Anzeigen. Und gute Makler verdienen eine Plattform, die Qualität mit direkten Verbindungen zu ernsthaften Klienten belohnt.'}
          </p>
        </div>
      </section>

      {/* ── THREE ROLES ────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand mb-6 text-center">
            {isEN ? 'One platform, three perspectives' : 'Eine Plattform, drei Perspektiven'}
          </p>
          <h2 className="text-title-1 text-white leading-tight text-center mb-16">
            {isEN ? 'Built for how property actually works.' : 'Gebaut für echte Immobilienprozesse.'}
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Owners */}
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <div className="h-1.5 bg-brand" />
              <div className="p-8">
                <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mb-5">
                  <Home size={24} className="text-brand" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {isEN ? 'For Owners' : 'Für Eigentümer'}
                </h3>
                <p className="text-sm text-text-on-dark-secondary leading-relaxed mb-5">
                  {isEN
                    ? 'List your property, receive agent proposals, manage viewings, and track everything from one dashboard. You choose how much help you want.'
                    : 'Inserieren, Makler-Vorschläge erhalten, Besichtigungen verwalten und alles über ein Dashboard verfolgen. Sie entscheiden, wie viel Hilfe Sie möchten.'}
                </p>
                <Link href="/owner" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:gap-2.5 transition-all">
                  {isEN ? 'Owner Dashboard' : 'Eigentümer-Dashboard'} <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Hunters */}
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <div className="h-1.5 bg-[#5856D6]" />
              <div className="p-8">
                <div className="w-12 h-12 rounded-xl bg-[#5856D6]/10 flex items-center justify-center mb-5">
                  <Users size={24} className="text-[#5856D6]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {isEN ? 'For Home Hunters' : 'Für Suchende'}
                </h3>
                <p className="text-sm text-text-on-dark-secondary leading-relaxed mb-5">
                  {isEN
                    ? 'Create your Home Passport — tell us what you\'re looking for and we\'ll match you with local agents who specialise in exactly that.'
                    : 'Erstellen Sie Ihren Home Passport — sagen Sie uns, was Sie suchen, und wir verbinden Sie mit lokalen Maklern, die genau darauf spezialisiert sind.'}
                </p>
                <Link href="/hunter" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5856D6] hover:gap-2.5 transition-all">
                  {isEN ? 'Hunter Dashboard' : 'Suchenden-Dashboard'} <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Agents */}
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] overflow-hidden transition-transform duration-300 hover:-translate-y-1">
              <div className="h-1.5 bg-[#34C759]" />
              <div className="p-8">
                <div className="w-12 h-12 rounded-xl bg-[#34C759]/10 flex items-center justify-center mb-5">
                  <Shield size={24} className="text-[#34C759]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {isEN ? 'For Agents' : 'Für Makler'}
                </h3>
                <p className="text-sm text-text-on-dark-secondary leading-relaxed mb-5">
                  {isEN
                    ? 'Get matched with serious buyers and sellers in your area. No cold calling — clients come to you through search briefs. Compete on quality, win on service.'
                    : 'Werden Sie mit ernsthaften Käufern und Verkäufern in Ihrer Region verbunden. Kein Kaltakquise — Klienten kommen über Suchanfragen zu Ihnen.'}
                </p>
                <Link href="/agent" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#34C759] hover:gap-2.5 transition-all">
                  {isEN ? 'Agent Dashboard' : 'Makler-Dashboard'} <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ─────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand mb-6 text-center">
            {isEN ? 'What we believe' : 'Woran wir glauben'}
          </p>
          <h2 className="text-title-1 text-white leading-tight text-center mb-16">
            {isEN ? 'Principles, not promises.' : 'Prinzipien, nicht Versprechen.'}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-8">
              <Eye size={28} className="text-brand mb-4" />
              <h3 className="text-lg font-bold text-white mb-3">
                {isEN ? 'Transparency' : 'Transparenz'}
              </h3>
              <p className="text-sm text-text-on-dark-secondary leading-relaxed">
                {isEN
                  ? 'Everyone sees what they need to see. Owners track their sale. Hunters get honest matches. Agents get real briefs.'
                  : 'Jeder sieht, was er sehen muss. Eigentümer verfolgen ihren Verkauf. Suchende bekommen ehrliche Matches. Makler bekommen echte Anfragen.'}
              </p>
            </div>
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-8">
              <Zap size={28} className="text-brand mb-4" />
              <h3 className="text-lg font-bold text-white mb-3">
                {isEN ? 'Technology, not friction' : 'Technologie, nicht Reibung'}
              </h3>
              <p className="text-sm text-text-on-dark-secondary leading-relaxed">
                {isEN
                  ? 'Real tools: market data, comparable sales, agent match scores, automated updates. We build the infrastructure so people can focus on decisions.'
                  : 'Echte Werkzeuge: Marktdaten, Vergleichsverkäufe, Agent-Match-Scores, automatisierte Updates. Wir bauen die Infrastruktur, damit sich Menschen auf Entscheidungen konzentrieren können.'}
              </p>
            </div>
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-8">
              <Users size={28} className="text-brand mb-4" />
              <h3 className="text-lg font-bold text-white mb-3">
                {isEN ? 'Better together' : 'Gemeinsam besser'}
              </h3>
              <p className="text-sm text-text-on-dark-secondary leading-relaxed">
                {isEN
                  ? 'Agents aren\'t the problem — lack of transparency is. Great agents thrive on our platform because quality service speaks for itself.'
                  : 'Makler sind nicht das Problem — mangelnde Transparenz ist es. Gute Makler florieren auf unserer Plattform, weil Qualität für sich spricht.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── OUR STORY ──────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand mb-6">
            {isEN ? 'Our Story' : 'Unsere Geschichte'}
          </p>
          <h2 className="text-title-1 text-white leading-tight mb-8">
            {isEN ? 'Started with a question.' : 'Begann mit einer Frage.'}
          </h2>
          <div className="space-y-6 text-text-on-dark-secondary text-base leading-relaxed">
            <p>
              {isEN
                ? 'When our founder sold a flat in London, the experience was opaque: no live updates, no market data, no visibility into buyer feedback. Not because the agent was bad — but because the tools didn\'t exist to share that information easily.'
                : 'Als unser Gründer eine Wohnung in London verkaufte, war die Erfahrung undurchsichtig: keine Live-Updates, keine Marktdaten, kein Einblick in Käufer-Feedback. Nicht weil der Makler schlecht war — sondern weil die Werkzeuge fehlten.'}
            </p>
            <p>
              {isEN
                ? 'That\'s when the question became clear: what if there was a platform where owners, hunters, and agents could all see what matters — and work together more effectively?'
                : 'Da wurde die Frage klar: Was wäre, wenn es eine Plattform gäbe, auf der Eigentümer, Suchende und Makler alle sehen können, was wichtig ist — und effektiver zusammenarbeiten?'}
            </p>
            <p className="text-white font-semibold">
              {isEN
                ? 'That\'s Yalla.House. Built by one founder and one AI, moving fast to fix property for everyone.'
                : 'Das ist Yalla.House. Gebaut von einem Gründer und einer KI, schnell unterwegs, um Immobilien für alle besser zu machen.'}
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #D4764E 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-title-1 text-white leading-tight mb-6">
            {isEN ? 'Ready to get started?' : 'Bereit loszulegen?'}
          </h2>
          <p className="text-lede text-white/50 mb-10 max-w-xl mx-auto">
            {isEN
              ? 'Whether you\'re selling, searching, or an agent looking for better leads — there\'s a dashboard for you.'
              : 'Ob Sie verkaufen, suchen oder als Makler bessere Kontakte wollen — es gibt ein Dashboard für Sie.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/owner">
              <button className="px-8 py-4 bg-brand text-white font-semibold rounded-full hover:bg-brand-hover transition-all duration-300">
                {isEN ? 'List your property' : 'Immobilie inserieren'}
              </button>
            </Link>
            <Link href="/agents">
              <button className="px-8 py-4 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300">
                {isEN ? 'Find an agent' : 'Makler finden'}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
