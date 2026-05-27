'use client'

import { BadgeCheck, Shield, ShieldCheck } from 'lucide-react'

type VerificationTier = 'none' | 'self_declared' | 'basic' | 'full'

interface VerificationBadgeProps {
  tier: VerificationTier
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  translations: Record<string, string>
}

function tr(t: Record<string, string>, key: string): string {
  return t[key] ?? key
}

const TIER_CONFIG: Record<Exclude<VerificationTier, 'none'>, {
  icon: typeof BadgeCheck
  bgClass: string
  textClass: string
  borderClass: string
  labelKey: string
}> = {
  self_declared: {
    icon: Shield,
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    labelKey: 'verificationSelfDeclared',
  },
  basic: {
    icon: ShieldCheck,
    bgClass: 'bg-green-50',
    textClass: 'text-green-700',
    borderClass: 'border-green-200',
    labelKey: 'verificationBasic',
  },
  full: {
    icon: BadgeCheck,
    bgClass: 'bg-brand/10',
    textClass: 'text-brand',
    borderClass: 'border-brand/20',
    labelKey: 'verificationFull',
  },
}

const SIZE_CONFIG = {
  sm: { iconSize: 12, textClass: 'text-[10px]', padding: 'px-1.5 py-0.5', gap: 'gap-1' },
  md: { iconSize: 14, textClass: 'text-xs', padding: 'px-2 py-1', gap: 'gap-1.5' },
  lg: { iconSize: 16, textClass: 'text-sm', padding: 'px-3 py-1.5', gap: 'gap-2' },
}

/**
 * Reusable verification badge — shows buyer's verification tier.
 * Renders nothing for 'none' tier.
 *
 * Usage:
 *   <VerificationBadge tier="full" translations={t} />
 *   <VerificationBadge tier="basic" size="sm" showLabel={false} translations={t} />
 */
export function VerificationBadge({
  tier,
  size = 'md',
  showLabel = true,
  translations: t,
}: VerificationBadgeProps) {
  if (tier === 'none') return null

  const config = TIER_CONFIG[tier]
  const sizeConfig = SIZE_CONFIG[size]
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center ${sizeConfig.gap} ${sizeConfig.padding} ${config.bgClass} ${config.textClass} border ${config.borderClass} rounded-full font-semibold ${sizeConfig.textClass} whitespace-nowrap`}
      title={tr(t, config.labelKey)}
    >
      <Icon size={sizeConfig.iconSize} className="flex-shrink-0" />
      {showLabel && <span>{tr(t, config.labelKey)}</span>}
    </span>
  )
}

/**
 * Inline verification icon only — for tight spaces like search results.
 * Renders nothing for 'none' tier.
 */
export function VerificationIcon({
  tier,
  size = 14,
  translations: t,
}: {
  tier: VerificationTier
  size?: number
  translations: Record<string, string>
}) {
  if (tier === 'none') return null

  const config = TIER_CONFIG[tier]
  const Icon = config.icon

  return (
    <Icon
      size={size}
      className={`${config.textClass} flex-shrink-0`}
      title={tr(t, config.labelKey)}
    />
  )
}
