'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'

interface Property {
  title: string
  price: string
  url: string
  beds: string
  area: string
}

export function ResponseForm({ matchId }: { matchId: string }) {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [properties, setProperties] = useState<Property[]>([
    { title: '', price: '', url: '', beds: '', area: '' },
  ])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  function updateProperty(idx: number, field: keyof Property, value: string) {
    setProperties(prev =>
      prev.map((p, i) => i === idx ? { ...p, [field]: value } : p)
    )
  }

  function addProperty() {
    if (properties.length < 5) {
      setProperties(prev => [...prev, { title: '', price: '', url: '', beds: '', area: '' }])
    }
  }

  function removeProperty(idx: number) {
    if (properties.length > 1) {
      setProperties(prev => prev.filter((_, i) => i !== idx))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    // Build properties payload (filter out empty entries)
    const validProperties = properties
      .filter(p => p.title.trim())
      .map(p => ({
        title: p.title.trim(),
        price: p.price ? Math.round(Number(p.price) * 100) : null,
        url: p.url.trim() || null,
        beds: p.beds ? Number(p.beds) : null,
        area: p.area.trim() || null,
      }))

    try {
      const res = await fetch(`/api/agent/respond/${matchId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          properties: validProperties,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to submit response')
      }

      setSuccess(true)
      setTimeout(() => router.push('/agent/briefs'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (success) {
    return (
      <div className="bg-[#DCFCE7] rounded-2xl p-8 text-center border border-[#22C55E]/20">
        <div className="w-12 h-12 rounded-full bg-[#22C55E] text-white flex items-center justify-center mx-auto mb-3">
          <Check size={24} />
        </div>
        <h2 className="text-lg font-bold text-[#166534] mb-1">Response Sent</h2>
        <p className="text-sm text-[#166534]/80">
          Your reply has been submitted and will be scored for relevance.
          Redirecting to briefs...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-surface rounded-2xl p-6 border border-[#E2E4EB]">
        <h2 className="text-lg font-bold mb-4">Your Reply</h2>

        {error && (
          <div className="bg-[#FEE2E2] text-[#991B1B] text-sm p-3 rounded-lg mb-4">{error}</div>
        )}

        {/* Message */}
        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2">Message to Home-Hunter</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Introduce yourself and explain why your suggestions are a good fit..."
            rows={4}
            required
            className="w-full px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <p className="text-xs text-[#999] mt-1">
            Tip: specific, detailed replies score higher. Include property details, not just &quot;call us&quot;.
          </p>
        </div>

        {/* Property suggestions */}
        <div className="mb-5">
          <label className="block text-sm font-semibold mb-2">
            Property Suggestions ({properties.length}/5)
          </label>
          <div className="space-y-3">
            {properties.map((p, idx) => (
              <div key={idx} className="bg-[#F5F5F7] rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#5E6278]">Property {idx + 1}</span>
                  {properties.length > 1 && (
                    <button type="button" onClick={() => removeProperty(idx)} className="text-xs text-[#991B1B] hover:underline">
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={p.title}
                      onChange={e => updateProperty(idx, 'title', e.target.value)}
                      placeholder="Property title / address"
                      className="w-full px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm"
                    />
                  </div>
                  <input
                    type="number"
                    value={p.price}
                    onChange={e => updateProperty(idx, 'price', e.target.value)}
                    placeholder="Price (e.g. 350000)"
                    className="px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm"
                  />
                  <input
                    type="number"
                    value={p.beds}
                    onChange={e => updateProperty(idx, 'beds', e.target.value)}
                    placeholder="Bedrooms"
                    className="px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm"
                  />
                  <input
                    type="text"
                    value={p.area}
                    onChange={e => updateProperty(idx, 'area', e.target.value)}
                    placeholder="Area / postcode"
                    className="px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm"
                  />
                  <input
                    type="url"
                    value={p.url}
                    onChange={e => updateProperty(idx, 'url', e.target.value)}
                    placeholder="Listing URL (optional)"
                    className="px-3 py-2 rounded-lg border border-[#D8DBE5] text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
          {properties.length < 5 && (
            <button
              type="button"
              onClick={addProperty}
              className="mt-2 text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] transition"
            >
              + Add another property
            </button>
          )}
        </div>

        {/* Privacy notice */}
        <div className="bg-[#F5F5F7] rounded-lg p-3 mb-5">
          <p className="text-xs text-[#5E6278]">
            <span className="font-semibold text-[#0F1117]">Note: </span>
            Your reply goes through Yalla.House. The Home-Hunter&apos;s contact details are not
            shared. Phone numbers in your message will be redacted unless the hunter
            has enabled phone contact.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving || !message.trim()}
          className="w-full py-3 bg-brand text-black font-bold rounded-xl hover:bg-brand-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Submitting...' : 'Submit Reply'}
        </button>
      </div>
    </form>
  )
}
