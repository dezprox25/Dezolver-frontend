import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { usePath } from '@/hooks/usePaths'
import { useNextStep, usePathProgress } from '@/hooks/useProgress'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProgressRing } from '@/components/paths/ProgressRing'
import { JourneyMap } from '@/components/paths/JourneyMap'
import { CompletionBadge } from '@/components/paths/CompletionBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'

export function MyPathProgressPage() {
  const { pathId } = useParams<{ pathId: string }>()
  const navigate = useNavigate()

  const { data: path, isLoading } = usePath(pathId)
  const { data: progress } = usePathProgress(pathId)
  const { data: nextStep } = useNextStep(pathId)

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    )
  }

  if (!path) {
    return (
      <EmptyState
        title="Path not found"
        action={
          <Button variant="outline" onClick={() => navigate('/me/progress')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
    )
  }

  const pct = progress?.percentageComplete ?? 0
  const steps = path.steps ?? []
  const currentStepId = nextStep?.next?.id

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title={path.title}
        description="Your progress through this learning path."
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/me/progress')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />

      {/* Progress summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <ProgressRing percentage={pct} size={80} strokeWidth={8} />
            <div className="flex-1 space-y-2">
              {progress?.isCompleted && <CompletionBadge />}
              <Progress value={pct} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {progress?.stepsCompleted ?? nextStep?.completion.stepsCompleted ?? 0} /{' '}
                  {progress?.stepsTotal ?? nextStep?.completion.stepsTotal ?? path.stepCount ?? 0} steps completed
                </span>
                <span className="font-semibold tabular-nums">{pct}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journey */}
      {steps.length > 0 ? (
        <JourneyMap steps={steps} currentStepId={currentStepId} />
      ) : (
        <EmptyState title="No steps" description="This path has no steps configured." />
      )}
    </div>
  )
}
