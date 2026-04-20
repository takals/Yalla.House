'use client'

import { useState, useRef, useEffect } from 'react'
import { Share2, FileDown, Upload, Check, Copy, MessageCircle, Mail, Link2 } from 'lucide-react'

interface Props {
  slug: string | null
  placeId: string
  title: string
  translations: Record<string, string>
}

function tr(t: Record<string, string>, key: string): string {
  return t[key] ?? key
}

/**
 * Share / Download Brochure / Export actions row.
 */
export function ListingActionsBar({ slug, placeId, title, translations: t }: Props) {
  const listingPath = slug ? `/p/${slug}` : `/p/${placeId}`
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shareMenuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShareMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [shareMenuOpen])

  function getFullUrl() {
    return typeof window !== 'undefined' ? `${window.location.origin}${listingPath}` : listingPath
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(getFullUrl())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleWhatsAppShare() {
    const url = getFullUrl()
    const text = `${title} — ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    setShareMenuOpen(false)
  }

  function handleEmailShare() {
    const url = getFullUrl()
    const subject = tr(t, 'ownerEmailSubject') || 'Property on Yalla.House'
    const body = `${title}\n\n${url}`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setShareMenuOpen(false)
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ url: getFullUrl(), title })
      } catch {
        // User cancelled
      }
    }
    setShareMenuOpen(false)
  }

  return (
    <div className="flex items-center gap-1">
      {/* Share dropdown */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShareMenuOpen(!shareMenuOpen)}
          className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg hover:bg-bg transition-colors"
        >
          <Share2 size={14} />
          {tr(t, 'shareProperty')}
        </button>

        {shareMenuOpen && (
          <div className="absolute right-0 top-full mt-1 w-52 bg-surface rounded-xl border border-border-default shadow-lg z-50 overflow-hidden">
            <button
              onClick={handleCopyLink}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary hover:bg-bg transition-colors"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy link'}
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary hover:bg-bg transition-colors"
            >
              <MessageCircle size={14} />
              WhatsApp
            </button>
            <button
              onClick={handleEmailShare}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary hover:bg-bg transition-colors"
            >
              <Mail size={14} />
              Email
            </button>
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-text-primary hover:bg-bg transition-colors border-t border-border-default"
              >
                <Link2 size={14} />
                More options...
              </button>
            )}
          </div>
        )}
      </div>

      {/* Print/Brochure */}
      <button
        onClick={() => window.print()}
        className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg hover:bg-bg transition-colors"
      >
        <FileDown size={14} />
        {tr(t, 'downloadBrochure')}
      </button>
    </div>
  )
}
