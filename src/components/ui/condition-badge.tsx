import type { ConditionGrade } from '@app-types/product'

interface ConditionBadgeProps {
  condition: ConditionGrade
  className?: string
}

export function ConditionBadge({
  condition,
  className = '',
}: ConditionBadgeProps) {
  const getConditionStyles = (cond: ConditionGrade) => {
    switch (cond) {
      case 'excellent':
        return 'bg-pedie-badge-excellent text-white'
      case 'good':
        return 'bg-pedie-badge-good text-white'
      case 'acceptable':
        return 'bg-pedie-badge-acceptable text-white'
      case 'fair':
        return 'bg-pedie-badge-fair text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getConditionLabel = (cond: ConditionGrade) => {
    return cond.charAt(0).toUpperCase() + cond.slice(1)
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getConditionStyles(
        condition
      )} ${className}`}
    >
      {getConditionLabel(condition)}
    </span>
  )
}
