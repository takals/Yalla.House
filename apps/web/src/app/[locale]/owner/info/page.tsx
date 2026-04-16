import { getTranslations } from 'next-intl/server'
import {
  Home, BarChart3, Handshake, Calendar, MessageSquare,
  ArrowRight, Check, Megaphone, Shield,
} from 'lucide-react'
import Link from 'next/link'

export default async function OwnerInfoPage() {
  const t = await getTranslations('ownerInfo')
  const tDash = await getTranslations('ownerDash')

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-[#0F1117]">
          {t('pageTitle')}
        </h1>
      </div>

      {/* Sub-nav tabs */}
      <div className="flex gap-6 mb-8 border-b border-[#E2E4EB]">
        <Link href="/owner/info" className="text-sm font-semibold text-[#0F1117] pb-3 border-b-2 border-brand -mb-px">
          {t('tabInfo')}
        </Link>
        <Link href="/owner/overview" className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors">
          {tDash('pageTitle')}
        </Link>
        <Link href="/owner/listings" className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors">
          {tDash('tabListings')}
        </Link>
        <Link href="/owner/inbox" className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] pb-3 transition-colors">
          {tDash('tabInquiries')}
        </Link>
      </div>

      {/* Hero intro */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8 mb-8">
        <h2 className="text-xl font-bold text-[#0F1117] mb-3">
          {t('heroTitle')}
        </h2>
        <p className="text-[#5E6278] leading-relaxed max-w-3xl">
          {t('heroBody')}
        </p>
      </div>

      {/* Benefits grid -- outcome-focused */}
      <div className="grid md:grid-cols-2 gap-5 mb-8">

        {/* 1: List for free */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
            <Home size={22} className="text-brand" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {t('benefit1Title')}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {t('benefit1Body')}
          </p>
        </div>

        {/* 2: Agents compete for you */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
            <Handshake size={22} className="text-brand" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {t('benefit2Title')}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {t('benefit2Body')}
          </p>
        </div>

        {/* 3: Real-time tracking */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
            <BarChart3 size={22} className="text-brand" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {t('benefit3Title')}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {t('benefit3Body')}
          </p>
        </div>

        {/* 4: Viewings on autopilot */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
            <Calendar size={22} className="text-brand" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {t('benefit4Title')}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {t('benefit4Body')}
          </p>
        </div>

        {/* 5: One inbox */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
            <MessageSquare size={22} className="text-brand" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {t('benefit5Title')}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {t('benefit5Body')}
          </p>
        </div>

        {/* 6: Keep every pound */}
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
          <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4">
            <Shield size={22} className="text-brand" />
          </div>
          <h3 className="font-bold text-[#0F1117] mb-2">
            {t('benefit6Title')}
          </h3>
          <p className="text-sm text-[#5E6278] leading-relaxed">
            {t('benefit6Body')}
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8 mb-8">
        <h2 className="text-lg font-bold text-[#0F1117] mb-6">
          {t('howItWorksTitle')}
        </h2>
        <div className="space-y-6">
          {[
            { num: '1', title: t('step1Title'), desc: t('step1Desc') },
            { num: '2', title: t('step2Title'), desc: t('step2Desc') },
            { num: '3', title: t('step3Title'), desc: t('step3Desc') },
          ].map(step => (
            <div key={step.num} className="flex gap-5">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand flex items-center justify-center text-white font-extrabold text-base">
                {step.num}
              </div>
              <div>
                <h3 className="font-bold text-[#0F1117] mb-1">{step.title}</h3>
                <p className="text-sm text-[#5E6278]">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-8 mb-8">
        <h2 className="text-lg font-bold text-[#0F1117] mb-2">
          {t('pricingTitle')}
        </h2>
        <p className="text-sm text-[#5E6278] mb-8">
          {t('pricingSubtitle')}
        </p>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Free tier */}
          <div className="rounded-xl border-2 border-brand p-6 relative">
            <span className="absolute -top-3 left-4 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">
              {t('freeForever')}
            </span>
            <h3 className="text-lg font-bold text-[#0F1117] mt-2 mb-1">Starter</h3>
            <p className="text-3xl font-extrabold text-[#0F1117] mb-4">&pound;0</p>
            <ul className="space-y-2.5 text-sm text-[#5E6278]">
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('starterFreeChannels')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('starterDashboard')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('starterAgentProposals')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('starterInbox')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('starterAiDescription')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('starterContractorMarketplace')}</li>
            </ul>
          </div>

          {/* Sell Smart -- active sale */}
          <div className="rounded-xl border-2 border-[#5856D6] p-6 relative bg-[#FAFBFC]">
            <span className="absolute -top-3 left-4 bg-[#5856D6] text-white text-xs font-bold px-3 py-1 rounded-full">
              {t('duringYourSale')}
            </span>
            <h3 className="text-lg font-bold text-[#0F1117] mt-2 mb-1">Sell Smart</h3>
            <p className="text-3xl font-extrabold text-[#0F1117] mb-1">&pound;19<span className="text-sm font-normal text-[#5E6278]">/mo</span></p>
            <p className="text-xs text-[#5E6278] mb-4">{t('cancelWhenDone')}</p>
            <ul className="space-y-2.5 text-sm text-[#5E6278]">
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('sellSmartEverythingInStarter')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('sellSmartViewingCalendar')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('sellSmartOnlineTour')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('sellSmartMarketCheck')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('sellSmartBuyerFollowups')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('sellSmartOfferComparison')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('sellSmartDocumentStorage')}</li>
            </ul>
          </div>

          {/* Home Passport -- ongoing home management */}
          <div className="rounded-xl border-2 border-[#34C759] p-6 relative bg-[#FAFBFC]">
            <span className="absolute -top-3 left-4 bg-[#34C759] text-white text-xs font-bold px-3 py-1 rounded-full">
              {t('yourHomeManaged')}
            </span>
            <h3 className="text-lg font-bold text-[#0F1117] mt-2 mb-1">Home Passport</h3>
            <p className="text-3xl font-extrabold text-[#0F1117] mb-1">&pound;5<span className="text-sm font-normal text-[#5E6278]">/mo</span></p>
            <p className="text-xs text-[#5E6278] mb-4">{t('homePassportSubtitle')}</p>
            <ul className="space-y-2.5 text-sm text-[#5E6278]">
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('homePassportCleaners')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('homePassportAwayMode')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('homePassportValueTracker')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('homePassportMaintenance')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('homePassportDocuments')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('homePassportVerifiedProviders')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-[#34C759] mt-0.5 flex-shrink-0" /> {t('homePassportEpcInsurance')}</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-[#F5F5FA] rounded-xl p-5">
          <p className="text-sm text-[#5E6278] leading-relaxed">
            <span className="font-semibold text-[#0F1117]">{t('oneOffServicesLabel')}:</span>{' '}
            {t('oneOffServicesBody')}
          </p>
        </div>

        <p className="text-xs text-[#5E6278] mt-4 text-center">
          {t('allPlansNote')}
        </p>
      </div>

      {/* Free advertising callout */}
      <div className="bg-[#0F1117] rounded-2xl p-8 mb-8">
        <div className="flex items-start gap-5">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Megaphone size={22} className="text-brand" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">
              {t('freeAdvertisingTitle')}
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              {t('freeAdvertisingBody')}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand/5 border border-brand/20 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-[#0F1117] mb-3">
          {t('ctaTitle')}
        </h2>
        <p className="text-sm text-[#5E6278] mb-6 max-w-lg mx-auto">
          {t('ctaBody')}
        </p>
        <Link
          href="/owner/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white font-semibold rounded-lg transition-colors"
        >
          {t('ctaButton')} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
