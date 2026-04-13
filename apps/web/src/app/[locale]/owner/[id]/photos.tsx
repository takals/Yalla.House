'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useAuthAction } from '@/lib/use-auth-action'
import { savePhotoAction, deletePhotoAction, setPrimaryPhotoAction } from './actions'

export interface PhotoRow {
  id: string
  url: string
  thumb_url: string | null
  is_primary: boolean
  sort_order: number
  type: string
}

const BUCKET = 'listing-photos'
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

function randomId() {
  return Math.random().toString(36).slice(2, 10)
}

function extOf(file: File): string {
  return file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
}

function storagePathFromUrl(url: string): string {
  // Public URL: https://xxx.supabase.co/storage/v1/object/public/listing-photos/listingId/file.jpg
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const idx = url.indexOf(marker)
  return idx >= 0 ? url.slice(idx + marker.length) : url
}

export function PhotoManager({
  listingId,
  photos: initialPhotos,
}: {
  listingId: string
  photos: PhotoRow[]
}) {
  const { handleAuthRequired } = useAuthAction()
  const [photos, setPhotos] = useState<PhotoRow[]>(
    [...initialPhotos].sort((a, b) => a.sort_order - b.sort_order)
  )
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(files: FileList) {
    setUploadError('')
    const supabase = createClient()

    for (const file of Array.from(files)) {
      if (file.size > MAX_BYTES) {
        setUploadError(`"${file.name}" ist zu groß (max. 10 MB)`)
        continue
      }

      setUploading(true)
      const path = `${listingId}/${randomId()}.${extOf(file)}`

      const { error: storageError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: false })

      if (storageError) {
        setUploadError(`Upload fehlgeschlagen: ${storageError.message}`)
        setUploading(false)
        continue
      }

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)

      const result = await savePhotoAction(listingId, publicUrl, photos.length)

      if (handleAuthRequired(result)) {
        setUploading(false)
        return
      }

      if ('error' in result) {
        setUploadError(result.error)
        // Clean up orphaned storage file
        await supabase.storage.from(BUCKET).remove([path])
      } else if ('success' in result) {
        const newPhoto: PhotoRow = {
          id: result.id,
          url: publicUrl,
          thumb_url: null,
          is_primary: photos.length === 0, // first upload auto-primary
          sort_order: photos.length,
          type: 'photo',
        }
        setPhotos(prev => [...prev, newPhoto])
      }

      setUploading(false)
    }
  }

  async function handleDelete(photo: PhotoRow) {
    const storagePath = storagePathFromUrl(photo.url)
    const result = await deletePhotoAction(photo.id, storagePath)
    if (handleAuthRequired(result)) {
      return
    }
    if ('error' in result) {
      setUploadError(result.error)
    } else if ('success' in result) {
      setPhotos(prev => prev.filter(p => p.id !== photo.id))
    }
  }

  async function handleSetPrimary(photo: PhotoRow) {
    if (photo.is_primary) return
    const result = await setPrimaryPhotoAction(photo.id, listingId)
    if (handleAuthRequired(result)) {
      return
    }
    if ('error' in result) {
      setUploadError(result.error)
    } else if ('success' in result) {
      setPhotos(prev => prev.map(p => ({ ...p, is_primary: p.id === photo.id })))
    }
  }

  return (
    <div className="space-y-4">
      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map(photo => (
            <div
              key={photo.id}
              className="relative aspect-square overflow-hidden rounded-xl bg-[#E4E6EF] group"
            >
              <Image
                src={photo.url}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
                unoptimized
              />

              {/* Primary badge */}
              {photo.is_primary && (
                <span className="absolute top-2 left-2 text-xs font-bold bg-brand text-[#0F1117] px-2 py-0.5 rounded-full">
                  Titelbild
                </span>
              )}

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleDelete(photo)}
                className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-opacity opacity-0 group-hover:opacity-100"
                aria-label="Foto löschen"
              >
                <svg className="w-3.5 h-3.5 text-[#0F1117]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Set primary button */}
              {!photo.is_primary && (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(photo)}
                  className="absolute bottom-2 left-2 text-xs font-semibold bg-white/90 hover:bg-white text-[#5E6278] px-2 py-0.5 rounded-full shadow transition-opacity opacity-0 group-hover:opacity-100"
                  aria-label="Als Titelbild setzen"
                >
                  Als Titelbild
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-[#D8DBE5] hover:border-brand rounded-xl text-sm font-medium text-[#5E6278] hover:text-[#0F1117] transition-colors disabled:opacity-50 w-full justify-center"
        >
          {uploading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Wird hochgeladen …
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {photos.length === 0 ? 'Erstes Foto hinzufügen' : 'Weitere Fotos hinzufügen'}
            </>
          )}
        </button>
      </div>

      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}

      {photos.length === 0 && !uploading && (
        <p className="text-sm text-[#999999] text-center">
          Noch keine Fotos. Portale wie ImmobilienScout24 empfehlen mindestens 5 Bilder.
        </p>
      )}
    </div>
  )
}
