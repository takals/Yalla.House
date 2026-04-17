'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Scale, Thermometer, Camera, ClipboardCheck, Landmark,
  Sofa, Shield, Flame, Zap, UserCheck,
  ClipboardList, Banknote, Truck, Sparkles, Warehouse,
  Wifi, Plug, Mail, Wrench, Palette,
  Search, ArrowRight,
} from 'lucide-react'

// Map icon slug → component
const ICON_MAP: Record<string, React.ElementType> = {
  scale: Scale,
  thermometer: Thermometer,
  camera: Camera,
  'clipboard-check': ClipboardCheck,
  landmark: Landmark,
  sofa: Sofa,
  shield: Shield,
  flame: Flame,
  zap: Zap,
  'user-check': UserCheck,
  'clipboard-list': ClipboardList,
  banknote: Banknote,
  truck: Truck,
  sparkles: Sparkles,
  warehouse: Warehouse,
  wifi: Wifi,
  plug: Plug,
  mail: Mail,
  wrench: Wrench,
  palette: Palette,
}

interface Category {
  id: string
  slug: string
  name: string
  description: string
  icon: string
  phase: string
  providerCount: number
}

interface Tier {
  key: string
  label: string
  categories: Category[]
}

interface Props {
  tiers: Tier[]
  translations: Record<string, string>
}

export function MarketplaceGrid({ tiers, translations: t }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const filters = [
    { key: 'all', label: t.filterAll },
    { key: 'transaction', label: t.filterTransaction },
    { key: 'lettings', label: t.filterLettings },
    { key: 'moving', label: t.filterMoving },
  ]

  const filteredTiers = useMemo(() => {
    const q = search.toLowerCase().trim()
    return tiers
      .filter(tier => activeFilter === 'all' || tier.key === activeFilter)
      .map(tier => ({
        ...tier,
        categories: tier.categories.filter(c =>
          !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
        ),
      }))
      .filter(tier => tier.categories.length > 0)
  }, [tiers, activeFilter, search])

  return (
    <div>
      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-10">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-on-dark-muted" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-surface-dark border border-white/[0.08] rounded-card-dark pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-text-on-dark-muted focus:outline-none focus:border-brand/40 transition-[border-color] duration-200"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-4 py-2 rounded-card-dark text-sm font-medium transition-all duration-200 ${
                activeFilter === f.key
                  ? 'bg-brand text-white'
                  : 'bg-surface-dark text-text-on-dark-secondary hover:text-white border border-white/[0.08] hover:border-white/[0.16]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tier sections */}
      {filteredTiers.map(tier => (
        <div key={tier.key} className="mb-12">
          <h2 className="text-title-2 text-white mb-6">{tier.label}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tier.categories.map(cat => {
              const IconComp = ICON_MAP[cat.icon] ?? Wrench
              const isLive = cat.phase === 'phase_1'

              return (
                <div
                  key={cat.id}
                  className="group bg-surface-dark rounded-card-dark p-5 border border-white/[0.04] hover:border-brand/20 transition-[border-color] duration-300"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-card-dark bg-brand/10 flex items-center justify-center text-brand flex-shrink-0">
                      <IconComp size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-white mb-1 truncate">{cat.name}</h3>
                      <p className="text-sm text-text-on-dark-secondary leading-relaxed line-clamp-2 mb-3">
                        {cat.description}
                      </p>
                      <div className="flex items-center justify-between">
                        {isLive ? (
                          <span className="text-xs text-text-on-dark-muted">
                            {cat.providerCount} {t.providersLabel}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-brand/70 bg-brand/[0.08] px-2 py-0.5 rounded-card-dark">
                            {t.comingSoon}
                          </span>
                        )}
                        {isLive && (
                          <Link
                            href={`/marketplace/${cat.slug}`}
                            className="text-xs font-semibold text-brand hover:text-brand-hover transition-colors inline-flex items-center gap-1 opacity-0 group-hover:opacity-100"
                          >
                            {t.requestQuote}
                            <ArrowRight size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {filteredTiers.length === 0 && (
        <div className="text-center py-16">
          <p className="text-text-on-dark-muted text-sm">{t.noProviders}</p>
        </div>
      )}
    </div>
  )
}
