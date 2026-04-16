'use client'

import { useState, useTransition } from 'react'
import { Search, Shield, ShieldCheck, ShieldAlert, UserCircle } from 'lucide-react'

type T = Record<string, string>
function tx(t: T, key: string): string { return t[key] ?? key }

interface UserRow {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  country_code: string | null
  created_at: string
  roles: string[]
}

const ROLE_OPTIONS = ['owner', 'hunter', 'agent', 'admin'] as const

const ROLE_BADGE_STYLES: Record<string, string> = {
  owner: 'bg-blue-100 text-blue-700',
  hunter: 'bg-green-100 text-green-700',
  agent: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
}

const ROLE_LABEL_KEYS: Record<string, string> = {
  owner: 'roleOwner',
  hunter: 'roleHunter',
  agent: 'roleAgent',
  admin: 'roleAdmin',
}

interface Props {
  users: UserRow[]
  t: T
}

export function UserManagement({ users, t }: Props) {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [expandedUser, setExpandedUser] = useState<string | null>(null)
  const [localRoles, setLocalRoles] = useState<Record<string, string[]>>(() => {
    const m: Record<string, string[]> = {}
    for (const u of users) m[u.id] = [...u.roles]
    return m
  })

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchesSearch = !q || (
      (u.full_name?.toLowerCase().includes(q)) ||
      u.email.toLowerCase().includes(q)
    )
    const userRoles = localRoles[u.id] ?? []
    const matchesRole = !roleFilter || userRoles.includes(roleFilter)
    return matchesSearch && matchesRole
  })

  return (
    <div>
      {/* Search + filter */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={tx(t, 'searchPlaceholder')}
            className="w-full text-sm border border-[#D8DBE5] rounded-lg pl-9 pr-3 py-2.5 bg-white"
          />
        </div>
        <div className="flex gap-1.5">
          <FilterBtn label={tx(t, 'allRoles')} active={!roleFilter} onClick={() => setRoleFilter(null)} />
          {ROLE_OPTIONS.map(r => (
            <FilterBtn
              key={r}
              label={tx(t, ROLE_LABEL_KEYS[r] ?? r)}
              active={roleFilter === r}
              onClick={() => setRoleFilter(roleFilter === r ? null : r)}
            />
          ))}
        </div>
      </div>

      {/* User list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E2E4EB] p-12 text-center">
          <p className="text-sm text-[#5E6278]">{tx(t, 'noUsers')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E2E4EB] divide-y divide-[#F0F2F5]">
          {filtered.map(user => (
            <UserRow
              key={user.id}
              user={user}
              t={t}
              roles={localRoles[user.id] ?? []}
              expanded={expandedUser === user.id}
              onToggle={() => setExpandedUser(prev => prev === user.id ? null : user.id)}
              onRolesChange={(newRoles) => setLocalRoles(prev => ({ ...prev, [user.id]: newRoles }))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-semibold px-3 py-2 rounded-lg transition-colors ${
        active ? 'bg-[#0F1117] text-white' : 'bg-[#F5F5FA] text-[#5E6278] hover:bg-[#E4E6EF]'
      }`}
    >
      {label}
    </button>
  )
}

function UserRow({
  user, t, roles, expanded, onToggle, onRolesChange,
}: {
  user: UserRow; t: T; roles: string[]; expanded: boolean
  onToggle: () => void; onRolesChange: (roles: string[]) => void
}) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const dateStr = new Date(user.created_at).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })

  function handleToggleRole(role: string) {
    const hasRole = roles.includes(role)
    startTransition(async () => {
      setMessage(null)
      try {
        const res = await fetch('/api/admin/user-roles', {
          method: hasRole ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, role }),
        })
        if (res.ok) {
          const newRoles = hasRole
            ? roles.filter(r => r !== role)
            : [...roles, role]
          onRolesChange(newRoles)
          setMessage(tx(t, 'rolesUpdated'))
          setTimeout(() => setMessage(null), 2000)
        } else {
          setMessage(tx(t, 'errorUpdatingRole'))
        }
      } catch {
        setMessage(tx(t, 'errorUpdatingRole'))
      }
    })
  }

  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-4 cursor-pointer" onClick={onToggle}>
        <div className="w-8 h-8 rounded-full bg-[#EDEEF2] flex items-center justify-center flex-shrink-0">
          <UserCircle size={16} className="text-[#5E6278]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#0F1117] truncate">{user.full_name ?? '—'}</p>
          <p className="text-xs text-[#5E6278] truncate">{user.email}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {roles.length === 0 ? (
            <span className="text-xs text-[#999]">{tx(t, 'noRoles')}</span>
          ) : (
            roles.map(r => (
              <span key={r} className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_BADGE_STYLES[r] ?? 'bg-gray-100 text-gray-600'}`}>
                {tx(t, ROLE_LABEL_KEYS[r] ?? r)}
              </span>
            ))
          )}
          <span className="text-xs text-[#999] ml-2">{dateStr}</span>
          <span className="text-xs text-[#999]">{user.country_code ?? 'DE'}</span>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pl-12">
          <p className="text-xs font-semibold text-[#5E6278] mb-2">{tx(t, 'addRole')} / {tx(t, 'removeRole')}</p>
          <div className="flex gap-2 flex-wrap">
            {ROLE_OPTIONS.map(role => {
              const hasRole = roles.includes(role)
              const Icon = role === 'admin' ? ShieldAlert : role === 'agent' ? ShieldCheck : Shield
              return (
                <button
                  key={role}
                  onClick={() => handleToggleRole(role)}
                  disabled={isPending}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                    hasRole
                      ? `${ROLE_BADGE_STYLES[role]} ring-2 ring-offset-1 ring-current`
                      : 'bg-[#F5F5FA] text-[#5E6278] hover:bg-[#E4E6EF]'
                  }`}
                >
                  <Icon size={12} />
                  {tx(t, ROLE_LABEL_KEYS[role] ?? role)}
                </button>
              )
            })}
          </div>
          {message && (
            <p className={`text-xs mt-2 ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </p>
          )}
          {user.phone && (
            <p className="text-xs text-[#999] mt-2">Phone: {user.phone}</p>
          )}
        </div>
      )}
    </div>
  )
}
