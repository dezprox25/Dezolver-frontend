import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Custom fallback UI. If not provided, uses the built-in error card. */
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

/**
 * React class error boundary. Catches render-time errors in its subtree
 * and displays a recovery UI instead of crashing the whole app.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this would go to Sentry / CloudWatch
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  reset = () => this.setState({ hasError: false, error: undefined })

  override render() {
    if (!this.state.hasError) return this.props.children
    if (this.props.fallback) return this.props.fallback

    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div className="space-y-1 max-w-sm">
          <p className="text-sm font-semibold">Something went wrong</p>
          <p className="text-xs text-muted-foreground">
            {this.state.error?.message ?? 'An unexpected error occurred in this section.'}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={this.reset}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Try again
        </Button>
      </div>
    )
  }
}
