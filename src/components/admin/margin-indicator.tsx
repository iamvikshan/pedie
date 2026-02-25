interface MarginIndicatorProps {
  pediePriceKes: number
  competitorPriceKes: number
}

export function MarginIndicator({
  pediePriceKes,
  competitorPriceKes,
}: MarginIndicatorProps) {
  if (competitorPriceKes <= 0) {
    return <span className='text-pedie-muted'>—</span>
  }

  const diff = competitorPriceKes - pediePriceKes
  const percentDiff = Math.round((diff / competitorPriceKes) * 100)
  const absPct = Math.abs(percentDiff)

  let color: 'green' | 'red' | 'yellow'
  let label: string

  if (absPct <= 5) {
    color = 'yellow'
    label = 'Close'
  } else if (diff > 0) {
    // Competitor is more expensive → Pedie is cheaper → good
    color = 'green'
    label = 'Cheaper'
  } else {
    // Competitor is cheaper → needs attention
    color = 'red'
    label = 'Higher'
  }

  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorClasses[color]}`}
    >
      {diff > 0 ? '-' : '+'}
      {absPct}% {label}
    </span>
  )
}
