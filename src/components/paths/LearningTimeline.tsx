import { CheckCircle2, BookOpen, Trophy } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'

export interface TimelineItem {
  id: string
  kind: 'room_completed' | 'path_completed' | 'achievement'
  title: string
  subtitle?: string
  date: string
}

interface LearningTimelineProps {
  items: TimelineItem[]
  maxItems?: number
}

const iconMap = {
  room_completed: CheckCircle2,
  path_completed: Trophy,
  achievement: BookOpen,
}
const colorMap = {
  room_completed: 'text-emerald-500',
  path_completed: 'text-amber-500',
  achievement: 'text-violet-500',
}

export function LearningTimeline({ items, maxItems = 10 }: LearningTimelineProps) {
  const visible = items.slice(0, maxItems)

  if (visible.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No activity yet. Start a path to track your progress.
      </p>
    )
  }

  return (
    <ol className="space-y-3" aria-label="Learning timeline">
      {visible.map((item) => {
        const Icon = iconMap[item.kind]
        const color = colorMap[item.kind]
        return (
          <li key={item.id} className="flex items-start gap-3">
            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-tight">{item.title}</p>
              {item.subtitle && (
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              )}
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatRelativeTime(item.date)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
