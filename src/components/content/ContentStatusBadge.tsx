import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { ContentStatus } from '@/types/content.types'
import { CONTENT_STATUS_LABELS } from '@/types/content.types'

const statusStyles: Record<ContentStatus, string> = {
  draft: 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400',
  review: 'border-amber-400 text-amber-700 dark:border-amber-600 dark:text-amber-400',
  published: 'border-emerald-500 text-emerald-700 dark:border-emerald-500 dark:text-emerald-400',
  archived: 'border-rose-300 text-rose-600 dark:border-rose-700 dark:text-rose-400',
}

interface ContentStatusBadgeProps {
  status: ContentStatus
  className?: string
}

export function ContentStatusBadge({ status, className }: ContentStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('font-medium text-xs', statusStyles[status], className)}>
      {CONTENT_STATUS_LABELS[status]}
    </Badge>
  )
}
