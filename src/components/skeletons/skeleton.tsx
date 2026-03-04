interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-pedie-surface ${className}`}
      role='status'
      aria-label='Loading'
    />
  )
}
