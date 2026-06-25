import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { SubscriptionStatus } from '@/types/billing.types'
import { SUBSCRIPTION_STATUS_LABELS } from '@/types/billing.types'

const statusStyles: Record<SubscriptionStatus, string> = {
  pending: 'border-slate-300 text-slate-500',
  trial: 'border-blue-400 text-blue-600 bg-blue-50 dark:bg-blue-950/20',
  active: 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20',
  past_due: 'border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/20 animate-pulse',
  suspended: 'border-red-400 text-red-600 bg-red-50 dark:bg-red-950/20',
  expired: 'border-slate-400 text-slate-500',
  cancelled: 'border-slate-300 text-slate-400 line-through opacity-60',
}

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus
  className?: string
}

export function SubscriptionStatusBadge({ status, className }: SubscriptionStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium', statusStyles[status], className)}
    >
      {SUBSCRIPTION_STATUS_LABELS[status]}
    </Badge>
  )
}
