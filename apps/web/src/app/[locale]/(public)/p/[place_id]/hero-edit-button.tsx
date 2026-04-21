'use client'

import { useState } from 'react'
import { Camera } from 'lucide-react'
import { PhotoUploadModal } from './photo-upload-modal'

interface Props {
  hasPhotos: boolean
  listingId: string
  photoCount: number
  translations: Record<string, string>
}

function tr(t: Record<string, string>, key: string): string {
  return t[key] ?? key
}

/**
 * Overlay button on the hero section for owners to upload/change photos.
 * Shows prominently when no photos exist, subtly when photos already exist.
 */
export function HeroEditButton({ hasPhotos, listingId, photoCount, translations: t }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      {hasPhotos ? (
        /* Subtle button in bottom-right when photos exist */
        <button
          onClick={() => setModalOpen(true)}
          className="absolute bottom-20 right-6 z-20 flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-black/80 text-white text-sm font-semibold rounded-lg backdrop-blur-sm transition-colors"
        >
          <Camera size={16} />
          {tr(t, 'heroChangePhotos')}
        </button>
      ) : (
        /* Prominent centered button when no photos */
        <button
          onClick={() => setModalOpen(true)}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-transparent hover:bg-black/10 transition-colors cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-brand/90 flex items-center justify-center shadow-lg">
            <Camera size={28} className="text-white" />
          </div>
          <span className="text-white text-sm font-bold bg-black/50 px-4 py-1.5 rounded-full backdrop-blur-sm">
            {tr(t, 'heroUploadPhotos')}
          </span>
        </button>
      )}

      <PhotoUploadModal
        listingId={listingId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        currentPhotoCount={photoCount}
      />
    </>
  )
}
