'use client'

import { useTransition, useState } from 'react'
import {
  updateProfileAction,
  pauseAllSharingAction,
  disconnectAgentAction,
  deleteAgentDataAction,
  deleteAllDataAction,
} from './actions'

interface Assignment {
  id: string
  status: string
  agency_name: string | null
  agent_name: string | null
}

interface ConsentEvent {
  id: string
  event_type: string
  agent_name: string | null
  created_at: string
}

interface ProfileData {
  full_name: string | null
  email: string
  phone: string | null
}

interface Props {
  profile: ProfileData
  assignments: Assignment[]
  consentLog: ConsentEvent[]
}

const EVENT_LABELS: Record<string, string> = {
  brief_shared:       'Brief geteilt',
  contact_shared:     'Kontakt geteilt',
  data_paused:        'Datenweitergabe pausiert',
  data_resumed:       'Datenweitergabe fortgesetzt',
  agent_disconnected: 'Makler getrennt',
  data_deleted:       'Daten gelöscht',
}

const EVENT_DOT: Record<string, string> = {
  brief_shared:       'bg-green-600',
  contact_shared:     'bg-green-600',
  data_paused:        'bg-yellow-500',
  data_resumed:       'bg-green-600',
  agent_disconnected: 'bg-gray-400',
  data_deleted:       'bg-red-600',
}

export function SettingsClient({ profile, assignments, consentLog }: Props) {
  const [profileState, setProfileState] = useState<{ success?: true; error?: string } | null>(null)
  const [profilePending, startProfileTransition] = useTransition()
  const [isPending, startTransition] = useTransition()
  const [deleteAllMsg, setDeleteAllMsg] = useState<string | null>(null)

  function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startProfileTransition(async () => {
      const result = await updateProfileAction(null, formData)
      setProfileState(result)
    })
  }

  return (
    <div className="space-y-8">

      {/* Profile */}
      <div className="bg-surface rounded-card p-6">
        <h3 className="font-semibold mb-4 pb-3 border-b border-[#E2E4EB]">Profil</h3>
        {profileState && 'success' in profileState! && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-800 font-medium">
            Profil gespeichert.
          </div>
        )}
        {profileState && 'error' in profileState! && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {profileState.error}
          </div>
        )}
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#5E6278] mb-1">Name</label>
              <input
                type="text"
                name="full_name"
                defaultValue={profile.full_name ?? ''}
                className="w-full border border-[#E2E4EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#5E6278] mb-1">Telefon</label>
              <input
                type="tel"
                name="phone"
                defaultValue={profile.phone ?? ''}
                className="w-full border border-[#E2E4EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5E6278] mb-1">E-Mail (nicht änderbar)</label>
            <input
              type="email"
              value={profile.email}
              readOnly
              className="w-full border border-[#E2E4EB] rounded-lg px-3 py-2 text-sm bg-[#EDEEF2] text-[#999] cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={profilePending}
            className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-[#0F1117] font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
          >
            {profilePending ? 'Wird gespeichert…' : 'Änderungen speichern'}
          </button>
        </form>
      </div>

      {/* Privacy */}
      <div className="bg-surface rounded-card p-6">
        <h3 className="font-semibold mb-4 pb-3 border-b border-[#E2E4EB]">Datenschutz</h3>

        {/* Master pause */}
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#E2E4EB]">
          <div>
            <p className="font-medium text-sm">Alle Datenweitergabe pausieren</p>
            <p className="text-xs text-[#5E6278] mt-0.5">Makler erhalten vorübergehend keine Updates.</p>
          </div>
          <button
            onClick={() => startTransition(async () => { await pauseAllSharingAction(true) })}
            disabled={isPending}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E2E4EB] text-[#5E6278] hover:border-[#C8CCD6] transition-colors disabled:opacity-50"
          >
            Pausieren
          </button>
        </div>

        {/* Per-agent rows */}
        {assignments.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-bold text-[#5E6278] uppercase tracking-wide mb-3">Verbundene Makler</p>
            <div className="space-y-3">
              {assignments.map(a => (
                <div key={a.id} className="flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{a.agency_name ?? 'Unbekannte Agentur'}</p>
                    {a.agent_name && <p className="text-xs text-[#999]">{a.agent_name}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => startTransition(async () => { await disconnectAgentAction(a.id) })}
                      disabled={isPending}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-[#E2E4EB] text-[#5E6278] hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                    >
                      Trennen
                    </button>
                    <button
                      onClick={() => startTransition(async () => { await deleteAgentDataAction(a.id) })}
                      disabled={isPending}
                      className="text-xs font-semibold px-2.5 py-1 rounded-lg text-red-600 hover:underline disabled:opacity-50"
                    >
                      Daten löschen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Consent log */}
        {consentLog.length > 0 && (
          <div>
            <p className="text-xs font-bold text-[#5E6278] uppercase tracking-wide mb-3">Einwilligungs-Log</p>
            <div className="space-y-2">
              {consentLog.map(ev => (
                <div key={ev.id} className="flex items-center gap-2 text-sm">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${EVENT_DOT[ev.event_type] ?? 'bg-gray-400'}`} />
                  <span className="flex-1 text-[#5E6278]">
                    {EVENT_LABELS[ev.event_type] ?? ev.event_type}
                    {ev.agent_name ? ` — ${ev.agent_name}` : ''}
                  </span>
                  <span className="text-xs text-[#999] flex-shrink-0">
                    {new Date(ev.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-red-50 border border-red-200 rounded-card p-6">
        <h3 className="font-semibold text-red-800 mb-2">Gefahrenzone</h3>
        <p className="text-sm text-red-700 mb-4">
          Dein HomeHunter-Profil und alle zugehörigen Daten dauerhaft löschen. Dies kann nicht rückgängig gemacht werden.
        </p>
        {deleteAllMsg && (
          <div className="mb-4 bg-white border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {deleteAllMsg}
          </div>
        )}
        <button
          onClick={async () => {
            const result = await deleteAllDataAction()
            if ('error' in result) setDeleteAllMsg(result.error)
          }}
          className="text-sm font-semibold px-4 py-2 rounded-lg border-2 border-red-300 text-red-700 hover:bg-red-100 transition-colors"
        >
          Alle Daten löschen
        </button>
      </div>

    </div>
  )
}
