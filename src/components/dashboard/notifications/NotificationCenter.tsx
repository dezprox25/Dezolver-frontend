import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { useNotificationStore } from '@/store/notificationStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { NotificationItem } from './NotificationItem'
import type { AppNotification } from '@/types/dashboard.types'
import type { Notification } from '@/types/common.types'

// Adapt the store's Notification type to our dashboard AppNotification
function adaptNotification(n: Notification): AppNotification {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    severity: n.severity,
    read: n.read,
    createdAt: n.createdAt,
    link: n.link,
  }
}

export function NotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotificationStore()

  const adapted = notifications.map(adaptNotification)
  const isEmpty = adapted.length === 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={markAllAsRead}
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
              </Button>
            )}
            {!isEmpty && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={clearAll}
                title="Clear all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* List */}
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
            <p className="text-xs text-muted-foreground/70">
              Activity updates will appear here in real time.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[360px]">
            <div className="py-1">
              {adapted.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onMarkRead={markAsRead}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}
