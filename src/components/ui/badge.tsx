import * as React from 'react'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'green'
    | 'discount'
  size?: 'sm' | 'md' | 'lg'
}

export function Badge({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full font-medium'

  const variants = {
    default: 'bg-pedie-surface text-pedie-text',
    success: 'bg-pedie-success-bg text-pedie-success',
    error: 'bg-pedie-error-bg text-pedie-error',
    warning: 'bg-pedie-warning-bg text-pedie-warning',
    info: 'bg-pedie-info-bg text-pedie-info',
    green: 'bg-pedie-green/10 text-pedie-green',
    discount: 'bg-pedie-discount/10 text-pedie-discount',
  }

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-xs font-bold',
  }

  const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`

  return (
    <span className={combinedClassName} {...props}>
      {children}
    </span>
  )
}
