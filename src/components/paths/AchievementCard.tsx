import { GraduationCap, Trophy, CheckCircle2, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export type AchievementType = 'certificate' | 'path_completion' | 'event_completion' | 'assessment_pass'

interface AchievementCardProps {
  type: AchievementType
  title: string
  subtitle?: string
  earnedAt?: string
  isNew?: boolean
}

const iconMap: Record<AchievementType, typeof Trophy> = {
  certificate: GraduationCap,
  path_completion: Trophy,
  event_completion: Star,
  assessment_pass: CheckCircle2,
}

const colorMap: Record<AchievementType, { bg: string; text: string }> = {
  certificate: { bg: 'bg-violet-100 dark:bg-violet-950/30', text: 'text-violet-700 dark:text-violet-300' },
  path_completion: { bg: 'bg-amber-100 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300' },
  event_completion: { bg: 'bg-sky-100 dark:bg-sky-950/30', text: 'text-sky-700 dark:text-sky-300' },
  assessment_pass: { bg: 'bg-emerald-100 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300' },
}

export function AchievementCard({ type, title, subtitle, earnedAt, isNew }: AchievementCardProps) {
  const Icon = iconMap[type]
  const { bg, text } = colorMap[type]

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
          <Icon className={`h-5 w-5 ${text}`} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold truncate">{title}</p>
            {isNew && (
              <Badge className="text-[10px] px-1 bg-primary text-primary-foreground shrink-0">
                New
              </Badge>
            )}
          </div>
          {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
          {earnedAt && (
            <p className="text-xs text-muted-foreground/60">{earnedAt}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
