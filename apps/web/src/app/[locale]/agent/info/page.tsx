import { Briefcase, TrendingUp, Shield, Users, Inbox, MapPin, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'

export default async function AgentInfoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEN = locale === 'en'

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-[#0F1117]">
          {isEN ? 'Agent Dashboard' : 'Makler-Dashboard'}
        </h1>
      </div>

      {/* Sub-nav tabs */}
      <div className="flex gap-6 mb-8 border-b border-[#E2E4EB]">
        <Link href="/agent/info" className="text-sm font-semibold text-[#0F1117] pb-3 border-b-2 border-[#34C759] -mb-px">
          Info
        </Link>
        <Link href="/agent/overview" className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors">
          Dashboard
        </Link>
        <Link href="/agent/briefs" className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors">
          Briefs
        </Link>
        <Link href="/agent/assignments" className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors">
          Assignments
        </Link>
      </div>

      {/* Intro */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8 mb-8">
        <h2 className="text-xl font-bold text-[#0F1117] mb-3">
          {isEN ? 'How Yalla.House works for agents' : 'Wie Yalla.House für Makler funktioniert'}
        </h2>
        <p className="text-[#5E6278] leading-relaxed max-w-3xl">
          {isEN
            ? 'Yalla.House connects you directly with home hunters who are actively searching in your area. Instead of cold calling or paying for expensive advertising, you receive qualified search briefs from people who have already described what they\'re looking for. You reply with relevant properties and your service pitch. The best proposals win — meaning quality agents get rewarded, not just the loudest ones.'
            : 'Yalla.House verbindet Sie direkt mit Suchenden in Ihrem Gebiet. Statt Kaltakquise oder teurer Werbung erhalten Sie qualifizierte Suchanfragen von Menschen, die bereits beschrieben haben, was sie suchen. Sie antworten mit relevanten Immobilien. Die besten Vorschläge gewinnen — Qualität wird belohnt.'}
        </p>
      </div>

      {/* Benefits grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {[
          {
            icon: <Inbox size={22} className="text-[#34C759]" />,
            title: isEN ? 'Qualified search briefs' : 'Qualifizierte Suchanfragen',
            desc: isEN
              ? 'Home hunters create detailed briefs: budget, target area, property type, bedrooms, timeline, languages, and notes. You see the full picture before deciding whether to respond. No guessing, no wasted time.'
              : 'Suchende erstellen detaillierte Anfragen: Budget, Gebiet, Typ, Schlafzimmer, Zeitplan, Sprachen und Notizen. Sie sehen das vollständige Bild, bevor Sie antworten.',
          },
          {
            icon: <Users size={22} className="text-[#34C759]" />,
            title: isEN ? 'No cold calling' : 'Keine Kaltakquise',
            desc: isEN
              ? 'Clients come to you through the platform. When a hunter saves a search in your area, their brief appears in your Briefs tab. You reply with relevant listings and your service pitch — they choose who to work with.'
              : 'Klienten kommen über die Plattform zu Ihnen. Wenn ein Suchender in Ihrem Gebiet eine Suche speichert, erscheint die Anfrage in Ihrem Briefs-Tab.',
          },
          {
            icon: <Shield size={22} className="text-[#34C759]" />,
            title: isEN ? 'Verified agent badge' : 'Verifiziertes Makler-Badge',
            desc: isEN
              ? 'We verify your details against Propertymark, NAEA, and ARLA registries. Verified agents display a trust badge, rank higher in search results, and receive more briefs. Verification is automatic if you\'re in our database.'
              : 'Wir verifizieren Ihre Daten gegen Propertymark, NAEA und ARLA. Verifizierte Makler zeigen ein Vertrauensbadge und werden höher eingestuft.',
          },
          {
            icon: <MapPin size={22} className="text-[#34C759]" />,
            title: isEN ? 'Postcode-level matching' : 'PLZ-genaues Matching',
            desc: isEN
              ? 'Set your exact coverage areas down to postcode level (e.g. SW11, IG2, N1). The platform only sends you briefs from hunters searching in those areas. No noise, just relevant leads that match your expertise.'
              : 'Legen Sie Ihre Gebiete bis auf PLZ-Ebene fest. Die Plattform sendet Ihnen nur Anfragen aus diesen Gebieten. Kein Rauschen, nur relevante Leads.',
          },
          {
            icon: <TrendingUp size={22} className="text-[#34C759]" />,
            title: isEN ? 'Compete on quality' : 'Konkurrieren Sie mit Qualität',
            desc: isEN
              ? 'Hunters see your proposal alongside others. Your response time, the relevance of your suggested properties, and your track record on the platform all factor into how you\'re ranked. Great service gets more connections.'
              : 'Suchende sehen Ihren Vorschlag neben anderen. Antwortzeit, Relevanz Ihrer vorgeschlagenen Immobilien und Ihre Erfolgsbilanz bestimmen Ihr Ranking.',
          },
          {
            icon: <Briefcase size={22} className="text-[#34C759]" />,
            title: isEN ? 'Free to join, free forever' : 'Kostenlos beitreten, für immer',
            desc: isEN
              ? 'Joining Yalla.House and receiving briefs is free. There are no monthly fees, no per-lead charges, and no lock-in contracts. We only succeed when our agents succeed — our business model is aligned with yours.'
              : 'Beitritt und Anfragen-Erhalt sind kostenlos. Keine monatlichen Gebühren, keine Kosten pro Lead, keine Vertragsbindung.',
          },
        ].map((b, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
            <div className="w-11 h-11 rounded-xl bg-[#34C759]/10 flex items-center justify-center mb-4">
              {b.icon}
            </div>
            <h3 className="font-bold text-[#0F1117] mb-2 text-[0.9375rem]">{b.title}</h3>
            <p className="text-sm text-[#5E6278] leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8 mb-8">
        <h2 className="text-lg font-bold text-[#0F1117] mb-6">
          {isEN ? 'From sign-up to first client' : 'Von der Anmeldung zum ersten Klienten'}
        </h2>
        <div className="space-y-6">
          {[
            { num: '1', title: isEN ? 'Complete your profile' : 'Profil vervollständigen', desc: isEN ? 'Set your agency name, coverage areas (by postcode), property specialisms, and upload your credentials. We verify you automatically against professional registries.' : 'Agenturname, Gebiete, Spezialisierungen und Nachweise festlegen. Automatische Verifizierung.' },
            { num: '2', title: isEN ? 'Receive matched briefs' : 'Passende Anfragen erhalten', desc: isEN ? 'When a home hunter saves a search in your area, their brief appears in your Briefs tab with full details: budget, property type, timeline, and preferences.' : 'Wenn ein Suchender in Ihrem Gebiet sucht, erscheint die Anfrage in Ihrem Briefs-Tab.' },
            { num: '3', title: isEN ? 'Reply and connect' : 'Antworten und verbinden', desc: isEN ? 'Send a proposal with relevant property suggestions and your service pitch. The hunter reviews all proposals and picks the best fit. Once connected, you communicate directly through the platform.' : 'Vorschlag mit relevanten Immobilien senden. Der Suchende prüft und wählt. Direkte Kommunikation über die Plattform.' },
          ].map(step => (
            <div key={step.num} className="flex gap-5">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#34C759] flex items-center justify-center text-white font-extrabold text-base">
                {step.num}
              </div>
              <div>
                <h3 className="font-bold text-[#0F1117] mb-1">{step.title}</h3>
                <p className="text-sm text-[#5E6278]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#34C759]/5 border border-[#34C759]/20 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-[#0F1117] mb-3">
          {isEN ? 'Set up your agent profile' : 'Makler-Profil einrichten'}
        </h2>
        <p className="text-sm text-[#5E6278] mb-6 max-w-lg mx-auto">
          {isEN
            ? 'Complete your profile to start receiving matched search briefs from home hunters in your area.'
            : 'Vervollständigen Sie Ihr Profil, um passende Suchanfragen von Suchenden in Ihrer Region zu erhalten.'}
        </p>
        <Link
          href="/agent/profile"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#34C759] hover:bg-[#2BA84A] text-white font-semibold rounded-lg transition-colors"
        >
          {isEN ? 'Complete profile' : 'Profil einrichten'} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
