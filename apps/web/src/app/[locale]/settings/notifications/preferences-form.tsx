'use client'

import { useState, useTransition } from 'react'
import { Mail, MessageSquare, MessageCircle, Phone, Clock, Check } from 'lucide-react'
import {
  updateNotificationPreferences,
  sendPhoneVerificationCode,
  verifyPhoneCode,
} from './actions'

interface Props {
  initialPrefs: {
    emailEnabled: boolean
    smsEnabled: boolean
    whatsappEnabled: boolean
    phoneNumber: string | null
    phoneVerified: boolean
    quietHoursStart: string | null
    quietHoursEnd: string | null
  }
  labels: Record<string, string>
}

type PhoneVerifyState = 'idle' | 'codeSent' | 'verified'

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (val: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-2 ${
        checked ? 'bg-brand' : 'bg-gray-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export function NotificationPreferencesForm({ initialPrefs, labels }: Props) {
  const [emailEnabled, setEmailEnabled] = useState(initialPrefs.emailEnabled)
  const [smsEnabled, setSmsEnabled] = useState(initialPrefs.smsEnabled)
  const [whatsappEnabled, setWhatsappEnabled] = useState(initialPrefs.whatsappEnabled)
  const [quietHoursStart, setQuietHoursStart] = useState(initialPrefs.quietHoursStart ?? '22:00')
  const [quietHoursEnd, setQuietHoursEnd] = useState(initialPrefs.quietHoursEnd ?? '08:00')

  const [phoneNumber, setPhoneNumber] = useState(initialPrefs.phoneNumber ?? '')
  const [phoneInput, setPhoneInput] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(initialPrefs.phoneVerified)
  const [phoneVerifyState, setPhoneVerifyState] = useState<PhoneVerifyState>(
    initialPrefs.phoneVerified ? 'verified' : 'idle'
  )
  const [verificationCode, setVerificationCode] = useState('')
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [isChangingPhone, setIsChangingPhone] = useState(false)

  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [isPending, startTransition] = useTransition()

  const showPhoneSection = (smsEnabled || whatsappEnabled) && (!phoneVerified || isChangingPhone)

  async function handleSendCode() {
    if (!phoneInput.trim()) return
    setPhoneError(null)
    const result = await sendPhoneVerificationCode(phoneInput)
    if ('error' in result) {
      setPhoneError(result.error)
    } else {
      setPhoneVerifyState('codeSent')
    }
  }

  async function handleVerifyCode() {
    if (!verificationCode.trim()) return
    setPhoneError(null)
    const result = await verifyPhoneCode(verificationCode)
    if ('error' in result) {
      setPhoneError(result.error)
    } else {
      setPhoneVerifyState('verified')
      setPhoneVerified(true)
      setPhoneNumber(phoneInput)
      setIsChangingPhone(false)
      setVerificationCode('')
    }
  }

  function handleChangePhone() {
    setIsChangingPhone(true)
    setPhoneVerifyState('idle')
    setPhoneInput('')
    setVerificationCode('')
    setPhoneError(null)
  }

  async function handleSave() {
    setSaveState('saving')
    startTransition(async () => {
      const result = await updateNotificationPreferences({
        emailEnabled,
        smsEnabled,
        whatsappEnabled,
        quietHoursStart,
        quietHoursEnd,
      })

      if ('error' in result) {
        setSaveState('idle')
        return
      }

      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    })
  }

  return (
    <div className="space-y-6">
      {/* Section A: Channel Settings */}
      <div className="bg-surface rounded-card p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {labels.channelSettingsTitle}
        </h2>
        <div className="space-y-4">
          {/* Email toggle */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{labels.emailToggle}</p>
                <p className="text-sm text-gray-500">{labels.emailDesc}</p>
              </div>
            </div>
            <Toggle checked={emailEnabled} onChange={setEmailEnabled} />
          </div>

          {/* SMS toggle */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{labels.smsToggle}</p>
                  <p className="text-sm text-gray-500">{labels.smsDesc}</p>
                </div>
              </div>
              <Toggle checked={smsEnabled} onChange={setSmsEnabled} />
            </div>
          </div>

          {/* WhatsApp toggle */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                  <MessageCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{labels.whatsappToggle}</p>
                  <p className="text-sm text-gray-500">{labels.whatsappDesc}</p>
                </div>
              </div>
              <Toggle checked={whatsappEnabled} onChange={setWhatsappEnabled} />
            </div>
          </div>
        </div>
      </div>

      {/* Section B: Phone Number */}
      {(smsEnabled || whatsappEnabled) && (
        <div className="bg-surface rounded-card p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="h-5 w-5 text-gray-600" />
            {labels.phoneTitle}
          </h2>

          {phoneVerified && !isChangingPhone ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-900 font-medium">{phoneNumber}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  <Check className="h-3 w-3" />
                  {labels.phoneVerified}
                </span>
              </div>
              <button
                type="button"
                onClick={handleChangePhone}
                className="text-sm font-medium text-brand hover:text-brand/80 transition-colors"
              >
                {labels.phoneChange}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {phoneVerifyState === 'idle' && (
                <div className="flex gap-2">
                  <div className="flex-1 flex">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                      +44
                    </span>
                    <input
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder={labels.phonePlaceholder}
                      className="block w-full rounded-r-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={!phoneInput.trim()}
                    className="shrink-0 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {labels.sendCode}
                  </button>
                </div>
              )}

              {phoneVerifyState === 'codeSent' && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">{labels.codeHint}</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder={labels.codePlaceholder}
                      className="block w-40 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 text-center tracking-widest placeholder:text-gray-400 placeholder:tracking-normal focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={verificationCode.length < 6}
                      className="shrink-0 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {labels.verifyCode}
                    </button>
                  </div>
                </div>
              )}

              {phoneError && (
                <p className="text-sm text-red-600">{phoneError}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Section C: Quiet Hours */}
      <div className="bg-surface rounded-card p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-600" />
          {labels.quietHoursTitle}
        </h2>
        <p className="text-sm text-gray-500 mb-4">{labels.quietHoursDesc}</p>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="quiet-start" className="text-sm font-medium text-gray-700">
              {labels.quietHoursFrom}
            </label>
            <input
              id="quiet-start"
              type="time"
              value={quietHoursStart}
              onChange={(e) => setQuietHoursStart(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="quiet-end" className="text-sm font-medium text-gray-700">
              {labels.quietHoursTo}
            </label>
            <input
              id="quiet-end"
              type="time"
              value={quietHoursEnd}
              onChange={(e) => setQuietHoursEnd(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-400">{labels.quietHoursNote}</p>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || saveState === 'saving'}
          className="rounded-md bg-brand px-6 py-2.5 text-sm font-medium text-white hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveState === 'saving'
            ? labels.saving
            : saveState === 'saved'
              ? labels.saved
              : labels.save}
        </button>
      </div>
    </div>
  )
}
