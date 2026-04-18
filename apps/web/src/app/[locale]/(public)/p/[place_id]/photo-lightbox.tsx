'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface Photo {
  id: string
  url: string
  thumb_url: string | null
  caption_de: string | null
  caption: string | null
}

interface PhotoLightboxProps {
  photos: Photo[]
  initialIndex?: number
  onClose: () => void
  translations: {
    photoOf: string
    closeGallery: string
  }
}

export function PhotoLightbox({ photos, initialIndex = 0, onClose, translations: t }: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const photo = photos[currentIndex]

  const goNext = useCallback(() => {
    setCurrentIndex(i => (i + 1) % photos.length)
  }, [photos.length])

  const goPrev = useCallback(() => {
    setCurrentIndex(i => (i - 1 + photos.length) % photos.length)
  }, [photos.length])

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') goNext()
      else if (e.key === 'ArrowLeft') goPrev()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, goNext, goPrev])

  // Touch swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0]?.clientX ?? null)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const diff = (e.changedTouches[0]?.clientX ?? 0) - touchStart
    if (Math.abs(diff) > 50) {
      if (diff > 0) goPrev()
      else goNext()
    }
    setTouchStart(null)
  }

  if (!photo) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <span className="text-white/70 text-sm font-medium">
          {currentIndex + 1} {t.photoOf} {photos.length}
        </span>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm font-medium"
        >
          {t.closeGallery}
          <X size={18} />
        </button>
      </div>

      {/* Main image area */}
      <div
        className="flex-1 relative flex items-center justify-center px-4 min-h-0"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous button */}
        {photos.length > 1 && (
          <button
            onClick={goPrev}
            className="absolute left-2 md:left-6 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
        )}

        {/* Photo */}
        <div className="relative w-full h-full max-w-5xl mx-auto">
          <Image
            src={photo.url}
            alt={photo.caption ?? photo.caption_de ?? `Photo ${currentIndex + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 80vw"
            priority
          />
        </div>

        {/* Next button */}
        {photos.length > 1 && (
          <button
            onClick={goNext}
            className="absolute right-2 md:right-6 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ChevronRight size={24} className="text-white" />
          </button>
        )}
      </div>

      {/* Caption */}
      {(photo.caption || photo.caption_de) && (
        <p className="text-center text-white/60 text-sm py-2 px-4">
          {photo.caption ?? photo.caption_de}
        </p>
      )}

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex-shrink-0 px-4 py-3 overflow-x-auto">
          <div className="flex items-center justify-center gap-1.5">
            {photos.map((thumb, idx) => (
              <button
                key={thumb.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                  idx === currentIndex
                    ? 'ring-2 ring-brand opacity-100 scale-105'
                    : 'opacity-50 hover:opacity-80'
                }`}
              >
                <Image
                  src={thumb.thumb_url ?? thumb.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
