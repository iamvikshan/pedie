import { Badge } from '@components/ui/badge'

interface MarginIndicatorProps {
  pediePriceKes: number
  competitorPriceKes: number
}

export function MarginIndicator({
  pediePriceKes,
  competitorPriceKes,
}: MarginIndicatorProps) {
  if (competitorPriceKes <= 0) {
    return <span className='text-pedie-text-muted'>--</span>
  }

  const diff = competitorPriceKes - pediePriceKes
  const percentDiff = Math.round((diff / competitorPriceKes) * 100)
  const absPct = Math.abs(percentDiff)

  let variant: 'success' | 'error' | 'warning'
  let label: string

  if (absPct <= 5) {
    variant = 'warning'
    label = 'Close'
  } else if (diff > 0) {
    variant = 'success'
    label = 'Cheaper'
  } else {
    variant = 'error'
    label = 'Higher'
  }

  return (
    <Badge variant={variant} size='sm'>
      {diff > 0 ? '-' : '+'}
      {absPct}% {label}
    </Badge>
  )
}
