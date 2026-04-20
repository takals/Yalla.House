import {
  Calendar, MessageSquare, ShieldCheck, RefreshCw, Clock, Megaphone,
  ArrowRight, Check, X, Users, Briefcase, Palette,
} from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function AgentInfoPage() {
  const t = await getTranslations('agentInfo')

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-text-primary">
          {t('pageTitle')}
        </h1>
      </div>

      {/* Hero intro */}
      <div className="bg-white rounded-2xl border border-border-default p-8 mb-8">
        <h2 className="text-xl font-bold text-text-primary mb-3">
          {t('heroTitle')}
        </h2>
        <p className="text-text-secondary leading-relaxed max-w-3xl">
          {t('heroBody')}
        </p>
      </div>

      {/* Benefits grid — outcome-focused */}
      <div className="grid md:grid-cols-2 gap-5 mb-8">

        {/* 1: Calendar */}
        <div className="bg-white rounded-2xl border border-border-default p-6">
          <div className="w-11 h-11 rounded-xl bg-[#34C759]/10 flex items-center justify-center mb-4">
            <Calendar size={22} className="text-[#34C759]" />
          </div>
          <h3 className="font-bold text-text-primary mb-2">
            {t('benefit1Title')}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t('benefit1Body')}
          </p>
        </div>

        {/* 2: All comms in one place */}
        <div className="bg-white rounded-2xl border border-border-default p-6">
          <div className="w-11 h-11 rounded-xl bg-[#34C759]/10 flex items-center justify-center mb-4">
            <MessageSquare size={22} className="text-[#34C759]" />
          </div>
          <h3 className="font-bold text-text-primary mb-2">
            {t('benefit2Title')}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t('benefit2Body')}
          </p>
        </div>

        {/* 3: Verified hunters */}
        <div className="bg-white rounded-2xl border border-border-default p-6">
          <div className="w-11 h-11 rounded-xl bg-[#34C759]/10 flex items-center justify-center mb-4">
            <ShieldCheck size={22} className="text-[#34C759]" />
          </div>
          <h3 className="font-bold text-text-primary mb-2">
            {t('benefit3Title')}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t('benefit3Body')}
          </p>
        </div>

        {/* 4: CRM sync */}
        <div className="bg-white rounded-2xl border border-border-default p-6">
          <div className="w-11 h-11 rounded-xl bg-[#34C759]/10 flex items-center justify-center mb-4">
            <RefreshCw size={22} className="text-[#34C759]" />
          </div>
          <h3 className="font-bold text-text-primary mb-2">
            {t('benefit4Title')}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t('benefit4Body')}
          </p>
        </div>

        {/* 5: Save time */}
        <div className="bg-white rounded-2xl border border-border-default p-6">
          <div className="w-11 h-11 rounded-xl bg-[#34C759]/10 flex items-center justify-center mb-4">
            <Clock size={22} className="text-[#34C759]" />
          </div>
          <h3 className="font-bold text-text-primary mb-2">
            {t('benefit5Title')}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t('benefit5Body')}
          </p>
        </div>

        {/* 6: Your branding */}
        <div className="bg-white rounded-2xl border border-border-default p-6">
          <div className="w-11 h-11 rounded-xl bg-[#34C759]/10 flex items-center justify-center mb-4">
            <Palette size={22} className="text-[#34C759]" />
          </div>
          <h3 className="font-bold text-text-primary mb-2">
            {t('benefit6Title')}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {t('benefit6Body')}
          </p>
        </div>
      </div>

      {/* How qualified leads reach you */}
      <div className="bg-white rounded-2xl border border-border-default p-8 mb-8">
        <h2 className="text-lg font-bold text-text-primary mb-6">
          {t('howClientsTitle')}
        </h2>
        <div className="space-y-6">
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
          ].map(step => (
            <div key={step.num} className="flex gap-5">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#34C759] flex items-center justify-center text-white font-extrabold text-base">
                {step.num}
              </div>
              <div>
                <h3 className="font-bold text-text-primary mb-1">{step.title}</h3>
                <p className="text-sm text-text-secondary">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl border border-border-default p-8 mb-8">
        <h2 className="text-lg font-bold text-text-primary mb-2">
          {t('pricingTitle')}
        </h2>
        <p className="text-sm text-text-secondary mb-8">
          {t('pricingSubtitle')}
        </p>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Free tier */}
          <div className="rounded-xl border-2 border-[#34C759] p-6 relative">
            <span className="absolute -top-3 left-4 bg-[#34C759] text-white text-xs font-bold px-3 py-1 rounded-full">
              {t('starterBadge')}
            </span>
            <h3 className="text-lg font-bold text-text-primary mt-2 mb-1">{t('starterName')}</h3>
            <p className="text-3xl font-extrabold text-text-primary mb-4">{t('starterPrice')}<span className="text-sm font-normal text-text-secondary">{t('perMonth')}</span></p>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('starterFeature1')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('starterFeature2')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('starterFeature3')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('starterFeature4')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('starterFeature5')}</li>
              <li className="flex items-start gap-2"><X size={15} className="text-[#CBD5E1] mt-0.5 flex-shrink-0" /> {t('starterFeature6')}</li>
              <li className="flex items-start gap-2"><X size={15} className="text-[#CBD5E1] mt-0.5 flex-shrink-0" /> {t('starterFeature7')}</li>
            </ul>
          </div>

          {/* Pro tier */}
          <div className="rounded-xl border border-border-default p-6 bg-[#FAFBFC]">
            <h3 className="text-lg font-bold text-text-primary mb-1">{t('proName')}</h3>
            <p className="text-3xl font-extrabold text-text-primary mb-4">{t('proPrice')}<span className="text-sm font-normal text-text-secondary">{t('perMonth')}</span></p>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('proFeature1')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('proFeature2')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('proFeature3')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('proFeature4')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('proFeature5')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('proFeature6')}</li>
            </ul>
          </div>

          {/* Agency tier */}
          <div className="rounded-xl border border-border-default p-6 bg-[#FAFBFC]">
            <h3 className="text-lg font-bold text-text-primary mb-1">{t('agencyName')}</h3>
            <p className="text-3xl font-extrabold text-text-primary mb-4">{t('agencyPrice')}<span className="text-sm font-normal text-text-secondary">{t('perMonth')}</span></p>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('agencyFeature1')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('agencyFeature2')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('agencyFeature3')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('agencyFeature4')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('agencyFeature5')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('agencyFeature6')}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* The gatekeeper line */}
      <div className="bg-[#0F1117] rounded-2xl p-8 mb-8">
        <div className="flex items-start gap-5">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Megaphone size={22} className="text-brand" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">
              {t('freeAdTitle')}
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              {t('freeAdBody')}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#34C759]/5 border border-[#34C759]/20 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-text-primary mb-3">
          {t('ctaTitle')}
        </h2>
        <p className="text-sm text-text-secondary mb-6 max-w-lg mx-auto">
          {t('ctaBody')}
        </p>
        <Link
          href="/agent/profile"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#34C759] hover:bg-[#2BA84A] text-white font-semibold rounded-lg transition-colors"
        >
          {t('ctaButton')} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
