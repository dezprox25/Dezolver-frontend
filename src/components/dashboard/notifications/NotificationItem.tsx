import { Info, CheckCircle2, AlertTriangle, XCircle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatRelativeTime } from '@/lib/utils/format'
import type { AppNotification } from '@/types/dashboard.types'

const iconMap = {
  info: { Icon: Info, className: 'text-blue-500' },
  success: { Icon: CheckCircle2, className: 'text-emerald-500' },
  warning: { Icon: AlertTriangle, className: 'text-amber-500' },
  error: { Icon: XCircle, className: 'text-destructive' },
}

interface NotificationItemProps {
  notification: AppNotification
  onMarkRead: (id: string) => void
}

export function NotificationItem({ notification, onMarkRead }: NotificationItemProps) {
  const { Icon, className: iconCn } = iconMap[notification.severity]

  return (
    <button
      type="button"
      onClick={() => onMarkRead(notification.id)}
      className={cn(
        'flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors hover:bg-muted',
        !notification.read && 'bg-primary/5 hover:bg-primary/10'
      )}
    >
      {/* Severity icon */}
      <div className="mt-0.5 shrink-0">
        <Icon className={cn('h-4 w-4', iconCn)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <p className={cn('text-sm leading-tight', !notification.read && 'font-medium')}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-snug">
          {notification.message}
        </p>
        <p className="text-[11px] text-muted-foreground/70">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {/* Unread dot + external link */}
      <div className="shrink-0 flex flex-col items-end gap-1">
        {!notification.read && (
          <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
        )}
        {notification.link && (
          <ExternalLink className="h-3 w-3 text-muted-foreground/50" />
        )}
      </div>
    </button>
  )
}
