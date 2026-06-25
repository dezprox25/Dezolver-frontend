import { useGlobalLeaderboard } from '@/hooks/useLeaderboard'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, RefreshCw, AlertCircle, Medal } from 'lucide-react'

export function GlobalLeaderboardPage() {
  const user = useAuthStore((s) => s.user)
  const { data, isLoading, isError, refetch } = useGlobalLeaderboard()

  const entries = data?.entries ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Global Leaderboard"
        description="Platform-wide competitive rankings based on PlatformRating."
        actions={
          <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      {/* Backend limitation notice */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-4">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm">
          <p className="font-semibold text-amber-700">Backend Limitation</p>
          <p className="text-amber-600 mt-0.5">
            PlatformRating is only applied for <strong>platform-scope</strong> competitions and
            external participants in <strong>tenant_open</strong> competitions.
            Ratings are computed after event grading completes.
            The global leaderboard data is reconciled hourly from the Redis ZSET.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load leaderboard"
          description="The global leaderboard may not be available yet."
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-8 w-8 text-muted-foreground/50" />}
          title="No ratings yet"
          description="Compete in platform-scope events to earn a rating."
        />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider w-16">#</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Participant</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rating</th>
                <th className="px-4 py-2 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Events</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {entries.map((e) => {
                const isMe = e.personId === user?.personId
                return (
                  <tr
                    key={e.personId}
                    className={isMe ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/30'}
                  >
                    <td className="px-4 py-3 text-center">
                      {e.rank === 1 ? <span aria-label="1st">🥇</span>
                        : e.rank === 2 ? <span aria-label="2nd">🥈</span>
                        : e.rank === 3 ? <span aria-label="3rd">🥉</span>
                        : <span className="text-sm font-semibold text-muted-foreground tabular-nums">{e.rank}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Medal className="h-4 w-4 text-muted-foreground/40 shrink-0" aria-hidden="true" />
                        <span className={`text-sm font-medium ${isMe ? 'text-primary' : ''}`}>
                          {e.displayName ?? `Person ${e.personId.slice(0, 6)}`}
                        </span>
                        {isMe && (
                          <Badge variant="secondary" className="text-[10px] px-1">You</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">
                      <span className="text-sm font-bold text-violet-700 dark:text-violet-400">
                        {e.rating}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground hidden md:table-cell">
                      {e.eventsParticipated ?? '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {data?.total && data.total > entries.length && (
        <p className="text-xs text-muted-foreground text-center">
          Showing top {entries.length} of {data.total} rated participants
        </p>
      )}
    </div>
  )
}
