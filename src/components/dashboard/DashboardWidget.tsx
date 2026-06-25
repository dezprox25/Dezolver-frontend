import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { RefreshCw, AlertCircle, Inbox } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { WidgetSkeleton } from './WidgetSkeleton'

// ─── WidgetHeader ─────────────────────────────────────────────────────────────

interface WidgetHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: ReactNode
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function WidgetHeader({
  title,
  description,
  icon: Icon,
  actions,
  onRefresh,
  isRefreshing,
}: WidgetHeaderProps) {
  return (
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
          <CardTitle className="text-base truncate">{title}</CardTitle>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {actions}
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
            </Button>
          )}
        </div>
      </div>
      {description && (
        <CardDescription className="text-xs">{description}</CardDescription>
      )}
    </CardHeader>
  )
}

// ─── WidgetContent ────────────────────────────────────────────────────────────

interface WidgetContentProps {
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export function WidgetContent({ children, className, noPadding }: WidgetContentProps) {
  return (
    <CardContent className={cn(!noPadding && 'pt-0', className)}>
      {children}
    </CardContent>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface WidgetEmptyProps {
  icon?: LucideIcon
  message?: string
}

function WidgetEmpty({ icon: Icon = Inbox, message = 'No data yet' }: WidgetEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <Icon className="h-8 w-8 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

// ─── Error State ──────────────────────────────────────────────────────────────

interface WidgetErrorProps {
  message?: string
  onRetry?: () => void
}

function WidgetError({ message = 'Failed to load', onRetry }: WidgetErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
      <AlertCircle className="h-6 w-6 text-destructive/60" />
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  )
}

// ─── DashboardWidget ──────────────────────────────────────────────────────────

interface DashboardWidgetProps {
  title: string
  description?: string
  icon?: LucideIcon
  actions?: ReactNode
  onRefresh?: () => void
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  onRetry?: () => void
  isEmpty?: boolean
  emptyIcon?: LucideIcon
  emptyMessage?: string
  skeletonLines?: number
  className?: string
  contentClassName?: string
  noPadding?: boolean
  children: ReactNode
}

export function DashboardWidget({
  title,
  description,
  icon,
  actions,
  onRefresh,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  isEmpty,
  emptyIcon,
  emptyMessage,
  skeletonLines = 4,
  className,
  contentClassName,
  noPadding,
  children,
}: DashboardWidgetProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <WidgetHeader
        title={title}
        description={description}
        icon={icon}
        actions={actions}
        onRefresh={onRefresh}
        isRefreshing={isLoading}
      />
      <WidgetContent noPadding={noPadding} className={contentClassName}>
        {isLoading ? (
          <WidgetSkeleton lines={skeletonLines} />
        ) : isError ? (
          <WidgetError message={errorMessage} onRetry={onRetry} />
        ) : isEmpty ? (
          <WidgetEmpty icon={emptyIcon} message={emptyMessage} />
        ) : (
          children
        )}
      </WidgetContent>
    </Card>
  )
}
