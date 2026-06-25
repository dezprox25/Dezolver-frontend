import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, BookOpen, Clock, GitFork, Edit2, Archive, CheckCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { usePath, useForkPath, usePublishPath, useArchivePath } from '@/hooks/usePaths'
import { useNextStep, usePathProgress, useStartRoom } from '@/hooks/useProgress'
import { useProgressUpdates } from '@/hooks/useProgress'
import { usePermissions } from '@/hooks/usePermissions'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { PathStatusBadge } from '@/components/paths/PathStatusBadge'
import { ProgressRing } from '@/components/paths/ProgressRing'
import { JourneyMap } from '@/components/paths/JourneyMap'
import { CompletionBadge } from '@/components/paths/CompletionBadge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { DOMAIN_LABELS } from '@/types/path.types'
import type { PathStep } from '@/types/path.types'

export function PathDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const canAuthor = usePermissions('manage:assessment')
  const canFork = usePermissions('fork:path')

  const { data: path, isLoading, isError } = usePath(id)
  const { data: nextStepData } = useNextStep(id)
  const { data: progress } = usePathProgress(id)
  const { mutateAsync: fork, isPending: forking } = useForkPath()
  const { mutateAsync: publish, isPending: publishing } = usePublishPath()
  const { mutateAsync: archive } = useArchivePath()
  const { mutateAsync: startRoom } = useStartRoom()

  // WS updates
  useProgressUpdates((event) => {
    if (event.pathId === id) {
      toast.success('🎉 Path completed!')
    }
  })

  const handleFork = async () => {
    if (!path) return
    try {
      const forked = await fork(path.id)
      toast.success('Path forked to your personal collection.')
      navigate(`/paths/${forked.id}`)
    } catch (err) {
      const code = (err as { response?: { data?: { error?: { code?: string } } } })
        ?.response?.data?.error?.code
      if (code === 'tenant_locks_path_personalization') {
        toast.error('Your institution has disabled path personalization.')
      } else {
        toast.error('Fork failed.')
      }
    }
  }

  const handleStartStep = async (step: PathStep) => {
    if (!step.room) return
    try {
      await startRoom(step.room.id)
      navigate(`/content/rooms/${step.room.slug}`)
    } catch {
      navigate(`/content/rooms/${step.room.slug}`)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    )
  }

  if (isError || !path) {
    return (
      <EmptyState
        title="Path not found"
        action={
          <Button variant="outline" onClick={() => navigate('/paths')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
    )
  }

  const pct = progress?.percentageComplete ?? path.myProgress?.percentageComplete ?? 0
  const isCompleted = progress?.isCompleted ?? path.myProgress?.isCompleted ?? false
  const steps = path.steps ?? []
  const currentStepId = nextStepData?.next?.id

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title={path.title}
        description={path.description ?? undefined}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate('/paths')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            {/* Fork — students on non-personalized paths */}
            {canFork && path.kind !== 'personalized' && path.status === 'published' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleFork}
                disabled={forking}
              >
                <GitFork className="mr-2 h-4 w-4" />
                Fork Path
              </Button>
            )}

            {/* Authoring actions */}
            {canAuthor && (
              <>
                {path.status === 'draft' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/paths/${path.id}/edit`)}
                    >
                      <Edit2 className="mr-2 h-4 w-4" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      disabled={publishing}
                      onClick={async () => {
                        try {
                          await publish(path.id)
                          toast.success('Path published.')
                        } catch {
                          toast.error('Publish failed.')
                        }
                      }}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Publish
                    </Button>
                  </>
                )}
                {path.status === 'published' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await archive(path.id)
                        toast.info('Path archived.')
                      } catch {
                        toast.error('Archive failed.')
                      }
                    }}
                  >
                    <Archive className="mr-2 h-4 w-4" /> Archive
                  </Button>
                )}
              </>
            )}
          </div>
        }
      />

      {/* Status + completion */}
      <div className="flex flex-wrap items-center gap-2">
        <PathStatusBadge kind={path.kind} status={path.status} />
        {path.domainCode && (
          <Badge variant="secondary" className="text-xs">
            {DOMAIN_LABELS[path.domainCode] ?? path.domainCode}
          </Badge>
        )}
        {isCompleted && <CompletionBadge />}
      </div>

      {/* Progress overview */}
      {pct > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Your Progress</span>
              <ProgressRing percentage={pct} size={56} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={pct} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {progress?.stepsCompleted ?? nextStepData?.completion.stepsCompleted ?? 0} /{' '}
                {progress?.stepsTotal ?? nextStepData?.completion.stepsTotal ?? path.stepCount ?? 0} steps
              </span>
              <span>{pct}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
        {path.stepCount != null && (
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            {path.stepCount} step{path.stepCount !== 1 ? 's' : ''}
          </span>
        )}
        {path.estimatedMinutes && (
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" aria-hidden="true" />
            ~{Math.round(path.estimatedMinutes / 60)}h estimated
          </span>
        )}
      </div>

      {path.outcomeStatement && (
        <div className="rounded-lg bg-muted/30 border px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Learning Outcome
          </p>
          <p className="text-sm">{path.outcomeStatement}</p>
        </div>
      )}

      {/* Journey map */}
      {steps.length > 0 ? (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Steps</h2>
          <JourneyMap
            steps={steps}
            currentStepId={currentStepId}
            onStart={handleStartStep}
          />
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="h-8 w-8 text-muted-foreground/50" />}
          title="No steps yet"
          description={
            canAuthor
              ? 'Add rooms to this path from the edit page.'
              : 'This path has no steps configured yet.'
          }
          action={
            canAuthor && path.status === 'draft' ? (
              <Button onClick={() => navigate(`/paths/${path.id}/edit`)}>
                <Edit2 className="mr-2 h-4 w-4" /> Edit Path
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  )
}
