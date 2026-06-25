import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { EventStatus } from '@/types/event.types'
import { EVENT_STATUS_LABELS } from '@/types/event.types'

const statusStyles: Record<EventStatus, string> = {
  draft: 'border-slate-300 text-slate-500',
  published: 'border-blue-400 text-blue-600',
  registration_open: 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20',
  registration_closed: 'border-amber-400 text-amber-600',
  live: 'border-rose-500 text-rose-700 bg-rose-50 dark:bg-rose-950/20 animate-pulse',
  grading: 'border-purple-400 text-purple-600',
  completed: 'border-slate-400 text-slate-600',
  cancelled: 'border-red-300 text-red-500 line-through opacity-60',
}

interface EventStatusBadgeProps {
  status: EventStatus
  className?: string
}

export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium', statusStyles[status], className)}
    >
      {status === 'live' && (
        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-rose-500" aria-hidden="true" />
      )}
      {EVENT_STATUS_LABELS[status]}
    </Badge>
  )
}
