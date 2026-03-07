import * as React from 'react'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className = '',
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-4 text-center bg-pedie-card rounded-xl border border-pedie-border ${className}`}
      {...props}
    >
      <Icon className='w-16 h-16 text-pedie-text-muted mb-4' />
      <h3 className='text-xl font-semibold text-pedie-text mb-2'>{title}</h3>
      {description && (
        <p className='text-pedie-text-muted max-w-md'>{description}</p>
      )}
      {children}
    </div>
  )
}
