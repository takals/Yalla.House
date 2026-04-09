'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AgentReply {
  id: string
  message: string
  properties: {
    title?: string
    price?: number
    url?: string
    beds?: number
    area?: string
  }[]
  relevance_score: number | null
  priority_tier: string | null
  hunter_action: string | null
  created_at: string
  agent_match: {
    id: string
    agent_id: string
    match_score: number
    search_request_id: string
    agent: { full_name: string | null; avatar_url: string | null } | null
    agent_profile: { agency_name: string | null } | null
  } | null
}

interface AgentRepliesProps {
  topMatches: AgentReply[]
  otherReplies: AgentReply[]
  lowRelevance: AgentReply[]
  stats: {
    totalSearches: number
    agentsContacted: number
    repliesReceived: number
    topMatchCount: number
  }
}

function ReplyCard({ reply, expanded = false }: { reply: AgentReply; expanded?: boolean }) {
  const router = useRouter()
  const [acting, setActing] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const agent = reply.agent_match?.agent
  const agency = reply.agent_match?.agent_profile?.agency_name
  const score = reply.relevance_score ?? 0
  const properties = Array.isArray(reply.properties) ? reply.properties : []

  async function handleAction(action: 'promoted' | 'dismissed' | 'blocked') {
    setActing(true)
    try {
      await fetch(`/api/responses/${reply.id}/action`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (action === 'dismissed' || action === 'blocked') {
        setDismissed(true)
      }
      router.refresh()
    } finally {
      setActing(false)
    }
  }

  return (
    <div className={`bg-surface rounded-xl border p-4 transition ${
      expanded ? 'border-[#FFD400] shadow-md' : 'border-[#E2E4EB]'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EDEEF2] flex items-center justify-center text-sm font-bold text-[#5E6278]">
            {agent?.full_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div>
            <p className="text-sm font-semibold">{agent?.full_name ?? 'Agent'}</p>
            {agency && <p className="text-xs text-[#5E6278]">{agency}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            score >= 70 ? 'bg-[#DCFCE7] text-[#166534]'
            : score >= 30 ? 'bg-[#FFFBE0] text-[#7A5F00]'
            : 'bg-[#FEE2E2] text-[#991B1B]'
          }`}>
            {score}%
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            reply.priority_tier === 'top_match' ? 'bg-[#DCFCE7] text-[#166534]'
            : reply.priority_tier === 'other' ? 'bg-[#DBEAFE] text-[#1E40AF]'
            : 'bg-[#F3F4F6] text-[#6B7280]'
          }`}>
            {reply.priority_tier === 'top_match' ? 'Top Match'
            : reply.priority_tier === 'other' ? 'Other'
            : 'Low'}
          </span>
        </div>
      </div>

      {/* Message preview */}
      <p className={`text-sm text-[#333] mb-3 ${expanded ? '' : 'line-clamp-2'}`}>
        {reply.message}
      </p>

      {/* Property suggestions */}
      {expanded && properties.length > 0 && (
        <div className="mb-3 space-y-2">
          <p className="text-xs font-semibold text-[#5E6278] uppercase tracking-wide">
            {properties.length} propert{properties.length === 1 ? 'y' : 'ies'} suggested
          </p>
          {properties.map((p, i) => (
            <div key={i} className="bg-[#F5F5F7] rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{p.title ?? 'Property'}</p>
                <p className="text-xs text-[#5E6278]">
                  {p.beds && `${p.beds} bed · `}
                  {p.area && `${p.area} · `}
                  {p.price && `£${(p.price / 100).toLocaleString()}`}
                </p>
              </div>
              {p.url && (
                <a href={p.url} target="_blank" rel="noopener noreferrer"
                   className="text-xs font-semibold text-brand hover:underline">
                  View →
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-[#E2E4EB]">
        {reply.priority_tier !== 'top_match' && (
          <button
            onClick={() => handleAction('promoted')}
            disabled={acting}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0] transition"
          >
            Promote
          </button>
        )}
        <button
          onClick={() => handleAction('dismissed')}
          disabled={acting}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB] transition"
        >
          Dismiss
        </button>
        <button
          onClick={() => handleAction('blocked')}
          disabled={acting}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#FEE2E2] text-[#991B1B] hover:bg-[#FECACA] transition"
        >
          Block
        </button>
        <span className="text-xs text-[#999] ml-auto">
          {new Date(reply.created_at).toLocaleDateString('en-GB')}
        </span>
      </div>
    </div>
  )
}

export function AgentReplies({ topMatches, otherReplies, lowRelevance, stats }: AgentRepliesProps) {
  const [showLow, setShowLow] = useState(false)

  return (
    <div>
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Active searches', value: stats.totalSearches, color: 'text-[#0F1117]' },
          { label: 'Agents contacted', value: stats.agentsContacted, color: 'text-[#1E40AF]' },
          { label: 'Replies received', value: stats.repliesReceived, color: 'text-[#166534]' },
          { label: 'Top matches', value: stats.topMatchCount, color: 'text-[#FFD400]' },
        ].map(s => (
          <div key={s.label} className="bg-surface rounded-lg p-3 border border-[#E2E4EB] text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-[#5E6278]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Top matches */}
      {topMatches.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
            Top Matches ({topMatches.length})
          </h3>
          <div className="space-y-3">
            {topMatches.map(r => <ReplyCard key={r.id} reply={r} expanded />)}
          </div>
        </div>
      )}

      {/* Other replies */}
      {otherReplies.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            Other Replies ({otherReplies.length})
          </h3>
          <div className="space-y-2">
            {otherReplies.map(r => <ReplyCard key={r.id} reply={r} />)}
          </div>
        </div>
      )}

      {/* Low relevance — collapsed by default */}
      {lowRelevance.length > 0 && (
        <div>
          <button
            onClick={() => setShowLow(!showLow)}
            className="text-sm font-semibold text-[#5E6278] hover:text-[#0F1117] transition mb-3"
          >
            {showLow ? '▾' : '▸'} More replies ({lowRelevance.length})
          </button>
          {showLow && (
            <div className="space-y-2">
              {lowRelevance.map(r => <ReplyCard key={r.id} reply={r} />)}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {topMatches.length === 0 && otherReplies.length === 0 && lowRelevance.length === 0 && (
        <div className="bg-surface rounded-xl p-8 text-center border border-[#E2E4EB]">
          <p className="text-[#5E6278] font-medium mb-1">No agent replies yet</p>
          <p className="text-xs text-[#999]">
            {stats.agentsContacted > 0
              ? `${stats.agentsContacted} agents have been contacted. Replies usually arrive within 24–48 hours.`
              : 'Create a search and enable agent outreach to get started.'}
          </p>
        </div>
      )}
    </div>
  )
}
