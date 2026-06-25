import { LeaderboardRow } from './LeaderboardRow'
import type { LeaderboardEntry } from '@/types/event.types'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  showPenalty?: boolean
  compact?: boolean
}

export function LeaderboardTable({
  entries,
  showPenalty = true,
  compact = false,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-muted-foreground">
        No entries yet. Be the first to solve a problem!
      </div>
    )
  }

  const limit = compact ? Math.min(10, entries.length) : entries.length

  return (
    <div className="rounded-lg border overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12">
              #
            </th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Participant
            </th>
            <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Solved
            </th>
            {showPenalty && (
              <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Time
              </th>
            )}
            {entries[0]?.score != null && (
              <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Score
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y">
          {entries.slice(0, limit).map((entry) => (
            <LeaderboardRow
              key={entry.userId}
              entry={entry}
              showPenalty={showPenalty}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
