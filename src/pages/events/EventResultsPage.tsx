import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, GraduationCap } from 'lucide-react'
import { useEvent } from '@/hooks/useEvents'
import { useEventResults } from '@/hooks/useLeaderboard'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { EventStatusBadge } from '@/components/events/EventStatusBadge'
import { EventResultsTable } from '@/components/events/EventResultsTable'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/lib/utils/format'

export function EventResultsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { data: event } = useEvent(id)
  const { data: resultsData, isLoading, isError, refetch } = useEventResults(id)

  const results = resultsData?.items ?? []
  const myResult = results.find((r) => r.userId === user?.id)
  const isRegistered = event?.myRegistration?.status === 'registered'

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        title="Failed to load results"
        action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
      />
    )
  }

  if (!event) return null

  const isGrading = event.status === 'grading'
  const isCompleted = event.status === 'completed'

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={`${event.title} — Results`}
        description={
          isGrading
            ? 'Grading in progress. Results will appear shortly.'
            : `Final standings for ${results.length} participant${results.length !== 1 ? 's' : ''}.`
        }
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(`/events/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />

      <div className="flex items-center gap-2">
        <EventStatusBadge status={event.status} />
        <Badge variant="outline" className="text-xs">
          {formatDateTime(event.endsAt)}
        </Badge>
        <Badge variant="outline" className="text-xs capitalize">
          {event.kind}
        </Badge>
      </div>

      {isGrading && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm text-amber-700">
          Results are being processed. This may take a few minutes. Refresh the page to check.
        </div>
      )}

      {/* Certificate link for completed events */}
      {isCompleted && isRegistered && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3">
          <GraduationCap className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Certificates may be available
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
              If you qualified, your certificate will appear in your profile.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-emerald-400 text-emerald-700 shrink-0"
            onClick={() => navigate('/me/certificates')}
          >
            <GraduationCap className="mr-2 h-3.5 w-3.5" />
            My Certificates
          </Button>
        </div>
      )}

      {/* My result highlight */}
      {myResult && (
        <Card className="border-primary/40">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              Your Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Rank</dt>
                <dd className="font-bold text-lg">#{myResult.rank}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Score</dt>
                <dd className="font-bold text-lg">{myResult.score}</dd>
              </div>
              {myResult.totalTimeSeconds !== undefined && (
                <div>
                  <dt className="text-xs text-muted-foreground">Total Time</dt>
                  <dd className="font-bold text-lg">
                    {Math.floor(myResult.totalTimeSeconds / 60)}m {myResult.totalTimeSeconds % 60}s
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Full results table */}
      {results.length > 0 ? (
        <EventResultsTable results={results} currentUserId={user?.id} />
      ) : !isGrading ? (
        <EmptyState
          title="No results yet"
          description="Results will be published after grading completes."
          icon={<Trophy className="h-8 w-8 text-muted-foreground/30" />}
        />
      ) : null}
    </div>
  )
}
