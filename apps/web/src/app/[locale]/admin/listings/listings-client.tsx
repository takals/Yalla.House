'use client'

import { useState, useTransition } from 'react'
import { Check, X, Send, ExternalLink, MapPin, BedDouble, Tag, Building2, Loader2 } from 'lucide-react'
import { reviewListingAction } from './actions'

export interface ListingRow {
  id: string
  title: string | null
  priceText: string | null
  currency: string | null
  location: string | null
  postcode: string | null
  countryCode: string | null
  propertyType: string | null
  bedrooms: number | null
  url: string | null
  status: string
  createdAt: string
  agencyName: string | null
  fromEmail: string | null
  subject: string | null
}

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-gray-100 text-gray-500 border-gray-200',
  distributed: 'bg-blue-50 text-blue-700 border-blue-200',
}

function Row({ row }: { row: ListingRow }) {
  const [status, setStatus] = useState(row.status)
  const [pending, start] = useTransition()
  const [err, setErr] = useState<string | null>(null)

  function act(action: 'approve' | 'reject' | 'distribute') {
    setErr(null)
    start(async () => {
      const res = await reviewListingAction(row.id, action)
      if ('error' in res) setErr(res.error)
      else setStatus(action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'distributed')
    })
  }

  return (
    <div className="bg-white rounded-xl border border-border-default p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <h3 className="font-bold text-text-primary truncate">{row.title || '(no title)'}</h3>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-1">
            <Building2 size={13} className="flex-shrink-0" />
            <span className="truncate">{row.agencyName || row.fromEmail || 'Unknown sender'}</span>
          </div>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${STATUS_STYLES[status] ?? STATUS_STYLES.new}`}>
          {status}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-text-secondary mb-4">
        {row.priceText && <span className="inline-flex items-center gap-1"><Tag size={13} /> {row.priceText}</span>}
        {(row.location || row.postcode) && <span className="inline-flex items-center gap-1"><MapPin size={13} /> {row.location || row.postcode}{row.countryCode ? ` · ${row.countryCode}` : ''}</span>}
        {row.bedrooms != null && <span className="inline-flex items-center gap-1"><BedDouble size={13} /> {row.bedrooms} bed</span>}
        {row.propertyType && <span className="inline-flex items-center gap-1 capitalize">{row.propertyType.replace('_', ' ')}</span>}
        {row.url && (
          <a href={row.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-dark font-semibold hover:underline">
            <ExternalLink size={13} /> Source
          </a>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => act('approve')}
          disabled={pending || status === 'approved'}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white transition-colors"
        >
          {pending ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Approve
        </button>
        <button
          onClick={() => act('distribute')}
          disabled={pending || status === 'distributed'}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-brand hover:bg-brand-hover disabled:opacity-40 text-white transition-colors"
        >
          <Send size={13} /> Distribute
        </button>
        <button
          onClick={() => act('reject')}
          disabled={pending || status === 'rejected'}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border border-border-default hover:bg-hover-bg disabled:opacity-40 text-text-secondary transition-colors"
        >
          <X size={13} /> Reject
        </button>
        {err && <span className="text-xs text-red-600 ml-2">{err}</span>}
      </div>
    </div>
  )
}

export function ListingsClient({ rows }: { rows: ListingRow[] }) {
  if (!rows.length) {
    return (
      <div className="bg-white rounded-xl border border-border-default p-10 text-center text-text-secondary text-sm">
        No inbound listings yet. Agents send them to <code className="font-bold text-brand-dark">listings@yalla.house</code>.
      </div>
    )
  }
  return <div className="grid gap-4">{rows.map(r => <Row key={r.id} row={r} />)}</div>
}
