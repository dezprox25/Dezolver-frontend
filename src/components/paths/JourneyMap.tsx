import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2, Circle, Lock, SkipForward, Loader2, ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { PathStep } from '@/types/path.types'

interface JourneyMapProps {
  steps: PathStep[]
  currentStepId?: string
  onStart?: (step: PathStep) => void
  onSkip?: (step: PathStep) => void
}

function StepIcon({ step }: { step: PathStep }) {
  const state = step.progress

  if (state === 'completed') {
    return <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" aria-label="Completed" />
  }
  if (state === 'skipped') {
    return <SkipForward className="h-5 w-5 text-slate-400 shrink-0" aria-label="Skipped" />
  }
  if (state === 'in_progress') {
    return <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" aria-label="In progress" />
  }
  if (!step.unlocked) {
    return <Lock className="h-5 w-5 text-muted-foreground/40 shrink-0" aria-label="Locked" />
  }
  return <Circle className="h-5 w-5 text-muted-foreground/60 shrink-0" aria-label="Not started" />
}

export function JourneyMap({ steps, currentStepId, onStart }: JourneyMapProps) {
  const navigate = useNavigate()
  const isComplete = (s: PathStep) => s.progress === 'completed' || s.progress === 'skipped'

  return (
    <ol className="space-y-0" aria-label="Learning path steps">
      {steps.map((step, idx) => {
        const isCurrent = step.id === currentStepId
        const completed = isComplete(step)
        const locked = !step.unlocked && step.progress !== 'in_progress'
        const room = step.room

        return (
          <li key={step.id} className="flex gap-0">
            {/* Connector column */}
            <div className="flex flex-col items-center mr-4">
              <div className="mt-3">
                <StepIcon step={step} />
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'w-0.5 flex-1 mt-1 mb-0',
                    completed ? 'bg-emerald-300 dark:bg-emerald-800' : 'bg-border'
                  )}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Content */}
            <div
              className={cn(
                'flex-1 rounded-lg border mb-3 px-4 py-3 transition-all',
                isCurrent && 'border-primary/50 bg-primary/5 shadow-sm',
                completed && 'bg-muted/20 border-emerald-200 dark:border-emerald-900',
                locked && 'opacity-60',
                !locked && !completed && !isCurrent && 'hover:border-muted-foreground/30 hover:bg-muted/10 cursor-pointer'
              )}
              onClick={
                !locked && room
                  ? () => navigate(`/content/rooms/${room.slug}`)
                  : undefined
              }
              role={!locked && room ? 'button' : undefined}
              tabIndex={!locked && room ? 0 : undefined}
              onKeyDown={
                !locked && room
                  ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/content/rooms/${room.slug}`)
                      }
                    }
                  : undefined
              }
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground/60">
                      Step {step.orderIndex + 1}
                    </span>
                    {step.isOptional && (
                      <Badge variant="secondary" className="text-[10px] px-1">Optional</Badge>
                    )}
                    {room?.difficulty && (
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] border-0',
                          room.difficulty === 'beginner' && 'bg-green-100 text-green-700',
                          room.difficulty === 'intermediate' && 'bg-amber-100 text-amber-700',
                          room.difficulty === 'advanced' && 'bg-red-100 text-red-700',
                        )}
                      >
                        {room.difficulty}
                      </Badge>
                    )}
                  </div>
                  <p className={cn(
                    'text-sm font-medium mt-0.5',
                    completed && 'text-muted-foreground line-through'
                  )}>
                    {room?.title ?? `Step ${step.orderIndex + 1}`}
                  </p>
                  {room?.estimatedMinutes && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ~{room.estimatedMinutes} min
                    </p>
                  )}
                </div>

                {isCurrent && onStart && (
                  <Button
                    size="sm"
                    className="shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      onStart(step)
                    }}
                  >
                    <ArrowRight className="mr-1.5 h-3.5 w-3.5" />
                    Continue
                  </Button>
                )}
              </div>

              {/* Locked prereq notice */}
              {locked && step.prerequisiteStepIds.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Complete prerequisites to unlock
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
