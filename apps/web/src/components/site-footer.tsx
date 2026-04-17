import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Home } from 'lucide-react'

export async function SiteFooter() {
  const t = await getTranslations('footer')

  return (
    <footer
      aria-label="Footer navigation"
      className="bg-page-dark px-8 pt-12 pb-6"
      style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand column */}
          <div>
            <Link href="/" className="font-bold text-xl text-brand hover:text-brand block mb-2 flex items-center gap-1">
              <Home size={20} /> Yalla.House
            </Link>
            <div className="text-sm text-text-on-dark-secondary mb-3">
              {t('tagline')}
            </div>
          </div>

          {/* For you */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-on-dark-muted mb-4">{t('forYou')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/owner"
                  className="text-white hover:text-brand-hover transition-[color] duration-[400ms]"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.44, 0, 0.56, 1)' }}
                >
                  {t('forOwners')}
                </Link>
              </li>
              <li>
                <Link
                  href="/hunter"
                  className="text-white hover:text-brand-hover transition-[color] duration-[400ms]"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.44, 0, 0.56, 1)' }}
                >
                  {t('forHunters')}
                </Link>
              </li>
              <li>
                <Link
                  href="/agent"
                  className="text-white hover:text-brand-hover transition-[color] duration-[400ms]"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.44, 0, 0.56, 1)' }}
                >
                  {t('forAgents')}
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace"
                  className="text-white hover:text-brand-hover transition-[color] duration-[400ms]"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.44, 0, 0.56, 1)' }}
                >
                  {t('marketplace')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-on-dark-muted mb-4">{t('company')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-white hover:text-brand-hover transition-[color] duration-[400ms]"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.44, 0, 0.56, 1)' }}
                >
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="text-white hover:text-brand-hover transition-[color] duration-[400ms]"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.44, 0, 0.56, 1)' }}
                >
                  {t('services')}
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-white hover:text-brand-hover transition-[color] duration-[400ms]"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.44, 0, 0.56, 1)' }}
                >
                  {t('faq')}
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@yalla.house"
                  className="text-white hover:text-brand-hover transition-[color] duration-[400ms]"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.44, 0, 0.56, 1)' }}
                >
                  {t('contact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-text-on-dark-muted mb-4">{t('legal')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/privacy"
                  className="text-text-on-dark-muted hover:text-white transition-[color] duration-[400ms]"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.44, 0, 0.56, 1)' }}
                >
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-text-on-dark-muted hover:text-white transition-[color] duration-[400ms]"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.44, 0, 0.56, 1)' }}
                >
                  {t('termsOfService')}
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-text-on-dark-muted hover:text-white transition-[color] duration-[400ms]"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.44, 0, 0.56, 1)' }}
                >
                  {t('cookiePolicy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-text-on-dark-muted"
          style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}
        >
          <span>{t('allRightsReserved', { year: new Date().getFullYear().toString() })}</span>
          <span>{t('location')}</span>
        </div>
      </div>
    </footer>
  )
}
