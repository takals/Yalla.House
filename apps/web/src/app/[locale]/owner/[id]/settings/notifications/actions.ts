'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'

type ActionResult = { success: true } | { error: string }

async function verifyOwnership(
  listingId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await (supabase.from('listings') as any)
    .select('id')
    .eq('id', listingId)
    .eq('owner_id', userId)
    .single()

  return !!data
}

export async function saveCustomTemplateAction(opts: {
  listingId: string
  eventType: string
  channel: 'email' | 'sms'
  subject?: string
  bodyTemplate: string
}): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { error: 'Not authenticated' }
  }

  const owns = await verifyOwnership(opts.listingId, auth.userId)
  if (!owns) {
    return { error: 'Not authorized' }
  }

  const supabase = await createClient()

  // Delete existing custom template for this combo
  await (supabase.from('notification_templates') as any)
    .delete()
    .eq('listing_id', opts.listingId)
    .eq('event_type', opts.eventType)
    .eq('channel', opts.channel)
    .eq('is_custom', true)

  // Insert new custom template
  const { error } = await (supabase.from('notification_templates') as any)
    .insert({
      listing_id: opts.listingId,
      event_type: opts.eventType,
      channel: opts.channel,
      subject: opts.channel === 'email' ? (opts.subject ?? '') : null,
      body_template: opts.bodyTemplate,
      is_custom: true,
      is_active: true,
    })

  if (error) {
    console.error('saveCustomTemplateAction error:', error)
    return { error: error.message }
  }

  return { success: true }
}

export async function resetTemplateAction(opts: {
  listingId: string
  eventType: string
  channel: 'email' | 'sms'
}): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { error: 'Not authenticated' }
  }

  const owns = await verifyOwnership(opts.listingId, auth.userId)
  if (!owns) {
    return { error: 'Not authorized' }
  }

  const supabase = await createClient()

  const { error } = await (supabase.from('notification_templates') as any)
    .delete()
    .eq('listing_id', opts.listingId)
    .eq('event_type', opts.eventType)
    .eq('channel', opts.channel)
    .eq('is_custom', true)

  if (error) {
    console.error('resetTemplateAction error:', error)
    return { error: error.message }
  }

  return { success: true }
}

export async function toggleTemplateChannelAction(opts: {
  listingId: string
  eventType: string
  channel: 'email' | 'sms'
  isActive: boolean
}): Promise<ActionResult> {
  const auth = await requireAuth()
  if (!auth.authenticated) {
    return { error: 'Not authenticated' }
  }

  const owns = await verifyOwnership(opts.listingId, auth.userId)
  if (!owns) {
    return { error: 'Not authorized' }
  }

  const supabase = await createClient()

  // Check if a custom row exists for this combo
  const { data: existing } = await (supabase.from('notification_templates') as any)
    .select('id, body_template, subject')
    .eq('listing_id', opts.listingId)
    .eq('event_type', opts.eventType)
    .eq('channel', opts.channel)
    .single()

  if (existing) {
    // Update existing custom row
    const { error } = await (supabase.from('notification_templates') as any)
      .update({ is_active: opts.isActive })
      .eq('id', existing.id)

    if (error) {
      console.error('toggleTemplateChannelAction update error:', error)
      return { error: error.message }
    }
  } else {
    // Get the default template to copy body/subject
    const { data: defaultRow } = await (supabase.from('notification_templates') as any)
      .select('body_template, subject')
      .is('listing_id', null)
      .eq('event_type', opts.eventType)
      .eq('channel', opts.channel)
      .single()

    const { error } = await (supabase.from('notification_templates') as any)
      .insert({
        listing_id: opts.listingId,
        event_type: opts.eventType,
        channel: opts.channel,
        subject: defaultRow?.subject ?? null,
        body_template: defaultRow?.body_template ?? '',
        is_custom: false,
        is_active: opts.isActive,
      })

    if (error) {
      console.error('toggleTemplateChannelAction insert error:', error)
      return { error: error.message }
    }
  }

  return { success: true }
}
