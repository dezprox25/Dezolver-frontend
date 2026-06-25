import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

interface TrendCardProps {
  label: string
  value: number | string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  /** Contextual label beneath the value, e.g. "total this semester" */
  subLabel?: string
  icon?: LucideIcon
  /**
   * Sparkline data points (0-100 relative values).
   * Rendered as a simple SVG polyline — no external charting library needed.
   */
  sparkline?: number[]
  className?: string
}

function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (data.length < 2) return null

  const width = 80
  const height = 24
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((v - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0"
      aria-hidden
    >
      <polyline
        points={points}
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={positive ? 'stroke-emerald-500' : 'stroke-destructive'}
      />
    </svg>
  )
}

export function TrendCard({
  label,
  value,
  change,
  changeType = 'neutral',
  subLabel,
  icon: Icon,
  sparkline,
  className,
}: TrendCardProps) {
  const changeColors = {
    positive: 'text-emerald-600 dark:text-emerald-400',
    negative: 'text-destructive',
    neutral: 'text-muted-foreground',
  }

  return (
    <Card className={cn('transition-shadow hover:shadow-sm', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              {change && (
                <span className={cn('text-xs font-medium', changeColors[changeType])}>
                  {change}
                </span>
              )}
              {subLabel && (
                <span className="text-xs text-muted-foreground">{subLabel}</span>
              )}
            </div>
          </div>
          {sparkline && sparkline.length >= 2 && (
            <Sparkline data={sparkline} positive={changeType !== 'negative'} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
