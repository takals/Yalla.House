import {
  Calendar, MessageSquare, ShieldCheck, Download, Clock, Calculator,
  ArrowRight, Check, X, Home, Search, Palette, PlusCircle, Send, Mail,
} from 'lucide-react'
import { LocaleLink as Link } from '@/components/locale-link'
import { getLocale, getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { pageAlternates } from '@/lib/seo'
import { NewsletterSignup } from '@/components/newsletter-signup'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('agentInfo')
  return {
    title: t('metaTitle'),
    alternates: pageAlternates(await getLocale(), '/agent/info'),
  }
}

export default async function AgentInfoPage() {
  const t = await getTranslations('agentInfo')

  const benefits = [
    { icon: Calendar, title: t('benefit1Title'), body: t('benefit1Body') },
    { icon: MessageSquare, title: t('benefit2Title'), body: t('benefit2Body') },
    { icon: ShieldCheck, title: t('benefit3Title'), body: t('benefit3Body') },
    { icon: Download, title: t('benefit4Title'), body: t('benefit4Body') },
    { icon: Clock, title: t('benefit5Title'), body: t('benefit5Body') },
    { icon: Palette, title: t('benefit6Title'), body: t('benefit6Body') },
  ]

  const ownerSteps = [
    { title: t('ownerStep1Title'), desc: t('ownerStep1Desc') },
    { title: t('ownerStep2Title'), desc: t('ownerStep2Desc') },
    { title: t('ownerStep3Title'), desc: t('ownerStep3Desc') },
  ]

  const hunterSteps = [
    { title: t('step1Title'), desc: t('step1Desc') },
    { title: t('step2Title'), desc: t('step2Desc') },
    { title: t('step3Title'), desc: t('step3Desc') },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-1">
        <h1 className="text-3xl font-bold text-text-primary">
          {t('h1Title')}
        </h1>
      </div>
      <p className="text-text-secondary text-sm mb-6">{t('h1Sub')}</p>

      {/* Hero */}
      <div className="bg-white rounded-2xl border border-border-default p-8 mb-4 grid md:grid-cols-[1.4fr_1fr] gap-8 items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">
            {t('heroTitle')}
          </h2>
          <p className="text-text-secondary leading-relaxed mb-6">
            {t('heroBody')}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/agent/profile"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white font-semibold rounded-xl transition-colors"
            >
              {t('ctaClaim')} <ArrowRight size={16} />
            </Link>
            <a
              href="#how-leads"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border-default hover:border-brand text-text-primary font-semibold rounded-xl transition-colors"
            >
              {t('ctaHow')}
            </a>
          </div>
          <p className="text-[13px] text-text-secondary mt-4">
            <span className="font-semibold text-brand-dark">{t('heroMicroLead')}</span> {t('heroMicro')}
          </p>
        </div>
        <div className="rounded-xl border border-brand-light bg-brand-solid-bg p-5">
          {[t('heroCard1'), t('heroCard2'), t('heroCard3')].map(row => (
            <div key={row} className="bg-white rounded-lg px-3.5 py-2.5 mb-2 text-[13px] font-semibold text-text-primary shadow-sm">
              {row}
            </div>
          ))}
          <p className="text-[11.5px] text-brand-dark font-semibold text-center mt-3">
            {t('heroCardCap')}
          </p>
        </div>
      </div>

      {/* Proof strip */}
      <div className="bg-white rounded-2xl border border-border-default px-8 py-5 mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { n: t('proof1n'), l: t('proof1l') },
          { n: t('proof2n'), l: t('proof2l') },
          { n: t('proof3n'), l: t('proof3l') },
          { n: t('proof4n'), l: t('proof4l') },
        ].map(p => (
          <div key={p.l} className="text-center">
            <div className="text-xl font-extrabold text-brand">{p.n}</div>
            <div className="text-xs font-semibold text-text-secondary">{p.l}</div>
          </div>
        ))}
      </div>

      {/* Benefits grid */}
      <div className="grid md:grid-cols-2 gap-5 mb-8">
        {benefits.map(b => (
          <div key={b.title} className="bg-white rounded-2xl border border-border-default p-6">
            <div className="w-11 h-11 rounded-xl bg-brand-light flex items-center justify-center mb-4">
              <b.icon size={22} className="text-brand" />
            </div>
            <h3 className="font-bold text-text-primary mb-2">{b.title}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{b.body}</p>
          </div>
        ))}
      </div>

      {/* Two lead sources */}
      <div id="how-leads" className="bg-white rounded-2xl border border-border-default p-8 mb-8">
        <h2 className="text-lg font-bold text-text-primary mb-1">
          {t('howClientsTitle')}
        </h2>
        <p className="text-sm text-text-secondary mb-7">{t('howSub')}</p>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { icon: Home, title: t('ownerLeadTitle'), tag: t('ownerLeadTag'), steps: ownerSteps },
            { icon: Search, title: t('hunterLeadTitle'), tag: t('hunterLeadTag'), steps: hunterSteps },
          ].map(col => (
            <div key={col.title} className="rounded-xl border border-border-default bg-[#FCFDFE] p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <col.icon size={19} className="text-brand" />
                <h3 className="font-bold text-text-primary">{col.title}</h3>
                <span className="text-[11px] font-bold text-brand-dark bg-brand-light px-2.5 py-0.5 rounded-full">
                  {col.tag}
                </span>
              </div>
              {col.steps.map((step, i) => (
                <div key={step.title} className="flex gap-3.5 mb-4">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-brand flex items-center justify-center text-white font-extrabold text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">{step.title}</h4>
                    <p className="text-[13px] text-text-secondary">{step.desc}</p>
                  </div>
                </div>
              ))}
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
          <div className="rounded-xl border-2 border-brand p-6 relative flex flex-col">
            <span className="absolute -top-3 left-4 bg-brand text-white text-xs font-bold px-3 py-1 rounded-full">
              {t('starterBadge')}
            </span>
            <h3 className="text-lg font-bold text-text-primary mt-2 mb-1">{t('starterName')}</h3>
            <p className="text-3xl font-extrabold text-text-primary mb-4">{t('starterPrice')}<span className="text-sm font-normal text-text-secondary">{t('perMonth')}</span></p>
            <ul className="space-y-2.5 text-sm text-text-secondary flex-1">
              <li className="flex items-start gap-2"><Check size={15} className="text-brand mt-0.5 flex-shrink-0" /> {t('starterFeature1')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-brand mt-0.5 flex-shrink-0" /> {t('starterFeature2')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-brand mt-0.5 flex-shrink-0" /> {t('starterFeature3')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-brand mt-0.5 flex-shrink-0" /> {t('starterFeature4')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-brand mt-0.5 flex-shrink-0" /> {t('starterFeature5')}</li>
              <li className="flex items-start gap-2"><X size={15} className="text-[#CBD5E1] mt-0.5 flex-shrink-0" /> {t('starterFeature6')}</li>
              <li className="flex items-start gap-2"><X size={15} className="text-[#CBD5E1] mt-0.5 flex-shrink-0" /> {t('starterFeature7')}</li>
            </ul>
            <Link
              href="/agent/profile"
              className="mt-5 text-center bg-brand hover:bg-brand-hover text-white font-bold text-sm py-2.5 rounded-lg transition-colors"
            >
              {t('starterCta')}
            </Link>
          </div>

          {/* Pro tier */}
          <div className="rounded-xl border border-border-default p-6 bg-[#FAFBFC] flex flex-col">
            <h3 className="text-lg font-bold text-text-primary mb-1">{t('proName')}</h3>
            <p className="text-3xl font-extrabold text-text-primary mb-4">{t('proPrice')}<span className="text-sm font-normal text-text-secondary">{t('perMonth')}</span></p>
            <ul className="space-y-2.5 text-sm text-text-secondary flex-1">
              <li className="flex items-start gap-2"><Check size={15} className="text-brand mt-0.5 flex-shrink-0" /> {t('proFeature1')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-brand mt-0.5 flex-shrink-0" /> {t('proFeature2')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-brand mt-0.5 flex-shrink-0" /> {t('proFeature3')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-brand mt-0.5 flex-shrink-0" /> {t('proFeature4')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-brand mt-0.5 flex-shrink-0" /> {t('proFeature5')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-brand mt-0.5 flex-shrink-0" /> {t('proFeature6')}</li>
            </ul>
            <a
              href="mailto:support@yalla.house?subject=Pro%20waitlist"
              className="mt-5 text-center border-[1.5px] border-brand text-brand-dark font-bold text-sm py-2.5 rounded-lg hover:bg-brand-light transition-colors"
            >
              {t('proCta')}
            </a>
          </div>

          {/* Agency tier */}
          <div className="rounded-xl border border-border-default p-6 bg-[#FAFBFC] flex flex-col">
            <h3 className="text-lg font-bold text-text-primary mb-1">{t('agencyName')}</h3>
            <p className="text-3xl font-extrabold text-text-primary mb-4">{t('agencyPrice')}<span className="text-sm font-normal text-text-secondary">{t('perMonth')}</span></p>
            <ul className="space-y-2.5 text-sm text-text-secondary flex-1">
              <li className="flex items-start gap-2"><Check size={15} className="text-brand mt-0.5 flex-shrink-0" /> {t('agencyFeature1')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-brand mt-0.5 flex-shrink-0" /> {t('agencyFeature2')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-brand mt-0.5 flex-shrink-0" /> {t('agencyFeature3')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-brand mt-0.5 flex-shrink-0" /> {t('agencyFeature4')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-brand mt-0.5 flex-shrink-0" /> {t('agencyFeature5')}</li>
              <li className="flex items-start gap-2"><Check size={15} className="text-brand mt-0.5 flex-shrink-0" /> {t('agencyFeature6')}</li>
            </ul>
            <a
              href="mailto:support@yalla.house?subject=Agency%20plan"
              className="mt-5 text-center border-[1.5px] border-brand text-brand-dark font-bold text-sm py-2.5 rounded-lg hover:bg-brand-light transition-colors"
            >
              {t('agencyCta')}
            </a>
          </div>
        </div>
      </div>

      {/* Portal-fee maths */}
      <div className="bg-[#0F1117] rounded-2xl p-8 mb-8">
        <div className="flex items-start gap-5">
          <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
            <Calculator size={22} className="text-brand" />
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

      {/* Not listed (self-add) + forward-your-listings */}
      <div className="grid md:grid-cols-2 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-border-default p-8">
          <div className="w-11 h-11 rounded-xl bg-brand-light flex items-center justify-center mb-4">
            <PlusCircle size={22} className="text-brand" />
          </div>
          <h3 className="font-bold text-text-primary mb-2">{t('notListedTitle')}</h3>
          <p className="text-sm text-text-secondary leading-relaxed mb-5">{t('notListedBody')}</p>
          <Link
            href="/agent/profile"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white font-bold text-sm rounded-lg transition-colors"
          >
            {t('notListedCta')} <ArrowRight size={15} />
          </Link>
        </div>
        <div className="bg-white rounded-2xl border border-border-default p-8">
          <div className="w-11 h-11 rounded-xl bg-brand-light flex items-center justify-center mb-4">
            <Send size={20} className="text-brand" />
          </div>
          <h3 className="font-bold text-text-primary mb-2">{t('listingsForwardTitle')}</h3>
          <p className="text-sm text-text-secondary leading-relaxed mb-4">{t('listingsForwardBody')}</p>
          <div className="flex items-center gap-2 bg-brand-solid-bg border border-brand-light rounded-lg px-4 py-3">
            <Mail size={15} className="text-brand flex-shrink-0" />
            <code className="text-sm font-bold text-brand-dark">listings@yalla.house</code>
          </div>
          <p className="text-[12px] text-text-secondary mt-3">{t('listingsForwardNote')}</p>
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-white rounded-2xl border border-border-default p-8 mb-8">
        <h2 className="text-lg font-bold text-text-primary mb-1">{t('newsletterHeading')}</h2>
        <p className="text-sm text-text-secondary mb-5 max-w-xl">{t('newsletterSub')}</p>
        <div className="max-w-xl">
          <NewsletterSignup source="agent_info" role="agent" />
        </div>
      </div>

      {/* CTA */}
      <div className="bg-brand-solid-bg border border-brand-light rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-text-primary mb-3">
          {t('ctaTitle')}
        </h2>
        <p className="text-sm text-text-secondary mb-6 max-w-lg mx-auto">
          {t('ctaBody')}
        </p>
        <Link
          href="/agent/profile"
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white font-semibold rounded-lg transition-colors"
        >
          {t('ctaButton')} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
