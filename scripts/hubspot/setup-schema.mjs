#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * HubSpot schema bootstrap for Yalla.House.
 *
 * Creates (idempotently):
 *   - 'Yalla.House' contact property group
 *   - 18 custom contact properties (persona, market, locale, listings, hunter, referrer)
 *   - 'Yalla Owner Pipeline' deal pipeline with 9 stages
 *
 * Safe to re-run. Existing groups/properties/pipelines are detected and skipped.
 *
 * Usage:
 *   export HUBSPOT_PRIVATE_APP_TOKEN=pat-eu1-...
 *   node scripts/hubspot/setup-schema.mjs
 *
 * Required scopes on the Private App:
 *   crm.schemas.contacts.read, crm.schemas.contacts.write
 *   crm.schemas.deals.read, crm.schemas.deals.write
 */

const TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN
const BASE = 'https://api.hubapi.com'

if (!TOKEN) {
  console.error('Missing HUBSPOT_PRIVATE_APP_TOKEN. Set it and re-run.')
  process.exit(1)
}

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  'Content-Type': 'application/json',
}

// ----------------------------------------------------------------------------
// HTTP helpers
// ----------------------------------------------------------------------------
async function hs(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let parsed
  try { parsed = text ? JSON.parse(text) : {} } catch { parsed = { raw: text } }
  return { ok: res.ok, status: res.status, body: parsed }
}

// ----------------------------------------------------------------------------
// Schema definitions
// ----------------------------------------------------------------------------
const GROUP = {
  name: 'yalla_house',
  label: 'Yalla.House',
  displayOrder: -1,
}

const bool = {
  type: 'bool',
  fieldType: 'booleancheckbox',
  options: [
    { label: 'Yes', value: 'true', displayOrder: 0 },
    { label: 'No', value: 'false', displayOrder: 1 },
  ],
}

