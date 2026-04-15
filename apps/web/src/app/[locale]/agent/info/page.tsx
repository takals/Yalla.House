import { getTranslations } from 'next-intl/server'
import { Briefcase, TrendingUp, Shield, Users, Inbox, MapPin } from 'lucide-react'
import Link from 'next/link'

export default async function AgentInfoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEN = locale === 'en'

  const benefits = [
    {
      icon: <Inbox size={24} className="text-[#34C759]" />,
      title: isEN ? 'Qualified search briefs' : 'Qualifizierte Suchanfragen',
      desc: isEN
        ? 'Home hunters create detailed search briefs with budget, area, property type, and timeline. You only see briefs that match your coverage area and specialisms.'
        : 'Suchende erstellen detaillierte Suchanfragen. Sie sehen nur Anfragen, die zu Ihrem Gebiet und Ihren Spezialisierungen passen.',
    },
    {
      icon: <Users size={24} className="text-[#34C759]" />,
      title: isEN ? 'No cold calling' : 'Keine Kaltakquise',
      desc: isEN
        ? 'Clients come to you through the platform. Reply to briefs with relevant properties and your service pitch — the hunter decides who to work with.'
        : 'Klienten kommen über die Plattform zu Ihnen. Antworten Sie auf Anfragen — der Suchende entscheidet.',
    },
    {
      icon: <Shield size={24} className="text-[#34C759]" />,
      title: isEN ? 'Verified agent badge' : 'Verifiziertes Makler-Badge',
      desc: isEN
        ? 'We verify your details against professional registries (Propertymark, NAEA, ARLA). Verified agents rank higher and get more briefs.'
        : 'Wir verifizieren Ihre Daten. Verifizierte Makler werden höher eingestuft und erhalten mehr Anfragen.',
    },
    {
      icon: <MapPin size={24} className="text-[#34C759]" />,
      title: isEN ? 'Coverage area matching' : 'Gebiets-Matching',
      desc: isEN
        ? 'Set your postcode areas and property specialisms. The platform only sends you briefs from hunters in your area — no noise, just relevant leads.'
        : 'Legen Sie Ihre Postleitzahlgebiete fest. Die Plattform sendet Ihnen nur relevante Anfragen.',
    },
    {
      icon: <TrendingUp size={24} className="text-[#34C759]" />,
      title: isEN ? 'Compete on quality' : 'Konkurrieren Sie mit Qualität',
      desc: isEN
        ? 'Hunters see your proposal alongside others. Your track record, response time, and service quality matter more than your marketing budget.'
        : 'Suchende sehen Ihren Vorschlag neben anderen. Ihre Erfolgsbilanz und Servicequalität zählen mehr als Ihr Werbebudget.',
    },
    {
      icon: <Briefcase size={24} className="text-[#34C759]" />,
      title: isEN ? 'Free forever' : 'Für immer kostenlos',
      desc: isEN
        ? 'Joining and receiving briefs is free. We only succeed when you succeed — our model aligns with yours.'
        : 'Beitritt und Anfragen-Erhalt sind kostenlos. Wir haben nur Erfolg, wenn Sie Erfolg haben.',
    },
  ]

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F1117] mb-2">
          {isEN ? 'Why agents love Yalla.House' : 'Warum Makler Yalla.House lieben'}
        </h1>
        <p className="text-[#5E6278]">
          {isEN
            ? 'Get matched with serious buyers and sellers in your area. No cold calling, no marketing spend — just quality leads.'
            : 'Werden Sie mit ernsthaften Käufern und Verkäufern verbunden. Keine Kaltakquise, keine Werbeausgaben.'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-10">
        {benefits.map((b, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
            <div className="w-12 h-12 rounded-xl bg-[#34C759]/10 flex items-center justify-center mb-4">
              {b.icon}
            </div>
            <h3 className="font-bold text-[#0F1117] mb-2">{b.title}</h3>
            <p className="text-sm text-[#5E6278] leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#34C759]/5 border border-[#34C759]/20 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-[#0F1117] mb-3">
          {isEN ? 'Complete your profile' : 'Profil vervollständigen'}
        </h2>
        <p className="text-sm text-[#5E6278] mb-6">
          {isEN
            ? 'Set up your coverage areas and specialisms to start receiving matched briefs.'
            : 'Legen Sie Ihre Gebiete und Spezialisierungen fest, um passende Anfragen zu erhalten.'}
        </p>
        <Link
          href="/agent/profile"
          className="inline-block px-6 py-3 bg-[#34C759] hover:bg-[#2BA84A] text-white font-semibold rounded-lg transition-colors"
        >
          {isEN ? 'Set up profile' : 'Profil einrichten'}
        </Link>
      </div>
    </div>
  )
}
