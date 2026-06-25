import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { FlaggedDecision } from '@/types/assessment.types'

interface ActivityFlagBadgeProps {
  decision?: FlaggedDecision | null
  suspicionScore?: number | null
  className?: string
}

export function ActivityFlagBadge({ decision, suspicionScore, className }: ActivityFlagBadgeProps) {
  if (decision === 'cleared') {
    return (
      <Badge variant="outline" className={cn('border-emerald-500 text-emerald-700 text-xs', className)}>
        Cleared
      </Badge>
    )
  }

  if (decision === 'invalidated') {
    return (
      <Badge variant="outline" className={cn('border-red-500 text-red-700 text-xs', className)}>
        Invalidated
      </Badge>
    )
  }

  if (decision === 'flagged') {
    return (
      <Badge variant="outline" className={cn('border-amber-500 text-amber-700 text-xs', className)}>
        Flagged
      </Badge>
    )
  }

  if (suspicionScore != null) {
    const isHigh = suspicionScore > 70
    return (
      <Badge
        variant="outline"
        className={cn(
          'text-xs',
          isHigh
            ? 'border-red-400 text-red-600'
            : 'border-amber-400 text-amber-600',
          className
        )}
      >
        Suspicion: {suspicionScore}
      </Badge>
    )
  }

  return null
}
