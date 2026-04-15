import {
  ShieldCheck, Search, Users, MessageSquare, MapPin, Zap, ArrowRight,
  Eye, Handshake, Check, X, BadgeCheck, Home, Heart, Bell,
} from 'lucide-react'
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
        <Link href="/hunter/info" className="text-sm font-semibold text-[#0F1117] pb-3 border-b-2 border-[#5856D6] -mb-px">
          Info
        </Link>
        <Link href="/hunter/overview" className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors">
          Dashboard
        </Link>
        <Link href="/hunter/passport" className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors">
          Passport
        </Link>
        <Link href="/hunter/inbox" className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors">
          Inbox
        </Link>
      </div>

      {/* Hero — outcome-focused */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
        <h2 className="text-xl font-bold text-[#0F1117] mb-3">
          {isEN ? 'Stop scrolling. Start finding.' : 'Aufhören zu scrollen. Anfangen zu finden.'}
        </h2>
        <p className="text-[#5E6278] leading-relaxed max-w-3xl">
          {isEN
            ? 'Most platforms make you trawl through hundreds of listings, then cold-call agents who don\'t pick up. Yalla.House works differently: you create your Home Passport once — what you\'re looking for, your budget, your timeline — and local agents who specialise in exactly that come to you with relevant properties. No scrolling, no chasing. You pick who to work with.'
            : 'Die meisten Plattformen zwingen Sie, durch Hunderte von Anzeigen zu scrollen und Makler kalt anzurufen. Yalla.House funktioniert anders: Sie erstellen einmal Ihren Home Passport und lokale Makler kommen mit relevanten Immobilien zu Ihnen. Kein Scrollen, kein Hinterherlaufen.'}
        </p>
      </div>

      {/* Home Passport = the centre */}
      <div className="bg-[#5856D6]/5 border border-[#5856D6]/20 rounded-2xl p-8">
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-[#5856D6]/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={24} className="text-[#5856D6]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0F1117] mb-2">
              {isEN ? 'Your Home Passport is the centre of everything' : 'Ihr Home Passport steht im Mittelpunkt'}
            </h3>
            <p className="text-sm text-[#5E6278] leading-relaxed mb-4">
              {isEN
                ? 'Your passport is a structured profile of what you need: areas, budget, property type, bedrooms, timeline, languages, and any specific requirements. Fill it out once, and it powers everything — agent matching, property alerts, search filters, and your readiness badges.'
                : 'Ihr Passport ist ein strukturiertes Profil Ihrer Anforderungen. Einmal ausfüllen und alles wird angetrieben — Makler-Matching, Immobilien-Benachrichtigungen, Suchfilter und Ihre Bereitschafts-Badges.'}
            </p>
            <Link href="/hunter/passport" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5856D6] hover:gap-2.5 transition-all">
              {isEN ? 'Create your passport' : 'Passport erstellen'} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits grid */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Agents come to you */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-[#5856D6]/10 flex items-center justify-center mb-4">
            <Users size={22} className="text-[#5856D6]" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {isEN ? 'Agents come to you' : 'Makler kommen zu Ihnen'}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {isEN
              ? 'When you save your passport, agents in your target area see your brief and reply with relevant properties. You review all replies and pick who to work with — like getting proposals instead of making cold calls.'
              : 'Wenn Sie Ihren Passport speichern, sehen Makler in Ihrem Zielgebiet Ihre Anfrage und antworten mit relevanten Immobilien. Sie wählen, mit wem Sie arbeiten möchten.'}
          </p>
        </div>

        {/* Property search */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-[#5856D6]/10 flex items-center justify-center mb-4">
            <Search size={22} className="text-[#5856D6]" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {isEN ? 'Search across all listings' : 'Alle Angebote durchsuchen'}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {isEN
              ? 'Browse properties from free advertising channels and our partner agents in one place. Filter by location, price, type, and features. Save searches and get notified when new matches appear. See comparable prices in the area to know if a property is fairly priced.'
              : 'Immobilien aus kostenlosen Kanälen und unseren Partner-Maklern an einem Ort durchsuchen. Filtern, Suchen speichern und benachrichtigt werden.'}
          </p>
        </div>

        {/* 17K agents */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-[#5856D6]/10 flex items-center justify-center mb-4">
            <MapPin size={22} className="text-[#5856D6]" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {isEN ? '17,000+ registered UK agents' : '17.000+ registrierte UK-Makler'}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {isEN
              ? 'Our agent directory covers 100+ UK postcode areas, sourced from professional registries including Propertymark, NAEA, and ARLA. Each agent has a profile with their coverage areas and specialisms. We\'re expanding to Germany, France, and the Netherlands next.'
              : 'Unser Makler-Verzeichnis deckt über 100 UK-Postleitzahlgebiete ab. Jeder Makler hat ein Profil. Wir expandieren als Nächstes nach Deutschland, Frankreich und die Niederlande.'}
          </p>
        </div>

        {/* One inbox */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-[#5856D6]/10 flex items-center justify-center mb-4">
            <MessageSquare size={22} className="text-[#5856D6]" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {isEN ? 'All conversations in one inbox' : 'Alle Gespräche in einem Posteingang'}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {isEN
              ? 'Messages from agents, property alerts, viewing confirmations, and document requests — all in one threaded inbox. No more juggling email, WhatsApp, and phone calls across five different agents.'
              : 'Nachrichten von Maklern, Immobilien-Benachrichtigungen, Besichtigungsbestätigungen — alles in einem Posteingang.'}
          </p>
        </div>

        {/* Special requirements */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-[#5856D6]/10 flex items-center justify-center mb-4">
            <Heart size={22} className="text-[#5856D6]" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {isEN ? 'Search your way' : 'Suchen Sie auf Ihre Art'}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {isEN
              ? 'Beyond bedrooms and budget: search by accessibility needs (wheelchair accessible, step-free), soundproofing, EV charging, pet-friendly, garden size — requirements that matter to you but most platforms ignore. Coming soon: team up with others on a shared home search.'
              : 'Über Schlafzimmer und Budget hinaus: Suchen Sie nach Barrierefreiheit, Schalldämmung, E-Ladestationen, Haustierfreundlichkeit — Anforderungen, die Ihnen wichtig sind.'}
          </p>
        </div>

        {/* Free */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-[#5856D6]/10 flex items-center justify-center mb-4">
            <Zap size={22} className="text-[#5856D6]" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {isEN ? 'Free to search and connect' : 'Kostenlos suchen und verbinden'}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {isEN
              ? 'Creating your passport, getting matched with agents, browsing listings, and messaging are all free. You only pay if you want premium features like instant alerts or priority matching.'
              : 'Passport erstellen, mit Maklern verbunden werden, Angebote durchsuchen und Nachrichten sind kostenlos. Sie zahlen nur für Premium-Features.'}
          </p>
        </div>
      </div>

      {/* Readiness badges */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
        <h2 className="text-lg font-bold text-[#0F1117] mb-2">
          {isEN ? 'Readiness badges — stand out to agents' : 'Bereitschafts-Badges — fallen Sie Maklern auf'}
        </h2>
        <p className="text-sm text-[#5E6278] mb-6">
          {isEN
            ? 'Agents prioritise serious hunters. Earn badges on your profile to show you\'re ready to move — and get faster, better responses.'
            : 'Makler priorisieren ernsthafte Suchende. Verdienen Sie Badges, um zu zeigen, dass Sie bereit sind.'}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <BadgeCheck size={20} className="text-[#5856D6]" />,
              label: isEN ? 'Mortgage in Principle' : 'Hypothekengrundsatz',
              desc: isEN ? 'Proof you can afford it' : 'Nachweis der Finanzierung',
            },
            {
              icon: <ShieldCheck size={20} className="text-[#34C759]" />,
              label: isEN ? 'Identity Verified' : 'Identität verifiziert',
              desc: isEN ? 'ID check completed' : 'Ausweiskontrolle abgeschlossen',
            },
            {
              icon: <Home size={20} className="text-brand" />,
              label: isEN ? 'Profile Complete' : 'Profil vollständig',
              desc: isEN ? 'Passport fully filled out' : 'Passport vollständig ausgefüllt',
            },
            {
              icon: <Check size={20} className="text-[#FF9500]" />,
              label: isEN ? 'Renter Ready' : 'Mieter-bereit',
              desc: isEN ? 'References & deposit confirmed' : 'Referenzen & Kaution bestätigt',
            },
          ].map((badge, i) => (
            <div key={i} className="bg-[#F5F5FA] rounded-xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-[#E2E4EB]">
                {badge.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0F1117]">{badge.label}</p>
                <p className="text-xs text-[#5E6278]">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#5E6278] mt-4">
          {isEN
            ? 'Badges are optional. Need a mortgage in principle? We can connect you with a broker — at no cost to you.'
            : 'Badges sind optional. Benötigen Sie eine Hypothekengrundsatzgenehmigung? Wir verbinden Sie kostenlos mit einem Berater.'}
        </p>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8">
        <h2 className="text-lg font-bold text-[#0F1117] mb-2">
          {isEN ? 'Pricing' : 'Preise'}
        </h2>
        <p className="text-sm text-[#5E6278] mb-8">
          {isEN
            ? 'Search for free. Pay for speed.'
            : 'Kostenlos suchen. Für Geschwindigkeit zahlen.'}
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Free */}
          <div className="rounded-xl border-2 border-[#5856D6] p-6 relative">
            <span className="absolute -top-3 left-4 bg-[#5856D6] text-white text-xs font-bold px-3 py-1 rounded-full">
              {isEN ? 'FREE FOREVER' : 'FÜR IMMER KOSTENLOS'}
            </span>
            <h3 className="text-lg font-bold text-[#0F1117] mt-2 mb-1">Home Hunter</h3>
            <p className="text-3xl font-extrabold text-[#0F1117] mb-4">£0</p>
            <ul className="space-y-2.5 text-sm text-[#5E6278]">
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Home Passport & agent matching' : 'Home Passport & Makler-Matching'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Browse all listings' : 'Alle Angebote durchsuchen'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Inbox & messaging' : 'Posteingang & Nachrichten'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Save up to 3 searches' : 'Bis zu 3 Suchen speichern'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Readiness badges' : 'Bereitschafts-Badges'}</li>
              <li className="flex items-start gap-2"><X size={15} className="text-[#CBD5E1] mt-0.5 flex-shrink-0" /> {isEN ? 'Instant new-listing alerts' : 'Sofortige Benachrichtigungen'}</li>
              <li className="flex items-start gap-2"><X size={15} className="text-[#CBD5E1] mt-0.5 flex-shrink-0" /> {isEN ? 'Area price reports' : 'Gebiets-Preisberichte'}</li>
            </ul>
          </div>

          {/* Pro */}
          <div className="rounded-xl border border-[#E2E4EB] p-6 bg-[#FAFBFC]">
            <h3 className="text-lg font-bold text-[#0F1117] mb-1">Hunter Pro</h3>
            <p className="text-3xl font-extrabold text-[#0F1117] mb-1">£9<span className="text-sm font-normal text-[#5E6278]">/mo</span></p>
            <p className="text-xs text-[#5E6278] mb-4">{isEN ? 'cancel anytime' : 'jederzeit kündbar'}</p>
            <ul className="space-y-2.5 text-sm text-[#5E6278]">
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Everything in free' : 'Alles aus der kostenlosen Version'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Instant alerts when new listings match' : 'Sofortige Benachrichtigungen bei neuen Treffern'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Unlimited saved searches' : 'Unbegrenzte gespeicherte Suchen'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Area price reports & comparables' : 'Gebiets-Preisberichte & Vergleichsdaten'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Priority agent matching' : 'Bevorzugtes Makler-Matching'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Viewing scheduler' : 'Besichtigungsplaner'}</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-[#F5F5FA] rounded-xl p-5">
          <p className="text-sm text-[#5E6278] leading-relaxed">
            <span className="font-semibold text-[#0F1117]">{isEN ? 'Coming soon' : 'Demnächst'}:</span>{' '}
            {isEN
              ? 'Shared home search — team up with friends or housemates to hunt together (beta). Living community matching for co-living and house shares.'
              : 'Gemeinsame Wohnungssuche — suchen Sie zusammen mit Freunden oder Mitbewohnern (Beta). Wohngemeinschafts-Matching.'}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#5856D6]/5 border border-[#5856D6]/20 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-[#0F1117] mb-3">
          {isEN ? 'Create your Home Passport' : 'Erstellen Sie Ihren Home Passport'}
        </h2>
        <p className="text-sm text-[#5E6278] mb-6 max-w-lg mx-auto">
          {isEN
            ? 'Tell us what you\'re looking for. Takes 2 minutes. Agents start matching within hours.'
            : 'Sagen Sie uns, was Sie suchen. Dauert 2 Minuten. Makler beginnen innerhalb von Stunden mit dem Matching.'}
        </p>
        <Link
          href="/hunter/passport"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#5856D6] hover:bg-[#4B49B8] text-white font-semibold rounded-lg transition-colors"
        >
          {isEN ? 'Start your passport' : 'Passport starten'} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
