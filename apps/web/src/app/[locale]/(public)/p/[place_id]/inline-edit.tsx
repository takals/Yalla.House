'use client'

import { useState, useRef, useEffect } from 'react'
import { Pencil, Check, X, Loader2 } from 'lucide-react'
import { updateListingFieldAction } from './actions'

interface InlineEditProps {
  listingId: string
  field: string
  value: string
  label: string
  /** Display element wrapping the value (e.g. 'h1', 'p', 'span') */
  as?: 'h1' | 'h2' | 'p' | 'span'
  className?: string
  inputType?: 'text' | 'textarea' | 'number'
  /** For price fields — display unit like € or £ */
  prefix?: string
  suffix?: string
  /** Minor units → major units conversion (prices stored as cents) */
  fromMinor?: boolean
}

export function InlineEdit({
  listingId,
  field,
  value,
  label,
  as: Tag = 'span',
  className = '',
  inputType = 'text',
  prefix,
  suffix,
  fromMinor = false,
}: InlineEditProps) {
  const displayValue = fromMinor ? String(parseFloat(value) / 100) : value
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(displayValue)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select()
      }
    }
  }, [editing])

  function handleEdit() {
    setEditValue(displayValue)
    setEditing(true)
    setError(null)
  }

  function handleCancel() {
    setEditing(false)
    setError(null)
  }

  async function handleSave() {
    if (editValue === displayValue) {
      setEditing(false)
      return
    }

    setSaving(true)
    setError(null)

    const saveValue = fromMinor ? editValue : editValue
    const result = await updateListingFieldAction(listingId, field, saveValue)

    setSaving(false)
    if ('error' in result) {
      setError(result.error)
    } else {
      setEditing(false)
      // Soft reload to reflect changes
      window.location.reload()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && inputType !== 'textarea') {
      e.preventDefault()
      handleSave()
    }
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (!editing) {
    return (
      <div className="group relative inline">
        <Tag className={className}>
          {prefix}{value ? (fromMinor ? new Intl.NumberFormat('en-GB').format(parseFloat(value) / 100) : value) : '—'}{suffix}
        </Tag>
        <button
          onClick={handleEdit}
          className="inline-flex items-center justify-center ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-brand hover:text-[#BF6840] align-middle"
          title={label}
        >
          <Pencil size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="inline-flex items-start gap-2 w-full">
      {inputType === 'textarea' ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={4}
          className="flex-1 border border-brand/40 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 resize-y"
          disabled={saving}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={inputType}
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border border-brand/40 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
          disabled={saving}
        />
      )}
      <div className="flex gap-1 flex-shrink-0 pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand text-white hover:bg-brand-hover transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
        </button>
        <button
          onClick={handleCancel}
          disabled={saving}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <X size={14} />
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}
