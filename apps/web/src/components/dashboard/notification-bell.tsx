'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell } from 'lucide-react'

interface Notification {
  id: string
  title: string
  body: string | null
  action_url: string | null
  status: string
  created_at: string
}

interface Props {
  initialNotifications: Notification[]
  unreadCount: number
  t: Record<string, string>
}

function tx(t: Record<string, string>, key: string): string {
  return t[key] ?? key
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

export function NotificationBell({ initialNotifications, unreadCount, t }: Props) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [count, setCount] = useState(unreadCount)
  const ref = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  async function markAllRead() {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, status: 'read' })))
        setCount(0)
      }
    } catch (e) {
      console.error('Failed to mark notifications read:', e)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen(o => !o)
          if (!open && count > 0) markAllRead()
        }}
        className="relative w-8 h-8 rounded-full bg-[#F5F5FA] hover:bg-[#E4E6EF] flex items-center justify-center transition-colors"
        aria-label={tx(t, 'notifications')}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell size={15} className="text-[#5E6278]" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-10 w-80 bg-white rounded-xl border border-[#E2E4EB] shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#E2E4EB] flex items-center justify-between">
            <p className="text-sm font-bold text-[#0F1117]">{tx(t, 'notifications')}</p>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs font-semibold text-[#D4764E] hover:text-[#BF6840] transition-colors"
              >
                {tx(t, 'markAllRead')}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell size={24} className="mx-auto mb-2 text-[#D9DCE4]" />
                <p className="text-sm text-[#5E6278]">{tx(t, 'noNotifications')}</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-[#F5F5FA] last:border-0 ${n.status === 'unread' ? 'bg-[#FFF9F6]' : ''}`}
                >
                  {n.action_url ? (
                    <a href={n.action_url} className="block group">
                      <p className="text-sm font-semibold text-[#0F1117] group-hover:text-[#D4764E] transition-colors">
                        {n.title}
                      </p>
                      {n.body && <p className="text-xs text-[#5E6278] mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-[10px] text-[#999] mt-1">{timeAgo(n.created_at)}</p>
                    </a>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-[#0F1117]">{n.title}</p>
                      {n.body && <p className="text-xs text-[#5E6278] mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-[10px] text-[#999] mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
