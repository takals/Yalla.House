'use client'

import {
  Home, BedDouble, Bath, Building, CalendarDays,
  Zap,
} from 'lucide-react'
import { InlineEdit } from './inline-edit'

interface Props {
  listingId: string
  listing: Record<string, unknown>
  translations: Record<string, string>
}

function tr(t: Record<string, string>, key: string): string {
  return t[key] ?? key
}

/**
 * Owner-editable key facts grid — each value is wrapped in InlineEdit.
 * Replaces the static KeyFactsGrid when the viewer is the listing owner.
 */
export function EditableKeyFacts({ listingId, listing, translations: t }: Props) {
  const facts: Array<{
    icon: React.ReactNode
    label: string
    field: string
    value: string
    inputType?: 'text' | 'number'
  }> = [
    {
      icon: <Home size={18} />,
      label: tr(t, 'factPropertyType'),
      field: 'property_type',
      value: String(listing.property_type ?? ''),
      inputType: 'text',
    },
    {
      icon: <BedDouble size={18} />,
      label: tr(t, 'factBedrooms'),
      field: 'bedrooms',
      value: listing.bedrooms != null ? String(listing.bedrooms) : '',
      inputType: 'number',
    },
    {
      icon: <Bath size={18} />,
      label: tr(t, 'factBathrooms'),
      field: 'bathrooms',
      value: listing.bathrooms != null ? String(listing.bathrooms) : '',
      inputType: 'number',
    },
    {
      icon: <Home size={18} />,
      label: tr(t, 'factLivingSpace'),
      field: 'size_sqm',
      value: listing.size_sqm ? String(listing.size_sqm) : '',
      inputType: 'number',
    },
    {
      icon: <Building size={18} />,
      label: tr(t, 'factFloor'),
      field: 'floor',
      value: listing.floor != null ? String(listing.floor) : '',
      inputType: 'number',
    },
    {
      icon: <CalendarDays size={18} />,
      label: tr(t, 'factBuiltYear'),
      field: 'construction_year',
      value: listing.construction_year ? String(listing.construction_year) : '',
      inputType: 'number',
    },
    {
      icon: <Zap size={18} />,
      label: tr(t, 'factEnergyRating'),
      field: 'energy_rating',
      value: listing.energy_rating ? String(listing.energy_rating) : '',
      inputType: 'text',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {facts.map((fact) => (
        <div
          key={fact.field}
          className="flex items-start gap-3 p-4 bg-bg rounded-xl border border-border-default"
        >
          <div className="text-brand flex-shrink-0 mt-0.5">{fact.icon}</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-text-secondary uppercase tracking-wide font-semibold mb-1">{fact.label}</p>
            <InlineEdit
              listingId={listingId}
              field={fact.field}
              value={fact.value}
              label={tr(t, 'editLabel')}
              as="span"
              className="text-sm font-bold text-text-primary"
              inputType={fact.inputType ?? 'text'}
              suffix={fact.field === 'size_sqm' ? ' m²' : undefined}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
