import * as React from 'react'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: 'success' | 'error' | 'warning' | 'info'
}

export function Alert({
  variant,
  className = '',
  children,
  ...props
}: AlertProps) {
  const baseStyles = 'rounded-lg p-3 text-sm'

  const variants = {
    success: 'bg-pedie-success-bg text-pedie-success',
    error: 'bg-pedie-error-bg text-pedie-error',
    warning: 'bg-pedie-warning-bg text-pedie-warning',
    info: 'bg-pedie-info-bg text-pedie-info',
  }

  const combinedClassName = `${baseStyles} ${variants[variant]} ${className}`

  return (
    <div className={combinedClassName} role='alert' {...props}>
      {children}
    </div>
  )
}
