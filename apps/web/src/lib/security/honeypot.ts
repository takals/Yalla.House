/**
 * Honeypot paths.
 *
 * Rules that matter more than the specific paths:
 *  - NEVER link these from any page, hidden or otherwise. Browser prefetch,
 *    screen readers and link-preview bots follow hidden anchors and would get
 *    real users blocked.
 *  - They ARE disallowed in robots.txt. That is the mechanism: a compliant
 *    crawler reads the Disallow and stays away; anything that reads robots.txt
 *    and then visits the path is ignoring it by definition. Critical while we
 *    have near-zero indexation — Googlebot must never trip this.
 *  - Nobody reaches these by accident. They are credential and config probes.
 */
export const HONEYPOT_PATHS = [
  '/.env',
  '/.env.local',
  '/.git/config',
  '/wp-admin',
  '/wp-login.php',
  '/phpmyadmin',
  '/administrator',
  '/.aws/credentials',
  '/backup.sql',
] as const

export function isHoneypotPath(pathname: string): boolean {
  const p = pathname.toLowerCase().replace(/\/+$/, '')
  return HONEYPOT_PATHS.some(h => p === h || p.startsWith(h + '/'))
}
