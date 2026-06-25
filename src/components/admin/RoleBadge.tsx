import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { UserRole } from '@/types/auth.types'
import { ROLE_LABELS } from '@/lib/permissions/roles'

const roleStyles: Record<UserRole, string> = {
  student: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
  faculty: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  coordinator: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
  college_admin: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  content_manager: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400',
  platform_moderator: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
  platform_admin: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400',
}

interface RoleBadgeProps {
  role: UserRole
  className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <Badge
      className={cn('border-0 font-medium', roleStyles[role], className)}
    >
      {ROLE_LABELS[role]}
    </Badge>
  )
}
