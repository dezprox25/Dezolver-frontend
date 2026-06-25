import { Trophy, CheckCircle2, BookOpen } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate } from '@/lib/utils/format'

export type MilestoneKind = 'path_completed' | 'room_completed' | 'achievement'

interface MilestoneCardProps {
  kind: MilestoneKind
  title: string
  subtitle?: string
  date?: string
}

const iconMap: Record<MilestoneKind, typeof Trophy> = {
  path_completed: Trophy,
  room_completed: CheckCircle2,
  achievement: BookOpen,
}

const colorMap: Record<MilestoneKind, string> = {
  path_completed: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20',
  room_completed: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
  achievement: 'text-violet-500 bg-violet-50 dark:bg-violet-950/20',
}

export function MilestoneCard({ kind, title, subtitle, date }: MilestoneCardProps) {
  const Icon = iconMap[kind]
  const color = colorMap[kind]

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{title}</p>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
          {date && <p className="text-xs text-muted-foreground/70">{formatDate(date)}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
