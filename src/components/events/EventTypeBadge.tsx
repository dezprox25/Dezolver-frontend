import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { EventKind } from '@/types/event.types'
import { EVENT_KIND_LABELS } from '@/types/event.types'

const kindStyles: Record<EventKind, string> = {
  workshop: 'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-950/20 dark:text-sky-400',
  competition: 'bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-950/20 dark:text-violet-400',
}

interface EventTypeBadgeProps {
  kind: EventKind
  className?: string
}

export function EventTypeBadge({ kind, className }: EventTypeBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium border-0', kindStyles[kind], className)}
    >
      {EVENT_KIND_LABELS[kind]}
    </Badge>
  )
}
