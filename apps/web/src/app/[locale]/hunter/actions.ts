'use server'

import { createClient } from '@/lib/supabase/server'

export async function cancelViewingAction(
  viewingId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Nicht autorisiert' }

  // Verify the viewing belongs to this hunter
  const { data: viewing } = await (supabase.from('viewings') as any)
    .select('id, status, hunter_id')
    .eq('id', viewingId)
    .eq('hunter_id', user.id)
    .single()

  if (!viewing) return { error: 'Anfrage nicht gefunden.' }
  if (viewing.status === 'cancelled') return { error: 'Anfrage bereits abgebrochen.' }
  if (['completed', 'no_show'].includes(viewing.status)) {
    return { error: 'Diese Anfrage kann nicht mehr abgebrochen werden.' }
  }

  const { error } = await (supabase.from('viewings') as any)
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', viewingId)

  if (error) {
    console.error('cancelViewingAction error:', error)
    return { error: 'Fehler beim Abbrechen. Bitte erneut versuchen.' }
  }

  return { success: true }
}
