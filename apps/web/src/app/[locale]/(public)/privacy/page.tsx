import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal' })

  return {
    title: t('privacyTitle') + ' | Yalla.House',
    description: t('privacyDescription'),
  }
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('legal')

  return (
    <main className="bg-bg">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-brand mb-4">
            {t('privacyEyebrow')}
          </div>
          <h1 className="text-[clamp(2.25rem,5.5vw,3.875rem)] font-extrabold tracking-tight text-text-primary leading-[1.1] mb-4">
            {t('privacyHeading')}
          </h1>
          <p className="text-base text-text-muted">
            {t('lastUpdated')}: 17 April 2026
          </p>
        </div>
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* 1. Data Controller */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('dataControllerTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>{t('dataControllerBody')}</p>
              <p>
                <strong>{t('dataControllerCompany')}</strong><br />
                {t('dataControllerAddress')}<br />
                {t('dataControllerJurisdiction')}
              </p>
              <p>
                <strong>{t('emailLabel')}:</strong> support@yalla.house<br />
                <strong>{t('legalEmailLabel')}:</strong> legal@yalla.house
              </p>
            </div>
          </div>

          {/* 2. What Data We Collect */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('dataCollectedTitle')}
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('personalDataTitle')}</h3>
                <p>{t('personalDataBody')}</p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('listingDataTitle')}</h3>
                <p>{t('listingDataBody')}</p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('usageDataTitle')}</h3>
                <p>{t('usageDataBody')}</p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('cookiesDataTitle')}</h3>
                <p>{t('cookiesDataBody')}</p>
              </div>
            </div>
          </div>

          {/* 3. Purpose of Processing */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('processingPurposeTitle')}
            </h2>
            <ul className="space-y-3 text-text-muted leading-relaxed">
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>{t('purposeAccountLabel')}:</strong> {t('purposeAccountBody')}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>{t('purposeListingLabel')}:</strong> {t('purposeListingBody')}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>{t('purposeCommsLabel')}:</strong> {t('purposeCommsBody')}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>{t('purposePaymentLabel')}:</strong> {t('purposePaymentBody')}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>{t('purposeAnalyticsLabel')}:</strong> {t('purposeAnalyticsBody')}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>{t('purposeLegalLabel')}:</strong> {t('purposeLegalBody')}</span>
              </li>
            </ul>
          </div>

          {/* 4. Legal Basis */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('legalBasisTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>{t('legalBasisIntro')}</p>
              <ul className="space-y-2 ml-4">
                <li><strong>{t('legalBasisConsentLabel')}:</strong> {t('legalBasisConsentBody')}</li>
                <li><strong>{t('legalBasisContractLabel')}:</strong> {t('legalBasisContractBody')}</li>
                <li><strong>{t('legalBasisLegitimateLabel')}:</strong> {t('legalBasisLegitimateBody')}</li>
                <li><strong>{t('legalBasisObligationLabel')}:</strong> {t('legalBasisObligationBody')}</li>
              </ul>
            </div>
          </div>

          {/* 5. Data Sharing */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('dataSharingTitle')}
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p>{t('dataSharingIntro')}</p>
              <div className="bg-brand-solid-bg border border-brand rounded-lg p-4 space-y-2">
                <p><strong>Supabase (PostgreSQL Hosting):</strong> {t('dataSharingSupabase')}</p>
                <p><strong>Stripe ({t('paymentProcessing')}):</strong> {t('dataSharingStripe')}</p>
                <p><strong>Rightmove & Zoopla:</strong> {t('dataSharingPortals')}</p>
                <p><strong>Vercel (Hosting):</strong> {t('dataSharingVercel')}</p>
              </div>
              <p>{t('dataSharingNoSell')}</p>
            </div>
          </div>

          {/* 6. Your Rights */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('yourRightsTitle')}
            </h2>
            <p className="text-text-muted leading-relaxed mb-4">
              {t('yourRightsIntro')}
            </p>
            <ul className="space-y-3 text-text-muted leading-relaxed">
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>{t('rightAccessLabel')}:</strong> {t('rightAccessBody')}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>{t('rightRectificationLabel')}:</strong> {t('rightRectificationBody')}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>{t('rightErasureLabel')}:</strong> {t('rightErasureBody')}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>{t('rightRestrictionLabel')}:</strong> {t('rightRestrictionBody')}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>{t('rightPortabilityLabel')}:</strong> {t('rightPortabilityBody')}</span>
              </li>
              <li className="flex gap-3">
                <span className="text-brand font-bold">•</span>
                <span><strong>{t('rightObjectionLabel')}:</strong> {t('rightObjectionBody')}</span>
              </li>
            </ul>
            <p className="text-text-muted leading-relaxed mt-4">
              {t('rightExercise')} <strong>support@yalla.house</strong>
            </p>
          </div>

          {/* 7. International Transfers */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('internationalTransfersTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>{t('internationalTransfersBody1')}</p>
              <p>{t('internationalTransfersBody2')}</p>
            </div>
          </div>

          {/* 8. Data Retention */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('dataRetentionTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>{t('dataRetentionBody1')}</p>
              <p>{t('dataRetentionBody2')}</p>
            </div>
          </div>

          {/* 9. Contact & Complaints */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('contactComplaintsTitle')}
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p>{t('contactComplaintsIntro')}</p>
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <p><strong>{t('emailLabel')}:</strong> support@yalla.house</p>
                <p><strong>{t('legalEmailLabel')}:</strong> legal@yalla.house</p>
                <p><strong>{t('addressLabel')}:</strong> {t('dataControllerAddress')}</p>
              </div>
              <p>{t('contactComplaintsICO')}</p>
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <p><strong>Information Commissioner&apos;s Office (ICO)</strong></p>
                <p>Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF</p>
                <p>{t('websiteLabel')}: <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-brand hover:text-brand-hover transition-colors underline">ico.org.uk</a></p>
                <p>{t('phoneLabel')}: 0303 123 1113</p>
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
            &larr; {t('backToHome')}
          </Link>
        </div>
      </section>
    </main>
  )
}
