import {
  Code2,
  UserPlus,
  CheckCircle2,
  Calendar,
  GraduationCap,
  Settings,
  LogIn,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatRelativeTime } from '@/lib/utils/format'
import type { ActivityItem as ActivityItemType } from '@/types/dashboard.types'

const typeConfig: Record<
  ActivityItemType['type'],
  { icon: React.ElementType; colorClass: string }
> = {
  submission: { icon: Code2, colorClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' },
  enrollment: { icon: UserPlus, colorClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' },
  completion: { icon: CheckCircle2, colorClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' },
  event: { icon: Calendar, colorClass: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400' },
  certificate: { icon: GraduationCap, colorClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' },
  system: { icon: Settings, colorClass: 'bg-muted text-muted-foreground' },
  login: { icon: LogIn, colorClass: 'bg-muted text-muted-foreground' },
  invite: { icon: Mail, colorClass: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400' },
}

interface ActivityItemProps {
  item: ActivityItemType
  isLast?: boolean
}

export function ActivityItemComponent({ item, isLast }: ActivityItemProps) {
  const { icon: Icon, colorClass } = typeConfig[item.type] ?? typeConfig.system

  return (
    <div className="flex gap-3">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full', colorClass)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
      </div>

      {/* Content */}
      <div className={cn('flex-1 pb-4 min-w-0', isLast && 'pb-0')}>
        <p className="text-sm leading-tight">{item.title}</p>
        {item.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
        )}
        {item.actor && (
          <p className="mt-0.5 text-xs text-muted-foreground/70">by {item.actor}</p>
        )}
        <p className="mt-1 text-[11px] text-muted-foreground/60">
          {formatRelativeTime(item.timestamp)}
        </p>
      </div>
    </div>
  )
}
