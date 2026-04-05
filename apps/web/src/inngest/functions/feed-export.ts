import { inngest } from '@/lib/inngest/client'
import { createServiceClient } from '@/lib/supabase/server'
import { connectorRegistry } from '@yalla/integrations'
import type { Listing, PortalConfig, PortalCredentials, PortalFieldMapping } from '@yalla/integrations'

interface StatusOpts {
  externalId?: string | undefined
  validationErrors?: unknown[] | undefined
  setSubmittedAt?: boolean | undefined
  setLiveAt?: boolean | undefined
}

export const feedExport = inngest.createFunction(
  { id: 'feed.export', retries: 3 },
  { event: 'feed/export.requested' },
  async ({ event, step }) => {
    const { listingId, portalId } = event.data

    // Fetch all required data in parallel
    const [listing, portal, mappings, creds] = await step.run('fetch-data', async () => {
      const db = createServiceClient()

      const [listingRes, portalRes, mappingsRes, credsRes] = await Promise.all([
        db.from('listings')
          .select('*, listing_media(*)')
          .eq('id', listingId)
          .single(),
        db.from('portal_config')
          .select('*')
          .eq('id', portalId)
          .single(),
        db.from('portal_field_mappings')
          .select('*')
          .eq('portal_id', portalId),
        db.from('portal_credentials')
          .select('key_name, key_value')
          .eq('portal_id', portalId)
          .eq('environment', process.env['NODE_ENV'] === 'production' ? 'production' : 'sandbox'),
      ])

      if (listingRes.error) throw new Error(`Listing not found: ${listingRes.error.message}`)
      if (portalRes.error) throw new Error(`Portal not found: ${portalRes.error.message}`)

      // Build credentials map
      const credMap: PortalCredentials = {}
      for (const c of (credsRes.data ?? []) as Array<{ key_name: string; key_value: string }>) {
        credMap[c.key_name] = c.key_value
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return [listingRes.data, portalRes.data as any, mappingsRes.data ?? [], credMap] as const
    })

    if (!portal) {
      await updatePortalStatus(listingId, portalId, 'failed', 'Portal config not found')
      return { status: 'failed', error: 'Portal config not found' }
    }

    // Check connector is available
    if (!connectorRegistry.has(portal.slug)) {
      await updatePortalStatus(listingId, portalId, 'failed', `No connector for portal: ${portal.slug}`)
      return { status: 'failed', error: `No connector registered for ${portal.slug}` }
    }

    const connector = connectorRegistry.get(portal.slug)

    // Validate
    const validation = await step.run('validate', () =>
      connector.validateListing(listing as unknown as Listing, portal as unknown as PortalConfig)
    )

    if (!validation.valid) {
      const errMsg = validation.errors[0]?.message_de ?? validation.errors[0]?.message ?? 'Validation failed'
      await updatePortalStatus(listingId, portalId, 'failed', errMsg, {
        validationErrors: validation.errors,
      })
      return { status: 'failed', errors: validation.errors }
    }

    // Transform
    const payload = await step.run('transform', () =>
      connector.transformListing(listing as unknown as Listing, mappings as unknown as PortalFieldMapping[])
    )

    // Check if existing external ID
    const db = createServiceClient()
    const { data: existingStatus } = await db
      .from('listing_portal_status')
      .select('external_id')
      .eq('listing_id', listingId)
      .eq('portal_id', portalId)
      .single()

    const existingExternalId = (existingStatus as { external_id?: string } | null)?.external_id
    const isNewSubmission = !existingExternalId

    // Submit or update
    const result = existingExternalId
      ? await step.run('update', () =>
          connector.updateListing(existingExternalId, payload, creds as PortalCredentials)
        )
      : await step.run('submit', () =>
          connector.submitListing(payload, creds as PortalCredentials)
        )

    // Persist result — set submitted_at on first submission, live_at when portal confirms live
    await updatePortalStatus(
      listingId,
      portalId,
      result.status === 'published' ? 'published' : 'failed',
      result.message ?? null,
      {
        externalId: result.externalId || undefined,
        setSubmittedAt: isNewSubmission,
        setLiveAt: result.status === 'published',
      }
    )

    return result
  }
)

async function updatePortalStatus(
  listingId: string,
  portalId: string,
  status: string,
  errorMessage: string | null,
  opts: StatusOpts = {}
) {
  const db = createServiceClient()
  const now = new Date().toISOString()

  const row: Record<string, unknown> = {
    listing_id: listingId,
    portal_id: portalId,
    status,
    external_id: opts.externalId ?? null,
    error_message: errorMessage,
    last_sync_at: now,
    ...(opts.validationErrors !== undefined && { validation_errors: opts.validationErrors }),
    ...(opts.setSubmittedAt && { submitted_at: now }),
    ...(opts.setLiveAt && { live_at: now }),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db.from('listing_portal_status') as any).upsert(row, { onConflict: 'listing_id,portal_id' })
}
