import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="bg-[#0d0d0d] border-t border-white/10 px-4 pt-12 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="font-extrabold text-lg text-white tracking-tight mb-2">Yalla.House</div>
            <div className="text-sm text-white/40 mb-3">Klüger verkaufen — mit oder ohne Makler.</div>
            <div className="text-xs text-white/30">Yalla.House GmbH<br />Registriert in Deutschland.</div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Richtlinien</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><Link href="/datenschutz" className="hover:text-white transition-colors">Datenschutzrichtlinie</Link></li>
              <li><Link href="/nutzungsbedingungen" className="hover:text-white transition-colors">Nutzungsbedingungen</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie-Richtlinie</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Rechtliches &amp; Compliance</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><Link href="/dsgvo" className="hover:text-white transition-colors">DSGVO &amp; Datensicherheit</Link></li>
              <li><Link href="/sicherheit" className="hover:text-white transition-colors">Sicherheit &amp; Datenschutz</Link></li>
              <li><Link href="/impressum" className="hover:text-white transition-colors">Impressum</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Kontakt</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><a href="mailto:support@yalla.house" className="hover:text-white transition-colors">Support</a></li>
              <li><a href="https://wa.me/4915000000000" target="_blank" rel="noopener" className="hover:text-white transition-colors">WhatsApp</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-white/30">
          <span>&copy; 2025 Yalla.House GmbH. Alle Rechte vorbehalten.</span>
          <span>Auf ImmobilienScout24 &middot; Immowelt &middot; ImmoNet gelistet</span>
        </div>
      </div>
    </footer>
  )
}
