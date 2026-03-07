import type { ConditionGrade } from '@app-types/product'
import { TbCircleCheck, TbCrown, TbDiamond, TbThumbUp } from 'react-icons/tb'

/** Icon-only condition badge with tooltip. */
export const CONDITION_ICONS = {
  premium: 'TbCrown',
  excellent: 'TbDiamond',
  good: 'TbThumbUp',
  acceptable: 'TbCircleCheck',
} as const

const iconMap = {
  premium: TbCrown,
  excellent: TbDiamond,
  good: TbThumbUp,
  acceptable: TbCircleCheck,
} as const

const styleMap: Record<ConditionGrade, string> = {
  premium: 'text-pedie-badge-premium',
  excellent: 'text-pedie-badge-excellent',
  good: 'text-pedie-badge-good',
  acceptable: 'text-pedie-badge-acceptable',
}

export const CONDITION_BADGE_VARIANTS = ['default', 'circle'] as const

interface ConditionBadgeProps {
  condition: ConditionGrade
  variant?: 'default' | 'circle'
  className?: string
}

export function ConditionBadge({
  condition,
  variant = 'default',
  className = '',
}: ConditionBadgeProps) {
  const Icon = iconMap[condition] ?? TbCircleCheck
  const label = condition.charAt(0).toUpperCase() + condition.slice(1)

  if (variant === 'circle') {
    return (
      <span
        title={label}
        className={`glass backdrop-blur-sm rounded-full p-1.5 inline-flex items-center ${styleMap[condition] ?? 'text-pedie-text-muted'} ${className}`}
      >
        <Icon className='w-5 h-5' aria-hidden='true' />
        <span className='sr-only'>{label}</span>
      </span>
    )
  }

  return (
    <span
      title={label}
      className={`inline-flex items-center ${styleMap[condition] ?? 'text-pedie-text-muted'} ${className}`}
    >
      <Icon className='w-5 h-5' aria-hidden='true' />
      <span className='sr-only'>{label}</span>
    </span>
  )
}
