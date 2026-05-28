'use client'

import { MapPin } from 'lucide-react'
import { InlineEdit } from './inline-edit'

interface Props {
  listingId: string
  street: string | null
  city: string | null
  postcode: string | null
  isOwner: boolean
  translations: Record<string, string>
}

function tr(t: Record<string, string>, key: string): string {
  return t[key] ?? key
}

/**
 * Location display — static for visitors, inline-editable for owners.
 */
export function EditableLocation({ listingId, street, city, postcode, isOwner, translations: t }: Props) {
  if (!isOwner) {
    // Public view — static display
    return (
      <div className="bg-surface rounded-xl border border-border-default p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0">
            <MapPin size={18} className="text-brand" />
          </div>
          <div>
            <p className="font-bold text-text-primary">{postcode} {city}</p>
            {street && <p className="text-sm text-text-secondary">{street}</p>}
          </div>
        </div>
      </div>
    )
  }

  // Owner view — editable fields
  return (
    <div className="bg-surface rounded-xl border border-border-default p-6">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center flex-shrink-0 mt-1">
          <MapPin size={18} className="text-brand" />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wide font-semibold mb-1">{tr(t, 'locationStreet')}</p>
            <InlineEdit
              listingId={listingId}
              field="street"
              value={street ?? ''}
              label={tr(t, 'editLabel')}
              as="p"
              className="text-sm font-medium text-text-primary"
              inputType="text"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-xs text-text-secondary uppercase tracking-wide font-semibold mb-1">{tr(t, 'locationPostcode')}</p>
              <InlineEdit
                listingId={listingId}
                field="postcode"
                value={postcode ?? ''}
                label={tr(t, 'editLabel')}
                as="span"
                className="text-sm font-bold text-text-primary"
                inputType="text"
              />
            </div>
            <div className="flex-1">
              <p className="text-xs text-text-secondary uppercase tracking-wide font-semibold mb-1">{tr(t, 'locationCity')}</p>
              <InlineEdit
                listingId={listingId}
                field="city"
                value={city ?? ''}
                label={tr(t, 'editLabel')}
                as="span"
                className="text-sm font-bold text-text-primary"
                inputType="text"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
