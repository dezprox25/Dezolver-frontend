import { useNavigate } from 'react-router-dom'
import { Clock, Cpu } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { VerdictBadge } from './VerdictBadge'
import { formatRelativeTime } from '@/lib/utils/format'
import type { Submission } from '@/types/assessment.types'

interface SubmissionCardProps {
  submission: Submission
}

export function SubmissionCard({ submission }: SubmissionCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      role="button"
      tabIndex={0}
      className="cursor-pointer hover:shadow-sm transition-shadow"
      onClick={() => navigate(`/submissions/${submission.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(`/submissions/${submission.id}`)
        }
      }}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium line-clamp-1">
            {submission.assessmentTitle ?? submission.assessmentId.slice(0, 8) + '…'}
          </p>
          <VerdictBadge verdict={submission.verdict} />
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          {submission.score != null && (
            <span>Score: {submission.score}%</span>
          )}
          {submission.language && (
            <Badge variant="secondary" className="text-[10px]">{submission.language}</Badge>
          )}
          {submission.executionTimeMs != null && (
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {submission.executionTimeMs}ms
            </span>
          )}
          {submission.memoryUsedKb != null && (
            <span className="flex items-center gap-0.5">
              <Cpu className="h-3 w-3" aria-hidden="true" />
              {(submission.memoryUsedKb / 1024).toFixed(1)}MB
            </span>
          )}
          <span className="ml-auto">{formatRelativeTime(submission.submittedAt)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
