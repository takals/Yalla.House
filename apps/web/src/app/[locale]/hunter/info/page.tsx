import { ShieldCheck, Search, Users, MessageCircle, MapPin, Zap, ArrowRight, Eye, Handshake } from 'lucide-react'
import Link from 'next/link'

export default async function HunterInfoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEN = locale === 'en'

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#0F1117]">
          {isEN ? 'Home Hunter' : 'Suchenden-Dashboard'}
        </h1>
      </div>

      {/* Sub-nav tabs */}
      <div className="flex gap-6 border-b border-[#E2E4EB] -mt-2">
        <Link href="/hunter" className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors">
          Dashboard
        </Link>
        <Link href="/hunter/passport" className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors">
          Passport
        </Link>
        <Link href="/hunter/inbox" className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors">
          Inbox
        </Link>
        <Link href="/hunter/info" className="text-sm font-semibold text-[#0F1117] pb-3 border-b-2 border-[#5856D6] -mb-px">
          Info
        </Link>
      </div>

      {/* Intro */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
        <h2 className="text-xl font-bold text-[#0F1117] mb-3">
          {isEN ? 'How Yalla.House helps you find your next home' : 'Wie Yalla.House Ihnen hilft, Ihr nächstes Zuhause zu finden'}
        </h2>
        <p className="text-[#5E6278] leading-relaxed max-w-3xl">
          {isEN
            ? 'Most home search platforms make you scroll through hundreds of listings and then cold-call agents. Yalla.House flips this: you tell us what you\'re looking for via your Home Passport, and we match you with local agents who specialise in exactly that. They come to you with relevant properties — no trawling, no cold calls. You stay in control of who you work with.'
            : 'Die meisten Suchplattformen zwingen Sie, durch Hunderte von Anzeigen zu scrollen und dann Makler kalt anzurufen. Yalla.House dreht das um: Sie sagen uns über Ihren Home Passport, was Sie suchen, und wir verbinden Sie mit lokalen Maklern. Sie behalten die Kontrolle.'}
        </p>
      </div>

      {/* Benefits grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          {
            icon: <ShieldCheck size={22} className="text-[#5856D6]" />,
            title: isEN ? 'Home Passport' : 'Home Passport',
            desc: isEN
              ? 'A structured profile of what you\'re looking for: areas, budget range, property type, bedrooms, timeline, languages you speak, and any specific requirements. Complete it once and agents can find you.'
              : 'Ein strukturiertes Profil Ihrer Anforderungen: Gebiete, Budget, Immobilientyp, Schlafzimmer, Zeitplan und spezielle Wünsche. Einmal ausfüllen und Makler finden Sie.',
          },
          {
            icon: <Users size={22} className="text-[#5856D6]" />,
            title: isEN ? 'Agents come to you' : 'Makler kommen zu Ihnen',
            desc: isEN
              ? 'When you save your passport, local agents in your target area see your brief. They reply with relevant properties and their pitch. You review all replies and pick who to work with — like receiving proposals instead of making cold calls.'
              : 'Wenn Sie Ihren Passport speichern, sehen lokale Makler Ihre Anfrage. Sie antworten mit relevanten Immobilien. Sie prüfen alle Antworten und wählen.',
          },
          {
            icon: <Search size={22} className="text-[#5856D6]" />,
            title: isEN ? 'Smart property search' : 'Intelligente Immobiliensuche',
            desc: isEN
              ? 'Browse all properties on the platform. Filter by location, price, type, and features. Save searches and get notified when new matches appear. See comparable sale prices in the area.'
              : 'Durchsuchen Sie alle Immobilien. Filtern nach Standort, Preis, Typ und Ausstattung. Suchen speichern und benachrichtigt werden.',
          },
          {
            icon: <MapPin size={22} className="text-[#5856D6]" />,
            title: isEN ? '17,000+ UK agents' : '17.000+ UK-Makler',
            desc: isEN
              ? 'Our database covers over 100 postcode areas with verified agents from Propertymark, NAEA, and ARLA. Each agent has a profile with their coverage areas, specialisms, and verification status.'
              : 'Unsere Datenbank deckt über 100 PLZ-Gebiete mit verifizierten Maklern ab. Jeder Makler hat ein Profil mit Gebieten, Spezialisierungen und Verifizierungsstatus.',
          },
          {
            icon: <Eye size={22} className="text-[#5856D6]" />,
            title: isEN ? 'Full transparency' : 'Volle Transparenz',
            desc: isEN
              ? 'See which agents are active in your area, how they compare, and what they offer. No hidden fees, no surprises. Agent match scores show you how well each one fits your brief.'
              : 'Sehen Sie, welche Makler in Ihrem Gebiet aktiv sind, wie sie sich vergleichen und was sie anbieten. Keine versteckten Gebühren.',
          },
          {
            icon: <Zap size={22} className="text-[#5856D6]" />,
            title: isEN ? 'Completely free' : 'Komplett kostenlos',
            desc: isEN
              ? 'Yalla.House is free for home hunters — forever. Create your passport, get matched, search properties, book viewings. No fees at any stage. Agents pay to be on the platform, not you.'
              : 'Yalla.House ist für Suchende kostenlos — für immer. Passport erstellen, verbunden werden, suchen, Besichtigungen buchen. Keine Gebühren.',
          },
        ].map((b, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
            <div className="w-11 h-11 rounded-xl bg-[#5856D6]/10 flex items-center justify-center mb-4">
              {b.icon}
            </div>
            <h3 className="font-bold text-[#0F1117] mb-2 text-[0.9375rem]">{b.title}</h3>
            <p className="text-sm text-[#5E6278] leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-[#5856D6]/5 border border-[#5856D6]/20 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-[#0F1117] mb-3">
          {isEN ? 'Start your home search' : 'Starten Sie Ihre Suche'}
        </h2>
        <p className="text-sm text-[#5E6278] mb-6 max-w-lg mx-auto">
          {isEN
            ? 'Create your Home Passport and let matched agents find properties for you.'
            : 'Erstellen Sie Ihren Home Passport und lassen Sie passende Makler für Sie suchen.'}
        </p>
        <Link
          href="/hunter/passport"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#5856D6] hover:bg-[#4B49B8] text-white font-semibold rounded-lg transition-colors"
        >
          {isEN ? 'Create Home Passport' : 'Home Passport erstellen'} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
