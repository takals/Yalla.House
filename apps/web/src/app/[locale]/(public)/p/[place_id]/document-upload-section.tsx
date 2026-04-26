'use client'

import { useState, useRef } from 'react'
import { Upload, Loader2, Check, FileText, Zap, X } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { uploadDocumentAction } from './actions'

interface Props {
  listingId: string
  type: 'floorplan' | 'energy_cert'
  existingUrl: string | null
  translations: Record<string, string>
}

function tr(t: Record<string, string>, key: string): string {
  return t[key] ?? key
}

export function DocumentUploadSection({ listingId, type, existingUrl, translations: t }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(existingUrl)
  const [error, setError] = useState<string | null>(null)

  const Icon = type === 'floorplan' ? FileText : Zap
  const emptyLabel = type === 'floorplan' ? tr(t, 'noFloorPlan') : tr(t, 'noEpc')
  const uploadLabel = type === 'floorplan' ? tr(t, 'uploadFloorPlan') : tr(t, 'uploadEpc')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const file = files[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      setError(tr(t, 'fileTooLarge'))
      return
    }

    setError(null)
    setUploading(true)

    const ext = file.name.split('.').pop() ?? 'pdf'
    const path = `${listingId}/${type}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('listing-photos')
      .upload(path, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data: publicUrl } = supabase.storage
      .from('listing-photos')
      .getPublicUrl(path)

    const result = await uploadDocumentAction(listingId, publicUrl.publicUrl, type)

    setUploading(false)

    if ('error' in result) {
      setError(result.error)
    } else {
      setUploadedUrl(publicUrl.publicUrl)
    }
  }

  // If document is uploaded, show it
  if (uploadedUrl) {
    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(uploadedUrl)
    return (
      <div className="bg-surface rounded-xl border border-border-default overflow-hidden">
        {isImage ? (
          <img src={uploadedUrl} alt={type} className="w-full max-h-[500px] object-contain bg-gray-50" />
        ) : (
          <div className="p-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Check size={18} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary">
                {type === 'floorplan' ? tr(t, 'sectionFloorPlan') : tr(t, 'sectionEpc')}
              </p>
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brand hover:text-brand-hover transition-colors"
              >
                {tr(t, 'viewDocument')}
              </a>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors"
            >
              {tr(t, 'replace')}
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>
    )
  }

  // Empty state — upload prompt
  return (
    <div
      onClick={() => !uploading && fileInputRef.current?.click()}
      className="bg-surface rounded-xl border border-dashed border-border-default p-8 text-center cursor-pointer hover:border-brand/40 hover:bg-brand/5 transition-colors"
    >
      {uploading ? (
        <Loader2 size={32} className="mx-auto mb-3 text-brand animate-spin" />
      ) : (
        <Icon size={32} className="mx-auto mb-3 text-text-secondary" />
      )}
      <p className="text-sm text-text-secondary mb-4">
        {uploading ? tr(t, 'uploading') : emptyLabel}
      </p>
      {!uploading && (
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-bg hover:bg-hover-muted text-text-primary text-sm font-semibold rounded-lg border border-border-default transition-colors">
          <Upload size={14} />
          {uploadLabel}
        </span>
      )}
      {error && (
        <p className="mt-3 text-xs text-red-600">{error}</p>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  )
}
