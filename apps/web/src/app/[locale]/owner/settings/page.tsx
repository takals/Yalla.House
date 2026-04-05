import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OwnerSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F1117] tracking-tight">Einstellungen</h1>
        <p className="text-sm text-[#656565] mt-1">Konto- und Benachrichtigungseinstellungen</p>
      </div>

      {/* Account info */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6 space-y-4">
        <h2 className="font-bold text-[#0F1117]">Konto</h2>
        <div className="flex items-center justify-between py-3 border-b border-[#F0F0F0]">
          <div>
            <div className="text-sm font-semibold text-[#0F1117]">E-Mail-Adresse</div>
            <div className="text-sm text-[#999]">{user.email}</div>
          </div>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <div className="text-sm font-semibold text-[#0F1117]">Konto-ID</div>
            <div className="text-xs text-[#999] font-mono">{user.id}</div>
          </div>
        </div>
      </div>

      {/* Notifications placeholder */}
      <div className="bg-white rounded-2xl border border-[#E2E4EB] p-6 space-y-4">
        <h2 className="font-bold text-[#0F1117]">Benachrichtigungen</h2>
        <p className="text-sm text-[#999]">Benachrichtigungseinstellungen — demnächst verfügbar.</p>
      </div>
    </div>
  )
}
