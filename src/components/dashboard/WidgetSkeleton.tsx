import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils/cn'

interface WidgetSkeletonProps {
  lines?: number
  className?: string
}

export function WidgetSkeleton({ lines = 4, className }: WidgetSkeletonProps) {
  return (
    <div className={cn('space-y-3 p-4', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4 rounded"
          style={{ width: `${100 - i * 8}%` }}
        />
      ))}
    </div>
  )
}

export function KpiRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-5 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <Skeleton className="h-8 w-20 rounded" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
      ))}
    </div>
  )
}
