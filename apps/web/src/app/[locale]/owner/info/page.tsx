import { getTranslations } from 'next-intl/server'
import { Check, Home, BarChart3, Shield, Users, Zap, MessageCircle, Eye, ArrowRight, Handshake, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function OwnerInfoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('ownerDash')
  const isEN = locale === 'en'

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-[#0F1117]">
          {isEN ? 'Owner Dashboard' : 'Eigentümer-Dashboard'}
        </h1>
      </div>

      {/* Sub-nav tabs */}
      <div className="flex gap-6 mb-8 border-b border-[#E2E4EB]">
        <Link href="/owner" className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors">
          {t('pageTitle')}
        </Link>
        <Link href="/owner/listings" className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors">
          {t('tabListings')}
        </Link>
        <Link href="/owner/inbox" className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors">
          {t('tabInquiries')}
        </Link>
        <Link href="/owner/info" className="text-sm font-semibold text-[#0F1117] pb-3 border-b-2 border-brand -mb-px">
          Info
        </Link>
      </div>

      {/* Intro */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8 mb-8">
        <h2 className="text-xl font-bold text-[#0F1117] mb-3">
          {isEN ? 'What Yalla.House does for property owners' : 'Was Yalla.House für Eigentümer tut'}
        </h2>
        <p className="text-[#5E6278] leading-relaxed max-w-3xl">
          {isEN
            ? 'Yalla.House is a platform that puts you in control of your property sale. Instead of handing everything to a single agent and hoping for the best, you get a dashboard where you can see exactly what\'s happening — every viewing, every inquiry, every agent proposal — and make decisions based on real information. You choose how much help you want: go fully solo, bring in an agent for specific tasks, or use our full-service option.'
            : 'Yalla.House ist eine Plattform, die Ihnen die Kontrolle über Ihren Immobilienverkauf gibt. Statt alles einem einzigen Makler zu überlassen, erhalten Sie ein Dashboard mit voller Transparenz — jede Besichtigung, jede Anfrage, jeder Makler-Vorschlag — und treffen Entscheidungen auf Basis echter Informationen.'}
        </p>
      </div>

      {/* Benefits grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {[
          {
            icon: <Home size={22} className="text-brand" />,
            title: isEN ? 'List in minutes' : 'In Minuten inserieren',
            desc: isEN
              ? 'Upload photos, set your price, write your description with AI help. Your listing goes live on major portals automatically — no manual syndication needed.'
              : 'Fotos hochladen, Preis setzen, Beschreibung mit KI-Hilfe verfassen. Ihr Inserat wird automatisch auf den großen Portalen veröffentlicht.',
          },
          {
            icon: <Handshake size={22} className="text-brand" />,
            title: isEN ? 'Agent proposals come to you' : 'Makler-Vorschläge kommen zu Ihnen',
            desc: isEN
              ? '17,000+ verified agents see your listing. Interested ones send proposals with their commission rates and what they\'ll do for you. You compare side-by-side and pick the best fit — or go it alone.'
              : 'Über 17.000 verifizierte Makler sehen Ihr Inserat. Interessierte senden Vorschläge mit Provisionsraten. Sie vergleichen und wählen den besten — oder machen es allein.',
          },
          {
            icon: <BarChart3 size={22} className="text-brand" />,
            title: isEN ? 'Real-time tracking' : 'Echtzeit-Tracking',
            desc: isEN
              ? 'Your dashboard shows live data: how many people viewed your listing, who requested viewings, which agents responded, and where offers stand. No more calling your agent for an update.'
              : 'Ihr Dashboard zeigt Live-Daten: Aufrufe, Besichtigungsanfragen, Makler-Antworten und Angebotsstand.',
          },
          {
            icon: <Calendar size={22} className="text-brand" />,
            title: isEN ? 'Viewing management' : 'Besichtigungsverwaltung',
            desc: isEN
              ? 'Set your availability slots. Buyers book directly through your listing page. You approve, reschedule, or decline — all from one calendar view. No phone tag.'
              : 'Verfügbarkeiten festlegen. Käufer buchen direkt. Sie genehmigen, verschieben oder lehnen ab — alles aus einer Kalenderansicht.',
          },
          {
            icon: <MessageCircle size={22} className="text-brand" />,
            title: isEN ? 'One inbox for everything' : 'Ein Posteingang für alles',
            desc: isEN
              ? 'Messages from buyers, agents, photographers, and solicitors all land in your Yalla inbox. Threaded conversations, no context lost, searchable history.'
              : 'Nachrichten von Käufern, Maklern, Fotografen und Notaren in einem Posteingang. Gesprächsverläufe, kein Kontext geht verloren.',
          },
          {
            icon: <Shield size={22} className="text-brand" />,
            title: isEN ? 'Your data, your terms' : 'Ihre Daten, Ihre Bedingungen',
            desc: isEN
              ? 'You own your listing data. No lock-in contracts. Pause or remove your listing at any time. If you bring in an agent, you can switch or remove them whenever you want.'
              : 'Sie besitzen Ihre Inserat-Daten. Keine Vertragsbindung. Pausieren oder entfernen Sie Ihr Inserat jederzeit.',
          },
        ].map((b, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
            <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
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
          {isEN ? 'How it works' : 'So funktioniert es'}
        </h2>
        <div className="space-y-6">
          {[
            { num: '1', title: isEN ? 'Create your listing' : 'Inserat erstellen', desc: isEN ? 'Add photos, property details, and your asking price. Our AI helps you write a compelling description.' : 'Fotos, Objektdetails und Ihren Preis hinzufügen.' },
            { num: '2', title: isEN ? 'Go live on portals' : 'Auf Portalen veröffentlichen', desc: isEN ? 'Your listing syndicates to Rightmove, Zoopla, and other major portals within 48 hours.' : 'Ihr Inserat erscheint innerhalb von 48 Stunden auf den großen Portalen.' },
            { num: '3', title: isEN ? 'Manage from your dashboard' : 'Über Ihr Dashboard verwalten', desc: isEN ? 'Track inquiries, schedule viewings, review agent proposals, and negotiate offers — all in one place.' : 'Anfragen verfolgen, Besichtigungen planen, Makler-Vorschläge prüfen — alles an einem Ort.' },
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

      {/* CTA */}
      <div className="bg-brand/5 border border-brand/20 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-[#0F1117] mb-3">
          {isEN ? 'Ready to list your property?' : 'Bereit zum Inserieren?'}
        </h2>
        <p className="text-sm text-[#5E6278] mb-6 max-w-lg mx-auto">
          {isEN
            ? 'Create your first listing and start receiving inquiries and agent proposals today.'
            : 'Erstellen Sie Ihr erstes Inserat und erhalten Sie heute noch Anfragen und Makler-Vorschläge.'}
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
