'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Maximize2 } from 'lucide-react'
import { PhotoLightbox } from './photo-lightbox'

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
  translations: {
    photosTitle: string
    viewAllPhotos: string
    photoOf: string
    closeGallery: string
  }
}

export function PhotoGallery({ photos, title, translations: t }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

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
          {photos.map((photo, idx) => (
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
            </button>
          ))}
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