const CONTACT_PROPERTIES = [
  // ---- Core / persona ----
  {
    name: 'yh_user_role',
    label: 'Yalla User Role',
    description: 'Which persona this contact represents in the Yalla.House marketplace',
    groupName: GROUP.name,
    type: 'enumeration', fieldType: 'select',
    options: [
      { label: 'Owner (Seller)', value: 'owner', displayOrder: 0 },
      { label: 'Hunter (Buyer/Renter)', value: 'hunter', displayOrder: 1 },
      { label: 'Agent (Field)', value: 'agent', displayOrder: 2 },
      { label: 'Partner (Service Provider)', value: 'partner', displayOrder: 3 },
      { label: 'Referrer (Affiliate)', value: 'referrer', displayOrder: 4 },
      { label: 'Admin (Internal)', value: 'admin', displayOrder: 5 },
      { label: 'Other', value: 'other', displayOrder: 6 },
    ],
  },
  {
    name: 'yh_market',
    label: 'Yalla Market',
    description: 'Geographic market the contact is in',
    groupName: GROUP.name,
    type: 'enumeration', fieldType: 'select',
    options: [
      { label: 'Germany (DE)', value: 'DE', displayOrder: 0 },
      { label: 'United Kingdom (UK)', value: 'UK', displayOrder: 1 },
      { label: 'Both', value: 'both', displayOrder: 2 },
      { label: 'Undecided', value: 'undecided', displayOrder: 3 },
    ],
  },
  {
    name: 'yh_locale',
    label: 'Yalla Preferred Locale',
    description: 'Language the contact uses on the site',
    groupName: GROUP.name,
    type: 'enumeration', fieldType: 'select',
    options: [
      { label: 'Deutsch (de)', value: 'de', displayOrder: 0 },
      { label: 'English (en)', value: 'en', displayOrder: 1 },
    ],
  },
  {
    name: 'yh_referral_source',
    label: 'Yalla Referral Source',
    description: 'Where the contact originated from',
    groupName: GROUP.name,
    type: 'enumeration', fieldType: 'select',
    options: [
      { label: 'Organic search', value: 'organic', displayOrder: 0 },
      { label: 'Direct', value: 'direct', displayOrder: 1 },
      { label: 'Paid search', value: 'paid_search', displayOrder: 2 },
      { label: 'Paid social', value: 'paid_social', displayOrder: 3 },
      { label: 'Content / SEO', value: 'content', displayOrder: 4 },
      { label: 'Referrer (affiliate)', value: 'referrer', displayOrder: 5 },
      { label: 'Partner', value: 'partner', displayOrder: 6 },
      { label: 'Outbound', value: 'outbound', displayOrder: 7 },
      { label: 'Other', value: 'other', displayOrder: 8 },
    ],
  },
  { name: 'yh_signup_at', label: 'Yalla Signup Date', description: 'When the contact created their Yalla.House account', groupName: GROUP.name, type: 'datetime', fieldType: 'date' },
  { name: 'yh_last_active_at', label: 'Yalla Last Active', description: 'Most recent activity timestamp from the product', groupName: GROUP.name, type: 'datetime', fieldType: 'date' },

  // ---- Owner-specific ----
  { name: 'yh_listing_count', label: 'Yalla Listings (Count)', description: 'Number of property listings this Owner has created', groupName: GROUP.name, type: 'number', fieldType: 'number' },
  { name: 'yh_listing_value_total', label: 'Yalla Listings (Total Value)', description: 'Combined asking price of all this Owner\'s listings (in EUR for DE, GBP for UK)', groupName: GROUP.name, type: 'number', fieldType: 'number' },
  {
    name: 'yh_listing_status',
    label: 'Yalla Listing Status',
    description: 'Status of the Owner\'s primary listing',
    groupName: GROUP.name,
    type: 'enumeration', fieldType: 'select',
    options: [
      { label: 'None', value: 'none', displayOrder: 0 },
      { label: 'Draft', value: 'draft', displayOrder: 1 },
      { label: 'Active', value: 'active', displayOrder: 2 },
      { label: 'Under offer', value: 'under_offer', displayOrder: 3 },
      { label: 'Sold', value: 'sold', displayOrder: 4 },
      { label: 'Withdrawn', value: 'withdrawn', displayOrder: 5 },
    ],
  },
  { name: 'yh_portal_immoscout', label: 'Listed on ImmoScout24', description: 'Owner has published a listing to ImmoScout24', groupName: GROUP.name, ...bool },
  { name: 'yh_portal_immowelt', label: 'Listed on Immowelt', description: 'Owner has published a listing to Immowelt', groupName: GROUP.name, ...bool },
  { name: 'yh_portal_rightmove', label: 'Listed on Rightmove', description: 'Owner has published a listing to Rightmove (UK)', groupName: GROUP.name, ...bool },
  { name: 'yh_portal_zoopla', label: 'Listed on Zoopla', description: 'Owner has published a listing to Zoopla (UK)', groupName: GROUP.name, ...bool },

  // ---- Hunter-specific ----
  { name: 'yh_offers_made', label: 'Yalla Offers Made', description: 'Number of offers this Hunter has submitted', groupName: GROUP.name, type: 'number', fieldType: 'number' },
  { name: 'yh_viewings_attended', label: 'Yalla Viewings Attended', description: 'Number of viewings this Hunter has attended', groupName: GROUP.name, type: 'number', fieldType: 'number' },
  { name: 'yh_budget_min', label: 'Yalla Budget (Min)', description: 'Minimum of Hunter\'s budget range', groupName: GROUP.name, type: 'number', fieldType: 'number' },
  { name: 'yh_budget_max', label: 'Yalla Budget (Max)', description: 'Maximum of Hunter\'s budget range', groupName: GROUP.name, type: 'number', fieldType: 'number' },

  // ---- Referrer-specific ----
  { name: 'yh_payouts_total', label: 'Yalla Referrer Payouts Total', description: 'Lifetime payouts to this Referrer (via Stripe Connect)', groupName: GROUP.name, type: 'number', fieldType: 'number' },
]

