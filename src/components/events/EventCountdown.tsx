import { useEffect, useState } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface EventCountdownProps {
  targetDate: string
  label?: string
  onExpired?: () => void
  serverTimeOffsetMs?: number
  className?: string
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0:00:00'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/**
 * Countdown to a fixed UTC ISO target date.
 * `serverTimeOffsetMs` compensates for client/server clock drift:
 *   offset = serverNow.getTime() - Date.now()
 */
export function EventCountdown({
  targetDate,
  label,
  onExpired,
  serverTimeOffsetMs = 0,
  className,
}: EventCountdownProps) {
  const target = new Date(targetDate).getTime()
  const [remaining, setRemaining] = useState(() =>
    Math.max(0, target - (Date.now() + serverTimeOffsetMs))
  )

  useEffect(() => {
    if (remaining <= 0) {
      onExpired?.()
      return
    }
    const id = setInterval(() => {
      const r = Math.max(0, target - (Date.now() + serverTimeOffsetMs))
      setRemaining(r)
      if (r === 0) onExpired?.()
    }, 1000)
    return () => clearInterval(id)
  }, [target, onExpired, serverTimeOffsetMs, remaining])

  const isLow = remaining > 0 && remaining < 5 * 60 * 1000
  const isExpired = remaining <= 0

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-mono font-semibold tabular-nums',
        isExpired
          ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
          : isLow
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
          : 'bg-muted text-muted-foreground',
        className
      )}
      aria-label={`${label ?? 'Time remaining'}: ${formatCountdown(remaining)}`}
      aria-live="polite"
    >
      {isLow || isExpired ? (
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      )}
      {isExpired ? 'Ended' : formatCountdown(remaining)}
    </div>
  )
}
