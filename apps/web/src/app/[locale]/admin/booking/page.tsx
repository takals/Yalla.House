import { createClient } from '@/lib/supabase/server'
import { PREVIEW_USER_ID } from '@/lib/preview-user'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react'
import { BookingLookup } from './booking-lookup'

export default async function AdminBookingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id ?? PREVIEW_USER_ID

  // Admin role check
  const { data: roleRow } = await (supabase.from('user_roles') as any)
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .eq('is_active', true)
    .maybeSingle()

  if (!roleRow) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-surface rounded-card p-10 text-center max-w-sm">
          <Lock size={32} className="mx-auto mb-2 text-text-secondary" />
          <p className="font-bold mb-1">No Access</p>
          <p className="text-sm text-text-secondary">Admin only.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-[#D4764E] font-semibold text-sm mb-4 hover:gap-3 transition-all"
        >
          <ArrowLeft size={16} />
          Back to Admin
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            Smart Booking Shortcut
          </h1>
          <span className="text-xs font-bold px-2.5 py-1 bg-[#D4764E] text-white rounded-full">
            Tier C
          </span>
        </div>
        <p className="text-sm text-text-secondary max-w-2xl">
          Caller rings in about a property. Search by ref code, postcode, or street name.
          Find the listing, then send them the link via SMS or WhatsApp — one click.
        </p>
      </div>

      {/* How it works */}
      <div className="bg-[#0F1117] rounded-2xl p-6 mb-8 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-[#D4764E] mb-3">Call Flow</p>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2 text-lg font-bold">1</div>
            <p className="text-xs text-white/70">Hunter calls</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2 text-lg font-bold">2</div>
            <p className="text-xs text-white/70">Search property</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2 text-lg font-bold">3</div>
            <p className="text-xs text-white/70">Send link</p>
          </div>
          <div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2 text-lg font-bold">4</div>
            <p className="text-xs text-white/70">Hunter books</p>
          </div>
        </div>
      </div>

      {/* Lookup Component */}
      <BookingLookup />
    </div>
  )
}