const PIPELINE = {
  label: 'Yalla Owner Pipeline',
  displayOrder: 1,
  stages: [
    { label: 'Lead', metadata: { probability: '0.10', isClosed: 'false' }, displayOrder: 0 },
    { label: 'Onboarded', metadata: { probability: '0.15', isClosed: 'false' }, displayOrder: 1 },
    { label: 'Listing in progress', metadata: { probability: '0.30', isClosed: 'false' }, displayOrder: 2 },
    { label: 'Listed (live on portals)', metadata: { probability: '0.50', isClosed: 'false' }, displayOrder: 3 },
    { label: 'Viewings active', metadata: { probability: '0.65', isClosed: 'false' }, displayOrder: 4 },
    { label: 'Offer received', metadata: { probability: '0.80', isClosed: 'false' }, displayOrder: 5 },
    { label: 'Under offer (accepted)', metadata: { probability: '0.90', isClosed: 'false' }, displayOrder: 6 },
    { label: 'Completed / Sold', metadata: { probability: '1.0', isClosed: 'true' }, displayOrder: 7 },
    { label: 'Withdrawn / Did not list', metadata: { probability: '0.0', isClosed: 'true' }, displayOrder: 8 },
  ],
}

// ----------------------------------------------------------------------------
// Setup: property group
// ----------------------------------------------------------------------------
async function ensureGroup() {
  const list = await hs('GET', '/crm/v3/properties/contacts/groups')
  if (!list.ok) throw new Error(`Failed to list groups: ${JSON.stringify(list.body)}`)
  const exists = list.body.results?.find((g) => g.name === GROUP.name)
  if (exists) {
    console.log(`  [skip] Group "${GROUP.label}" already exists`)
    return
  }
  const res = await hs('POST', '/crm/v3/properties/contacts/groups', GROUP)
  if (!res.ok) throw new Error(`Failed to create group: ${JSON.stringify(res.body)}`)
  console.log(`  [create] Group "${GROUP.label}"`)
}

// ----------------------------------------------------------------------------
// Setup: properties
// ----------------------------------------------------------------------------
async function ensureProperties() {
  const list = await hs('GET', '/crm/v3/properties/contacts')
  if (!list.ok) throw new Error(`Failed to list properties: ${JSON.stringify(list.body)}`)
  const existing = new Set(list.body.results.map((p) => p.name))

  for (const prop of CONTACT_PROPERTIES) {
    if (existing.has(prop.name)) {
      console.log(`  [skip] Property "${prop.name}" already exists`)
      continue
    }
    const res = await hs('POST', '/crm/v3/properties/contacts', prop)
    if (!res.ok) {
      console.error(`  [fail] Property "${prop.name}": ${JSON.stringify(res.body)}`)
      continue
    }
    console.log(`  [create] Property "${prop.name}" (${prop.label})`)
  }
}

