import { AlertTriangle, CheckCircle2, XCircle, Flag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { VerdictBadge } from './VerdictBadge'
import { ActivityFlagBadge } from './ActivityFlagBadge'
import { formatRelativeTime } from '@/lib/utils/format'
import type { FlaggedSubmission } from '@/types/assessment.types'

interface FlaggedSubmissionTableProps {
  items: FlaggedSubmission[]
  onReview: (item: FlaggedSubmission) => void
}

export function FlaggedSubmissionTable({ items, onReview }: FlaggedSubmissionTableProps) {
  const navigate = useNavigate()

  return (
    <div className="rounded-lg border divide-y">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-4 px-4 py-4">
          {/* Status icon */}
          <div className="mt-0.5 shrink-0" aria-hidden="true">
            {item.decision === 'cleared' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : item.decision === 'invalidated' ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : item.decision === 'flagged' ? (
              <Flag className="h-5 w-5 text-amber-500" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium">
                {item.assessmentTitle ?? 'Unknown assessment'}
              </p>
              <ActivityFlagBadge
                decision={item.decision}
                suspicionScore={!item.decision ? item.suspicionScore : undefined}
              />
              {item.submission?.verdict && <VerdictBadge verdict={item.submission.verdict} />}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Submission{' '}
              <button
                className="underline hover:text-foreground"
                onClick={() => navigate(`/submissions/${item.submissionId}`)}
              >
                {item.submissionId.slice(0, 12)}…
              </button>{' '}
              · {formatRelativeTime(item.createdAt)}
            </p>
            {item.signals && (
              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                {item.signals.pasteEventCount != null && (
                  <span>Pastes: {item.signals.pasteEventCount}</span>
                )}
                {item.signals.tabBlurCount != null && (
                  <span>Tab blurs: {item.signals.tabBlurCount}</span>
                )}
                {item.signals.windowBlurCount != null && (
                  <span>Window blurs: {item.signals.windowBlurCount}</span>
                )}
              </div>
            )}
          </div>

          {!item.decision && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              onClick={() => onReview(item)}
            >
              Review
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
