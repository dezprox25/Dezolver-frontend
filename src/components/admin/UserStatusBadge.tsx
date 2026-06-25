import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { InvitationStatus } from '@/types/tenancy.types'
import type { UserStatus } from '@/types/auth.types'

// ─── Invitation status badge ──────────────────────────────────────────────────

const invitationStyles: Record<InvitationStatus, string> = {
  pending: 'border-blue-400 text-blue-600 dark:text-blue-400',
  accepted: 'border-emerald-500 text-emerald-600 dark:text-emerald-400',
  revoked: 'border-red-400 text-red-600 dark:text-red-400',
  expired: 'border-amber-500 text-amber-600 dark:text-amber-400',
}

const invitationLabels: Record<InvitationStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  revoked: 'Revoked',
  expired: 'Expired',
}

interface InvitationStatusBadgeProps {
  status: InvitationStatus
  className?: string
}

export function InvitationStatusBadge({ status, className }: InvitationStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(invitationStyles[status], className)}>
      {invitationLabels[status]}
    </Badge>
  )
}

// ─── User account status badge ────────────────────────────────────────────────

const userStatusStyles: Record<UserStatus, string> = {
  invited: 'border-blue-400 text-blue-600 dark:text-blue-400',
  active: 'border-emerald-500 text-emerald-600 dark:text-emerald-400',
  suspended: 'border-amber-500 text-amber-600 dark:text-amber-400',
  revoked: 'border-red-400 text-red-600 dark:text-red-400',
}

const userStatusLabels: Record<UserStatus, string> = {
  invited: 'Invited',
  active: 'Active',
  suspended: 'Suspended',
  revoked: 'Revoked',
}

interface UserStatusBadgeProps {
  status: UserStatus
  className?: string
}

export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn(userStatusStyles[status], className)}>
      {userStatusLabels[status]}
    </Badge>
  )
}
