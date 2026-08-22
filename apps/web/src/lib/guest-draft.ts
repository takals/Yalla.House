'use client'

/**
 * Keeps a guest's work alive across the magic-link round trip.
 *
 * Guests can build a listing, fill in a passport or pick a viewing slot before
 * they have an account. Signing in means leaving the page, opening an email and
 * coming back on a fresh page load — which used to discard everything they had
 * typed, along with the reason they gave us their address in the first place.
 *
 * Two things get stored:
 *   • a *draft* — whatever they were filling in, restored on next mount
 *   • a *pending action* — the thing they pressed, replayed once they're back
 *
 * Everything is wrapped in try/catch: private windows and blocked site data
 * throw on access, and a lost draft must never break the page.
 */

const DRAFT_PREFIX = 'yalla_draft:'
const PENDING_KEY = 'yalla_pending_action'

/** Drafts older than this are stale enough to be misleading. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

interface Envelope<T> {
  savedAt: number
  value: T
}

/* ── Drafts ──────────────────────────────────────────────────────────── */

export function saveDraft<T>(key: string, value: T): void {
  try {
    const envelope: Envelope<T> = { savedAt: Date.now(), value }
    window.localStorage.setItem(DRAFT_PREFIX + key, JSON.stringify(envelope))
  } catch {
    // Storage unavailable — the page carries on without persistence.
  }
}

export function loadDraft<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(DRAFT_PREFIX + key)
    if (!raw) return null

    const envelope = JSON.parse(raw) as Envelope<T>
    if (!envelope || typeof envelope.savedAt !== 'number') return null

    if (Date.now() - envelope.savedAt > MAX_AGE_MS) {
      clearDraft(key)
      return null
    }

    return envelope.value
  } catch {
    return null
  }
}

export function clearDraft(key: string): void {
  try {
    window.localStorage.removeItem(DRAFT_PREFIX + key)
  } catch {
    // Nothing to do.
  }
}

/* ── Pending actions ─────────────────────────────────────────────────── */

export interface PendingAction {
  /** What they were trying to do, e.g. 'book-slot'. */
  kind: string
  /** Which page it belongs to, so we only replay it in the right place. */
  scope: string
  payload: Record<string, unknown>
  savedAt: number
}

/**
 * Remember the action a guest just pressed, so it can run itself the moment
 * they come back signed in.
 */
export function savePendingAction(
  kind: string,
  scope: string,
  payload: Record<string, unknown>
): void {
  try {
    const action: PendingAction = { kind, scope, payload, savedAt: Date.now() }
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(action))
  } catch {
    // Storage unavailable — they'll just press the button again.
  }
}

/**
 * Read back a pending action for this page. Returns null unless the kind and
 * scope both match, so a saved booking never fires on someone else's listing.
 * Reading does not consume it — call `clearPendingAction` once it has run.
 */
export function readPendingAction(kind: string, scope: string): PendingAction | null {
  try {
    const raw = window.localStorage.getItem(PENDING_KEY)
    if (!raw) return null

    const action = JSON.parse(raw) as PendingAction
    if (!action || action.kind !== kind || action.scope !== scope) return null

    if (Date.now() - action.savedAt > MAX_AGE_MS) {
      clearPendingAction()
      return null
    }

    return action
  } catch {
    return null
  }
}

export function clearPendingAction(): void {
  try {
    window.localStorage.removeItem(PENDING_KEY)
  } catch {
    // Nothing to do.
  }
}
