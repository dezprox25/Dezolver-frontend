import { useEffect, useState } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface AssessmentTimerProps {
  startTimeMs: number
  timeLimitMinutes: number
  onExpired?: () => void
  className?: string
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return '0:00:00'
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function AssessmentTimer({
  startTimeMs,
  timeLimitMinutes,
  onExpired,
  className,
}: AssessmentTimerProps) {
  const endTimeMs = startTimeMs + timeLimitMinutes * 60 * 1000
  const [remaining, setRemaining] = useState(() => Math.max(0, endTimeMs - Date.now()))

  useEffect(() => {
    if (remaining <= 0) {
      onExpired?.()
      return
    }
    const id = setInterval(() => {
      const r = Math.max(0, endTimeMs - Date.now())
      setRemaining(r)
      if (r === 0) onExpired?.()
    }, 1000)
    return () => clearInterval(id)
  }, [endTimeMs, onExpired, remaining])

  const isLow = remaining < 5 * 60 * 1000  // under 5 min
  const isExpired = remaining <= 0

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm font-mono font-semibold tabular-nums',
        isExpired
          ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
          : isLow
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
          : 'bg-muted text-muted-foreground',
        className
      )}
      aria-label={`Time remaining: ${formatCountdown(remaining)}`}
      aria-live="polite"
    >
      {isLow || isExpired ? (
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      )}
      {isExpired ? "Time's Up" : formatCountdown(remaining)}
    </div>
  )
}
