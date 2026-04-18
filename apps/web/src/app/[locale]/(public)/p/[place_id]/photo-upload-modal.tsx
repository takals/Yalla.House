'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { X, Upload, ImagePlus, Loader2, Check } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { uploadPhotoAction } from './actions'

interface Props {
  listingId: string
  open: boolean
  onClose: () => void
  currentPhotoCount: number
}

export function PhotoUploadModal({ listingId, open, onClose, currentPhotoCount }: Props) {
  const t = useTranslations('listingPage')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState<string[]>([])

  if (!open) return null

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)

    const newUploaded: string[] = []
    let sortOrder = currentPhotoCount + uploaded.length

    for (let i = 0; i < files.length; i++) {
      const file = files[i] as File | undefined
      if (!file) continue

      if (file.size > 10 * 1024 * 1024) {
        setError(t('photoTooLarge', { fileName: file.name }))
        continue
      }

      if (!file.type.startsWith('image/')) continue

      setUploadProgress(`${i + 1}/${files.length}`)

      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${listingId}/${Date.now()}-${i}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('listing-photos')
        .upload(path, file as File, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        console.error('Storage upload error:', uploadError)
        setError(t('photoUploadFailed', { error: uploadError.message }))
        continue
      }

      const { data: publicUrl } = supabase.storage
        .from('listing-photos')
        .getPublicUrl(path)

      sortOrder++
      const result = await uploadPhotoAction(listingId, publicUrl.publicUrl, sortOrder)

      if ('error' in result) {
        setError(result.error)
      } else {
        newUploaded.push(publicUrl.publicUrl)
      }
    }

    setUploaded(prev => [...prev, ...newUploaded])
    setUploading(false)
    setUploadProgress(null)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
  }

  function handleDone() {
    if (uploaded.length > 0) {
      window.location.reload()
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <ImagePlus size={20} className="text-brand" />
            {t('photoUploadTitle')}
          </h3>
          <button
            onClick={handleDone}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Upload area */}
        <div className="p-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border-default rounded-xl p-8 text-center cursor-pointer hover:border-brand/50 hover:bg-brand/5 transition-colors"
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 size={32} className="text-brand animate-spin" />
                <p className="text-sm font-semibold text-text-primary">
                  {t('photoUploading')} {uploadProgress}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload size={32} className="text-text-muted" />
                <p className="text-sm font-semibold text-text-primary">{t('photoDragDrop')}</p>
                <p className="text-xs text-text-muted">{t('photoFormats')}</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />

          {/* Error */}
          {error && (
            <p className="mt-3 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Uploaded preview thumbnails */}
          {uploaded.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-green-700 flex items-center gap-1 mb-2">
                <Check size={12} />
                {t('photoUploadedCount', { count: uploaded.length })}
              </p>
              <div className="flex gap-2 flex-wrap">
                {uploaded.map((url, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 rounded-lg overflow-hidden border border-border-default bg-gray-50"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border-default bg-[#FAFBFC]">
          <button
            onClick={handleDone}
            className="px-5 py-2 bg-brand hover:bg-brand-hover text-white font-bold text-sm rounded-xl transition-colors"
          >
            {uploaded.length > 0 ? t('photoDoneRefresh') : t('photoClose')}
          </button>
        </div>
      </div>
    </div>
  )
}
