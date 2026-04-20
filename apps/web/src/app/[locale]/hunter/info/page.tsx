import {
  ShieldCheck, Search, Users, MessageSquare, MapPin, Zap, ArrowRight,
  Eye, Handshake, Check, X, BadgeCheck, Home, Heart, Bell,
} from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function HunterInfoPage() {
  const t = await getTranslations('hunterInfo')

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">
          {t('pageTitle')}
        </h1>
      </div>

      {/* Hero — outcome-focused */}
      <div className="bg-white rounded-2xl border border-border-default p-8">
        <h2 className="text-xl font-bold text-text-primary mb-3">
          {t('heroTitle')}
        </h2>
        <p className="text-text-secondary leading-relaxed max-w-3xl">
          {t('heroBody')}
        </p>
      </div>

      {/* Home Passport = the centre */}
      <div className="bg-[#5856D6]/5 border border-[#5856D6]/20 rounded-2xl p-8">
        <div className="flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-[#5856D6]/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={24} className="text-[#5856D6]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary mb-2">
              {t('passportTitle')}
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              {t('passportBody')}
            </p>
            <Link href="/hunter/passport" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5856D6] hover:gap-2.5 transition-all">
              {t('passportCta')} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits grid */}
      <div className="grid md:grid-cols-2 gap-5">

        {/* Agents come to you */}
        <div className="bg-white rounded-2xl border border-border-default p-6">
          <div className="w-11 h-11 rounded-xl bg-[#5856D6]/10 flex items-center justify-center mb-4">
            <Users size={22} className="text-[#5856D6]" />
          </div>
          <h3 className="font-bold text-text-primary mb-2">
            {t('benefit1Title')}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t('benefit1Body')}
          </p>
        </div>

        {/* Property search */}
        <div className="bg-white rounded-2xl border border-border-default p-6">
          <div className="w-11 h-11 rounded-xl bg-[#5856D6]/10 flex items-center justify-center mb-4">
            <Search size={22} className="text-[#5856D6]" />
          </div>
          <h3 className="font-bold text-text-primary mb-2">
            {t('benefit2Title')}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t('benefit2Body')}
          </p>
        </div>

        {/* 17K agents */}
        <div className="bg-white rounded-2xl border border-border-default p-6">
          <div className="w-11 h-11 rounded-xl bg-[#5856D6]/10 flex items-center justify-center mb-4">
            <MapPin size={22} className="text-[#5856D6]" />
          </div>
          <h3 className="font-bold text-text-primary mb-2">
            {t('benefit3Title')}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t('benefit3Body')}
          </p>
        </div>

        {/* One inbox */}
        <div className="bg-white rounded-2xl border border-border-default p-6">
          <div className="w-11 h-11 rounded-xl bg-[#5856D6]/10 flex items-center justify-center mb-4">
            <MessageSquare size={22} className="text-[#5856D6]" />
          </div>
          <h3 className="font-bold text-text-primary mb-2">
            {t('benefit4Title')}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t('benefit4Body')}
          </p>
        </div>

        {/* Special requirements */}
        <div className="bg-white rounded-2xl border border-border-default p-6">
          <div className="w-11 h-11 rounded-xl bg-[#5856D6]/10 flex items-center justify-center mb-4">
            <Heart size={22} className="text-[#5856D6]" />
          </div>
          <h3 className="font-bold text-text-primary mb-2">
            {t('benefit5Title')}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t('benefit5Body')}
          </p>
        </div>

        {/* Free */}
        <div className="bg-white rounded-2xl border border-border-default p-6">
          <div className="w-11 h-11 rounded-xl bg-[#5856D6]/10 flex items-center justify-center mb-4">
            <Zap size={22} className="text-[#5856D6]" />
          </div>
          <h3 className="font-bold text-text-primary mb-2">
            {t('benefit6Title')}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t('benefit6Body')}
          </p>
        </div>
      </div>

      {/* Readiness badges */}
      <div className="bg-white rounded-2xl border border-border-default p-8">
        <h2 className="text-lg font-bold text-text-primary mb-2">
          {t('readinessTitle')}
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          {t('readinessSubtitle')}
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <BadgeCheck size={20} className="text-[#5856D6]" />,
              label: t('badgeLabel1'),
              desc: t('badgeDesc1'),
            },
            {
              icon: <ShieldCheck size={20} className="text-[#34C759]" />,
              label: t('badgeLabel2'),
              desc: t('badgeDesc2'),
            },
            {
              icon: <Home size={20} className="text-brand" />,
              label: t('badgeLabel3'),
              desc: t('badgeDesc3'),
            },
            {
              icon: <Check size={20} className="text-[#FF9500]" />,
              label: t('badgeLabel4'),
              desc: t('badgeDesc4'),
            },
          ].map((badge, i) => (
            <div key={i} className="bg-hover-bg rounded-xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-border-default">
                {badge.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{badge.label}</p>
                <p className="text-xs text-text-secondary">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-text-secondary mt-4">
          {t('readinessNote')}
        </p>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl border border-border-default p-8">
        <h2 className="text-lg font-bold text-text-primary mb-2">
          {t('pricingTitle')}
        </h2>
        <p className="text-sm text-text-secondary mb-8">
          {t('pricingSubtitle')}
        </p>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Free */}
          <div className="rounded-xl border-2 border-[#5856D6] p-6 relative">
            <span className="absolute -top-3 left-4 bg-[#5856D6] text-white text-xs font-bold px-3 py-1 rounded-full">
              {t('freeTierBadge')}
            </span>
            <h3 className="text-lg font-bold text-text-primary mt-2 mb-1">{t('freeTierName')}</h3>
            <p className="text-3xl font-extrabold text-text-primary mb-4">{t('freeTierPrice')}</p>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('freeTierFeature1')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('freeTierFeature2')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('freeTierFeature3')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('freeTierFeature4')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('freeTierFeature5')}</li>
              <li className="flex items-start gap-2"><X size={15} className="text-[#CBD5E1] mt-0.5 flex-shrink-0" /> {t('freeTierExclude1')}</li>
              <li className="flex items-start gap-2"><X size={15} className="text-[#CBD5E1] mt-0.5 flex-shrink-0" /> {t('freeTierExclude2')}</li>
            </ul>
          </div>

          {/* Pro */}
          <div className="rounded-xl border border-border-default p-6 bg-[#FAFBFC]">
            <h3 className="text-lg font-bold text-text-primary mb-1">{t('proTierName')}</h3>
            <p className="text-3xl font-extrabold text-text-primary mb-1">{t('proTierPrice')}<span className="text-sm font-normal text-text-secondary">{t('proTierPricePeriod')}</span></p>
            <p className="text-xs text-text-secondary mb-4">{t('proTierSubtitle')}</p>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('proTierFeature1')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('proTierFeature2')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('proTierFeature3')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('proTierFeature4')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('proTierFeature5')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('proTierFeature6')}</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-hover-bg rounded-xl p-5">
          <p className="text-sm text-text-secondary leading-relaxed">
            <span className="font-semibold text-text-primary">{t('comingSoonLabel')}:</span>{' '}
            {t('comingSoonBody')}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#5856D6]/5 border border-[#5856D6]/20 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-text-primary mb-3">
          {t('ctaTitle')}
        </h2>
        <p className="text-sm text-text-secondary mb-6 max-w-lg mx-auto">
          {t('ctaBody')}
        </p>
        <Link
          href="/hunter/passport"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#5856D6] hover:bg-[#4B49B8] text-white font-semibold rounded-lg transition-colors"
        >
          {t('ctaButton')} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
