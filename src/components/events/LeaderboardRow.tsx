import { cn } from '@/lib/utils/cn'
import type { LeaderboardEntry } from '@/types/event.types'

interface LeaderboardRowProps {
  entry: LeaderboardEntry
  showPenalty?: boolean
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-sm font-bold text-amber-500" aria-label="1st place">🥇</span>
  if (rank === 2) return <span className="text-sm font-bold text-slate-400" aria-label="2nd place">🥈</span>
  if (rank === 3) return <span className="text-sm font-bold text-amber-700" aria-label="3rd place">🥉</span>
  return <span className="text-sm font-semibold text-muted-foreground tabular-nums">{rank}</span>
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function LeaderboardRow({ entry, showPenalty = true }: LeaderboardRowProps) {
  return (
    <tr
      className={cn(
        'transition-colors',
        entry.isCurrentUser
          ? 'bg-primary/5 border-l-2 border-l-primary'
          : 'hover:bg-muted/30'
      )}
    >
      <td className="px-4 py-2.5 text-center w-12">
        <RankBadge rank={entry.rank} />
      </td>
      <td className="px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className={cn('text-sm font-medium', entry.isCurrentUser && 'text-primary')}>
            {entry.displayName ?? `User ${entry.userId.slice(0, 6)}`}
          </span>
          {entry.isCurrentUser && (
            <span className="text-[10px] font-medium bg-primary/10 text-primary rounded px-1">You</span>
          )}
        </div>
      </td>
      <td className="px-4 py-2.5 text-center tabular-nums">
        <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          {entry.acceptedCount}
        </span>
      </td>
      {showPenalty && (
        <td className="px-4 py-2.5 text-center tabular-nums text-sm text-muted-foreground">
          {formatTime(entry.totalTime)}
        </td>
      )}
      {entry.score != null && (
        <td className="px-4 py-2.5 text-center tabular-nums">
          <span className="text-sm font-medium">{entry.score}</span>
        </td>
      )}
    </tr>
  )
}
