import { getTranslations } from 'next-intl/server'
import { Check, Home, BarChart3, Shield, Users, Zap, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default async function OwnerInfoPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEN = locale === 'en'

  const benefits = [
    {
      icon: <Home size={24} className="text-brand" />,
      title: isEN ? 'List your property' : 'Immobilie inserieren',
      desc: isEN
        ? 'Create your listing in minutes. Add photos, set your price, and publish to major portals automatically.'
        : 'Erstellen Sie Ihr Inserat in Minuten. Fotos hinzufügen, Preis festlegen und automatisch veröffentlichen.',
    },
    {
      icon: <Users size={24} className="text-brand" />,
      title: isEN ? 'Receive agent proposals' : 'Makler-Vorschläge erhalten',
      desc: isEN
        ? 'Local agents see your listing and send proposals with their commission rates and services. You compare and choose.'
        : 'Lokale Makler sehen Ihr Inserat und senden Vorschläge. Sie vergleichen und wählen.',
    },
    {
      icon: <BarChart3 size={24} className="text-brand" />,
      title: isEN ? 'Track everything' : 'Alles verfolgen',
      desc: isEN
        ? 'Real-time dashboard with viewings, inquiries, offers, and agent activity. No more chasing your agent for updates.'
        : 'Echtzeit-Dashboard mit Besichtigungen, Anfragen, Angeboten und Makler-Aktivität.',
    },
    {
      icon: <MessageCircle size={24} className="text-brand" />,
      title: isEN ? 'Centralised inbox' : 'Zentraler Posteingang',
      desc: isEN
        ? 'All messages from buyers, agents, and service providers in one place. No more scattered emails and phone calls.'
        : 'Alle Nachrichten an einem Ort. Keine verstreuten E-Mails und Anrufe mehr.',
    },
    {
      icon: <Shield size={24} className="text-brand" />,
      title: isEN ? 'You stay in control' : 'Sie behalten die Kontrolle',
      desc: isEN
        ? 'Choose how much help you want — go solo, use an agent for specific tasks, or get full-service support.'
        : 'Wählen Sie, wie viel Hilfe Sie möchten — allein, mit Makler für bestimmte Aufgaben, oder Full-Service.',
    },
    {
      icon: <Zap size={24} className="text-brand" />,
      title: isEN ? 'Smart booking shortcut' : 'Smart Booking Shortcut',
      desc: isEN
        ? 'Buyers can book viewings directly through your listing page. You approve slots and manage your calendar.'
        : 'Käufer können Besichtigungen direkt über Ihre Inserat-Seite buchen.',
    },
  ]

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F1117] mb-2">
          {isEN ? 'Why list with Yalla.House' : 'Warum mit Yalla.House inserieren'}
        </h1>
        <p className="text-[#5E6278]">
          {isEN
            ? 'Everything you need to sell your property — with full visibility and control over the process.'
            : 'Alles, was Sie für den Verkauf brauchen — mit voller Transparenz und Kontrolle.'}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-10">
        {benefits.map((b, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
            <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
              {b.icon}
            </div>
            <h3 className="font-bold text-[#0F1117] mb-2">{b.title}</h3>
            <p className="text-sm text-[#5E6278] leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-brand/5 border border-brand/20 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-[#0F1117] mb-3">
          {isEN ? 'Ready to list?' : 'Bereit zum Inserieren?'}
        </h2>
        <p className="text-sm text-[#5E6278] mb-6">
          {isEN
            ? 'Create your first listing and start receiving inquiries today.'
            : 'Erstellen Sie Ihr erstes Inserat und erhalten Sie heute noch Anfragen.'}
        </p>
        <Link
          href="/owner/new"
          className="inline-block px-6 py-3 bg-brand hover:bg-brand-hover text-white font-semibold rounded-lg transition-colors"
        >
          {isEN ? 'Create listing' : 'Inserat erstellen'}
        </Link>
      </div>
    </div>
  )
}
