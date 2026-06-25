import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { AssessmentStatus } from '@/types/assessment.types'
import { ASSESSMENT_STATUS_LABELS } from '@/types/assessment.types'

const statusStyles: Record<AssessmentStatus, string> = {
  draft: 'border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400',
  published: 'border-emerald-500 text-emerald-700 dark:border-emerald-500 dark:text-emerald-400',
  archived: 'border-rose-300 text-rose-600 dark:border-rose-700 dark:text-rose-400',
}

interface AssessmentStatusBadgeProps {
  status: AssessmentStatus
  className?: string
}

export function AssessmentStatusBadge({ status, className }: AssessmentStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn('text-xs font-medium', statusStyles[status], className)}>
      {ASSESSMENT_STATUS_LABELS[status]}
    </Badge>
  )
}
