import { cn } from '@/lib/utils/cn'

interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function ProgressRing({
  percentage,
  size = 64,
  strokeWidth = 6,
  className,
  showLabel = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = clamp(percentage, 0, 100)
  const offset = circumference - (clamped / 100) * circumference

  const isComplete = clamped >= 100
  const strokeColor = isComplete
    ? '#10b981'  // emerald
    : clamped > 50
    ? '#6366f1'  // indigo
    : '#8b5cf6'  // violet

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${Math.round(clamped)}% complete`}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted-foreground/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {showLabel && (
        <span className="absolute tabular-nums font-semibold" style={{ fontSize: size < 56 ? 10 : 12 }}>
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  )
}
