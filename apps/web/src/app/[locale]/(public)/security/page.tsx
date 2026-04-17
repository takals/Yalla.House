import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal' })

  return {
    title: t('securityMetaTitle'),
    description: t('securityMetaDesc'),
  }
}

export default async function SecurityPage() {
  const t = await getTranslations('legal')

  return (
    <main className="bg-bg">
      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest text-brand mb-4">
            {t('securityEyebrow')}
          </div>
          <h1 className="text-[clamp(2.25rem,5.5vw,3.875rem)] font-extrabold tracking-tight text-text-primary leading-[1.1] mb-4">
            {t('securityHeading')}
          </h1>
          <p className="text-base text-text-muted">
            {t('securityLastUpdated')}
          </p>
        </div>
      </section>

      {/* ── CONTENT ──────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* Security architecture */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('securityArchTitle')}
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p>{t('securityArchIntro')}</p>
              <ul className="space-y-2 ml-4">
                <li><strong>{t('securityArchNetwork')}</strong></li>
                <li><strong>{t('securityArchApp')}</strong></li>
                <li><strong>{t('securityArchData')}</strong></li>
                <li><strong>{t('securityArchPhysical')}</strong></li>
              </ul>
            </div>
          </div>

          {/* Encryption */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('securityEncTitle')}
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('securityEncTlsTitle')}</h3>
                <p>{t('securityEncTlsBody')}</p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('securityEncAesTitle')}</h3>
                <p>{t('securityEncAesBody')}</p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('securityEncPassTitle')}</h3>
                <p>{t('securityEncPassBody')}</p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('securityEncTokenTitle')}</h3>
                <p>{t('securityEncTokenBody')}</p>
              </div>
            </div>
          </div>

          {/* Access controls */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('securityAccessTitle')}
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('securityAccessRbacTitle')}</h3>
                <p>{t('securityAccessRbacBody')}</p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('securityAccessMfaTitle')}</h3>
                <p>{t('securityAccessMfaBody')}</p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('securityAccessAuditTitle')}</h3>
                <p>{t('securityAccessAuditBody')}</p>
              </div>
            </div>
          </div>

          {/* Infrastructure */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('securityInfraTitle')}
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('securityInfraHostTitle')}</h3>
                <p>{t('securityInfraHostBody')}</p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('securityInfraCdnTitle')}</h3>
                <p>{t('securityInfraCdnBody')}</p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('securityInfraDdosTitle')}</h3>
                <p>{t('securityInfraDdosBody')}</p>
              </div>
            </div>
          </div>

          {/* Regular testing */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('securityTestTitle')}
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('securityTestDepsTitle')}</h3>
                <p>{t('securityTestDepsBody')}</p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('securityTestCodeTitle')}</h3>
                <p>{t('securityTestCodeBody')}</p>
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-2">{t('securityTestScanTitle')}</h3>
                <p>{t('securityTestScanBody')}</p>
              </div>
            </div>
          </div>

          {/* Responsible disclosure */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('securityDisclosureTitle')}
            </h2>
            <div className="space-y-4 text-text-muted leading-relaxed">
              <p>{t('securityDisclosureIntro')}</p>
              <div className="bg-[#DBEAFE] border border-[#BAE6FD] rounded-lg p-4">
                <p><strong>{t('securityDisclosureEmail')}</strong></p>
                <p className="text-sm mt-2">{t('securityDisclosureInclude')}</p>
                <ul className="list-disc list-inside text-sm ml-2 mt-2 space-y-1">
                  <li>{t('securityDisclosureItem1')}</li>
                  <li>{t('securityDisclosureItem2')}</li>
                  <li>{t('securityDisclosureItem3')}</li>
                  <li>{t('securityDisclosureItem4')}</li>
                </ul>
              </div>
              <p className="mt-4">{t('securityDisclosureResponse')}</p>
              <ul className="list-disc list-inside text-sm ml-2 space-y-1">
                <li>{t('securityDisclosureAck')}</li>
                <li>{t('securityDisclosureFix')}</li>
                <li>{t('securityDisclosureUpdate')}</li>
              </ul>
            </div>
          </div>

          {/* Bug bounty */}
          <div className="bg-white rounded-2xl border border-border-default p-8">
            <h2 className="text-[clamp(1.625rem,3vw,2.25rem)] font-extrabold tracking-tight text-text-primary mb-4">
              {t('securityBountyTitle')}
            </h2>
            <div className="space-y-3 text-text-muted leading-relaxed">
              <p>{t('securityBountyBody')}</p>
              <p className="text-sm italic">{t('securityBountyContact')}</p>
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
            {t('securityBackLink')}
          </Link>
        </div>
      </section>
    </main>
  )
}
