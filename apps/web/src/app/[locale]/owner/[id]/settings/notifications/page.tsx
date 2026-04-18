import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth-guard'
import { redirect } from 'next/navigation'
import { TemplateEditor } from './template-editor'

const EVENT_TYPES = [
  'viewing_confirmed_hunter',
  'viewing_confirmed_owner',
  'viewing_reminder_24h_hunter',
  'viewing_reminder_24h_owner',
  'viewing_reminder_1h_hunter',
  'viewing_reminder_1h_owner',
  'viewing_checkin_hunter',
  'viewing_completed_owner',
  'viewing_request_owner',
  'viewing_declined_hunter',
] as const

const CHANNELS = ['email', 'sms'] as const

interface TemplateRow {
  id: string
  listing_id: string | null
  event_type: string
  channel: string
  subject: string | null
  body_template: string
  is_active: boolean
  is_custom: boolean
}

interface Template {
  id: string
  eventType: string
  channel: 'email' | 'sms'
  subject: string | null
  bodyTemplate: string
  isActive: boolean
  isCustom: boolean
}

export default async function NotificationTemplatesPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params
  const auth = await requireAuth()
  if (!auth.authenticated) {
    redirect(`/${locale === 'en' ? 'en/' : ''}login`)
  }

  const supabase = await createClient()

  // Verify ownership
  const { data: listing } = await (supabase as unknown as {
    from: (table: string) => {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{ data: { owner_id: string } | null }>
        }
      }
    }
  })
    .from('listings')
    .select('owner_id')
    .eq('id', id)
    .single()

  if (!listing || listing.owner_id !== auth.userId) {
    redirect(`/${locale === 'en' ? 'en/' : ''}owner`)
  }

  // Fetch custom templates for this listing
  const { data: customTemplates } = await (supabase.from('notification_templates') as unknown as {
    select: (cols: string) => {
      eq: (col: string, val: string) => Promise<{ data: TemplateRow[] | null }>
    }
  })
    .select('*')
    .eq('listing_id', id)

  // Fetch platform defaults (listing_id IS NULL)
  const { data: defaultTemplates } = await (supabase.from('notification_templates') as unknown as {
    select: (cols: string) => {
      is: (col: string, val: null) => Promise<{ data: TemplateRow[] | null }>
    }
  })
    .select('*')
    .is('listing_id', null)

  // Merge: for each event_type + channel, use custom if exists, else default
  const customMap = new Map<string, TemplateRow>()
  for (const t of customTemplates ?? []) {
    customMap.set(`${t.event_type}_${t.channel}`, t)
  }

  const defaultMap = new Map<string, TemplateRow>()
  for (const t of defaultTemplates ?? []) {
    defaultMap.set(`${t.event_type}_${t.channel}`, t)
  }

  const merged: Template[] = []
  for (const eventType of EVENT_TYPES) {
    for (const channel of CHANNELS) {
      const key = `${eventType}_${channel}`
      const custom = customMap.get(key)
      const fallback = defaultMap.get(key)
      const source = custom ?? fallback

      if (source) {
        merged.push({
          id: source.id,
          eventType,
          channel: channel as 'email' | 'sms',
          subject: source.subject,
          bodyTemplate: source.body_template,
          isActive: source.is_active,
          isCustom: !!custom,
        })
      } else {
        // No template exists at all — create a placeholder
        merged.push({
          id: `placeholder_${key}`,
          eventType,
          channel: channel as 'email' | 'sms',
          subject: channel === 'email' ? '' : null,
          bodyTemplate: '',
          isActive: true,
          isCustom: false,
        })
      }
    }
  }

  const t = await getTranslations('ownerNotificationSettings')

  const labelKeys = [
    'title', 'subtitle', 'emailTab', 'smsTab', 'subjectLabel', 'bodyLabel',
    'previewLabel', 'variablesLabel', 'charCount', 'charWarning',
    'save', 'saving', 'saved', 'reset', 'resetConfirm', 'customBadge',
    'active', 'inactive',
    ...EVENT_TYPES.map((e) => `event_${e}`),
    ...EVENT_TYPES.map((e) => `eventDesc_${e}`),
  ]

  const labels: Record<string, string> = {}
  for (const key of labelKeys) {
    labels[key] = t(key)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{labels.title}</h1>
        <p className="mt-1 text-sm text-gray-500">{labels.subtitle}</p>
      </div>
      <TemplateEditor listingId={id} templates={merged} labels={labels} />
    </div>
  )
}
