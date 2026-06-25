import { CheckCircle2, XCircle, Clock, Cpu, AlertTriangle, Loader2 } from 'lucide-react'
import { VerdictBadge } from './VerdictBadge'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Submission } from '@/types/assessment.types'
import { isTerminalVerdict, isAccepted } from '@/types/assessment.types'

interface VerdictPanelProps {
  submission: Submission | null
  isLoading?: boolean
}

function TestCaseRow({
  index,
  isSample,
  status,
  timeMs,
  memoryKb,
  actualOutput,
  expectedOutput,
}: {
  index: number
  isSample: boolean
  status: string
  timeMs?: number | null
  memoryKb?: number | null
  actualOutput?: string | null
  expectedOutput?: string | null
}) {
  const passed = status === 'accepted'

  return (
    <div
      className={`rounded-md border px-3 py-2 text-sm ${
        passed
          ? 'border-emerald-300/50 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20'
          : 'border-red-300/50 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {passed ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
          ) : (
            <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" aria-hidden="true" />
          )}
          <span className="font-medium text-xs">
            Test {index} {isSample ? '(sample)' : '(hidden)'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {timeMs != null && (
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {timeMs}ms
            </span>
          )}
          {memoryKb != null && (
            <span className="flex items-center gap-0.5">
              <Cpu className="h-3 w-3" aria-hidden="true" />
              {(memoryKb / 1024).toFixed(1)}MB
            </span>
          )}
        </div>
      </div>
      {/* Only show I/O for sample cases */}
      {isSample && actualOutput != null && !passed && (
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground mb-0.5 font-medium">Expected</p>
            <pre className="rounded bg-muted/50 px-2 py-1 font-mono overflow-x-auto">
              {expectedOutput ?? '(empty)'}
            </pre>
          </div>
          <div>
            <p className="text-muted-foreground mb-0.5 font-medium">Got</p>
            <pre className="rounded bg-muted/50 px-2 py-1 font-mono overflow-x-auto">
              {actualOutput}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}

export function VerdictPanel({ submission, isLoading }: VerdictPanelProps) {
  if (isLoading || !submission) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Judging your submission…</p>
      </div>
    )
  }

  const isPending = !isTerminalVerdict(submission.verdict)
  const accepted = isAccepted(submission.verdict)

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden="true" />
          ) : accepted ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
          )}
          <VerdictBadge verdict={submission.verdict} />
          {submission.score != null && (
            <Badge variant="secondary" className="text-xs">
              Score: {submission.score}%
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {submission.executionTimeMs != null && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {submission.executionTimeMs}ms
            </span>
          )}
          {submission.memoryUsedKb != null && (
            <span className="flex items-center gap-1">
              <Cpu className="h-3 w-3" aria-hidden="true" />
              {(submission.memoryUsedKb / 1024).toFixed(1)}MB
            </span>
          )}
          {submission.language && (
            <Badge variant="secondary" className="text-[10px]">
              {submission.language}
            </Badge>
          )}
        </div>
      </div>

      {/* Test case pass count */}
      {submission.testCasesPassed != null && submission.testCasesTotal != null && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Test cases:</span>
          <span
            className={
              submission.testCasesPassed === submission.testCasesTotal
                ? 'text-emerald-600 font-semibold'
                : 'text-amber-600 font-semibold'
            }
          >
            {submission.testCasesPassed} / {submission.testCasesTotal} passed
          </span>
        </div>
      )}

      <Separator />

      {/* Per-test-case results (sample cases shown to all; hidden just show status) */}
      {submission.testCaseResults && submission.testCaseResults.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Test Cases
          </p>
          {submission.testCaseResults.map((tc) => (
            <TestCaseRow key={tc.index} {...tc} />
          ))}
        </div>
      ) : (
        isPending && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Waiting for Judge0 to process your submission…
          </div>
        )
      )}
    </div>
  )
}

// ─── Compact submission row for history tables ────────────────────────────────

interface SubmissionRowSummaryProps {
  submission: Submission
}

export function SubmissionRowSummary({ submission }: SubmissionRowSummaryProps) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <VerdictBadge verdict={submission.verdict} />
      {submission.score != null && <span>{submission.score}%</span>}
      {submission.executionTimeMs != null && (
        <span className="flex items-center gap-0.5">
          <Clock className="h-3 w-3" />
          {submission.executionTimeMs}ms
        </span>
      )}
      {submission.language && (
        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
          {submission.language}
        </Badge>
      )}
    </div>
  )
}
