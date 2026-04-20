'use client'

import { Share2, FileDown, Upload } from 'lucide-react'

interface Props {
  slug: string | null
  placeId: string
  translations: Record<string, string>
}

function tr(t: Record<string, string>, key: string): string {
  return t[key] ?? key
}

/**
 * Share / Download Brochure / Export bar below the hero.
 */
export function ListingActionsBar({ slug, placeId, translations: t }: Props) {
  const listingPath = slug ? `/p/${slug}` : `/p/${placeId}`

  async function handleShare() {
    const url = `${window.location.origin}${listingPath}`
    if (navigator.share) {
      try {
        await navigator.share({ url, title: document.title })
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-lg hover:bg-bg transition-colors"
      >
        <Share2 size={14} />
        {tr(t, 'shareProperty')}
      </button>
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
