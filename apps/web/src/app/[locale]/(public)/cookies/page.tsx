import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal' })

  return {
    title: t('cookieMetaTitle'),
    description: t('cookieMetaDesc'),
  }
}

export default async function CookiePolicyPage() {
  const t = await getTranslations('legal')

  return (
    <main className="bg-bg">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-brand mb-4">
            {t('cookieEyebrow')}
          </div>
          <h1 className="text-[clamp(2.25rem,5.5vw,3.875rem)] font-extrabold tracking-tight text-text-primary leading-[1.1] mb-4">
            {t('cookieHeading')}
          </h1>
          <p className="text-base text-text-muted">
            {t('cookieLastUpdated')}
          </p>
        </div>
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* What are cookies */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('cookieWhatTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>{t('cookieWhatBody1')}</p>
              <p>{t('cookieWhatBody2')}</p>
            </div>
          </div>

          {/* Strictly necessary cookies */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('cookieNecessaryTitle')}
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p>{t('cookieNecessaryIntro')}</p>
              <div className="bg-brand-solid-bg border border-brand rounded-lg p-4 space-y-3">
                <div>
                  <p><strong>{t('cookieNecessarySession')}</strong></p>
                  <p className="text-sm">{t('cookieNecessarySessionDesc')}</p>
                </div>
                <div>
                  <p><strong>{t('cookieNecessaryAuth')}</strong></p>
                  <p className="text-sm">{t('cookieNecessaryAuthDesc')}</p>
                </div>
                <div>
                  <p><strong>{t('cookieNecessaryCsrf')}</strong></p>
                  <p className="text-sm">{t('cookieNecessaryCsrfDesc')}</p>
                </div>
                <div>
                  <p><strong>{t('cookieNecessaryPref')}</strong></p>
                  <p className="text-sm">{t('cookieNecessaryPrefDesc')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics cookies */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('cookieAnalyticsTitle')}
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p>{t('cookieAnalyticsIntro')}</p>
              <div className="space-y-3">
                <div>
                  <p><strong>{t('cookieAnalyticsUsage')}</strong></p>
                  <p className="text-sm">{t('cookieAnalyticsUsageDesc')}</p>
                </div>
                <div>
                  <p><strong>{t('cookieAnalyticsFeature')}</strong></p>
                  <p className="text-sm">{t('cookieAnalyticsFeatureDesc')}</p>
                </div>
                <div>
                  <p><strong>{t('cookieAnalyticsError')}</strong></p>
                  <p className="text-sm">{t('cookieAnalyticsErrorDesc')}</p>
                </div>
              </div>
              <p className="text-sm italic">
                {t('cookieAnalyticsOptional')}
              </p>
            </div>
          </div>

          {/* Marketing cookies */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('cookieMarketingTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p><strong>{t('cookieMarketingBody1')}</strong></p>
              <p>{t('cookieMarketingBody2')}</p>
            </div>
          </div>

          {/* How to manage cookies */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('cookieManageTitle')}
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('cookieManageBanner')}</h3>
                <p>{t('cookieManageBannerDesc')}</p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('cookieManageBrowser')}</h3>
                <p>{t('cookieManageBrowserDesc')}</p>
                <ul className="list-disc list-inside ml-2 mt-2 space-y-1">
                  <li><strong>Chrome:</strong> {t('cookieManageChrome').replace('Chrome: ', '')}</li>
                  <li><strong>Firefox:</strong> {t('cookieManageFirefox').replace('Firefox: ', '')}</li>
                  <li><strong>Safari:</strong> {t('cookieManageSafari').replace('Safari: ', '')}</li>
                  <li><strong>Edge:</strong> {t('cookieManageEdge').replace('Edge: ', '')}</li>
                </ul>
              </div>
              <div className="bg-brand-solid-bg border border-brand rounded-lg p-4">
                <p className="text-sm">{t('cookieManageWarning')}</p>
              </div>
            </div>
          </div>

          {/* Do Not Track */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('cookieDntTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>{t('cookieDntBody')}</p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('cookieContactTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>{t('cookieContactBody')}</p>
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <p><strong>{t('cookieContactEmail')}</strong></p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── BACK LINK ────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 border-t border-border-default">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-brand font-semibold hover:text-brand-hover transition-colors"
          >
            {t('cookieBackLink')}
          </Link>
        </div>
      </section>
    </main>
  )
}
