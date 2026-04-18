'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'

type ActionResult = { success: true } | { error: string }

export async function getNotificationPreferences() {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { error: 'Not authenticated' }
  }

  const supabase = await createClient()
  const { data, error } = await (supabase.from('notification_preferences') as unknown as {
    select: (cols: string) => { eq: (col: string, val: string) => { single: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }> } }
  })
    .select('*')
    .eq('user_id', auth.userId)
    .single()

  if (error && !data) {
    return { error: error.message }
  }

  return { data }
}

export async function updateNotificationPreferences(opts: {
  emailEnabled: boolean
  smsEnabled: boolean
  whatsappEnabled: boolean
  quietHoursStart: string | null
  quietHoursEnd: string | null
}): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { error: 'Not authenticated' }
  }

  const supabase = await createClient()
  const row = {
    user_id: auth.userId,
    email_enabled: opts.emailEnabled,
    sms_enabled: opts.smsEnabled,
    whatsapp_enabled: opts.whatsappEnabled,
    quiet_hours_start: opts.quietHoursStart,
    quiet_hours_end: opts.quietHoursEnd,
    updated_at: new Date().toISOString(),
  }

  const { error } = await (supabase.from('notification_preferences') as unknown as {
    upsert: (row: Record<string, unknown>, opts: { onConflict: string }) => Promise<{ error: { message: string } | null }>
  })
    .upsert(row, { onConflict: 'user_id' })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

function normalizePhoneToE164(phone: string): string {
  // Strip all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, '')
  if (cleaned.startsWith('+')) return cleaned
  if (cleaned.startsWith('0')) return '+44' + cleaned.slice(1)
  return '+' + cleaned
}

export async function sendPhoneVerificationCode(phone: string): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { error: 'Not authenticated' }
  }

  const accountSid = process.env['TWILIO_ACCOUNT_SID']
  const authToken = process.env['TWILIO_AUTH_TOKEN']
  const serviceSid = process.env['TWILIO_VERIFY_SERVICE_SID']

  if (!accountSid || !authToken || !serviceSid) {
    return { error: 'Phone verification is not configured' }
  }

  const normalizedPhone = normalizePhoneToE164(phone)

  // Store the phone number being verified in the user's preferences row
  const supabase = await createClient()
  await (supabase.from('notification_preferences') as unknown as {
    upsert: (row: Record<string, unknown>, opts: { onConflict: string }) => Promise<{ error: unknown }>
  })
    .upsert(
      { user_id: auth.userId, pending_phone: normalizedPhone, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

  const response = await fetch(
    `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: normalizedPhone,
        Channel: 'sms',
      }),
    }
  )

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>
    return { error: (body['message'] as string) ?? 'Failed to send verification code' }
  }

  return { success: true }
}

export async function verifyPhoneCode(code: string): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { error: 'Not authenticated' }
  }

  const accountSid = process.env['TWILIO_ACCOUNT_SID']
  const authToken = process.env['TWILIO_AUTH_TOKEN']
  const serviceSid = process.env['TWILIO_VERIFY_SERVICE_SID']

  if (!accountSid || !authToken || !serviceSid) {
    return { error: 'Phone verification is not configured' }
  }

  // Retrieve the pending phone number
  const supabase = await createClient()
  const { data: prefs } = await (supabase.from('notification_preferences') as unknown as {
    select: (cols: string) => { eq: (col: string, val: string) => { single: () => Promise<{ data: Record<string, unknown> | null }> } }
  })
    .select('pending_phone')
    .eq('user_id', auth.userId)
    .single()

  const pendingPhone = prefs?.['pending_phone'] as string | null
  if (!pendingPhone) {
    return { error: 'No pending phone verification' }
  }

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64')

  const response = await fetch(
    `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: pendingPhone,
        Code: code,
      }),
    }
  )

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as Record<string, unknown>
    return { error: (body['message'] as string) ?? 'Verification failed' }
  }

  const result = await response.json() as Record<string, unknown>
  if (result['status'] !== 'approved') {
    return { error: 'Invalid code' }
  }

  // Update the preferences with the verified phone number
  await (supabase.from('notification_preferences') as unknown as {
    update: (row: Record<string, unknown>) => { eq: (col: string, val: string) => Promise<{ error: unknown }> }
  })
    .update({
      phone_number: pendingPhone,
      phone_verified: true,
      pending_phone: null,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', auth.userId)

  return { success: true }
}
