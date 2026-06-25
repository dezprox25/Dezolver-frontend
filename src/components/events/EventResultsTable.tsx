import type { EventResult } from '@/types/event.types'

interface EventResultsTableProps {
  results: EventResult[]
  currentUserId?: string
}

export function EventResultsTable({ results, currentUserId }: EventResultsTableProps) {
  if (results.length === 0) {
    return (
      <p className="text-center py-8 text-sm text-muted-foreground">No results available.</p>
    )
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/30">
            <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12">#</th>
            <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Participant</th>
            <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Score</th>
            <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {results.map((r) => {
            const isCurrentUser = r.userId === currentUserId
            return (
              <tr
                key={r.userId}
                className={isCurrentUser ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/30'}
              >
                <td className="px-4 py-2.5 text-center text-sm font-semibold text-muted-foreground tabular-nums">
                  {r.rank}
                </td>
                <td className="px-4 py-2.5 text-sm font-medium">
                  {r.displayName ?? `User ${r.userId.slice(0, 6)}`}
                  {isCurrentUser && (
                    <span className="ml-2 text-[10px] bg-primary/10 text-primary rounded px-1">You</span>
                  )}
                </td>
                <td className="px-4 py-2.5 text-center text-sm font-semibold tabular-nums">{r.score}</td>
                <td className="px-4 py-2.5 text-center text-sm text-muted-foreground tabular-nums hidden sm:table-cell">
                  {r.totalTimeSeconds != null
                    ? `${Math.floor(r.totalTimeSeconds / 60)}m`
                    : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
