import { getTranslations } from 'next-intl/server'
import { ShieldCheck, Search, Users, MessageCircle, MapPin, Zap } from 'lucide-react'
import Link from 'next/link'

export default async function HunterInfoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEN = locale === 'en'

  const benefits = [
    {
      icon: <ShieldCheck size={24} className="text-[#5856D6]" />,
      title: isEN ? 'Home Passport' : 'Home Passport',
      desc: isEN
        ? 'Tell us exactly what you\'re looking for — location, budget, property type, timeline. Your passport gets matched with local agents who specialise in exactly that.'
        : 'Sagen Sie uns genau, was Sie suchen. Ihr Passport wird mit lokalen Maklern verbunden, die genau darauf spezialisiert sind.',
    },
    {
      icon: <Users size={24} className="text-[#5856D6]" />,
      title: isEN ? 'Agent matching' : 'Makler-Matching',
      desc: isEN
        ? 'Instead of calling 10 agents, they come to you. Local agents see your brief and reply with relevant properties and their pitch.'
        : 'Statt 10 Makler anzurufen, kommen sie zu Ihnen. Lokale Makler sehen Ihre Anfrage und antworten mit relevanten Immobilien.',
    },
    {
      icon: <Search size={24} className="text-[#5856D6]" />,
      title: isEN ? 'Smart search' : 'Intelligente Suche',
      desc: isEN
        ? 'Search across all properties on the platform. Filter by location, price, type, and features. Save searches for instant alerts.'
        : 'Suchen Sie über alle Immobilien. Filtern Sie nach Standort, Preis, Typ und Ausstattung.',
    },
    {
      icon: <MapPin size={24} className="text-[#5856D6]" />,
      title: isEN ? '17,000+ agents across the UK' : '17.000+ Makler in ganz UK',
      desc: isEN
        ? 'Our agent database covers 100+ postcode areas. Enter your area and instantly see who\'s active locally.'
        : 'Unsere Makler-Datenbank deckt über 100 Postleitzahlgebiete ab.',
    },
    {
      icon: <MessageCircle size={24} className="text-[#5856D6]" />,
      title: isEN ? 'All conversations in one inbox' : 'Alle Gespräche in einem Posteingang',
      desc: isEN
        ? 'Messages from agents, owners, and service providers in one place. No more juggling email threads and voicemails.'
        : 'Nachrichten von Maklern, Eigentümern und Dienstleistern an einem Ort.',
    },
    {
      icon: <Zap size={24} className="text-[#5856D6]" />,
      title: isEN ? 'Completely free' : 'Komplett kostenlos',
      desc: isEN
        ? 'Yalla.House is free for home hunters. Create your passport, get matched, and find your next home — no fees, ever.'
        : 'Yalla.House ist für Suchende kostenlos. Passport erstellen, verbunden werden, Zuhause finden — keine Gebühren.',
    },
  ]

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F1117] mb-2">
          {isEN ? 'How Yalla.House works for you' : 'Wie Yalla.House für Sie funktioniert'}
        </h1>
        <p className="text-[#5E6278]">
          {isEN
            ? 'Find your next home faster — with matched agents, smart search, and zero fees.'
            : 'Finden Sie Ihr nächstes Zuhause schneller — mit passenden Maklern, intelligenter Suche und null Gebühren.'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-10">
        {benefits.map((b, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
            <div className="w-12 h-12 rounded-xl bg-[#5856D6]/10 flex items-center justify-center mb-4">
              {b.icon}
            </div>
            <h3 className="font-bold text-[#0F1117] mb-2">{b.title}</h3>
            <p className="text-sm text-[#5E6278] leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#5856D6]/5 border border-[#5856D6]/20 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-[#0F1117] mb-3">
          {isEN ? 'Start your home search' : 'Starten Sie Ihre Suche'}
        </h2>
        <p className="text-sm text-[#5E6278] mb-6">
          {isEN
            ? 'Create your Home Passport and let matched agents find properties for you.'
            : 'Erstellen Sie Ihren Home Passport und lassen Sie passende Makler für Sie suchen.'}
        </p>
        <Link
          href="/hunter/passport"
          className="inline-block px-6 py-3 bg-[#5856D6] hover:bg-[#4B49B8] text-white font-semibold rounded-lg transition-colors"
        >
          {isEN ? 'Create Home Passport' : 'Home Passport erstellen'}
        </Link>
      </div>
    </div>
  )
}
