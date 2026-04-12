'use client'

import { useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'

interface EditableFieldProps {
  label: string
  value: string
  placeholder: string
  actionLabel: string
  isReadOnly?: boolean
  onSave: (value: string) => Promise<{ error?: string; success?: boolean }>
}

export function EditableField({ label, value, placeholder, actionLabel, isReadOnly, onSave }: EditableFieldProps) {
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const [saving, setSaving] = useState(false)
  const [displayValue, setDisplayValue] = useState(value)

  async function handleSave() {
    if (!inputValue.trim()) return
    setSaving(true)
    const result = await onSave(inputValue.trim())
    setSaving(false)
    if (result.success) {
      setDisplayValue(inputValue.trim())
      setEditing(false)
    }
  }

  function handleCancel() {
    setInputValue(displayValue)
    setEditing(false)
  }

  if (isReadOnly) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-[#F0F0F0] last:border-b-0">
        <div className="flex-1">
          <div className="text-sm font-semibold text-[#0F1117]">{label}</div>
          <div className="text-sm text-[#5E6278] mt-0.5">{displayValue}</div>
        </div>
        <span className="text-xs text-[#999]">{actionLabel}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between py-3 border-b border-[#F0F0F0] last:border-b-0">
      <div className="flex-1">
        <div className="text-sm font-semibold text-[#0F1117]">{label}</div>
        {editing ? (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1 text-sm px-3 py-1.5 bg-[#EDEEF2] rounded-lg text-[#0F1117] placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#D4764E]"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') handleSave()
                if (e.key === 'Escape') handleCancel()
              }}
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-1.5 rounded-lg bg-[#D4764E] text-white hover:bg-[#BF6840] transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-lg bg-[#EDEEF2] text-[#5E6278] hover:bg-[#D9DCE4] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="text-sm text-[#5E6278] mt-0.5">{displayValue || placeholder}</div>
        )}
      </div>
      {!editing && (
        <button
          onClick={() => setEditing(true)}
          className="text-xs font-semibold text-[#D4764E] hover:text-[#BF6840] transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