// ----------------------------------------------------------------------------
// Setup: pipeline
// ----------------------------------------------------------------------------
async function ensurePipeline() {
  const list = await hs('GET', '/crm/v3/pipelines/deals')
  if (!list.ok) throw new Error(`Failed to list pipelines: ${JSON.stringify(list.body)}`)

  // Already created exactly as we want it
  const matchByLabel = list.body.results?.find((p) => p.label === PIPELINE.label)
  if (matchByLabel) {
    console.log(`  [skip] Pipeline "${PIPELINE.label}" already exists (id ${matchByLabel.id})`)
    console.log(`         Pipeline ID for env: HUBSPOT_OWNER_PIPELINE_ID=${matchByLabel.id}`)
    return matchByLabel.id
  }

  // Try to create. On Free CRM (1-pipeline limit) this 403s — fall back to
  // PATCHing the existing default pipeline in place.
  const create = await hs('POST', '/crm/v3/pipelines/deals', PIPELINE)
  if (create.ok) {
    console.log(`  [create] Pipeline "${PIPELINE.label}" (id ${create.body.id})`)
    console.log(`         Pipeline ID for env: HUBSPOT_OWNER_PIPELINE_ID=${create.body.id}`)
    return create.body.id
  }

  const isPipelineLimit =
    create.body?.category === 'API_LIMIT' ||
    /limit of \d+ deal pipelines/i.test(create.body?.message || '')

  if (!isPipelineLimit) {
    throw new Error(`Failed to create pipeline: ${JSON.stringify(create.body)}`)
  }

  // Free CRM: rewrite the (single) existing default pipeline
  if (!list.body.results?.length) {
    throw new Error('Pipeline limit hit but no existing pipelines found — odd.')
  }
  const target = list.body.results[0]
  console.log(`  [info] Free CRM 1-pipeline limit; converting existing "${target.label}" (id ${target.id})`)

  // 1. Rename / relabel the pipeline
  const renamePatch = await hs('PATCH', `/crm/v3/pipelines/deals/${target.id}`, { label: PIPELINE.label })
  if (!renamePatch.ok) throw new Error(`Failed to rename pipeline: ${JSON.stringify(renamePatch.body)}`)
  console.log(`  [patch ] Renamed pipeline → "${PIPELINE.label}"`)

  // 2. Reconcile stages — create our new ones, archive the leftover defaults
  const existingStages = target.stages || []
  const existingStageLabels = new Set(existingStages.map((s) => s.label))
  const desiredStageLabels = new Set(PIPELINE.stages.map((s) => s.label))

  // Create any of our stages that don't exist yet
  for (const stage of PIPELINE.stages) {
    if (existingStageLabels.has(stage.label)) {
      console.log(`  [skip ] Stage "${stage.label}" already exists`)
      continue
    }
    const r = await hs('POST', `/crm/v3/pipelines/deals/${target.id}/stages`, stage)
    if (!r.ok) {
      console.error(`  [fail ] Stage "${stage.label}": ${JSON.stringify(r.body)}`)
      continue
    }
    console.log(`  [create] Stage "${stage.label}" (prob ${stage.metadata.probability})`)
  }

  // Archive any default stages we don't want
  for (const stage of existingStages) {
    if (desiredStageLabels.has(stage.label)) continue
    const r = await hs('DELETE', `/crm/v3/pipelines/deals/${target.id}/stages/${stage.id}`)
    if (!r.ok) {
      console.error(`  [fail ] Archive stage "${stage.label}": ${JSON.stringify(r.body)}`)
      continue
    }
    console.log(`  [archive] Stage "${stage.label}"`)
  }

  console.log(`         Pipeline ID for env: HUBSPOT_OWNER_PIPELINE_ID=${target.id}`)
  return target.id
}

// ----------------------------------------------------------------------------
// Run
// ----------------------------------------------------------------------------
async function main() {
  console.log('\nYalla.House · HubSpot schema setup\n')

  console.log('1. Property group')
  await ensureGroup()

  console.log('\n2. Custom contact properties (' + CONTACT_PROPERTIES.length + ')')
  await ensureProperties()

  console.log('\n3. Deal pipeline')
  const pipelineId = await ensurePipeline()

  console.log('\nDone. Add to apps/web/.env.local:')
  console.log('  HUBSPOT_PRIVATE_APP_TOKEN=<your rotated token>')
  console.log('  HUBSPOT_PORTAL_ID=<your portal id, find in Settings > Account>')
  console.log('  HUBSPOT_OWNER_PIPELINE_ID=' + (pipelineId ?? '<see above>'))
  console.log('\nNext: run `pnpm dev` and open the site to verify the tracking script loads.\n')
}

main().catch((err) => {
  console.error('\nSetup failed:', err.message)
  process.exit(1)
})
