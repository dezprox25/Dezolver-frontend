import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { Loader2 } from 'lucide-react'
import type { SubmissionVerdict } from '@/types/assessment.types'
import { VERDICT_LABELS, isTerminalVerdict } from '@/types/assessment.types'

const verdictStyles: Record<SubmissionVerdict, string> = {
  pending:                'border-slate-300 text-slate-500 dark:text-slate-400',
  queued:                 'border-blue-300 text-blue-600 dark:text-blue-400',
  executing:              'border-amber-300 text-amber-600 dark:text-amber-400',
  accepted:               'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400',
  partial:                'border-teal-400 text-teal-700 bg-teal-50 dark:bg-teal-950/30 dark:text-teal-400',
  wrong_answer:           'border-red-400 text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400',
  time_limit_exceeded:    'border-orange-400 text-orange-600 dark:text-orange-400',
  memory_limit_exceeded:  'border-orange-400 text-orange-600 dark:text-orange-400',
  runtime_error:          'border-red-400 text-red-600 dark:text-red-400',
  compilation_error:      'border-red-400 text-red-600 dark:text-red-400',
  system_error:           'border-gray-400 text-gray-600 dark:text-gray-400',
}

interface VerdictBadgeProps {
  verdict: SubmissionVerdict
  className?: string
}

export function VerdictBadge({ verdict, className }: VerdictBadgeProps) {
  const pending = !isTerminalVerdict(verdict)
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-semibold gap-1', verdictStyles[verdict], className)}
    >
      {pending && <Loader2 className="h-3 w-3 animate-spin" />}
      {VERDICT_LABELS[verdict]}
    </Badge>
  )
}
