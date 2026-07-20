import type { Metadata } from 'next'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { Lock, Inbox, Mail } from 'lucide-react'
import { ListingsClient, type ListingRow } from './listings-client'

export const metadata: Metadata = {
  title: 'Inbound listings',
  robots: { index: false, follow: false },
}

export default async function AdminListingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  const { data: roleRow } = await (supabase.from('user_roles') as any)
    .select('role').eq('user_id', userId).eq('role', 'admin').eq('is_active', true).maybeSingle()

  if (!roleRow) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-surface rounded-card p-10 text-center max-w-sm">
          <Lock size={32} className="mx-auto mb-2 text-text-secondary" />
          <p className="font-bold mb-1">No access</p>
          <p className="text-sm text-text-secondary">You need admin access to view this page.</p>
        </div>
      </div>
    )
  }

  const service = createServiceClient()
  const { data: listings } = await (service.from('agent_inbound_listings') as any)
    .select('id, title, price_text, currency, location, postcode, country_code, property_type, bedrooms, url, status, created_at, agent_user_id, email:agent_inbound_emails(subject, from_email, from_name)')
    .order('created_at', { ascending: false })
    .limit(100)

  const rowsRaw = (listings ?? []) as any[]

  // Resolve agency names for matched agents.
  const agentIds = Array.from(new Set(rowsRaw.map(r => r.agent_user_id).filter(Boolean)))
  const agencyById: Record<string, string> = {}
  if (agentIds.length) {
    const { data: agents } = await (service.from('agent_profiles') as any)
      .select('user_id, agency_name').in('user_id', agentIds)
    for (const a of (agents ?? []) as any[]) agencyById[a.user_id] = a.agency_name
  }

  const rows: ListingRow[] = rowsRaw.map(r => ({
    id: r.id,
    title: r.title,
    priceText: r.price_text,
    currency: r.currency,
    location: r.location,
    postcode: r.postcode,
    countryCode: r.country_code,
    propertyType: r.property_type,
    bedrooms: r.bedrooms,
    url: r.url,
    status: r.status,
    createdAt: r.created_at,
    agencyName: r.agent_user_id ? agencyById[r.agent_user_id] ?? null : null,
    fromEmail: r.email?.from_email ?? null,
    subject: r.email?.subject ?? null,
  }))

  const counts = rows.reduce((acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc }, {} as Record<string, number>)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-2.5 mb-1">
        <Inbox size={22} className="text-brand" />
        <h1 className="text-2xl font-bold text-text-primary">Inbound listings</h1>
      </div>
      <p className="text-text-secondary text-sm mb-5">
        Listings agents forwarded to <code className="font-semibold text-brand-dark">listings@yalla.house</code>. Review, then distribute to owner &amp; hunter clients.
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        {(['new', 'approved', 'distributed', 'rejected'] as const).map(s => (
          <div key={s} className="bg-white rounded-xl border border-border-default px-4 py-2.5 text-center min-w-[92px]">
            <div className="text-lg font-extrabold text-text-primary">{counts[s] ?? 0}</div>
            <div className="text-[11px] font-semibold text-text-secondary capitalize">{s}</div>
          </div>
        ))}
      </div>

      {rows.length === 0 && (
        <div className="bg-brand-solid-bg border border-brand-light rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
          <Mail size={16} className="text-brand flex-shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary">
            No listings received yet. Once the <code className="font-semibold text-brand-dark">listings@yalla.house</code> inbound route is wired to a mail provider, forwarded property emails appear here automatically.
          </p>
        </div>
      )}

      <ListingsClient rows={rows} />
    </div>
  )
}
