'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import { PhotoLightbox } from './photo-lightbox'

interface Photo {
  id: string
  url: string
  thumb_url: string | null
  caption_de: string | null
  caption: string | null
}

interface HeroPhotoProps {
  photos: Photo[]
  primaryUrl: string
  alt: string
  photoCount: number
  translations: {
    viewAllPhotos: string
    photoOf: string
    closeGallery: string
  }
}

export function HeroPhoto({ photos, primaryUrl, alt, photoCount, translations: t }: HeroPhotoProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => photos.length > 0 && setLightboxOpen(true)}
        className="absolute inset-0 w-full h-full cursor-pointer group"
        aria-label={t.viewAllPhotos}
      >
        <Image
          src={primaryUrl}
          alt={alt}
          fill
          className="object-cover"
          priority
        />
        {/* Photo count badge */}
        {photoCount > 1 && (
          <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
            <Camera size={14} />
            {photoCount}
          </div>
        )}
      </button>

      {lightboxOpen && photos.length > 0 && (
        <PhotoLightbox
          photos={photos}
          initialIndex={0}
          onClose={() => setLightboxOpen(false)}
          translations={{
            photoOf: t.photoOf,
            closeGallery: t.closeGallery,
          }}
        />
      )}
    </>
  )
}
