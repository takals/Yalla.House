'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  PartyPopper, Rocket, Eye, EyeOff, ExternalLink,
  Share2, Users, ChevronRight, Globe, QrCode,
  MessageCircle, Facebook, Twitter, Mail, Copy,
  Search, Star, FileText, ArrowRight, Check,
} from 'lucide-react'

type Translations = {
  [key: string]: string
}

interface Props {
  listingId: string
  listingSlug: string
  listingTitle: string
  listingCity: string
  listingPostcode: string
  hasPhotos: boolean
  translations: Translations
  locale: string
}

type WizardStep = 'congrats' | 'preview' | 'paths' | 'share' | 'agents'

export function ActivationWizard({
  listingId,
  listingSlug,
  listingTitle,
  listingCity,
  listingPostcode,
  hasPhotos,
  translations: t,
  locale,
}: Props) {
  var [step, setStep] = useState<WizardStep>('congrats')
  var [isLive, setIsLive] = useState(true)
  var [copied, setCopied] = useState(false)

  var prefix = locale === 'en' ? '/en' : ''
  var publicUrl = prefix + '/p/' + listingSlug
  var fullUrl = 'https://yalla.house' + publicUrl

  function copyLink() {
    navigator.clipboard.writeText(fullUrl).then(function () {
      setCopied(true)
      setTimeout(function () { setCopied(false) }, 2000)
    })
  }

  // ── Step 1: Congratulations ─────────────────────────────────────
  if (step === 'congrats') {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-brand/10 rounded-full mb-6">
          <PartyPopper className="w-10 h-10 text-brand" />
        </div>

        <h1 className="text-3xl font-bold text-text-primary mb-3">
          {t.congratsTitle}
        </h1>

        <p className="text-lg text-text-secondary mb-2">
          {t.congratsSubtitle}
        </p>

        <div className="inline-block bg-brand/5 border border-brand/20 rounded-xl px-5 py-3 mb-6">
          <p className="font-semibold text-text-primary">{listingTitle}</p>
          <p className="text-xs text-text-secondary mt-0.5">{listingPostcode} {listingCity}</p>
        </div>

        <p className="text-sm text-text-secondary max-w-md mx-auto mb-8">
          {t.congratsBody}
        </p>

        <button
          onClick={function () { setStep('preview') }}
          className="inline-flex items-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold px-8 py-3 rounded-xl transition-colors will-change-transform hover:-translate-y-0.5 text-lg"
        >
          <Eye className="w-5 h-5" />
          {t.seeYourPage}
        </button>

        <div className="mt-4">
          <Link
            href={prefix + '/owner'}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            {t.skipForNow}
          </Link>
        </div>
      </div>
    )
  }

  // ── Step 2: Live page preview + toggle ──────────────────────────
  if (step === 'preview') {
    return (
      <div className="py-6">
        {/* Header with toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-1">
              {t.yourPageIsReady}
            </h1>
            <p className="text-sm text-text-secondary">
              {t.yourPageIsReadyDesc}
            </p>
          </div>

          {/* Live / Draft toggle */}
          <button
            onClick={function () { setIsLive(!isLive) }}
            className={'inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ' + (
              isLive
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            )}
          >
            {isLive ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                {t.toggleLive}
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                {t.toggleDraft}
              </>
            )}
          </button>
        </div>

        {/* Page preview card */}
        <div className="bg-surface border border-[#E4E6EF] rounded-2xl overflow-hidden shadow-sm mb-6">
          {/* Browser-like header bar */}
          <div className="bg-[#F1F3F9] px-4 py-3 flex items-center gap-3 border-b border-[#E4E6EF]">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <span className="w-3 h-3 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 bg-white rounded-md px-3 py-1.5 text-xs text-text-secondary font-mono truncate">
              {fullUrl}
            </div>
            <button
              onClick={copyLink}
              className="flex items-center gap-1 text-xs text-text-secondary hover:text-text-primary transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? t.copied : t.copyLink}
            </button>
          </div>

          {/* Preview content */}
          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Photo placeholder */}
              <div className="w-32 h-24 bg-bg rounded-xl flex items-center justify-center flex-shrink-0">
                {hasPhotos ? (
                  <span className="text-xs text-text-muted">{t.photosLoaded}</span>
                ) : (
                  <span className="text-xs text-text-muted">{t.noPhotosYet}</span>
                )}
              </div>

              {/* Listing details */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-text-primary text-lg mb-1">{listingTitle}</h3>
                <p className="text-sm text-text-secondary">{listingPostcode} {listingCity}</p>

                {isLive ? (
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                    </span>
                    {t.statusLive}
                  </div>
                ) : (
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    <EyeOff className="w-3 h-3" />
                    {t.statusDraft}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Visit link */}
          <div className="border-t border-[#E4E6EF] px-6 py-3 flex items-center justify-between">
            <span className="text-xs text-text-muted">{t.previewNote}</span>
            <Link
              href={publicUrl}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-hover transition-colors"
            >
              {t.openFullPage}
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={function () { setStep('paths') }}
          className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-hover text-white font-bold px-6 py-3.5 rounded-xl transition-colors will-change-transform hover:-translate-y-0.5 text-base"
        >
          <Rocket className="w-5 h-5" />
          {t.whatsNext}
        </button>
      </div>
    )
  }

  // ── Step 3: Two guided paths ────────────────────────────────────
  if (step === 'paths') {
    return (
      <div className="py-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {t.pathsTitle}
          </h1>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            {t.pathsSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Path A: Share your listing */}
          <button
            onClick={function () { setStep('share') }}
            className="group bg-surface border border-[#E4E6EF] rounded-2xl p-6 text-left hover:border-brand/30 hover:shadow-md transition-all will-change-transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
              <Share2 className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-bold text-text-primary text-lg mb-2">
              {t.pathShareTitle}
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              {t.pathShareDesc}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand group-hover:gap-2 transition-all">
              {t.pathShareCta}
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>

          {/* Path B: Find an agent */}
          <button
            onClick={function () { setStep('agents') }}
            className="group bg-surface border border-[#E4E6EF] rounded-2xl p-6 text-left hover:border-brand/30 hover:shadow-md transition-all will-change-transform hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-brand" />
            </div>
            <h3 className="font-bold text-text-primary text-lg mb-2">
              {t.pathAgentTitle}
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              {t.pathAgentDesc}
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand group-hover:gap-2 transition-all">
              {t.pathAgentCta}
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </div>

        {/* Skip to dashboard */}
        <div className="mt-6 text-center">
          <Link
            href={prefix + '/owner'}
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            {t.goToDashboard}
          </Link>
        </div>
      </div>
    )
  }

  // ── Path A: Share your listing ──────────────────────────────────
  if (step === 'share') {
    var shareChannels = [
      {
        key: 'whatsapp',
        icon: MessageCircle,
        label: t.shareWhatsapp,
        color: 'bg-green-50 text-green-600',
        href: 'https://wa.me/?text=' + encodeURIComponent(listingTitle + ' — ' + fullUrl),
      },
      {
        key: 'facebook',
        icon: Facebook,
        label: t.shareFacebook,
        color: 'bg-blue-50 text-blue-600',
        href: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(fullUrl),
      },
      {
        key: 'twitter',
        icon: Twitter,
        label: t.shareTwitter,
        color: 'bg-sky-50 text-sky-500',
        href: 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(fullUrl) + '&text=' + encodeURIComponent(listingTitle),
      },
      {
        key: 'email',
        icon: Mail,
        label: t.shareEmail,
        color: 'bg-purple-50 text-purple-600',
        href: 'mailto:?subject=' + encodeURIComponent(listingTitle) + '&body=' + encodeURIComponent(fullUrl),
      },
    ]

    return (
      <div className="py-6">
        {/* Back + title */}
        <button
          onClick={function () { setStep('paths') }}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors mb-4 inline-flex items-center gap-1"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          {t.back}
        </button>

        <h1 className="text-2xl font-bold text-text-primary mb-2">
          {t.shareTitle}
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          {t.shareSubtitle}
        </p>

        {/* Copy link bar */}
        <div className="flex items-center gap-2 bg-[#F1F3F9] rounded-xl px-4 py-3 mb-6">
          <Globe className="w-4 h-4 text-text-muted flex-shrink-0" />
          <span className="flex-1 text-sm text-text-primary font-mono truncate">{fullUrl}</span>
          <button
            onClick={copyLink}
            className={'text-sm font-semibold px-3 py-1 rounded-lg transition-colors ' + (
              copied ? 'text-green-600 bg-green-50' : 'text-brand hover:bg-brand/5'
            )}
          >
            {copied ? t.copied : t.copyLink}
          </button>
        </div>

        {/* Social channels */}
        <div className="space-y-3 mb-6">
          {shareChannels.map(function (ch) {
            var Icon = ch.icon
            return (
              <a
                key={ch.key}
                href={ch.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-surface border border-[#E4E6EF] rounded-xl hover:border-brand/20 hover:shadow-sm transition-all"
              >
                <div className={'w-10 h-10 rounded-xl flex items-center justify-center ' + ch.color}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="flex-1 font-semibold text-text-primary text-sm">{ch.label}</span>
                <ExternalLink className="w-4 h-4 text-text-muted" />
              </a>
            )
          })}
        </div>

        {/* QR + Portals links */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Link
            href={publicUrl}
            className="flex items-center gap-3 p-4 bg-surface border border-[#E4E6EF] rounded-xl hover:border-brand/20 transition-all"
          >
            <QrCode className="w-5 h-5 text-brand" />
            <span className="text-sm font-semibold text-text-primary">{t.shareQR}</span>
          </Link>
          <Link
            href={prefix + '/owner/' + listingId + '#portals'}
            className="flex items-center gap-3 p-4 bg-surface border border-[#E4E6EF] rounded-xl hover:border-brand/20 transition-all"
          >
            <Globe className="w-5 h-5 text-brand" />
            <span className="text-sm font-semibold text-text-primary">{t.sharePortals}</span>
          </Link>
        </div>

        {/* Next path nudge */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-brand" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">{t.nudgeAgentTitle}</p>
            <p className="text-xs text-text-secondary mt-0.5">{t.nudgeAgentDesc}</p>
          </div>
          <button
            onClick={function () { setStep('agents') }}
            className="text-sm font-semibold text-brand hover:text-brand-hover transition-colors flex-shrink-0"
          >
            {t.nudgeAgentCta}
            <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>
      </div>
    )
  }

  // ── Path B: Find an agent ───────────────────────────────────────
  if (step === 'agents') {
    return (
      <div className="py-6">
        {/* Back + title */}
        <button
          onClick={function () { setStep('paths') }}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors mb-4 inline-flex items-center gap-1"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          {t.back}
        </button>

        <h1 className="text-2xl font-bold text-text-primary mb-2">
          {t.agentTitle}
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          {t.agentSubtitle}
        </p>

        {/* Agent steps */}
        <div className="space-y-4 mb-8">
          {/* Step 1: Search */}
          <div className="bg-surface border border-[#E4E6EF] rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-brand/5 rounded-xl flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-text-primary text-sm mb-1">{t.agentStep1Title}</h3>
                <p className="text-xs text-text-secondary mb-3">{t.agentStep1Desc}</p>
                <Link
                  href={prefix + '/owner/agents/search'}
                  className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-hover text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
                >
                  {t.agentStep1Cta}
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Step 2: Compare */}
          <div className="bg-surface border border-[#E4E6EF] rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-brand/5 rounded-xl flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-text-primary text-sm mb-1">{t.agentStep2Title}</h3>
                <p className="text-xs text-text-secondary">{t.agentStep2Desc}</p>
              </div>
            </div>
          </div>

          {/* Step 3: Send brief */}
          <div className="bg-surface border border-[#E4E6EF] rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-brand/5 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-brand" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-text-primary text-sm mb-1">{t.agentStep3Title}</h3>
                <p className="text-xs text-text-secondary mb-3">{t.agentStep3Desc}</p>
                <Link
                  href={prefix + '/owner/' + listingId + '/brief'}
                  className="inline-flex items-center gap-1.5 border border-brand text-brand font-semibold text-xs px-4 py-2 rounded-lg hover:bg-brand/5 transition-colors"
                >
                  {t.agentStep3Cta}
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Share nudge */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
            <Share2 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">{t.nudgeShareTitle}</p>
            <p className="text-xs text-text-secondary mt-0.5">{t.nudgeShareDesc}</p>
          </div>
          <button
            onClick={function () { setStep('share') }}
            className="text-sm font-semibold text-brand hover:text-brand-hover transition-colors flex-shrink-0"
          >
            {t.nudgeShareCta}
            <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>

        {/* Dashboard link */}
        <div className="text-center">
          <Link
            href={prefix + '/owner'}
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            {t.goToDashboard}
          </Link>
        </div>
      </div>
    )
  }

  // Fallback — shouldn't happen
  return null
}
