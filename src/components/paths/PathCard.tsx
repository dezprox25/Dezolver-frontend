import { useNavigate } from 'react-router-dom'
import { Clock, BookOpen, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PathStatusBadge } from './PathStatusBadge'
import { ProgressRing } from './ProgressRing'
import { DOMAIN_LABELS } from '@/types/path.types'
import type { Path } from '@/types/path.types'

interface PathCardProps {
  path: Path
}

export function PathCard({ path }: PathCardProps) {
  const navigate = useNavigate()
  const progress = path.myProgress
  const hasProgress = progress && progress.percentageComplete > 0

  return (
    <Card
      role="button"
      tabIndex={0}
      className="cursor-pointer hover:shadow-md transition-all group"
      onClick={() => navigate(`/paths/${path.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/paths/${path.id}`)
        }
      }}
    >
      {/* Top progress bar */}
      {hasProgress && (
        <div
          className="h-1 rounded-t-lg bg-muted overflow-hidden"
          aria-hidden="true"
        >
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${progress.percentageComplete}%` }}
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <PathStatusBadge kind={path.kind} status={path.status} />
            <h3 className="text-sm font-semibold mt-1.5 leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {path.title}
            </h3>
          </div>
          {hasProgress && (
            <ProgressRing
              percentage={progress.percentageComplete}
              size={48}
              strokeWidth={5}
              className="shrink-0"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {path.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{path.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {path.domainCode && (
            <Badge variant="secondary" className="text-[10px]">
              {DOMAIN_LABELS[path.domainCode] ?? path.domainCode}
            </Badge>
          )}
          {path.stepCount != null && (
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" aria-hidden="true" />
              {path.stepCount} step{path.stepCount !== 1 ? 's' : ''}
            </span>
          )}
          {path.estimatedMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {Math.round(path.estimatedMinutes / 60)}h
            </span>
          )}
        </div>
        {progress?.isCompleted && (
          <Badge className="text-xs bg-emerald-100 text-emerald-700 border-emerald-300 border-0">
            ✓ Completed
          </Badge>
        )}
        {hasProgress && !progress?.isCompleted && (
          <div className="flex items-center gap-1 text-xs text-primary">
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
            <span>Continue</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
