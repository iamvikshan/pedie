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

interface ConditionBadgeProps {
  condition: ConditionGrade
  className?: string
}

export function ConditionBadge({
  condition,
  className = '',
}: ConditionBadgeProps) {
  const Icon = iconMap[condition] ?? TbCircleCheck
  const label = condition.charAt(0).toUpperCase() + condition.slice(1)

  return (
    <span
      title={label}
      className={`inline-flex items-center ${styleMap[condition] ?? 'text-gray-500'} ${className}`}
    >
      <Icon className='w-5 h-5' aria-hidden='true' />
      <span className='sr-only'>{label}</span>
    </span>
  )
}
