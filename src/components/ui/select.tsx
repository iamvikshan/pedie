import * as React from 'react'

export interface SelectProps extends Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'size'
> {
  size?: 'sm' | 'md' | 'lg'
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'w-full appearance-none border border-pedie-border bg-pedie-card text-pedie-text cursor-pointer focus:border-pedie-green focus:outline-none focus:ring-1 focus:ring-pedie-green disabled:opacity-50'

    const sizes = {
      sm: 'rounded-md px-2 py-1 text-sm',
      md: 'rounded-lg px-3 py-2 text-sm',
      lg: 'rounded-lg px-3 py-2.5 text-base',
    }

    const combinedClassName = `${baseStyles} ${sizes[size]} ${className}`

    return (
      <select className={combinedClassName} ref={ref} {...props}>
        {children}
      </select>
    )
  }
)

Select.displayName = 'Select'
