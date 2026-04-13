'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle2, Check } from 'lucide-react'
import { useAuthAction } from '@/lib/use-auth-action'
import { saveAgentProfileAction } from './actions'

interface AgentProfileData {
  agency_name: string | null
  license_number: string | null
  property_types: string[] | null
  focus: string | null
  verified_at: string | null
  subscription_tier: string | null
}

interface Props {
  profile: AgentProfileData | null
}

const PROPERTY_TYPES: { value: string; label: string }[] = [
  { value: 'flat', label: 'Wohnung' },
  { value: 'terraced', label: 'Reihenhaus' },
  { value: 'semi-detached', label: 'Doppelhaushälfte' },
  { value: 'detached', label: 'Freistehendes Haus' },
  { value: 'new_build', label: 'Neubau' },
  { value: 'commercial', label: 'Gewerbe' },
]

const FOCUS_OPTIONS = [
  { value: 'sale', label: 'Kauf' },
  { value: 'rent', label: 'Miete' },
  { value: 'both', label: 'Beides' },
]

function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors select-none ${
        active
          ? 'bg-brand border-brand text-[#0F1117]'
          : 'bg-surface border-[#E2E4EB] text-[#5E6278] hover:border-[#C8CCD6]'
      }`}
    >
      {label}
    </button>
  )
}

export function ProfileForm({ profile }: Props) {
  const t = useTranslations('agentDashboard')
  const [state, setState] = useState<{ success?: true; error?: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const { handleAuthRequired } = useAuthAction()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await saveAgentProfileAction(null, formData)
      if (handleAuthRequired(result)) return
      if (!('authRequired' in result)) {
        setState(result)
      }
    })
  }

  const [propertyTypes, setPropertyTypes] = useState<string[]>(profile?.property_types ?? [])
  const [focus, setFocus] = useState(profile?.focus ?? 'both')

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="property_types" value={JSON.stringify(propertyTypes)} />
      <input type="hidden" name="focus" value={focus} />

      {state && 'success' in state && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-sm text-green-800 font-medium flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-700 flex-shrink-0" />
          {t('profileSaved')}
        </div>
      )}
      {state && 'error' in state && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {/* Agency info */}
      <div className="bg-surface rounded-2xl p-6 border border-[#E2E4EB]">
        <h3 className="font-bold text-base mb-5">{t('agencySection')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#5E6278] mb-1">{t('agencyNameLabel')} *</label>
            <input
              type="text"
              name="agency_name"
              required
              defaultValue={profile?.agency_name ?? ''}
              placeholder="z.B. Müller Immobilien GmbH"
              className="w-full border border-[#E2E4EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#5E6278] mb-1">{t('licenseNumberLabel')}</label>
            <input
              type="text"
              name="license_number"
              defaultValue={profile?.license_number ?? ''}
              placeholder="z.B. D-XXXX-XXXXXXX-XX"
              className="w-full border border-[#E2E4EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>
      </div>

      {/* Specialisation */}
      <div className="bg-surface rounded-2xl p-6 border border-[#E2E4EB]">
        <h3 className="font-bold text-base mb-5">{t('specializationSection')}</h3>

        <p className="text-xs font-semibold text-[#5E6278] mb-3 uppercase tracking-wide">{t('focusLabel')}</p>
        <div className="flex gap-3 mb-6">
          {FOCUS_OPTIONS.map(o => (
            <button
              key={o.value}
              type="button"
              onClick={() => setFocus(o.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                focus === o.value ? 'bg-brand border-brand text-[#0F1117]' : 'bg-surface border-[#E2E4EB] text-[#5E6278]'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        <p className="text-xs font-semibold text-[#5E6278] mb-3 uppercase tracking-wide">{t('propertyTypesLabel')}</p>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map(t => (
            <Chip
              key={t.value}
              label={t.label}
              active={propertyTypes.includes(t.value)}
              onClick={() => setPropertyTypes(toggle(propertyTypes, t.value))}
            />
          ))}
        </div>
      </div>

      {/* Verification status */}
      {profile?.verified_at ? (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 text-sm text-green-800 flex items-center gap-2">
          <Check size={14} className="text-green-700 flex-shrink-0" />
          <span>{t('verifiedStatus')} {new Date(profile.verified_at).toLocaleDateString('de-DE')}</span>
        </div>
      ) : (
        <div className="bg-brand-solid-bg border border-brand rounded-2xl px-5 py-4 text-sm text-brand-badge-text">
          <span className="font-semibold">{t('verificationPending')}</span> — {t('verificationInstructions')}
          <a href="mailto:verify@yalla.house" className="underline">verify@yalla.house</a>.
          {t('verificationBenefit')}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand hover:bg-brand-hover disabled:opacity-50 text-[#0F1117] font-bold py-3.5 rounded-2xl text-sm transition-colors"
      >
        {isPending ? t('savingProfile') : t('saveProfile')}
      </button>
    </form>
  )
}
