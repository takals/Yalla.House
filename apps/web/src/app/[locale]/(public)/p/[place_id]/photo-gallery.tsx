'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Maximize2, Star, Loader2 } from 'lucide-react'
import { PhotoLightbox } from './photo-lightbox'
import { setHeroPhotoAction } from './actions'

interface Photo {
  id: string
  url: string
  thumb_url: string | null
  caption_de: string | null
  caption: string | null
}

interface PhotoGalleryProps {
  photos: Photo[]
  title: string | null
  isOwner?: boolean
  listingId?: string
  heroPhotoId?: string | null
  translations: {
    photosTitle: string
    viewAllPhotos: string
    photoOf: string
    closeGallery: string
    setAsHero?: string
    currentHero?: string
  }
}

export function PhotoGallery({ photos, title, isOwner, listingId, heroPhotoId, translations: t }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [settingHeroId, setSettingHeroId] = useState<string | null>(null)
  const [currentHeroId, setCurrentHeroId] = useState<string | null>(heroPhotoId ?? null)

  async function handleSetHero(e: React.MouseEvent, photoId: string) {
    e.stopPropagation()
    if (!listingId || settingHeroId) return
    setSettingHeroId(photoId)
    const result = await setHeroPhotoAction(listingId, photoId)
    if ('success' in result) {
      setCurrentHeroId(photoId)
    }
    setSettingHeroId(null)
  }

  return (
    <>
      <div className="bg-surface rounded-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">{t.photosTitle} ({photos.length})</h2>
          <button
            onClick={() => setLightboxIndex(0)}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand hover:text-brand-hover transition-colors"
          >
            <Maximize2 size={14} />
            {t.viewAllPhotos}
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {photos.map((photo, idx) => {
            const isHero = currentHeroId ? photo.id === currentHeroId : idx === 0
            return (
              <button
                key={photo.id}
                onClick={() => setLightboxIndex(idx)}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
              >
                <Image
                  src={photo.thumb_url ?? photo.url}
                  alt={photo.caption_de ?? photo.caption ?? (title ? `${title} photo` : 'Property photo')}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                {/* Hero badge */}
                {isHero && (
                  <div className="absolute top-1.5 left-1.5 bg-brand text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Star size={10} className="fill-white" />
                    {t.currentHero ?? 'Hero'}
                  </div>
                )}

                {/* Set as hero button — owner only, not on current hero */}
                {isOwner && !isHero && (
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleSetHero(e, photo.id)}
                  >
                    <span className="bg-black/70 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      {settingHeroId === photo.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Star size={12} />
                      )}
                      {t.setAsHero ?? 'Set as hero'}
                    </span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          translations={{
            photoOf: t.photoOf,
            closeGallery: t.closeGallery,
          }}
        />
      )}
    </>
  )
}
