import Link from 'next/link'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import {
  Users, Briefcase, TrendingUp, Shield, ArrowRight,
  Check, Handshake, Building2, Camera, FileText, MapPin,
} from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'partners' })

  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  }
}

export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'partners' })

  return (
    <main className="bg-page-dark min-h-screen">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.8s ease-out both; }
        .fade-up-d1 { animation: fadeUp 0.8s ease-out 0.15s both; }
        .fade-up-d2 { animation: fadeUp 0.8s ease-out 0.3s both; }
      `}</style>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="pt-40 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/10 rounded-full mb-8">
            <Handshake size={16} className="text-brand" />
            <span className="text-xs font-bold text-brand uppercase tracking-wider">
              {t('badge')}
            </span>
          </div>
          <h1 className="fade-up text-display text-white">
            {t('heroTitle')}{' '}<span className="text-brand">Yalla.House</span>
          </h1>
          <p className="fade-up-d1 mt-6 text-lede text-text-on-dark-secondary max-w-2xl mx-auto">
            {t('heroSubtitle')}
          </p>
          <div className="fade-up-d2 mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login?next=/agent">
              <button className="px-8 py-4 bg-brand text-white font-semibold rounded-full hover:bg-brand-hover transition-all duration-300">
                {t('joinAsAgent')}
              </button>
            </Link>
            <Link href="/auth/login?next=/partner">
              <button className="px-8 py-4 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300">
                {t('joinAsProvider')}
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── PARTNER TYPES ──────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand mb-6 text-center">
            {t('whoCanPartner')}
          </p>
          <h2 className="text-title-1 text-white leading-tight text-center mb-16">
            {t('fourTracks')}
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Estate Agents */}
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-8 hover:border-brand/30 transition-colors">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <Building2 size={28} className="text-brand" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {t('estateAgents')}
                  </h3>
                  <p className="text-sm text-text-on-dark-secondary leading-relaxed mb-4">
                    {t('estateAgentsDesc')}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-text-on-dark-secondary">
                      <Check size={14} className="text-[#34C759] flex-shrink-0" />
                      {t('estateAgentsBullet1')}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-on-dark-secondary">
                      <Check size={14} className="text-[#34C759] flex-shrink-0" />
                      {t('estateAgentsBullet2')}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-on-dark-secondary">
                      <Check size={14} className="text-[#34C759] flex-shrink-0" />
                      {t('estateAgentsBullet3')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Photographers */}
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-8 hover:border-brand/30 transition-colors">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#5856D6]/10 flex items-center justify-center flex-shrink-0">
                  <Camera size={28} className="text-[#5856D6]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {t('photographers')}
                  </h3>
                  <p className="text-sm text-text-on-dark-secondary leading-relaxed mb-4">
                    {t('photographersDesc')}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-text-on-dark-secondary">
                      <Check size={14} className="text-[#34C759] flex-shrink-0" />
                      {t('photographersBullet1')}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-on-dark-secondary">
                      <Check size={14} className="text-[#34C759] flex-shrink-0" />
                      {t('photographersBullet2')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Conveyancers */}
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-8 hover:border-brand/30 transition-colors">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#FF9500]/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={28} className="text-[#FF9500]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {t('solicitors')}
                  </h3>
                  <p className="text-sm text-text-on-dark-secondary leading-relaxed mb-4">
                    {t('solicitorsDesc')}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-text-on-dark-secondary">
                      <Check size={14} className="text-[#34C759] flex-shrink-0" />
                      {t('solicitorsBullet1')}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-on-dark-secondary">
                      <Check size={14} className="text-[#34C759] flex-shrink-0" />
                      {t('solicitorsBullet2')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Referrers */}
            <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-8 hover:border-brand/30 transition-colors">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#34C759]/10 flex items-center justify-center flex-shrink-0">
                  <Users size={28} className="text-[#34C759]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    {t('referralPartners')}
                  </h3>
                  <p className="text-sm text-text-on-dark-secondary leading-relaxed mb-4">
                    {t('referralPartnersDesc')}
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-text-on-dark-secondary">
                      <Check size={14} className="text-[#34C759] flex-shrink-0" />
                      {t('referralPartnersBullet1')}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-text-on-dark-secondary">
                      <Check size={14} className="text-[#34C759] flex-shrink-0" />
                      {t('referralPartnersBullet2')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand mb-6 text-center">
            {t('howItWorksEyebrow')}
          </p>
          <h2 className="text-title-1 text-white leading-tight text-center mb-16">
            {t('howItWorksTitle')}
          </h2>

          <div className="space-y-8">
            {[
              {
                num: '1',
                title: t('step1Title'),
                desc: t('step1Desc'),
              },
              {
                num: '2',
                title: t('step2Title'),
                desc: t('step2Desc'),
              },
              {
                num: '3',
                title: t('step3Title'),
                desc: t('step3Desc'),
              },
            ].map((step) => (
              <div key={step.num} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-brand flex items-center justify-center text-white font-extrabold text-xl">
                  {step.num}
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-text-on-dark-secondary leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-surface-dark rounded-card-dark border border-white/[0.08] p-10">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-brand mb-2">17,000+</div>
                <p className="text-sm text-text-on-dark-secondary">
                  {t('statAgents')}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-brand mb-2">100+</div>
                <p className="text-sm text-text-on-dark-secondary">
                  {t('statAreas')}
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-brand mb-2">{'\u00a3'}0</div>
                <p className="text-sm text-text-on-dark-secondary">
                  {t('statCost')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #D4764E 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-title-1 text-white leading-tight mb-6">
            {t('ctaTitle')}
          </h2>
          <p className="text-lede text-white/50 mb-10 max-w-xl mx-auto">
            {t('ctaBody')}
          </p>
          <Link href="/auth/login?next=/agent">
            <button className="px-10 py-4 bg-brand text-white font-semibold rounded-full hover:bg-brand-hover transition-all duration-300 text-lg">
              {t('ctaButton')}
            </button>
          </Link>
        </div>
      </section>
    </main>
  )
}
