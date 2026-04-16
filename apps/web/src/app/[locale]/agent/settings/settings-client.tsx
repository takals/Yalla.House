'use client'

import { useState, useTransition } from 'react'

type T = Record<string, string>

function tx(t: T, key: string): string {
  return t[key] ?? key
}

interface Props {
  profile: { full_name: string | null; email: string; phone: string | null }
  agentProfile: { agency_name: string | null; office_address: string | null }
  labels: T
}

export function AgentSettingsClient({ profile, agentProfile, labels: t }: Props) {
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  const [agencyName, setAgencyName] = useState(agentProfile.agency_name ?? '')
  const [agencyAddress, setAgencyAddress] = useState(agentProfile.office_address ?? '')
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  function handleSave() {
    startTransition(async () => {
      try {
        const res = await fetch('/api/agent/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName, phone, agencyName, agencyAddress }),
        })
        if (res.ok) {
          setSaved(true)
          setTimeout(() => setSaved(false), 3000)
        }
      } catch (err) {
        console.error('Failed to save agent settings:', err)
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Profile section */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6">
        <h2 className="text-base font-bold text-[#0F1117] mb-4">{tx(t, 'profile')}</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="agent-full-name" className="text-xs font-semibold text-[#5E6278] mb-1 block">{tx(t, 'fullName')}</label>
            <input
              id="agent-full-name"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full text-sm border border-[#D8DBE5] rounded-lg px-3 py-2.5 bg-white"
            />
          </div>

          <div>
            <label htmlFor="agent-email" className="text-xs font-semibold text-[#5E6278] mb-1 block">{tx(t, 'email')}</label>
            <input
              id="agent-email"
              type="email"
              value={profile.email}
              disabled
              className="w-full text-sm border border-[#D8DBE5] rounded-lg px-3 py-2.5 bg-[#FAFBFC] text-[#999] cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="agent-phone" className="text-xs font-semibold text-[#5E6278] mb-1 block">{tx(t, 'phone')}</label>
            <input
              id="agent-phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full text-sm border border-[#D8DBE5] rounded-lg px-3 py-2.5 bg-white"
            />
          </div>

          <div>
            <label htmlFor="agent-agency-name" className="text-xs font-semibold text-[#5E6278] mb-1 block">{tx(t, 'agencyName')}</label>
            <input
              id="agent-agency-name"
              type="text"
              value={agencyName}
              onChange={e => setAgencyName(e.target.value)}
              className="w-full text-sm border border-[#D8DBE5] rounded-lg px-3 py-2.5 bg-white"
            />
          </div>

          <div>
            <label htmlFor="agent-agency-address" className="text-xs font-semibold text-[#5E6278] mb-1 block">{tx(t, 'agencyAddress')}</label>
            <input
              id="agent-agency-address"
              type="text"
              value={agencyAddress}
              onChange={e => setAgencyAddress(e.target.value)}
              className="w-full text-sm border border-[#D8DBE5] rounded-lg px-3 py-2.5 bg-white"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="text-sm font-bold px-5 py-2.5 bg-[#D4764E] hover:bg-[#BF6840] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? tx(t, 'saving') : tx(t, 'saveChanges')}
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-semibold">{tx(t, 'profileSaved')}</span>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-200 p-6">
        <h2 className="text-base font-bold text-red-600 mb-2">{tx(t, 'dangerZone')}</h2>
        <p className="text-sm text-[#5E6278] mb-4">{tx(t, 'deleteAccountDesc')}</p>
        <button
          disabled
          className="text-sm font-bold px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg opacity-50 cursor-not-allowed"
        >
          {tx(t, 'deleteAccount')}
        </button>
      </div>
    </div>
  )
}
