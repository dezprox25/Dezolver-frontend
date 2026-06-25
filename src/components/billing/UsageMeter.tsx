import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils/cn'

interface UsageMeterProps {
  label: string
  used: number
  limit: number | null
  unit?: string
  className?: string
}

export function UsageMeter({ label, used, limit, unit = '', className }: UsageMeterProps) {
  const unlimited = limit === null
  const pct = unlimited ? 0 : Math.min((used / limit) * 100, 100)
  const isHigh = !unlimited && pct >= 80
  const isFull = !unlimited && pct >= 100

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className={cn('font-semibold tabular-nums', isFull ? 'text-red-600' : isHigh ? 'text-amber-600' : '')}>
          {used.toLocaleString('en-IN')}{unit}
          {!unlimited && ` / ${limit.toLocaleString('en-IN')}${unit}`}
          {unlimited && ' / Unlimited'}
        </span>
      </div>
      {!unlimited && (
        <Progress
          value={pct}
          className={cn(
            'h-1.5',
            isFull ? '[&>div]:bg-red-500' : isHigh ? '[&>div]:bg-amber-500' : ''
          )}
        />
      )}
    </div>
  )
}
