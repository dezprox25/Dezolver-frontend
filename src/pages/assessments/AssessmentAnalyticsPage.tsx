import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BarChart3, AlertCircle, RefreshCw, TrendingUp, Target } from 'lucide-react'
import { useAssessment } from '@/hooks/useAssessments'
import { useMySubmissions } from '@/hooks/useSubmissions'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { AssessmentStatusBadge } from '@/components/assessment/AssessmentStatusBadge'
import { VerdictBadge } from '@/components/assessment/VerdictBadge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/utils/format'
import {
  VERDICT_LABELS, ASSESSMENT_KIND_LABELS, isTerminalVerdict,
  type SubmissionVerdict,
} from '@/types/assessment.types'

// ─── Bar chart ────────────────────────────────────────────────────────────────

const VERDICT_COLORS: Partial<Record<SubmissionVerdict, string>> = {
  accepted: 'bg-emerald-500',
  partial: 'bg-blue-500',
  wrong_answer: 'bg-red-400',
  time_limit_exceeded: 'bg-amber-500',
  memory_limit_exceeded: 'bg-orange-500',
  runtime_error: 'bg-purple-500',
  compilation_error: 'bg-slate-500',
  system_error: 'bg-slate-400',
}

function HBar({ data, total }: { data: { label: string; count: number; color: string }[]; total: number }) {
  if (total === 0) return <p className="text-sm text-muted-foreground">No data.</p>
  return (
    <div className="space-y-2.5">
      {data.filter((d) => d.count > 0).map((item) => {
        const pct = Math.round((item.count / total) * 100)
        return (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-36 shrink-0 text-sm text-muted-foreground truncate">{item.label}</span>
            <div className="flex-1 overflow-hidden rounded-full bg-muted h-2">
              <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="w-8 text-right text-sm font-medium">{item.count}</span>
            <span className="w-8 text-right text-xs text-muted-foreground">{pct}%</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AssessmentAnalyticsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: assessment, isLoading: assessmentLoading } = useAssessment(id)
  const {
    data: submissionsData,
    isLoading: submissionsLoading,
    refetch,
  } = useMySubmissions({ assessmentId: id, limit: 200 })

  const submissions = submissionsData?.pages.flatMap((p) => p.items) ?? []
  const terminal = submissions.filter((s) => isTerminalVerdict(s.verdict))

  const verdictData = useMemo(() => {
    const verdicts: SubmissionVerdict[] = [
      'accepted', 'partial', 'wrong_answer', 'time_limit_exceeded',
      'memory_limit_exceeded', 'runtime_error', 'compilation_error', 'system_error',
    ]
    return verdicts.map((v) => ({
      label: VERDICT_LABELS[v],
      count: terminal.filter((s) => s.verdict === v).length,
      color: VERDICT_COLORS[v] ?? 'bg-slate-400',
    }))
  }, [terminal])

  const scores = terminal.map((s) => s.score ?? 0).filter((s) => s !== null) as number[]
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
  const bestScore = scores.length > 0 ? Math.max(...scores) : null
  const acceptedCount = terminal.filter((s) => s.verdict === 'accepted').length

  const languages = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of submissions) {
      if (s.language) map[s.language] = (map[s.language] ?? 0) + 1
    }
    return Object.entries(map).sort(([, a], [, b]) => b - a)
  }, [submissions])

  if (assessmentLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  if (!assessment) {
    return (
      <EmptyState
        title="Assessment not found"
        action={
          <Button variant="outline" onClick={() => navigate('/assessments')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={`Analytics: ${assessment.title}`}
        description="Your submission history and performance for this assessment."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/assessments/${id}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={submissionsLoading}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-2 flex-wrap">
        <AssessmentStatusBadge status={assessment.status ?? 'draft'} />
        <Badge variant="secondary" className="text-xs">{ASSESSMENT_KIND_LABELS[assessment.kind]}</Badge>
      </div>

      {/* Backend limitation notice */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3">
        <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Analytics show <strong>your own submissions only</strong> (GET /me/submissions?assessment=:id).
          Class-wide analytics (pass rates, score distributions across all students) require a
          dedicated backend analytics endpoint which does not exist. Organizers can view all
          submissions via the submissions list.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Attempts', value: submissionsLoading ? '…' : submissions.length, icon: BarChart3 },
          { label: 'Accepted', value: submissionsLoading ? '…' : acceptedCount, icon: Target },
          { label: 'Best Score', value: submissionsLoading ? '…' : (bestScore !== null ? `${bestScore}%` : '—'), icon: TrendingUp },
          { label: 'Avg Score', value: submissionsLoading ? '…' : (avgScore !== null ? `${avgScore}%` : '—'), icon: BarChart3 },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {submissionsLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <p className="text-2xl font-bold">{value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Verdict distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verdict Distribution</CardTitle>
          <CardDescription>
            Across {terminal.length} graded submission{terminal.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissionsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : terminal.length === 0 ? (
            <p className="text-sm text-muted-foreground">No graded submissions yet.</p>
          ) : (
            <HBar data={verdictData} total={terminal.length} />
          )}
        </CardContent>
      </Card>

      {/* Language distribution */}
      {languages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Languages Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {languages.map(([lang, count]) => (
                <Badge key={lang} variant="secondary" className="text-xs">
                  {lang} <span className="ml-1 text-muted-foreground">× {count}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent submissions */}
      {submissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Submission History</CardTitle>
            <CardDescription>Most recent attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {submissions.slice(0, 10).map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between py-3 gap-3 cursor-pointer hover:bg-muted/30 rounded -mx-2 px-2 transition-colors"
                  onClick={() => navigate(`/submissions/${sub.id}`)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <VerdictBadge verdict={sub.verdict} />
                    {sub.language && (
                      <Badge variant="outline" className="text-xs capitalize shrink-0">
                        {sub.language}
                      </Badge>
                    )}
                    {sub.score !== undefined && sub.score !== null && (
                      <span className="text-sm text-muted-foreground">{sub.score}%</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {formatDateTime(sub.submittedAt)}
                  </div>
                </div>
              ))}
            </div>
            {submissions.length > 0 && (
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => navigate(`/submissions?assessment=${id}`)}
                >
                  View all submissions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!submissionsLoading && submissions.length === 0 && (
        <EmptyState
          title="No submissions yet"
          description="Analytics will appear after you attempt this assessment."
          icon={<BarChart3 className="h-8 w-8 text-muted-foreground/30" />}
        />
      )}
    </div>
  )
}
