'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Pencil, Share2, Copy, Check, Mail, MessageCircle, Link2 } from 'lucide-react'

interface Props {
  listingId: string
  placeId: string
  status: string
  locale: string
}

export function OwnerToolbar({ listingId, placeId, status, locale }: Props) {
  const t = useTranslations('listingPage')
  const [isLive, setIsLive] = useState(status === 'active')
  const [toggling, setToggling] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const publicUrl = `https://yalla.house/${locale === 'de' ? '' : 'en/'}p/${placeId}`

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

  return (
    <div className="bg-[#0F1117] text-white">
      <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
        {/* Left: owner badge + edit */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4764E] bg-[#D4764E]/10 px-2 py-0.5 rounded-full">
            {t('ownerBadge')}
          </span>
          <a
            href={`/owner/${listingId}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors"
          >
            <Pencil size={12} />
            {t('ownerEdit')}
          </a>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
