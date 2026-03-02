'use client'

import type { ErrorInfo, ReactNode } from 'react'
import { Component } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className='flex flex-col items-center justify-center gap-4 rounded-lg border border-pedie-border bg-pedie-card p-8 text-center'>
          <h2 className='text-lg font-semibold text-pedie-text'>
            Something went wrong
          </h2>
          <p className='text-sm text-pedie-text-muted'>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={this.handleReset}
            className='rounded-md bg-pedie-green px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-pedie-green/90'
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
