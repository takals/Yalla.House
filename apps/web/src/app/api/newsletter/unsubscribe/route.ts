import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/newsletter/unsubscribe?token=...
 * One-click unsubscribe (link goes in every newsletter footer).
 */
function page(title: string, body: string): Response {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
     <body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;background:#FCFBFA;color:#1F2933;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0">
       <div style="max-width:420px;padding:32px;text-align:center">
         <h1 style="font-size:20px;margin:0 0 8px">${title}</h1>
         <p style="color:#5B6672;font-size:14px;margin:0">${body}</p>
       </div>
     </body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token')
  if (!token) return page('Invalid link', 'This unsubscribe link is not valid.')

  const service = createServiceClient()
  const { data: sub } = await (service.from('newsletter_subscribers') as any)
    .select('id, locale')
    .eq('confirm_token', token)
    .maybeSingle()

  if (!sub) return page('Invalid link', 'This unsubscribe link is not valid.')

  await (service.from('newsletter_subscribers') as any)
    .update({ unsubscribed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', sub.id)

  const de = String(sub.locale ?? 'en').startsWith('de')
  return de
    ? page('Abgemeldet', 'Du wurdest vom Yalla.House-Newsletter abgemeldet.')
    : page('Unsubscribed', "You've been removed from the Yalla.House newsletter.")
}
