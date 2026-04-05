'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cancelViewingAction } from './actions'

interface Props {
  id: string
  initialStatus: string
  title: string
  location: string
  placeId: string | null
  hunterNotes: string | null
  date: string
}

const STATUS_LABELS: Record<string, string> = {
  pending:   'Ausstehend',
  confirmed: 'Bestätigt',
  cancelled: 'Abgebrochen',
  completed: 'Abgeschlossen',
  no_show:   'Nicht erschienen',
}

const STATUS_STYLES: Record<string, string> = {
  pending:   'bg-yellow-50 text-yellow-800 border border-yellow-200',
  confirmed: 'bg-green-50 text-green-800 border border-green-200',
  cancelled: 'bg-gray-100 text-gray-500 border border-gray-200',
  completed: 'bg-blue-50 text-blue-800 border border-blue-200',
  no_show:   'bg-red-50 text-red-700 border border-red-200',
}

export function ViewingCard({ id, initialStatus, title, location, placeId, hunterNotes, date }: Props) {
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCancel() {
    if (!confirm('Anfrage wirklich zurückziehen?')) return
    setLoading(true)
    setError(null)
    const prev = status
    setStatus('cancelled')
    const result = await cancelViewingAction(id)
    if ('error' in result) {
      setStatus(prev)
      setError(result.error)
    }
    setLoading(false)
  }

  const canCancel = status === 'pending' || status === 'confirmed'

  return (
    <div className="bg-surface rounded-card p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-semibold truncate">{title}</p>
          <p className="text-sm text-[#5E6278]">{location}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 ${STATUS_STYLES[status] ?? STATUS_STYLES['pending']}`}>
          {STATUS_LABELS[status] ?? status}
        </span>
      </div>

      {status === 'confirmed' && (
        <div className="mb-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-800">
          Der Eigentümer hat Ihre Anfrage bestätigt und wird sich in Kürze bei Ihnen melden.
        </div>
      )}

      {status === 'cancelled' && (
        <div className="mb-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600">
          Diese Besichtigung wurde abgebrochen.
        </div>
      )}

      {hunterNotes && (
        <p className="text-sm text-[#5E6278] italic mb-3">&ldquo;{hunterNotes}&rdquo;</p>
      )}

      {error && (
        <p className="text-xs text-red-600 mb-3">{error}</p>
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#999]">Angefragt am {date}</p>
        <div className="flex items-center gap-3">
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={loading}
              className="text-xs font-semibold text-[#5E6278] hover:text-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Wird abgebrochen…' : 'Zurückziehen'}
            </button>
          )}
          {placeId && (
            <Link
              href={`/p/${placeId}`}
              className="text-xs font-semibold text-[#0F1117] hover:underline"
            >
              Inserat ansehen →
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
