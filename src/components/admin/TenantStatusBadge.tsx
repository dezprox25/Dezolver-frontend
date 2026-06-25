import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { TenantStatus } from '@/types/tenancy.types'
import { TENANT_STATUS_LABELS } from '@/types/tenancy.types'

const statusStyles: Record<TenantStatus, string> = {
  pending: 'border-slate-400 text-slate-600 dark:text-slate-400',
  trial: 'border-blue-400 text-blue-600 dark:text-blue-400',
  active: 'border-emerald-500 text-emerald-600 dark:text-emerald-400',
  suspended: 'border-amber-500 text-amber-600 dark:text-amber-400',
  expired: 'border-orange-500 text-orange-600 dark:text-orange-400',
  cancelled: 'border-red-400 text-red-600 dark:text-red-400',
  purged: 'border-gray-400 text-gray-500 dark:text-gray-400',
}

interface TenantStatusBadgeProps {
  status: TenantStatus
  className?: string
}

export function TenantStatusBadge({ status, className }: TenantStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(statusStyles[status], className)}
    >
      {TENANT_STATUS_LABELS[status]}
    </Badge>
  )
}
