import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export const maxDuration = 60

const MAX_BYTES = 8 * 1024 * 1024
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_TYPES = [...IMAGE_TYPES, 'application/pdf']

/**
 * POST /api/agent/verify
 *
 * Fully automated agent verification: the agent uploads a licence /
 * professional-membership document, Claude reads it and checks it against the
 * agency on their profile, and on a confident match verified_at is set —
 * no human in the loop. Every attempt is stored in agent_verifications.
 */
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Verification is temporarily unavailable.' }, { status: 503 })
  }

  const service = createServiceClient()

  // Must have an agent profile (we verify the DOCUMENT against the AGENCY)
  const { data: profile } = await (service.from('agent_profiles') as any)
    .select('agency_name, verified_at, license_number')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!profile?.agency_name) {
    return NextResponse.json({ error: 'Complete your profile (agency name) first.' }, { status: 400 })
  }
  if (profile.verified_at) {
    return NextResponse.json({ status: 'approved', alreadyVerified: true })
  }

  const formData = await request.formData()
  const file = formData.get('document') as File | null
  const licenceNumber = ((formData.get('licence_number') as string) || '').trim().slice(0, 100)

  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No document uploaded.' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Please upload a PDF, JPG, PNG or WebP.' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File too large (max 8 MB).' }, { status: 400 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())

  // Store the document (private bucket, service-role only)
  const safeName = (file.name || 'document').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80)
  const docPath = `${user.id}/${Date.now()}-${safeName}`
  const { error: uploadError } = await service.storage
    .from('agent-verification')
    .upload(docPath, bytes, { contentType: file.type, upsert: false })
  if (uploadError) {
    console.error('verify upload error:', uploadError)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }

  // Ask Claude to read the document
  const base64 = bytes.toString('base64')
  const contentBlock = file.type === 'application/pdf'
    ? { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64 } }
    : { type: 'image', source: { type: 'base64', media_type: file.type, data: base64 } }

  const prompt = `You are the automated verification system for Yalla.House, a property platform. An estate agent claiming to represent the agency "${profile.agency_name}" has uploaded a document as proof that they are a licensed / professionally registered estate agent.${licenceNumber ? ` They stated their licence or membership number is "${licenceNumber}".` : ''}

Examine the document and answer STRICTLY as minified JSON with exactly these fields:
{"is_professional_credential": boolean, "issuer": string|null, "holder_name": string|null, "credential_number": string|null, "matches_agency": boolean, "expired": boolean|null, "confidence": number, "reason": string}

Rules:
- is_professional_credential: true only if this is plausibly a genuine estate-agency credential: a membership certificate or card from bodies like Propertymark, NAEA, ARLA, RICS, The Property Ombudsman, PRS, a redress-scheme certificate, a German IHK/§34c Gewerbeerlaubnis or IVD membership, a company registration naming estate agency activity, or similar. Screenshots of websites, random photos, invoices, or unrelated documents are false.
- matches_agency: true if the agency or holder name on the document plausibly corresponds to "${profile.agency_name}" (allow trading names, abbreviations, personal name of a principal, minor spelling differences).
- confidence: 0 to 1 — your overall confidence that this agent legitimately represents that agency and holds a real credential. Be sceptical of documents that look edited, generated, inconsistent fonts, or template placeholders.
- reason: one short sentence a human would understand, phrased for the agent (e.g. "Propertymark certificate matches the agency name" or "The document does not show any professional credential").
Return ONLY the JSON.`

  let verdict: any = null
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: [contentBlock, { type: 'text', text: prompt }] }],
      }),
    })
    if (!res.ok) throw new Error(`Anthropic ${res.status}`)
    const data = await res.json()
    const text: string = data?.content?.[0]?.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('no JSON in response')
    verdict = JSON.parse(jsonMatch[0])
  } catch (e) {
    console.error('verify AI error:', e)
    await (service.from('agent_verifications') as any).insert({
      user_id: user.id, licence_number: licenceNumber || null, doc_path: docPath,
      status: 'needs_review', reason: 'Automatic check unavailable — please try again shortly.',
    })
    return NextResponse.json({ status: 'needs_review', reason: 'Automatic check unavailable — please try again in a few minutes.' })
  }

  const approved =
    verdict?.is_professional_credential === true &&
    verdict?.matches_agency === true &&
    verdict?.expired !== true &&
    typeof verdict?.confidence === 'number' && verdict.confidence >= 0.75

  const status = approved ? 'approved' : 'needs_review'
  const reason: string = typeof verdict?.reason === 'string' ? verdict.reason.slice(0, 300) : ''

  await (service.from('agent_verifications') as any).insert({
    user_id: user.id, licence_number: licenceNumber || null, doc_path: docPath,
    status, ai_verdict: verdict, reason, decided_at: new Date().toISOString(),
  })

  if (approved) {
    const update: Record<string, unknown> = { verified_at: new Date().toISOString() }
    const extractedNumber = licenceNumber || (typeof verdict?.credential_number === 'string' ? verdict.credential_number.slice(0, 100) : null)
    if (!profile.license_number && extractedNumber) update.license_number = extractedNumber
    await (service.from('agent_profiles') as any).update(update).eq('user_id', user.id)
  }

  return NextResponse.json({ status, reason })
}
