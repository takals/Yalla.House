'use client'

import { useAuthGate } from '@/components/auth-gate-provider'

/**
 * Handles the two "not yet" responses a server action can send back, so form
 * components don't each have to.
 *
 *   { authRequired: true }                → open the sign-in modal in place
 *   { agreementRequired, agreementPath }  → send them to sign, then back here
 *
 * Usage in form components:
 *
 *   const { handleAuthRequired } = useAuthAction()
 *
 *   const result = await someServerAction(formData)
 *   if (handleAuthRequired(result)) return  // handled, stop here
 *   // ... handle normal result
 */
export function useAuthAction() {
  const { showAuthGate, isAuthenticated } = useAuthGate()

  function handleAuthRequired(result: unknown): boolean {
    if (!result || typeof result !== 'object') return false

    const r = result as {
      authRequired?: boolean
      agreementRequired?: boolean
      agreementPath?: string
    }

    if (r.authRequired === true) {
      showAuthGate()
      return true
    }

    if (r.agreementRequired === true && r.agreementPath) {
      // Signed in, but hasn't accepted the terms this action commits them to.
      // Send them to sign, and bring them straight back afterwards.
      const returnTo = window.location.pathname + window.location.search
      window.location.href = `${r.agreementPath}?next=${encodeURIComponent(returnTo)}`
      return true
    }

    return false
  }

  return { handleAuthRequired, isAuthenticated, showAuthGate }
}
