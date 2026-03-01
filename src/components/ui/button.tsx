import * as React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = '', variant = 'primary', size = 'md', children, ...props },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pedie-accent disabled:pointer-events-none disabled:opacity-50'

    const variants = {
      primary: 'bg-pedie-green text-white hover:bg-pedie-green-dark',
      secondary:
        'border border-pedie-border bg-transparent hover:bg-pedie-card-hover text-pedie-text',
      outline:
        'border border-pedie-green bg-transparent text-pedie-green hover:bg-pedie-green hover:text-white',
      ghost: 'hover:bg-pedie-card-hover text-pedie-text hover:text-pedie-green',
    }

    const sizes = {
      sm: 'h-9 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8 text-lg',
    }

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`

    return (
      <button className={combinedClassName} ref={ref} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
