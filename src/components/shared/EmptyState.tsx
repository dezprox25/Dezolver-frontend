import type { ReactNode } from 'react'
import { PackageOpen } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title = 'No data found',
  description = 'There is nothing to show here yet.',
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4 py-16 text-center', className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {icon ?? <PackageOpen className="h-8 w-8 text-muted-foreground" />}
      </div>
      <div className="max-w-sm space-y-1">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
