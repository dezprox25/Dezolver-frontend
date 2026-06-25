import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { RegistrationStatus } from '@/types/event.types'
import { REGISTRATION_STATUS_LABELS } from '@/types/event.types'

const statusStyles: Record<RegistrationStatus, string> = {
  registered: 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20',
  waitlisted: 'border-amber-400 text-amber-600',
  pending_payment: 'border-orange-400 text-orange-600 bg-orange-50 dark:bg-orange-950/20',
  cancelled: 'border-slate-300 text-slate-400',
  refunded: 'border-slate-300 text-slate-400',
}

interface RegistrationStatusBadgeProps {
  status: RegistrationStatus
  className?: string
}

export function RegistrationStatusBadge({ status, className }: RegistrationStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium', statusStyles[status], className)}
    >
      {REGISTRATION_STATUS_LABELS[status]}
    </Badge>
  )
}
