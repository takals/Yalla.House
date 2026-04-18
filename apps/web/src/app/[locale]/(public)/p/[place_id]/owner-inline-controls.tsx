'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { ImagePlus } from 'lucide-react'
import { InlineEdit } from './inline-edit'
import { PhotoUploadModal } from './photo-upload-modal'

interface Props {
  listingId: string
  title: string
  description: string | null
  salePrice: number | null
  rentPrice: number | null
  currency: string
  photoCount: number
}

export function OwnerInlineControls({
  listingId,
  title,
  description,
  salePrice,
  rentPrice,
  currency,
  photoCount,
}: Props) {
  const t = useTranslations('listingPage')
  const [photoModalOpen, setPhotoModalOpen] = useState(false)

  return (
    <>
      {/* Editable Title */}
      <div className="mb-4">
        <InlineEdit
          listingId={listingId}
          field="title_de"
          value={title}
          label={t('inlineEditTitle')}
          as="h2"
          className="text-lg font-bold text-text-primary"
        />
      </div>

      {/* Editable Description */}
      <div className="mb-4">
        <InlineEdit
          listingId={listingId}
          field="description_de"
          value={description ?? ''}
          label={t('inlineEditDescription')}
          as="p"
          className="text-text-secondary leading-relaxed whitespace-pre-line"
          inputType="textarea"
        />
      </div>

      {/* Editable prices */}
      {salePrice != null && (
        <div className="mb-3">
          <InlineEdit
            listingId={listingId}
            field="sale_price"
            value={String(salePrice)}
            label={t('inlineEditPrice')}
            as="span"
            className="text-lg font-bold text-text-primary"
            inputType="number"
            prefix={currency === 'GBP' ? '\u00a3' : '\u20ac'}
            fromMinor
          />
        </div>
      )}
      {rentPrice != null && (
        <div className="mb-3">
          <InlineEdit
            listingId={listingId}
            field="rent_price"
            value={String(rentPrice)}
            label={t('inlineEditPrice')}
            as="span"
            className="text-lg font-bold text-text-primary"
            inputType="number"
            prefix={currency === 'GBP' ? '\u00a3' : '\u20ac'}
            suffix=" /mo"
            fromMinor
          />
        </div>
      )}

      {/* Add photos button */}
      <button
        onClick={() => setPhotoModalOpen(true)}
        className="flex items-center gap-2 text-sm font-semibold text-brand hover:text-[#BF6840] transition-colors mt-2"
      >
        <ImagePlus size={16} />
        {t('addPhotos')}
      </button>

      {/* Photo upload modal */}
      <PhotoUploadModal
        listingId={listingId}
        open={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        currentPhotoCount={photoCount}
      />
    </>
  )
}
