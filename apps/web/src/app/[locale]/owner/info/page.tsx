import { getTranslations } from 'next-intl/server'
import {
  Home, BarChart3, Handshake, Calendar, MessageSquare, Eye,
  ArrowRight, Check, X, Megaphone, Zap, Shield,
} from 'lucide-react'
import Link from 'next/link'

export default async function OwnerInfoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('ownerDash')
  const isEN = locale === 'en'

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-[#0F1117]">
          {isEN ? 'Owner Dashboard' : 'Eigentümer-Dashboard'}
        </h1>
      </div>

      {/* Sub-nav tabs */}
      <div className="flex gap-6 mb-8 border-b border-[#E2E4EB]">
        <Link href="/owner/info" className="text-sm font-semibold text-[#0F1117] pb-3 border-b-2 border-brand -mb-px">
          Info
        </Link>
        <Link href="/owner/overview" className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors">
          {t('pageTitle')}
        </Link>
        <Link href="/owner/listings" className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors">
          {t('tabListings')}
        </Link>
        <Link href="/owner/inbox" className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors">
          {t('tabInquiries')}
        </Link>
      </div>

      {/* Hero intro */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8 mb-8">
        <h2 className="text-xl font-bold text-[#0F1117] mb-3">
          {isEN ? 'Your property. Full visibility. No commission.' : 'Ihre Immobilie. Volle Transparenz. Keine Provision.'}
        </h2>
        <p className="text-[#5E6278] leading-relaxed max-w-3xl">
          {isEN
            ? 'Selling a property shouldn\'t mean handing everything over and hoping for the best. Yalla.House gives you a dashboard where you see exactly what\'s happening — every inquiry, every viewing, every offer — and you decide what to do next. List for free, get agent proposals if you want them, and keep every pound of your sale price.'
            : 'Einen Immobilienverkauf sollte nicht bedeuten, alles abzugeben und auf das Beste zu hoffen. Yalla.House gibt Ihnen ein Dashboard mit voller Transparenz — jede Anfrage, jede Besichtigung, jedes Angebot — und Sie entscheiden.'}
        </p>
      </div>

      {/* Benefits grid — outcome-focused */}
      <div className="grid md:grid-cols-2 gap-5 mb-8">

        {/* 1: List for free */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
            <Home size={22} className="text-brand" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {isEN ? 'List your property for free' : 'Kostenlos inserieren'}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {isEN
              ? 'Upload photos, set your price, and write your description with AI help. Your listing goes live on major portals — Rightmove, Zoopla, and free channels like OpenRent and Facebook Marketplace. No upfront cost, no commission, no hidden fees.'
              : 'Fotos hochladen, Preis setzen, Beschreibung mit KI-Hilfe verfassen. Ihr Inserat erscheint auf den großen Portalen. Keine Vorabkosten, keine Provision, keine versteckten Gebühren.'}
          </p>
        </div>

        {/* 2: Agents compete for you */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
            <Handshake size={22} className="text-brand" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {isEN ? 'Agents come to you — if you want them' : 'Makler kommen zu Ihnen — wenn Sie wollen'}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {isEN
              ? '17,000+ verified UK agents can see your listing. Interested ones send you a proposal with their rates and what they\'ll do. You compare side-by-side and pick the best fit — or handle it all yourself. You\'re never locked in to using an agent.'
              : 'Über 17.000 verifizierte UK-Makler können Ihr Inserat sehen. Interessierte senden Ihnen einen Vorschlag. Sie vergleichen und wählen — oder machen alles selbst.'}
          </p>
        </div>

        {/* 3: Real-time tracking */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
            <BarChart3 size={22} className="text-brand" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {isEN ? 'See everything in real time' : 'Alles in Echtzeit sehen'}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {isEN
              ? 'Your dashboard shows live data: how many people viewed your listing, who requested viewings, which agents responded, and where offers stand. No more calling your agent for an update — it\'s all there.'
              : 'Ihr Dashboard zeigt Live-Daten: Aufrufe, Besichtigungsanfragen, Makler-Antworten und Angebotsstatus. Alles sofort sichtbar.'}
          </p>
        </div>

        {/* 4: Viewings on autopilot */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
            <Calendar size={22} className="text-brand" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {isEN ? 'Viewings without the phone tag' : 'Besichtigungen ohne Telefon-Ping-Pong'}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {isEN
              ? 'Set your availability slots. Buyers pick a time that works and it\'s confirmed instantly — no back-and-forth emails. You see everything in one calendar: upcoming viewings, who\'s coming, and feedback after.'
              : 'Verfügbarkeiten festlegen. Käufer wählen einen Termin — sofort bestätigt. Alles in einem Kalender: kommende Besichtigungen, wer kommt, und Feedback danach.'}
          </p>
        </div>

        {/* 5: One inbox */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
            <MessageSquare size={22} className="text-brand" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {isEN ? 'One inbox, not six' : 'Ein Posteingang, nicht sechs'}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {isEN
              ? 'Buyer questions, agent proposals, viewing confirmations, offer notifications — all in one threaded inbox. No more hunting through email, WhatsApp, and voicemail to find that one message about the survey.'
              : 'Käuferanfragen, Makler-Vorschläge, Besichtigungsbestätigungen, Angebotsbenachrichtigungen — alles in einem Posteingang.'}
          </p>
        </div>

        {/* 6: Keep every pound */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
            <Shield size={22} className="text-brand" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {isEN ? 'Keep every pound of your sale price' : 'Behalten Sie jeden Euro'}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {isEN
              ? 'Yalla.House charges no commission on your sale — ever. The average UK agent charges 1.2% + VAT, which on a £350,000 property is over £5,000. That money stays in your pocket. If you choose to use an agent through the platform, you negotiate their fee directly.'
              : 'Yalla.House berechnet keine Provision — niemals. Die durchschnittliche Maklerprovision in Deutschland beträgt 3–6%. Dieses Geld bleibt bei Ihnen.'}
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8 mb-8">
        <h2 className="text-lg font-bold text-[#0F1117] mb-6">
          {isEN ? 'How it works' : 'So funktioniert es'}
        </h2>
        <div className="space-y-6">
          {[
            {
              num: '1',
              title: isEN ? 'Create your listing' : 'Inserat erstellen',
              desc: isEN
                ? 'Add photos, property details, and your asking price. Our AI helps you write a compelling description. Takes about 5 minutes.'
                : 'Fotos, Objektdetails und Ihren Preis hinzufügen. Unsere KI hilft bei der Beschreibung. Dauert etwa 5 Minuten.',
            },
            {
              num: '2',
              title: isEN ? 'Go live on portals' : 'Auf Portalen veröffentlichen',
              desc: isEN
                ? 'Your listing syndicates to Rightmove, Zoopla, and free channels. Buyers start finding you within hours.'
                : 'Ihr Inserat erscheint auf den großen Portalen und kostenlosen Kanälen. Käufer finden Sie innerhalb von Stunden.',
            },
            {
              num: '3',
              title: isEN ? 'Manage from your dashboard' : 'Über Ihr Dashboard verwalten',
              desc: isEN
                ? 'Track inquiries, schedule viewings, review agent proposals if you want them, and negotiate offers — all in one place.'
                : 'Anfragen verfolgen, Besichtigungen planen, Makler-Vorschläge prüfen und Angebote verhandeln — alles an einem Ort.',
            },
          ].map(step => (
            <div key={step.num} className="flex gap-5">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white font-extrabold text-base">
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
          {isEN ? 'Pricing — no commission, ever' : 'Preise — keine Provision, niemals'}
        </h2>
        <p className="text-sm text-[#5E6278] mb-8">
          {isEN
            ? 'List for free. Pay only if you want premium features.'
            : 'Kostenlos inserieren. Zahlen Sie nur für Premium-Features.'}
        </p>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Free tier */}
          <div className="rounded-xl border-2 border-brand p-6 relative">
            <span className="absolute -top-3 left-4 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">
              {isEN ? 'FREE' : 'KOSTENLOS'}
            </span>
            <h3 className="text-lg font-bold text-[#0F1117] mt-2 mb-1">Starter</h3>
            <p className="text-3xl font-extrabold text-[#0F1117] mb-4">£0<span className="text-sm font-normal text-[#5E6278]"> {isEN ? 'forever' : 'für immer'}</span></p>
            <ul className="space-y-2.5 text-sm text-[#5E6278]">
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'List on Rightmove & Zoopla' : 'Auf Rightmove & Zoopla inserieren'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Free channels (OpenRent, Gumtree, etc.)' : 'Kostenlose Kanäle (OpenRent, etc.)'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Owner dashboard with live stats' : 'Dashboard mit Live-Statistiken'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Receive agent proposals' : 'Makler-Vorschläge erhalten'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Inbox & messaging' : 'Posteingang & Nachrichten'}</li>
              <li className="flex items-start gap-2"><X size={15} className="text-[#CBD5E1] mt-0.5 flex-shrink-0" /> {isEN ? 'Viewing calendar' : 'Besichtigungskalender'}</li>
              <li className="flex items-start gap-2"><X size={15} className="text-[#CBD5E1] mt-0.5 flex-shrink-0" /> {isEN ? 'AI listing description' : 'KI-Beschreibung'}</li>
            </ul>
          </div>

          {/* Pro tier */}
          <div className="rounded-xl border border-[#E2E4EB] p-6 bg-[#FAFBFC]">
            <h3 className="text-lg font-bold text-[#0F1117] mb-1">Professional</h3>
            <p className="text-3xl font-extrabold text-[#0F1117] mb-4">£99<span className="text-sm font-normal text-[#5E6278]"> {isEN ? 'one-off' : 'einmalig'}</span></p>
            <ul className="space-y-2.5 text-sm text-[#5E6278]">
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Everything in Starter' : 'Alles aus Starter'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Viewing calendar & auto-booking' : 'Besichtigungskalender & Auto-Buchung'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'AI-written listing description' : 'KI-geschriebene Beschreibung'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Comparable sales data' : 'Vergleichbare Verkaufsdaten'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Priority portal placement' : 'Prioritätsplatzierung auf Portalen'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Document storage & sharing' : 'Dokumentenspeicher & Sharing'}</li>
            </ul>
          </div>

          {/* Concierge tier */}
          <div className="rounded-xl border border-[#E2E4EB] p-6 bg-[#FAFBFC]">
            <h3 className="text-lg font-bold text-[#0F1117] mb-1">Concierge</h3>
            <p className="text-3xl font-extrabold text-[#0F1117] mb-4">£499<span className="text-sm font-normal text-[#5E6278]"> {isEN ? 'one-off' : 'einmalig'}</span></p>
            <ul className="space-y-2.5 text-sm text-[#5E6278]">
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Everything in Professional' : 'Alles aus Professional'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Professional photography' : 'Professionelle Fotografie'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Floor plan' : 'Grundriss'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'EPC arrangement' : 'Energieausweis-Organisation'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Dedicated sale coordinator' : 'Dedizierter Verkaufskoordinator'}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {isEN ? 'Solicitor introductions' : 'Anwaltsempfehlungen'}</li>
            </ul>
          </div>
        </div>

        <p className="text-xs text-[#5E6278] mt-6 text-center">
          {isEN
            ? 'All plans: zero commission on your sale. The price you agree with your buyer is the price you keep.'
            : 'Alle Pläne: null Provision auf Ihren Verkauf. Der vereinbarte Preis gehört Ihnen.'}
        </p>
      </div>

      {/* Free advertising callout */}
      <div className="bg-[#0F1117] rounded-2xl p-8 mb-8">
        <div className="flex items-start gap-5">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Megaphone size={22} className="text-brand" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">
              {isEN ? 'You don\'t need to pay thousands for portal listings' : 'Sie müssen nicht Tausende für Portal-Anzeigen zahlen'}
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              {isEN
                ? 'Agents pay Rightmove and Zoopla thousands per month — then pass that cost to you through commission. With Yalla.House, your property appears on all the same portals plus free channels like OpenRent, Gumtree, and Facebook Marketplace. Same exposure, zero cost. The portals don\'t want you to know you can do this yourself, but you can.'
                : 'Makler zahlen Rightmove und Zoopla Tausende pro Monat — und geben diese Kosten über Provisionen an Sie weiter. Mit Yalla.House erscheint Ihre Immobilie auf denselben Portalen plus kostenlosen Kanälen. Gleiche Reichweite, null Kosten.'}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand/5 border border-brand/20 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-[#0F1117] mb-3">
          {isEN ? 'List your property for free' : 'Inserieren Sie kostenlos'}
        </h2>
        <p className="text-sm text-[#5E6278] mb-6 max-w-lg mx-auto">
          {isEN
            ? 'Create your listing in 5 minutes. No credit card, no commission, no contracts.'
            : 'Inserat in 5 Minuten erstellen. Keine Kreditkarte, keine Provision, keine Verträge.'}
        </p>
        <Link
          href="/owner/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white font-semibold rounded-lg transition-colors"
        >
          {isEN ? 'Create listing' : 'Inserat erstellen'} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
