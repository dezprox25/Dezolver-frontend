import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { useEvent } from '@/hooks/useEvents'
import { useEventLeaderboard, useLeaderboardUpdates } from '@/hooks/useLeaderboard'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LeaderboardTable } from '@/components/events/LeaderboardTable'
import { EventStatusBadge } from '@/components/events/EventStatusBadge'
import { EventCountdown } from '@/components/events/EventCountdown'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { joinChannel, leaveChannel } from '@/services/websocket/client'

export function EventLeaderboardPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { data: event } = useEvent(id)
  const {
    data: leaderboard,
    isLoading,
    isError,
    refetch,
  } = useEventLeaderboard(id)

  // Subscribe to live updates
  useEffect(() => {
    if (!id) return
    joinChannel(`event:${id}/leaderboard`)
    return () => leaveChannel(`event:${id}/leaderboard`)
  }, [id])

  useLeaderboardUpdates(id)

  const isLive = event?.status === 'live'
  const entries = (leaderboard?.entries ?? []).map((e) => ({
    ...e,
    isCurrentUser: e.userId === user?.id,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title={event ? `${event.title} — Leaderboard` : 'Leaderboard'}
        description={isLive ? 'Real-time standings. Updates automatically.' : 'Final standings.'}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/events/${id}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {event?.status === 'live' && event.endsAt && (
              <EventCountdown targetDate={event.endsAt} label="Event ends in" />
            )}
            <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {event && (
        <div className="flex items-center gap-2">
          <EventStatusBadge status={event.status} />
          {isLive && (
            <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-400">
              Live Updates
            </Badge>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load leaderboard"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : entries.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          description="Be the first to solve a problem!"
        />
      ) : (
        <LeaderboardTable
          entries={entries}
          showPenalty={event?.config?.scoring?.type === 'icpc'}
        />
      )}
    </div>
  )
}
