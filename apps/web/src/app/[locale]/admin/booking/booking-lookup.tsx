'use client'

import { useState } from 'react'
import {
  Search, MapPin, Home, Send, MessageCircle,
  Phone, Loader2, CheckCircle2, ExternalLink, Copy
} from 'lucide-react'
import { searchPropertiesAction, sendPropertyLinkAction } from './actions'

interface SearchResult {
  id: string
  place_id: string
  address_line1: string | null
  city: string | null
  postcode: string | null
  status: string
  bedrooms: number | null
  property_type: string | null
  owner_name: string | null
  owner_email: string | null
}

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-500',
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  under_offer: 'bg-blue-100 text-blue-700',
  sold: 'bg-purple-100 text-purple-700',
}

export function BookingLookup() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [channel, setChannel] = useState<'sms' | 'whatsapp'>('sms')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const siteUrl = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://yalla.house'

  async function handleSearch() {
    if (!query.trim()) return
    setSearching(true)
    setError(null)
    setResults([])
    setSelectedId(null)
    setSent(false)

    const result = await searchPropertiesAction(query)
    setSearching(false)

    if (result.error) {
      setError(result.error)
    } else {
      setResults(result.results ?? [])
      if (result.results?.length === 0) {
        setError('No properties found. Try a different search.')
      }
    }
  }

  async function handleSendLink() {
    if (!selectedId || !phoneNumber.trim()) return
    const selected = results.find(r => r.id === selectedId)
    if (!selected) return

    setSending(true)
    const result = await sendPropertyLinkAction({
      phoneNumber: phoneNumber.trim(),
      placeId: selected.place_id,
      channel,
    })
    setSending(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSent(true)
    }
  }

  function handleCopyLink(placeId: string) {
    const url = `${siteUrl}/p/${placeId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(placeId)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-border-default p-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-4 top-3.5 text-text-secondary" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Ref code (yh_de_xxx), postcode (10115), or street name..."
              className="w-full pl-10 pr-4 py-2.5 bg-bg rounded-xl text-sm text-text-primary placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#D4764E]"
              autoFocus
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || !query.trim()}
            className="px-6 py-2.5 bg-brand text-white font-semibold rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            Search
          </button>
        </div>

        {/* Quick search tips */}
        <div className="flex gap-4 mt-3">
          <span className="text-xs text-text-muted">
            <span className="font-semibold">Ref:</span> yh_de_xxx
          </span>
          <span className="text-xs text-text-muted">
            <span className="font-semibold">PLZ:</span> 10115
          </span>
          <span className="text-xs text-text-muted">
            <span className="font-semibold">Street:</span> Friedrichstraße
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-text-secondary uppercase tracking-wider">
            {results.length} {results.length === 1 ? 'property' : 'properties'} found
          </p>

          {results.map(result => (
            <div
              key={result.id}
              onClick={() => { setSelectedId(result.id); setSent(false) }}
              className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${
                selectedId === result.id
                  ? 'border-brand shadow-md'
                  : 'border-border-default'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin size={16} className="text-brand flex-shrink-0" />
                    <h3 className="font-bold text-text-primary truncate">
                      {result.address_line1 ?? 'Unknown address'}
                    </h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[result.status] ?? STATUS_STYLES['draft']}`}>
                      {result.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-text-secondary">
                    <span>{result.city}{result.postcode ? `, ${result.postcode}` : ''}</span>
                    {result.bedrooms && <span>{result.bedrooms} bed</span>}
                    {result.property_type && <span>{result.property_type}</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-text-muted">
                    <span className="font-mono">{result.place_id}</span>
                    {result.owner_name && <span>Owner: {result.owner_name}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Copy link */}
                  <button
                    onClick={e => { e.stopPropagation(); handleCopyLink(result.place_id) }}
                    className="p-2 rounded-lg bg-bg hover:bg-hover-muted transition-colors"
                    title="Copy property link"
                  >
                    {copied === result.place_id
                      ? <CheckCircle2 size={16} className="text-green-600" />
                      : <Copy size={16} className="text-text-secondary" />
                    }
                  </button>

                  {/* Open property page */}
                  <a
                    href={`/p/${result.place_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="p-2 rounded-lg bg-bg hover:bg-hover-muted transition-colors"
                    title="Open property page"
                  >
                    <ExternalLink size={16} className="text-text-secondary" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send Link Panel */}
      {selectedId && (
        <div className="bg-white rounded-2xl border-2 border-brand p-6">
          <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
            <Send size={18} className="text-brand" />
            Send Property Link
          </h3>

          {sent ? (
            <div className="flex items-center gap-3 bg-green-50 rounded-xl p-4">
              <CheckCircle2 size={20} className="text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-700">Link sent successfully!</p>
                <p className="text-xs text-green-600 mt-0.5">
                  via {channel === 'whatsapp' ? 'WhatsApp' : 'SMS'} to {phoneNumber}
                </p>
              </div>
              <button
                onClick={() => { setSent(false); setPhoneNumber('') }}
                className="ml-auto text-xs font-semibold text-green-700 hover:text-green-900"
              >
                Send another
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              {/* Phone input */}
              <div className="flex-1 relative">
                <Phone size={16} className="absolute left-4 top-3.5 text-text-secondary" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendLink()}
                  placeholder="+49 170 1234567"
                  className="w-full pl-10 pr-4 py-2.5 bg-bg rounded-xl text-sm text-text-primary placeholder-[#999] focus:outline-none focus:ring-2 focus:ring-[#D4764E]"
                />
              </div>

              {/* Channel toggle */}
              <div className="flex bg-bg rounded-xl overflow-hidden">
                <button
                  onClick={() => setChannel('sms')}
                  className={`px-4 py-2.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    channel === 'sms'
                      ? 'bg-brand text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <MessageCircle size={14} />
                  SMS
                </button>
                <button
                  onClick={() => setChannel('whatsapp')}
                  className={`px-4 py-2.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    channel === 'whatsapp'
                      ? 'bg-[#25D366] text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <MessageCircle size={14} />
                  WhatsApp
                </button>
              </div>

              {/* Send button */}
              <button
                onClick={handleSendLink}
                disabled={sending || !phoneNumber.trim()}
                className="px-6 py-2.5 bg-brand text-white font-semibold rounded-xl hover:bg-brand-hover transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Send
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
