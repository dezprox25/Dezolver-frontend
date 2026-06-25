import { Badge, type BadgeProps } from '@/components/ui/badge'
import type { Status } from '@/types/common.types'

type BadgeVariant = BadgeProps['variant']

const statusConfig: Record<Status, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'Pending', variant: 'secondary' },
  active: { label: 'Active', variant: 'success' },
  inactive: { label: 'Inactive', variant: 'secondary' },
  suspended: { label: 'Suspended', variant: 'warning' },
  expired: { label: 'Expired', variant: 'destructive' },
  cancelled: { label: 'Cancelled', variant: 'outline' },
  completed: { label: 'Completed', variant: 'success' },
  draft: { label: 'Draft', variant: 'secondary' },
  published: { label: 'Published', variant: 'success' },
  archived: { label: 'Archived', variant: 'outline' },
  trial: { label: 'Trial', variant: 'info' },
}

interface StatusBadgeProps {
  status: Status | string
  customLabel?: string
}

export function StatusBadge({ status, customLabel }: StatusBadgeProps) {
  const config = statusConfig[status as Status] ?? { label: status, variant: 'outline' as BadgeVariant }
  return (
    <Badge variant={config.variant}>
      {customLabel ?? config.label}
    </Badge>
  )
}
