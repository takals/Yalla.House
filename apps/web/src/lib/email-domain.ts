/**
 * Email-domain helpers for company-email agent verification.
 *
 * A "company email" is one whose registrable domain is NOT a known free /
 * consumer provider. Controlling such an inbox is strong proof the person
 * belongs to that business — stronger and cheaper to verify than a document.
 */

// Registrable domain for common multi-part TLDs (eTLD+1). Not exhaustive, but
// covers UK + DE + the usual internationals we deal with.
const MULTI_PART_SUFFIXES = new Set([
  'co.uk', 'org.uk', 'me.uk', 'ltd.uk', 'plc.uk', 'net.uk', 'sch.uk', 'ac.uk', 'gov.uk',
  'com.au', 'net.au', 'org.au', 'co.nz', 'co.za', 'com.de', 'co.at', 'or.at',
])

export function registrableDomain(hostOrEmail: string | null | undefined): string | null {
  if (!hostOrEmail) return null
  let host = String(hostOrEmail).trim().toLowerCase()
  if (host.includes('@')) host = host.split('@').pop() ?? ''
  host = host
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split('?')[0]
    .replace(/\.$/, '')
  const parts = host.split('.').filter(Boolean)
  if (parts.length < 2) return null
  const lastTwo = parts.slice(-2).join('.')
  if (parts.length >= 3 && MULTI_PART_SUFFIXES.has(lastTwo)) {
    return parts.slice(-3).join('.')
  }
  return lastTwo
}

// Known free / consumer email providers (UK + DE + international).
const FREE_PROVIDERS = new Set([
  'gmail.com', 'googlemail.com',
  'hotmail.com', 'hotmail.co.uk', 'hotmail.de', 'hotmail.fr',
  'outlook.com', 'outlook.de', 'outlook.fr', 'live.com', 'live.co.uk', 'live.de', 'msn.com',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.de', 'ymail.com', 'rocketmail.com',
  'icloud.com', 'me.com', 'mac.com',
  'aol.com', 'aol.co.uk',
  'gmx.com', 'gmx.de', 'gmx.net', 'gmx.at', 'gmx.ch', 'gmx.co.uk',
  'web.de', 't-online.de', 'freenet.de', 'mail.de', 'mailbox.org', 'posteo.de',
  'arcor.de', 'vodafone.de', '1und1.de', 'online.de',
  'protonmail.com', 'proton.me', 'pm.me', 'tutanota.com', 'tuta.com', 'tutanota.de',
  'mail.com', 'email.com', 'zoho.com', 'yandex.com', 'yandex.ru',
  'fastmail.com', 'hey.com', 'hushmail.com', 'inbox.com',
  'ntlworld.com', 'btinternet.com', 'sky.com', 'talktalk.net',
  'virginmedia.com', 'blueyonder.co.uk', 'gmail.co.uk',
])

export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())
}

export function isFreeEmailProvider(email: string | null | undefined): boolean {
  if (!isValidEmail(email)) return true // malformed → not usable as company proof
  const domain = String(email).trim().toLowerCase().split('@')[1]
  if (FREE_PROVIDERS.has(domain)) return true
  // Also treat the registrable domain as free (e.g. sub.gmail.com edge cases)
  const reg = registrableDomain(email)
  return reg ? FREE_PROVIDERS.has(reg) : true
}

/** True when a company email is usable for verification (valid + not free). */
export function isCompanyEmail(email: string | null | undefined): boolean {
  return isValidEmail(email) && !isFreeEmailProvider(email)
}

/** True when the email's registrable domain matches the website's. */
export function emailMatchesWebsite(email: string | null | undefined, website: string | null | undefined): boolean {
  if (!website) return false
  const a = registrableDomain(email)
  const b = registrableDomain(website)
  return !!a && !!b && a === b
}
