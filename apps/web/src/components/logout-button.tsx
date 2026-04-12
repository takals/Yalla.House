'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps {
  variant?: 'text' | 'button'
  size?: 'sm' | 'md'
  className?: string
}

export function LogoutButton({ variant = 'text', size = 'sm', className = '' }: LogoutButtonProps) {
  const router = useRouter()

  async function handleLogout() {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/')
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (variant === 'text') {
    return (
      <button
        onClick={handleLogout}
        className={`text-white/30 hover:text-white/70 transition-colors flex items-center gap-1 cursor-pointer ${className}`}
      >
        <LogOut size={size === 'sm' ? 10 : 16} />
        {size !== 'sm' && 'Sign Out'}
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2 ${className}`}
    >
      <LogOut size={16} />
      Sign Out
    </button>
  )
}
