import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AGREEMENT_SECTIONS, AGREEMENT_NAMESPACES, type AgreementType } from '@/lib/agreements'

/**
 * GET /api/agreements/pdf?type=agent_partner&locale=en
 *
 * Returns a branded HTML page with print-optimised CSS.
 * The browser's built-in "Print → Save as PDF" produces a clean, signed document.
 * Content-Disposition triggers download as .html — user can Cmd+P to get PDF.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const type = searchParams.get('type') as AgreementType | null
  const locale = searchParams.get('locale') ?? 'de'

  if (!type || !AGREEMENT_SECTIONS[type]) {
    return NextResponse.json({ error: 'Invalid agreement type' }, { status: 400 })
  }

  // Load translations
  const messages = await loadMessages(locale)
  const namespace = AGREEMENT_NAMESPACES[type]
  const t = (messages as Record<string, Record<string, string>>)[namespace]
  if (!t) {
    return NextResponse.json({ error: 'Translation namespace not found' }, { status: 500 })
  }

  const sections = AGREEMENT_SECTIONS[type]

  // Check if user has signed
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let signedInfo = ''
  if (user) {
    const { data: agreement } = await supabase
      .from('user_agreements')
      .select('signed_at, signatory_name, version, ip_address')
      .eq('user_id', user.id)
      .eq('agreement_type', type)
      .is('revoked_at', null)
      .order('signed_at', { ascending: false })
      .limit(1)
      .maybeSingle() as { data: {
        signed_at: string
        signatory_name: string | null
        version: string
        ip_address: string | null
      } | null }

    if (agreement) {
      const dateStr = new Date(agreement.signed_at).toLocaleDateString(
        locale === 'de' ? 'de-DE' : 'en-GB',
        { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
      )
      signedInfo = `
        <div class="signed-block">
          <div class="signed-badge">SIGNED</div>
          <p><strong>${locale === 'de' ? 'Unterzeichnet von' : 'Signed by'}:</strong> ${escapeHtml(agreement.signatory_name ?? '')}</p>
          <p><strong>${locale === 'de' ? 'Datum' : 'Date'}:</strong> ${dateStr}</p>
          <p><strong>${locale === 'de' ? 'Version' : 'Version'}:</strong> ${agreement.version}</p>
          ${agreement.ip_address ? `<p><strong>IP:</strong> ${escapeHtml(agreement.ip_address)}</p>` : ''}
        </div>
      `
    }
  }

  // Country name for governing law
  const countryCode = locale === 'de' ? 'DE' : 'GB'
  const countryName = locale === 'de' ? 'Deutschland' : 'United Kingdom'

  // Build HTML
  const sectionsHtml = sections.map((s, i) => `
    <div class="section">
      <h2>${escapeHtml(t[s.titleKey] ?? '')}</h2>
      <p>${escapeHtml((t[s.contentKey] ?? '').replace('{country}', countryName).replace('{referralPercent}', '15'))}</p>
    </div>
  `).join('\n')

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(t.pageTitle ?? 'Agreement')} | Yalla.House</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1E293B;
      max-width: 700px;
      margin: 0 auto;
      padding: 48px 32px;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #D4764E;
      padding-bottom: 16px;
      margin-bottom: 32px;
    }

    .brand {
      font-size: 18pt;
      font-weight: 800;
      color: #D4764E;
      letter-spacing: -0.02em;
    }

    .doc-type {
      font-size: 9pt;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
    }

    h1 {
      font-size: 18pt;
      font-weight: 800;
      color: #0F1117;
      margin-bottom: 8px;
      letter-spacing: -0.02em;
    }

    .subtitle {
      font-size: 10pt;
      color: #64748B;
      margin-bottom: 24px;
    }

    .intro {
      font-size: 10.5pt;
      color: #334155;
      margin-bottom: 24px;
      padding: 16px;
      background: #F8FAFC;
      border-radius: 8px;
      border-left: 3px solid #D4764E;
    }

    .section {
      margin-bottom: 20px;
    }

    .section h2 {
      font-size: 11pt;
      font-weight: 700;
      color: #0F1117;
      margin-bottom: 6px;
    }

    .section p {
      font-size: 10.5pt;
      color: #334155;
    }

    .signed-block {
      margin-top: 32px;
      padding: 20px;
      border: 2px solid #16A34A;
      border-radius: 8px;
      background: #F0FDF4;
    }

    .signed-badge {
      display: inline-block;
      background: #16A34A;
      color: white;
      font-size: 9pt;
      font-weight: 800;
      padding: 3px 12px;
      border-radius: 4px;
      margin-bottom: 12px;
      letter-spacing: 0.06em;
    }

    .signed-block p {
      font-size: 9.5pt;
      color: #166534;
      margin-bottom: 4px;
    }

    .footer {
      margin-top: 40px;
      padding-top: 16px;
      border-top: 1px solid #E2E8F0;
      font-size: 8pt;
      color: #94A3B8;
      text-align: center;
    }

    @media print {
      body { padding: 0; max-width: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="brand">Yalla.House</span>
    <span class="doc-type">${locale === 'de' ? 'Rechtsdokument' : 'Legal Document'}</span>
  </div>

  <h1>${escapeHtml(t.pageTitle ?? '')}</h1>
  <p class="subtitle">${escapeHtml(t.pageSubtitle ?? '')}</p>

  <div class="intro">${escapeHtml(t.intro ?? '')}</div>

  ${sectionsHtml}

  ${signedInfo}

  <div class="footer">
    <p>Yalla.House &mdash; ${locale === 'de' ? 'Erstellt am' : 'Generated on'} ${new Date().toLocaleDateString(locale === 'de' ? 'de-DE' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    <p class="no-print" style="margin-top: 8px; font-size: 9pt; color: #64748B;">
      ${locale === 'de' ? 'Tipp: Nutzen Sie Strg+P / Cmd+P um dieses Dokument als PDF zu speichern.' : 'Tip: Use Ctrl+P / Cmd+P to save this document as PDF.'}
    </p>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

async function loadMessages(locale: string): Promise<Record<string, unknown>> {
  try {
    if (locale === 'de') {
      return (await import('@/../messages/de.json')).default
    }
    return (await import('@/../messages/en.json')).default
  } catch {
    return (await import('@/../messages/en.json')).default
  }
}
