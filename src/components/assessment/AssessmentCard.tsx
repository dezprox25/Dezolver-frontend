import { useNavigate } from 'react-router-dom'
import { Clock, Target, Code2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AssessmentStatusBadge } from './AssessmentStatusBadge'
import { formatRelativeTime } from '@/lib/utils/format'
import { ASSESSMENT_KIND_LABELS } from '@/types/assessment.types'
import type { Assessment } from '@/types/assessment.types'

interface AssessmentCardProps {
  assessment: Assessment
}

export function AssessmentCard({ assessment }: AssessmentCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      role="button"
      tabIndex={0}
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/assessments/${assessment.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/assessments/${assessment.id}`)
        }
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-semibold leading-tight line-clamp-2">
            {assessment.title}
          </CardTitle>
          <AssessmentStatusBadge status={assessment.status ?? 'draft'} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {assessment.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{assessment.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {ASSESSMENT_KIND_LABELS[assessment.kind]}
          </Badge>
          {assessment.timeLimitMinutes ?? assessment.config?.timeLimitMinutes ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {assessment.timeLimitMinutes ?? assessment.config?.timeLimitMinutes}m
            </span>
          ) : null}
          {assessment.config?.passingScore && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3 w-3" aria-hidden="true" />
              {assessment.config.passingScore}%
            </span>
          )}
          {assessment.config?.allowedLanguages && assessment.config.allowedLanguages.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Code2 className="h-3 w-3" aria-hidden="true" />
              {assessment.config.allowedLanguages.length} lang
              {assessment.config.allowedLanguages.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground/60">
          {formatRelativeTime(assessment.createdAt)}
        </p>
      </CardContent>
    </Card>
  )
}
