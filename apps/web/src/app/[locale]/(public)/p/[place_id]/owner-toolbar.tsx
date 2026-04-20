'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Pencil, Share2, Copy, Check, Mail, MessageCircle, Link2, Eye } from 'lucide-react'
import { ShareCardModal } from '@/components/share-card'

interface Props {
  listingId: string
  placeId: string
  slug: string | null
  shortId: string | null
  status: string
  locale: string
  listingTitle?: string
  address?: string
  price?: string | null
  photoUrl?: string | null
  preMarketOptIn?: boolean
}

export function OwnerToolbar({ listingId, placeId, slug, shortId, status, locale, listingTitle, address, price, photoUrl, preMarketOptIn = false }: Props) {
  const t = useTranslations('listingPage')
  const [isLive, setIsLive] = useState(status === 'active')
  const [toggling, setToggling] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedShort, setCopiedShort] = useState(false)
  const [preMarket, setPreMarket] = useState(preMarketOptIn)
  const [preMarketToggling, setPreMarketToggling] = useState(false)

  const localePrefix = locale === 'de' ? '' : 'en/'
  // Canonical URL uses slug when available
  const canonicalId = slug ?? placeId
  const publicUrl = `https://yalla.house/${localePrefix}p/${canonicalId}`
  // Short URL for compact sharing / QR codes
  const shortUrl = shortId ? `https://yalla.house/${localePrefix}p/${shortId}` : publicUrl

  async function handleToggle() {
    setToggling(true)
    const newStatus = isLive ? 'draft' : 'active'

    const res = await fetch('/api/listings/toggle-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, status: newStatus }),
    })

    if (res.ok) {
      setIsLive(!isLive)
    }
    setToggling(false)
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleCopyShortLink() {
    navigator.clipboard.writeText(shortUrl)
    setCopiedShort(true)
    setTimeout(() => setCopiedShort(false), 2000)
  }

  async function handlePreMarketToggle() {
    setPreMarketToggling(true)
    const newVal = !preMarket
    const res = await fetch('/api/listings/pre-market', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId, enabled: newVal }),
    })
    if (res.ok) {
      setPreMarket(newVal)
    }
    setPreMarketToggling(false)
  }

  return (
    <div className="bg-[#0F1117] text-white">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
        {/* Left: owner badge + edit */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand/10 px-2 py-0.5 rounded-full">
            {t('ownerBadge')}
          </span>
          <button
            onClick={() => document.getElementById('owner-editing')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors"
          >
            <Pencil size={12} />
            {t('ownerEdit')}
          </button>
        </div>

        {/* Right: toggle + share */}
        <div className="flex items-center gap-3">
          {/* Live / Draft toggle */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            className="flex items-center gap-2 text-xs font-bold disabled:opacity-50"
          >
            <div className={`relative w-9 h-5 rounded-full transition-colors ${isLive ? 'bg-green-500' : 'bg-white/20'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isLive ? 'left-[18px]' : 'left-0.5'}`} />
            </div>
            <span className={isLive ? 'text-green-400' : 'text-white/40'}>
              {isLive ? 'Live' : t('ownerDraft')}
            </span>
          </button>

          {/* Pre-market early access toggle */}
          <button
            onClick={handlePreMarketToggle}
            disabled={preMarketToggling}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50 transition-colors"
            title={t('ownerPreMarketHint')}
          >
            <Eye size={13} className={preMarket ? 'text-brand' : 'text-white/30'} />
            <span className={preMarket ? 'text-brand' : 'text-white/40'}>
              {t('ownerPreMarket')}
            </span>
          </button>

          {/* Share */}
          <div className="relative">
            <button
              onClick={() => setShareOpen(!shareOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">{t('ownerShare')}</span>
            </button>

            {shareOpen && (
              <div className="absolute right-0 top-8 z-50 w-56 bg-[#1C1F2E] rounded-xl shadow-2xl border border-white/10 p-3 space-y-1">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  {copied ? <Check size={14} className="text-green-400" /> : <Link2 size={14} />}
                  {copied ? t('ownerCopied') : t('ownerCopyLink')}
                </button>
                {shortId && (
                  <button
                    onClick={handleCopyShortLink}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
                  >
                    {copiedShort ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    {copiedShort ? t('ownerCopied') : t('ownerCopyShortLink')}
                  </button>
                )}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(t('ownerShareText') + ' ' + publicUrl)}`}
                  target="_blank"
                  rel="noopener"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <MessageCircle size={14} />
                  WhatsApp
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent(t('ownerEmailSubject'))}&body=${encodeURIComponent(t('ownerShareText') + '\n\n' + publicUrl)}`}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Mail size={14} />
                  Email
                </a>
                <div className="border-t border-white/10 my-1" />
                <ShareCardModal
                  listingTitle={listingTitle ?? ''}
                  address={address ?? ''}
                  price={price ?? null}
                  photoUrl={photoUrl ?? null}
                  shareUrl={publicUrl}
                  shortUrl={shortUrl}
                  locale={locale}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
