'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AuthGateModal } from './auth-gate-modal'

interface AuthGateContextType {
  showAuthGate: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthGateContext = createContext<AuthGateContextType | undefined>(undefined)

interface AuthGateProviderProps {
  children: React.ReactNode
  locale?: string
}

export function AuthGateProvider({ children, locale = 'de' }: AuthGateProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        setIsAuthenticated(!!session)
      } catch (error) {
        console.error('Failed to check auth:', error)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session)
      if (event === 'SIGNED_IN') {
        setIsOpen(false)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const showAuthGate = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <AuthGateContext.Provider value={{ showAuthGate, isAuthenticated, isLoading }}>
      {children}
      <AuthGateModal open={isOpen} onClose={handleClose} locale={locale} />
    </AuthGateContext.Provider>
  )
}

export function useAuthGate() {
  const context = useContext(AuthGateContext)
  if (context === undefined) {
    throw new Error('useAuthGate must be used within an AuthGateProvider')
  }
  return context
}
