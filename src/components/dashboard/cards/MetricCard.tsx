import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'

interface MetricCardProps {
  label: string
  value: number | string
  previousValue?: number | string
  /** e.g. "vs last month" */
  period?: string
  icon?: LucideIcon
  /** Accent color class applied to icon background */
  accentClass?: string
  className?: string
}

export function MetricCard({
  label,
  value,
  previousValue,
  period,
  icon: Icon,
  accentClass = 'bg-primary/10 text-primary',
  className,
}: MetricCardProps) {
  const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''))
  const numPrev =
    previousValue !== undefined
      ? typeof previousValue === 'number'
        ? previousValue
        : parseFloat(String(previousValue).replace(/[^0-9.-]/g, ''))
      : undefined

  // Guard: skip diff when either value is non-numeric
  if (isNaN(numValue)) return null

  const diff =
    numPrev !== undefined && !isNaN(numPrev) ? numValue - numPrev : undefined

  const pctChange =
    diff !== undefined && numPrev !== undefined && numPrev !== 0
      ? ((diff / Math.abs(numPrev)) * 100).toFixed(1)
      : undefined

  const isUp = diff !== undefined && diff > 0
  const isDown = diff !== undefined && diff < 0

  return (
    <Card className={cn('transition-shadow hover:shadow-sm', className)}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between gap-3">
          {Icon && (
            <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', accentClass)}>
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {pctChange !== undefined && (
              <div className="mt-1 flex items-center gap-1">
                {isUp && <TrendingUp className="h-3 w-3 text-emerald-600" />}
                {isDown && <TrendingDown className="h-3 w-3 text-destructive" />}
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-[10px] px-1.5 py-0 h-4',
                    isUp && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
                    isDown && 'bg-destructive/10 text-destructive'
                  )}
                >
                  {isUp ? '+' : ''}{pctChange}%
                </Badge>
                {period && <span className="text-xs text-muted-foreground">{period}</span>}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
