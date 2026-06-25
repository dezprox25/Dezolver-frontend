import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { PathStatus, PathKind } from '@/types/path.types'
import { PATH_STATUS_LABELS, PATH_KIND_LABELS } from '@/types/path.types'

const statusStyles: Record<PathStatus, string> = {
  draft: 'border-slate-300 text-slate-500',
  published: 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20',
  archived: 'border-slate-400 text-slate-500 opacity-60',
}

const kindStyles: Record<PathKind, string> = {
  default: 'bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-950/20 dark:text-violet-400',
  curated: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-950/20 dark:text-sky-400',
  personalized: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950/20 dark:text-amber-400',
}

interface PathStatusBadgeProps {
  status?: PathStatus
  kind?: PathKind
  className?: string
}

export function PathStatusBadge({ status, kind, className }: PathStatusBadgeProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {kind && (
        <Badge variant="outline" className={cn('text-xs font-medium border-0', kindStyles[kind])}>
          {PATH_KIND_LABELS[kind]}
        </Badge>
      )}
      {status && (
        <Badge variant="outline" className={cn('text-xs font-medium', statusStyles[status])}>
          {PATH_STATUS_LABELS[status]}
        </Badge>
      )}
    </div>
  )
}
