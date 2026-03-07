import * as React from 'react'

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  size?: 'sm' | 'md' | 'lg'
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', size = 'md', ...props }, ref) => {
    const baseStyles =
      'w-full border border-pedie-border bg-pedie-card text-pedie-text placeholder:text-pedie-text-muted focus:border-pedie-green focus:outline-none focus:ring-1 focus:ring-pedie-green disabled:opacity-50'

    const sizes = {
      sm: 'rounded-md px-3 py-1.5 text-sm',
      md: 'rounded-lg px-3 py-2 text-sm',
      lg: 'rounded-lg px-4 py-2.5 text-base',
    }

    const combinedClassName = `${baseStyles} ${sizes[size]} ${className}`

    return <input className={combinedClassName} ref={ref} {...props} />
  }
)

Input.displayName = 'Input'
