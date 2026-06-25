import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import type { Path } from '@/types/path.types'

interface EnrollmentCardProps {
  path: Path
}

export function EnrollmentCard({ path }: EnrollmentCardProps) {
  const navigate = useNavigate()
  const progress = path.myProgress
  const pct = progress?.percentageComplete ?? 0

  return (
    <Card className="flex flex-col">
      <CardContent className="p-4 flex-1 space-y-3">
        <div>
          <p className="text-sm font-semibold line-clamp-1">{path.title}</p>
          {path.description && (
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{path.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {path.stepCount != null && (
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" aria-hidden="true" />
              {path.stepCount} steps
            </span>
          )}
          {path.estimatedMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {Math.round(path.estimatedMinutes / 60)}h
            </span>
          )}
        </div>

        {progress && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold tabular-nums">{pct}%</span>
            </div>
            <Progress value={pct} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              {progress.stepsCompleted} of {progress.stepsTotal} steps
            </p>
          </div>
        )}

        <Button
          size="sm"
          variant={pct > 0 ? 'default' : 'outline'}
          className="w-full"
          onClick={() => navigate(`/paths/${path.id}`)}
        >
          {pct > 0 ? (
            <>
              <ArrowRight className="mr-2 h-3.5 w-3.5" />
              Continue
            </>
          ) : 'Start Path'}
        </Button>
      </CardContent>
    </Card>
  )
}
