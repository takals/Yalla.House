'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import { updateAssignmentStatusAction, sendBriefAction } from './actions'

interface Assignment {
  id: string
  agent_id: string
  status: string
  data_scope: string
  agency_name: string | null
  agent_name: string | null
  initiated_by: string
}

interface Props {
  assignment: Assignment
}

const STATUS_STYLES: Record<string, string> = {
  invited:      'bg-yellow-50 text-yellow-800 border border-yellow-200',
  active:       'bg-green-50 text-green-800 border border-green-200',
  paused:       'bg-gray-100 text-gray-600 border border-gray-200',
  ignored:      'bg-gray-100 text-gray-400 border border-gray-200',
  disconnected: 'bg-red-50 text-red-700 border border-red-200',
}

function StatusLabels(t: any): Record<string, string> {
  return {
    invited:      t('statusInvited'),
    active:       t('statusActive'),
    paused:       t('statusPaused'),
    ignored:      t('statusIgnored'),
    disconnected: t('statusDisconnected'),
  }
}

function ScopeLabels(t: any): Record<string, string> {
  return {
    brief_only:         t('scopeBriefOnly'),
    brief_and_contact:  t('scopeBriefAndContact'),
  }
}

export function AgentCard({ assignment }: Props) {
  const t = useTranslations('hunterDashboard')
  const STATUS_LABELS = StatusLabels(t)
  const SCOPE_LABELS = ScopeLabels(t)
  const [isPending, startTransition] = useTransition()
  const { id, agent_id, status, data_scope, agency_name, agent_name, initiated_by } = assignment
  const agentInitiated = initiated_by === 'agent'

  function update(newStatus: 'active' | 'paused' | 'invited' | 'ignored' | 'disconnected') {
    startTransition(async () => { await updateAssignmentStatusAction(id, newStatus) })
  }

  function resend() {
    startTransition(async () => { await sendBriefAction(agent_id) })
  }

  return (
    <div className={`bg-surface rounded-card p-5 ${status === 'ignored' ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-semibold">{agency_name ?? 'Unbekannte Agentur'}</p>
          {agent_name && <p className="text-sm text-text-secondary">{agent_name}</p>}
          <p className="text-xs text-text-muted mt-0.5">{SCOPE_LABELS[data_scope] ?? data_scope}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_STYLES[status] ?? STATUS_STYLES['invited']}`}>
            {STATUS_LABELS[status] ?? status}
          </span>
          {agentInitiated && status === 'invited' && (
            <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-brand-solid-bg text-brand-badge-text border border-yellow-200 whitespace-nowrap">
              {t('agentWantsPassport')}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {status === 'active' && (
          <>
            <button
              onClick={() => update('paused')}
              disabled={isPending}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border-default text-text-secondary hover:border-[#C8CCD6] transition-colors disabled:opacity-50"
            >
              Daten pausieren
            </button>
            <button
              onClick={() => update('disconnected')}
              disabled={isPending}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border-default text-text-secondary hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
            >
              Trennen
            </button>
          </>
        )}
        {status === 'paused' && (
          <button
            onClick={() => update('active')}
            disabled={isPending}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-text-primary transition-colors disabled:opacity-50"
          >
            Daten fortsetzen
          </button>
        )}
        {/* Agent invited the hunter → hunter accepts or declines */}
        {status === 'invited' && agentInitiated && (
          <>
            <button
              onClick={() => update('active')}
              disabled={isPending}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand hover:bg-brand-hover text-text-primary transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              Annehmen <Check size={14} />
            </button>
            <button
              onClick={() => update('ignored')}
              disabled={isPending}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border-default text-text-secondary hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
            >
              {t('reject')}
            </button>
          </>
        )}
        {/* Hunter invited the agent → hunter can resend brief or ignore */}
        {status === 'invited' && !agentInitiated && (
          <>
            <button
              onClick={resend}
              disabled={isPending}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border-default text-text-secondary hover:border-[#C8CCD6] transition-colors disabled:opacity-50"
            >
              Brief erneut senden
            </button>
            <button
              onClick={() => update('ignored')}
              disabled={isPending}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-text-secondary hover:text-red-600 transition-colors disabled:opacity-50"
            >
              Ignorieren
            </button>
          </>
        )}
        {status === 'ignored' && (
          <button
            onClick={() => update('invited')}
            disabled={isPending}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border-default text-text-secondary hover:border-[#C8CCD6] transition-colors disabled:opacity-50"
          >
            Erneut verbinden
          </button>
        )}
      </div>
    </div>
  )
}
