import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal' })

  return {
    title: t('termsTitle') + ' | Yalla.House',
    description: t('termsDescription'),
  }
}

export default async function TermsOfServicePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations('legal')

  return (
    <main className="bg-bg">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-brand mb-4">
            {t('termsEyebrow')}
          </div>
          <h1 className="text-[clamp(2.25rem,5.5vw,3.875rem)] font-extrabold tracking-tight text-text-primary leading-[1.1] mb-4">
            {t('termsHeading')}
          </h1>
          <p className="text-base text-text-muted">
            {t('lastUpdated')}: 17 April 2026
          </p>
        </div>
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* 1. About These Terms */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('termsAboutTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>{t('termsAboutBody1')}</p>
              <p>{t('termsAboutBody2')}</p>
            </div>
          </div>

          {/* 2. Registration & Account */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('termsAccountTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>{t('termsAccountBody')}</p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-brand font-bold">•</span>
                  <span>{t('termsAccountAge')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand font-bold">•</span>
                  <span>{t('termsAccountAccurate')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand font-bold">•</span>
                  <span>{t('termsAccountSecure')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand font-bold">•</span>
                  <span>{t('termsAccountOnePerPerson')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 3. Services */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('termsServicesTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>{t('termsServicesBody')}</p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-brand font-bold">•</span>
                  <span>{t('termsServicesDashboard')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand font-bold">•</span>
                  <span>{t('termsServicesSyndication')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand font-bold">•</span>
                  <span>{t('termsServicesAgentMatch')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand font-bold">•</span>
                  <span>{t('termsServicesHunter')}</span>
                </li>
              </ul>
              <p>{t('termsServicesNoGuarantee')}</p>
            </div>
          </div>

          {/* 4. Pricing */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('termsPricingTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>{t('termsPricingBody')}</p>
              <p>{t('termsPricingFlatFee')}</p>
              <p>{t('termsPricingVAT')}</p>
            </div>
          </div>

          {/* 5. Payment */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('termsPaymentTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>{t('termsPaymentBody')}</p>
              <p>{t('termsPaymentStripe')}</p>
              <p>{t('termsPaymentRefund')}</p>
            </div>
          </div>

          {/* 6. User Obligations */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('termsObligationsTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>{t('termsObligationsBody')}</p>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-brand font-bold">•</span>
                  <span>{t('termsObligationsNoFraud')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand font-bold">•</span>
                  <span>{t('termsObligationsNoFake')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand font-bold">•</span>
                  <span>{t('termsObligationsNoDiscrimination')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand font-bold">•</span>
                  <span>{t('termsObligationsComply')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-brand font-bold">•</span>
                  <span>{t('termsObligationsAccurate')}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 7. Limitation of Liability */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('termsLiabilityTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>{t('termsLiabilityBody1')}</p>
              <p>{t('termsLiabilityBody2')}</p>
              <p>{t('termsLiabilityBody3')}</p>
            </div>
          </div>

          {/* 8. Termination */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('termsTerminationTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>{t('termsTerminationBody1')}</p>
              <p>{t('termsTerminationBody2')}</p>
              <p>{t('termsTerminationBody3')}</p>
            </div>
          </div>

          {/* 9. Governing Law */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('termsGoverningLawTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>{t('termsGoverningLawBody1')}</p>
              <p>{t('termsGoverningLawBody2')}</p>
            </div>
          </div>

          {/* 10. Changes to Terms */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('termsChangesTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>{t('termsChangesBody1')}</p>
              <p>{t('termsChangesBody2')}</p>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('termsContactTitle')}
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p>{t('termsContactBody')}</p>
              <div className="bg-[#F5F5F5] rounded-lg p-4">
                <p><strong>{t('emailLabel')}:</strong> support@yalla.house</p>
                <p><strong>{t('legalEmailLabel')}:</strong> legal@yalla.house</p>
                <p><strong>{t('addressLabel')}:</strong> {t('dataControllerAddress')}</p>
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
