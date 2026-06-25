import { Activity } from 'lucide-react'
import type { ActivityItem } from '@/types/dashboard.types'
import { ActivityItemComponent } from './ActivityItem'

interface ActivityTimelineProps {
  items: ActivityItem[]
  maxItems?: number
}

export function ActivityTimeline({ items, maxItems = 6 }: ActivityTimelineProps) {
  const visible = items.slice(0, maxItems)

  if (visible.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <Activity className="h-8 w-8 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="py-1">
      {visible.map((item, index) => (
        <ActivityItemComponent
          key={item.id}
          item={item}
          isLast={index === visible.length - 1}
        />
      ))}
    </div>
  )
}
