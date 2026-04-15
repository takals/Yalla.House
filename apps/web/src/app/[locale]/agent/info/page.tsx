import {
  Calendar, MessageSquare, ShieldCheck, RefreshCw, Clock, Megaphone,
  ArrowRight, Check, X, Users, Briefcase, Palette,
} from 'lucide-react'
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

      {/* Hero intro */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8 mb-8">
        <h2 className="text-xl font-bold text-[#0F1117] mb-3">
          {isEN ? 'Less admin. More deals.' : 'Weniger Verwaltung. Mehr Abschlüsse.'}
        </h2>
        <p className="text-[#5E6278] leading-relaxed max-w-3xl">
          {isEN
            ? 'You became an agent to help people find homes — not to spend half your day chasing callbacks, re-typing buyer details, and coordinating diaries over email. Yalla.House handles the boring work so you can focus on what you\'re actually good at: closing deals and building relationships.'
            : 'Sie sind Makler geworden, um Menschen bei der Wohnungssuche zu helfen — nicht um den halben Tag mit Rückrufen, dem Abtippen von Käuferdaten und der Koordination von Terminen per E-Mail zu verbringen. Yalla.House erledigt die langweilige Arbeit, damit Sie sich auf das konzentrieren können, was Sie wirklich gut können.'}
        </p>
      </div>

      {/* Benefits grid — outcome-focused */}
      <div className="grid md:grid-cols-2 gap-5 mb-8">

        {/* 1: Calendar */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-[#34C759]/10 flex items-center justify-center mb-4">
            <Calendar size={22} className="text-[#34C759]" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {isEN ? 'Online calendar — no more back and forth' : 'Online-Kalender — kein Hin und Her mehr'}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {isEN
              ? 'Set your availability once. Home hunters and owners pick a slot that works for them — confirmed instantly. No more 6-email chains to book a single viewing. You see everything in one calendar: viewings, follow-ups, offer deadlines.'
              : 'Verfügbarkeit einmal festlegen. Suchende und Eigentümer wählen einen passenden Termin — sofort bestätigt. Keine 6-E-Mail-Ketten mehr für eine einzige Besichtigung.'}
          </p>
        </div>

        {/* 2: All comms in one place */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-[#34C759]/10 flex items-center justify-center mb-4">
            <MessageSquare size={22} className="text-[#34C759]" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {isEN ? 'Everything in one inbox' : 'Alles in einem Posteingang'}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {isEN
              ? 'Messages, emails, viewing reminders, document requests, offer notifications — all in one place. No more switching between your phone, email, WhatsApp, and your CRM to piece together what\'s happening with a deal. One thread per client, full history, searchable.'
              : 'Nachrichten, E-Mails, Besichtigungserinnerungen, Dokumentenanfragen, Angebotsbenachrichtigungen — alles an einem Ort. Ein Thread pro Klient, vollständiger Verlauf, durchsuchbar.'}
          </p>
        </div>

        {/* 3: Verified hunters */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-[#34C759]/10 flex items-center justify-center mb-4">
            <ShieldCheck size={22} className="text-[#34C759]" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {isEN ? 'Verified home hunters — ready to go' : 'Verifizierte Suchende — sofort startklar'}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {isEN
              ? 'Every hunter who reaches you has already filled out their Home Passport: budget, area, property type, timeline, finance status, languages. No more 20-minute onboarding calls to find out what they\'re looking for. It\'s all there before you even reply.'
              : 'Jeder Suchende, der Sie erreicht, hat bereits seinen Home Passport ausgefüllt: Budget, Gebiet, Immobilientyp, Zeitplan, Finanzstatus. Keine 20-minütigen Onboarding-Gespräche mehr.'}
          </p>
        </div>

        {/* 4: CRM sync */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-[#34C759]/10 flex items-center justify-center mb-4">
            <RefreshCw size={22} className="text-[#34C759]" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {isEN ? 'Optional CRM sync — everyone stays in the loop' : 'Optionale CRM-Synchronisierung'}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {isEN
              ? 'Connect your existing CRM and Yalla.House keeps it updated automatically. New leads, viewing outcomes, offer status — synced in real time. Owners and hunters see live progress without you having to send manual updates. Saves hours every week.'
              : 'Verbinden Sie Ihr bestehendes CRM und Yalla.House hält es automatisch aktuell. Neue Leads, Besichtigungsergebnisse, Angebotsstatus — in Echtzeit synchronisiert. Spart Stunden pro Woche.'}
          </p>
        </div>

        {/* 5: Save time */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-[#34C759]/10 flex items-center justify-center mb-4">
            <Clock size={22} className="text-[#34C759]" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {isEN ? 'Get your evenings back' : 'Holen Sie sich Ihre Abende zurück'}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {isEN
              ? 'The platform automates the work that eats your time: scheduling, status updates, document collection, follow-up reminders. Agents on similar platforms report saving 8–12 hours per week on admin alone. That\'s two extra viewings a day, or a Friday off.'
              : 'Die Plattform automatisiert die zeitfressende Arbeit: Terminplanung, Statusupdates, Dokumentensammlung, Follow-up-Erinnerungen. Ähnliche Plattformen berichten von 8–12 Stunden Zeitersparnis pro Woche.'}
          </p>
        </div>

        {/* 6: Your branding */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-[#34C759]/10 flex items-center justify-center mb-4">
            <Palette size={22} className="text-[#34C759]" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {isEN ? 'Your branding, your reputation' : 'Ihr Branding, Ihr Ruf'}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {isEN
              ? 'Your agency name, logo, and profile are front and centre. When a hunter sees your proposal, they see you — not a generic platform. Build your reputation on Yalla.House with verified reviews, response times, and a track record that speaks for itself.'
              : 'Ihr Agenturname, Logo und Profil stehen im Mittelpunkt. Wenn ein Suchender Ihren Vorschlag sieht, sieht er Sie — nicht eine generische Plattform. Bauen Sie Ihren Ruf auf mit verifizierten Bewertungen und Reaktionszeiten.'}
          </p>
        </div>
      </div>

      {/* How qualified leads reach you */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8 mb-8">
        <h2 className="text-lg font-bold text-[#0F1117] mb-6">
          {isEN ? 'How clients find you' : 'Wie Klienten Sie finden'}
        </h2>
        <div className="space-y-6">
          {[
            {
              num: '1',
              title: isEN ? 'A hunter saves their search' : 'Ein Suchender speichert seine Suche',
              desc: isEN
                ? 'They fill out their Home Passport: location, budget, bedrooms, property type, timeline. This becomes a structured brief.'
                : 'Sie füllen ihren Home Passport aus: Standort, Budget, Schlafzimmer, Immobilientyp, Zeitplan.',
            },
            {
              num: '2',
              title: isEN ? 'You get matched by postcode' : 'Sie werden nach PLZ zugeordnet',
              desc: isEN
                ? 'If the hunter\'s target area overlaps with your coverage areas, their brief lands in your Briefs tab. You see the full picture before deciding to respond.'
                : 'Wenn das Zielgebiet des Suchenden sich mit Ihren Gebieten überschneidet, erscheint die Anfrage in Ihrem Briefs-Tab.',
            },
            {
              num: '3',
              title: isEN ? 'You reply with properties and your pitch' : 'Sie antworten mit Immobilien und Ihrem Angebot',
              desc: isEN
                ? 'Send relevant listings and your service offer. The hunter compares all proposals and picks who to work with. No cold calls — they chose you.'
                : 'Senden Sie relevante Angebote. Der Suchende vergleicht alle Vorschläge und wählt. Keine Kaltakquise — er hat Sie gewählt.',
            },
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

      {/* Pricing */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8 mb-8">
        <h2 className="text-lg font-bold text-[#0F1117] mb-2">
          {isEN ? 'Pricing — transparent, no surprises' : 'Preise — transparent, keine Überraschungen'}
        </h2>
        <p className="text-sm text-[#5E6278] mb-8">
          {isEN
            ? 'Start free. Upgrade when you need more.'
            : 'Kostenlos starten. Upgraden, wenn Sie mehr brauchen.'}
        </p>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Free tier */}
          <div className="rounded-xl border-2 border-[#34C759] p-6 relative">
            <span className="absolute -top-3 left-4 bg-[#34C759] text-white text-xs font-bold px-3 py-1 rounded-full">
              {isEN ? 'FREE FOREVER' : 'FÜR IMMER KOSTENLOS'}
            </span>
            <h3 className="text-lg font-bold text-[#0F1117] mt-2 mb-1">Starter</h3>
            <p className="text-3xl font-extrabold text-[#0F1117] mb-4">£0<span className="text-sm font-normal text-[#5E6278]">/mo</span></p>
            <ul className="space-y-2.5 text-sm text-[#5E6278]">
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Agent profile with verified badge' : 'Makler-Profil mit Badge'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Receive matched search briefs' : 'Passende Suchanfragen erhalten'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Reply to up to 5 briefs/month' : 'Bis zu 5 Antworten/Monat'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Online calendar & scheduling' : 'Online-Kalender & Planung'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Unified inbox' : 'Zentraler Posteingang'}</li>
              <li className="flex items-start gap-2"><X size={15} className="text-[#CBD5E1] mt-0.5 flex-shrink-0" /> {isEN ? 'CRM sync' : 'CRM-Synchronisierung'}</li>
              <li className="flex items-start gap-2"><X size={15} className="text-[#CBD5E1] mt-0.5 flex-shrink-0" /> {isEN ? 'Priority matching' : 'Prioritäts-Matching'}</li>
            </ul>
          </div>

          {/* Pro tier */}
          <div className="rounded-xl border border-[#E2E4EB] p-6 bg-[#FAFBFC]">
            <h3 className="text-lg font-bold text-[#0F1117] mb-1">Pro</h3>
            <p className="text-3xl font-extrabold text-[#0F1117] mb-4">£49<span className="text-sm font-normal text-[#5E6278]">/mo</span></p>
            <ul className="space-y-2.5 text-sm text-[#5E6278]">
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Everything in Starter' : 'Alles aus Starter'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Unlimited brief replies' : 'Unbegrenzte Antworten'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'CRM sync (Reapit, Alto, etc.)' : 'CRM-Sync (Reapit, Alto, etc.)'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Priority in search results' : 'Priorität in Suchergebnissen'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Custom branding on profile' : 'Eigenes Branding im Profil'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Document sharing & e-sign' : 'Dokumenten-Sharing & E-Sign'}</li>
            </ul>
          </div>

          {/* Agency tier */}
          <div className="rounded-xl border border-[#E2E4EB] p-6 bg-[#FAFBFC]">
            <h3 className="text-lg font-bold text-[#0F1117] mb-1">Agency</h3>
            <p className="text-3xl font-extrabold text-[#0F1117] mb-4">£149<span className="text-sm font-normal text-[#5E6278]">/mo</span></p>
            <ul className="space-y-2.5 text-sm text-[#5E6278]">
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Everything in Pro' : 'Alles aus Pro'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Up to 10 agent seats' : 'Bis zu 10 Makler-Plätze'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Team calendar & assignment' : 'Team-Kalender & Zuweisung'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Agency-wide analytics' : 'Agenturweite Analysen'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'White-label client portal' : 'White-Label Kundenportal'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Dedicated account manager' : 'Dedizierter Account Manager'}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* The gatekeeper line */}
      <div className="bg-[#0F1117] rounded-2xl p-8 mb-8">
        <div className="flex items-start gap-5">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Megaphone size={22} className="text-brand" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">
              {isEN ? 'Free advertising — the gatekeepers won\'t tell you this' : 'Kostenlose Werbung — das verraten Ihnen die Gatekeeper nicht'}
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              {isEN
                ? 'Rightmove and Zoopla charge agents thousands per month. Yalla.House lists your matched properties on free advertising channels too — OpenRent, Gumtree, Facebook Marketplace, and more. Your listings get exposure without the portal fees. The big portals don\'t want you to know this works, but it does.'
                : 'Rightmove und Zoopla berechnen Maklern Tausende pro Monat. Yalla.House listet Ihre Immobilien auch auf kostenlosen Kanälen — OpenRent, Gumtree, Facebook Marketplace und mehr. Ihre Angebote erhalten Reichweite ohne Portalgebühren.'}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#34C759]/5 border border-[#34C759]/20 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-[#0F1117] mb-3">
          {isEN ? 'Start free — upgrade when it makes sense' : 'Kostenlos starten — upgraden, wenn es Sinn macht'}
        </h2>
        <p className="text-sm text-[#5E6278] mb-6 max-w-lg mx-auto">
          {isEN
            ? 'Set up your profile in 2 minutes. Start receiving matched briefs from home hunters in your area today. No credit card, no contracts.'
            : 'Profil in 2 Minuten einrichten. Noch heute passende Anfragen erhalten. Keine Kreditkarte, keine Verträge.'}
        </p>
        <Link
          href="/agent/profile"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#34C759] hover:bg-[#2BA84A] text-white font-semibold rounded-lg transition-colors"
        >
          {isEN ? 'Complete your profile' : 'Profil einrichten'} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
