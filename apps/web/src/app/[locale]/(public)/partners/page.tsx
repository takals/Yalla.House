import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import {
  Users, Briefcase, TrendingUp, Shield, ArrowRight,
  Check, Handshake, Building2, Camera, FileText, MapPin,
} from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const isEnglish = locale === 'en'

  return {
    title: isEnglish ? 'Partner with Yalla.House' : 'Partner werden | Yalla.House',
    description: isEnglish
      ? 'Join the Yalla.House partner network. Estate agents, photographers, conveyancers, and service providers — grow your business with qualified leads.'
      : 'Werden Sie Teil des Yalla.House Partner-Netzwerks. Makler, Fotografen, Notare und Dienstleister — wachsen Sie mit qualifizierten Leads.',
  }
}

export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
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
      `}</style>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 rounded-full mb-8">
            <Handshake size={16} className="text-brand" />
            <span className="text-xs font-bold text-brand uppercase tracking-wider">
              {isEN ? 'Partner Programme' : 'Partner-Programm'}
            </span>
          </div>
          <h1 className="fade-up text-display text-white">
            {isEN ? (
              <>Grow your business with{' '}<span className="text-brand">Yalla.House</span></>
            ) : (
              <>Wachsen Sie mit{' '}<span className="text-brand">Yalla.House</span></>
            )}
          </h1>
          <p className="fade-up-d1 mt-6 text-lede text-text-on-dark-secondary max-w-2xl mx-auto">
            {isEN
              ? 'Join a network of 17,000+ verified agents and service providers. Get matched with serious clients in your area — no cold calling required.'
              : 'Treten Sie einem Netzwerk von über 17.000 verifizierten Maklern und Dienstleistern bei. Werden Sie mit ernsthaften Klienten in Ihrer Region verbunden.'}
          </p>
          <div className="fade-up-d2 mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login?next=/agent">
              <button className="px-8 py-4 bg-brand text-white font-semibold rounded-full hover:bg-brand-hover transition-all duration-300">
                {isEN ? 'Join as an Agent' : 'Als Makler beitreten'}
              </button>
            </Link>
            <Link href="/auth/login?next=/partner">
              <button className="px-8 py-4 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300">
                {isEN ? 'Join as a Service Provider' : 'Als Dienstleister beitreten'}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── PARTNER TYPES ──────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand mb-6 text-center">
            {isEN ? 'Who can partner with us' : 'Wer kann Partner werden'}
          </p>
          <h2 className="text-title-1 text-white leading-tight text-center mb-16">
            {isEN ? 'Four partner tracks. One platform.' : 'Vier Partner-Wege. Eine Plattform.'}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Estate Agents */}
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-8 hover:border-brand/30 transition-colors">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <Building2 size={28} className="text-brand" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {isEN ? 'Estate Agents' : 'Immobilienmakler'}
                  </h3>
                  <p className="text-sm text-text-on-dark-secondary leading-relaxed mb-4">
                    {isEN
                      ? 'Receive search briefs from matched home hunters. Compete on quality and service, not on who shouts the loudest. Get live CRM updates when clients are connected.'
                      : 'Erhalten Sie Suchanfragen von passenden Suchenden. Konkurrieren Sie mit Qualität und Service. Erhalten Sie Live-CRM-Updates.'}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-text-on-dark-secondary">
                      <Check size={14} className="text-[#34C759] flex-shrink-0" />
                      {isEN ? 'Qualified leads matched to your area' : 'Qualifizierte Leads in Ihrem Gebiet'}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-on-dark-secondary">
                      <Check size={14} className="text-[#34C759] flex-shrink-0" />
                      {isEN ? 'Agent profile with verified badge' : 'Makler-Profil mit Verifizierungsbadge'}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-on-dark-secondary">
                      <Check size={14} className="text-[#34C759] flex-shrink-0" />
                      {isEN ? 'Free to join — pay nothing until you close' : 'Kostenloser Beitritt — zahlen Sie erst beim Abschluss'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Photographers */}
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-8 hover:border-brand/30 transition-colors">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#5856D6]/10 flex items-center justify-center flex-shrink-0">
                  <Camera size={28} className="text-[#5856D6]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {isEN ? 'Photographers & Videographers' : 'Fotografen & Videografen'}
                  </h3>
                  <p className="text-sm text-text-on-dark-secondary leading-relaxed mb-4">
                    {isEN
                      ? 'Owners need professional photos and virtual tours. Get booked directly through the platform for property shoots in your area.'
                      : 'Eigentümer brauchen professionelle Fotos und virtuelle Touren. Werden Sie direkt über die Plattform für Immobilien-Shoots gebucht.'}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-text-on-dark-secondary">
                      <Check size={14} className="text-[#34C759] flex-shrink-0" />
                      {isEN ? 'Direct bookings from property owners' : 'Direktbuchungen von Eigentümern'}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-on-dark-secondary">
                      <Check size={14} className="text-[#34C759] flex-shrink-0" />
                      {isEN ? 'Set your own rates and availability' : 'Eigene Preise und Verfügbarkeit festlegen'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Conveyancers */}
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-8 hover:border-brand/30 transition-colors">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#FF9500]/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={28} className="text-[#FF9500]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {isEN ? 'Solicitors & Conveyancers' : 'Anwälte & Notare'}
                  </h3>
                  <p className="text-sm text-text-on-dark-secondary leading-relaxed mb-4">
                    {isEN
                      ? 'Sellers and buyers need legal support. Get connected to clients at the right stage of their property journey — when they actually need you.'
                      : 'Verkäufer und Käufer brauchen rechtliche Unterstützung. Werden Sie zum richtigen Zeitpunkt mit Klienten verbunden.'}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-text-on-dark-secondary">
                      <Check size={14} className="text-[#34C759] flex-shrink-0" />
                      {isEN ? 'Warm referrals at point of sale' : 'Qualifizierte Empfehlungen beim Verkauf'}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-on-dark-secondary">
                      <Check size={14} className="text-[#34C759] flex-shrink-0" />
                      {isEN ? 'Profile visibility to all platform users' : 'Profil-Sichtbarkeit für alle Nutzer'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Referrers */}
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-8 hover:border-brand/30 transition-colors">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#34C759]/10 flex items-center justify-center flex-shrink-0">
                  <Users size={28} className="text-[#34C759]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {isEN ? 'Referral Partners' : 'Empfehlungspartner'}
                  </h3>
                  <p className="text-sm text-text-on-dark-secondary leading-relaxed mb-4">
                    {isEN
                      ? 'Know someone selling or buying? Refer them to Yalla.House and earn a referral fee when they list or transact through the platform.'
                      : 'Kennen Sie jemanden, der verkauft oder kauft? Empfehlen Sie Yalla.House und verdienen Sie eine Empfehlungsprämie.'}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-text-on-dark-secondary">
                      <Check size={14} className="text-[#34C759] flex-shrink-0" />
                      {isEN ? 'Earn per successful referral' : 'Verdienen Sie pro erfolgreicher Empfehlung'}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-on-dark-secondary">
                      <Check size={14} className="text-[#34C759] flex-shrink-0" />
                      {isEN ? 'Track referrals from your dashboard' : 'Empfehlungen über Ihr Dashboard verfolgen'}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand mb-6 text-center">
            {isEN ? 'How it works for agents' : 'So funktioniert es für Makler'}
          </p>
          <h2 className="text-title-1 text-white leading-tight text-center mb-16">
            {isEN ? 'From sign-up to first client.' : 'Von der Anmeldung zum ersten Klienten.'}
          </h2>

          <div className="space-y-8">
            {[
              {
                num: '1',
                title: isEN ? 'Create your agent profile' : 'Erstellen Sie Ihr Makler-Profil',
                desc: isEN
                  ? 'Set your coverage areas, specialisms, and service tiers. We verify your details against professional registries.'
                  : 'Legen Sie Ihre Gebiete, Spezialisierungen und Service-Level fest. Wir verifizieren Ihre Daten.',
              },
              {
                num: '2',
                title: isEN ? 'Get matched with search briefs' : 'Werden Sie mit Suchanfragen verbunden',
                desc: isEN
                  ? 'When a home hunter saves a search in your area, you\'ll see their brief — budget, property type, timeline, preferences. No guessing.'
                  : 'Wenn ein Suchender in Ihrem Gebiet eine Suche speichert, sehen Sie die Anfrage — Budget, Immobilientyp, Zeitplan, Präferenzen.',
              },
              {
                num: '3',
                title: isEN ? 'Reply and connect' : 'Antworten und verbinden',
                desc: isEN
                  ? 'Send a proposal with relevant properties or your service pitch. The hunter reviews all proposals and picks the best fit. You compete on quality.'
                  : 'Senden Sie einen Vorschlag mit relevanten Immobilien. Der Suchende prüft alle Vorschläge und wählt den besten. Sie konkurrieren mit Qualität.',
              },
            ].map((step) => (
              <div key={step.num} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-brand flex items-center justify-center text-white font-extrabold text-xl">
                  {step.num}
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-text-on-dark-secondary leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-10">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-brand mb-2">17,000+</div>
                <p className="text-sm text-text-on-dark-secondary">
                  {isEN ? 'Agents already on the platform' : 'Makler bereits auf der Plattform'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-brand mb-2">100+</div>
                <p className="text-sm text-text-on-dark-secondary">
                  {isEN ? 'UK postcode areas covered' : 'PLZ-Gebiete abgedeckt'}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-brand mb-2">£0</div>
                <p className="text-sm text-text-on-dark-secondary">
                  {isEN ? 'To join — free forever for agents' : 'Kostenlos beitreten — für immer kostenlos'}
                </p>
              </div>
            </div>
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
            {isEN ? 'Ready to grow your business?' : 'Bereit, Ihr Geschäft zu vergrößern?'}
          </h2>
          <p className="text-lede text-white/50 mb-10 max-w-xl mx-auto">
            {isEN
              ? 'Join Yalla.House and start receiving qualified leads in your area. Free to join, no contracts, no lock-ins.'
              : 'Treten Sie Yalla.House bei und erhalten Sie qualifizierte Leads in Ihrer Region. Kostenlos, keine Verträge, keine Bindung.'}
          </p>
          <Link href="/auth/login?next=/agent">
            <button className="px-10 py-4 bg-brand text-white font-semibold rounded-full hover:bg-brand-hover transition-all duration-300 text-lg">
              {isEN ? 'Get started free' : 'Kostenlos starten'}
            </button>
          </Link>
        </div>
      </section>
    </main>
  )
}
