import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Play, Edit2, Clock, Target, Code2, MoreHorizontal,
  CheckCircle2, Archive, Users, BarChart3,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAssessment, usePublishAssessment, useArchiveAssessment } from '@/hooks/useAssessments'
import { usePermissions } from '@/hooks/usePermissions'
import { PageHeader } from '@/components/shared/PageHeader'
import { AssessmentStatusBadge } from '@/components/assessment/AssessmentStatusBadge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatRelativeTime } from '@/lib/utils/format'
import { ASSESSMENT_KIND_LABELS } from '@/types/assessment.types'
import { PROBLEM_DIFFICULTY_LABELS, type ProblemDifficulty } from '@/types/content.types'

export function AssessmentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const canManage = usePermissions('manage:assessment')
  const canSubmit = usePermissions('create:submission')
  const canReview = usePermissions('view:submission')

  const { data: assessment, isLoading, isError } = useAssessment(id)
  const { mutateAsync: publish, isPending: publishing } = usePublishAssessment()
  const { mutateAsync: archive, isPending: archiving } = useArchiveAssessment()

  const updating = publishing || archiving

  const handlePublish = async () => {
    if (!assessment) return
    try {
      await publish(assessment.id)
      toast.success('Assessment published.')
    } catch {
      toast.error('Failed to publish assessment.')
    }
  }

  const handleArchive = async () => {
    if (!assessment) return
    try {
      await archive(assessment.id)
      toast.success('Assessment archived.')
    } catch {
      toast.error('Failed to archive assessment.')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    )
  }

  if (isError || !assessment) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Assessment not found.{' '}
        <button className="underline" onClick={() => navigate('/assessments')}>
          Back to assessments
        </button>
      </div>
    )
  }

  const problem = assessment.problem
  const config = assessment.config
  const isCoding = assessment.kind === 'coding_problem'
  const isQuiz = !isCoding
  const status = assessment.status ?? 'draft'

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={assessment.title}
        description={assessment.description ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/assessments')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {canSubmit && status === 'published' && (
              <Button
                size="sm"
                onClick={() => navigate(`/assessments/${assessment.id}/take`)}
              >
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
            )}

            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updating}
                    aria-label="More actions"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {status === 'draft' && (
                    <>
                      <DropdownMenuItem
                        onClick={() => navigate(`/assessments/${assessment.id}/edit`)}
                      >
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handlePublish} disabled={publishing}>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                        Publish
                      </DropdownMenuItem>
                    </>
                  )}
                  {status === 'published' && (
                    <>
                      {canReview && (
                        <DropdownMenuItem
                          onClick={() => navigate(`/submissions?assessment=${assessment.id}`)}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          View Submissions
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => navigate(`/assessments/${assessment.id}/analytics`)}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={handleArchive}
                        disabled={archiving}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        }
      />

      {/* Status strip */}
      <div className="flex flex-wrap items-center gap-2">
        <AssessmentStatusBadge status={status} />
        <Badge variant="secondary" className="text-xs">
          {ASSESSMENT_KIND_LABELS[assessment.kind]}
        </Badge>
        {assessment.contextKind && (
          <Badge variant="outline" className="text-xs capitalize">
            {assessment.contextKind}
          </Badge>
        )}
        {assessment.myAttemptCount !== undefined && (
          <Badge variant="outline" className="text-xs">
            {assessment.myAttemptCount} attempt{assessment.myAttemptCount !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Configuration card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {(assessment.timeLimitMinutes ?? config?.timeLimitMinutes) && (
              <div>
                <dt className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Time Limit
                </dt>
                <dd>{assessment.timeLimitMinutes ?? config?.timeLimitMinutes} minutes</dd>
              </div>
            )}
            {(assessment.maxAttempts ?? config?.maxAttempts) && (
              <div>
                <dt className="text-xs text-muted-foreground mb-1">Max Attempts</dt>
                <dd>{assessment.maxAttempts ?? config?.maxAttempts}</dd>
              </div>
            )}
            {config?.passingScore && (
              <div>
                <dt className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Passing Score
                </dt>
                <dd>{config.passingScore}%</dd>
              </div>
            )}
            {config?.allowedLanguages && config.allowedLanguages.length > 0 && (
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Code2 className="h-3 w-3" />
                  Languages
                </dt>
                <dd className="flex flex-wrap gap-1">
                  {config.allowedLanguages.map((l) => (
                    <Badge key={l} variant="secondary" className="text-xs">
                      {l}
                    </Badge>
                  ))}
                </dd>
              </div>
            )}
            {isQuiz && (
              <div>
                <dt className="text-xs text-muted-foreground mb-1">Questions</dt>
                <dd>{assessment.questions?.length ?? 0} question{assessment.questions?.length !== 1 ? 's' : ''}</dd>
              </div>
            )}
            {isQuiz && config?.partialCredit !== undefined && (
              <div>
                <dt className="text-xs text-muted-foreground mb-1">Partial Credit</dt>
                <dd>{config.partialCredit ? 'Enabled' : 'Disabled'}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted-foreground mb-1">Created</dt>
              <dd>{formatRelativeTime(assessment.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground mb-1">Assessment ID</dt>
              <dd className="font-mono text-xs text-muted-foreground truncate">{assessment.id}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Problem details (coding) */}
      {problem && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Problem</span>
              <Badge
                className={`text-xs ${
                  problem.difficulty === 'easy'
                    ? 'bg-green-100 text-green-700 border-0'
                    : problem.difficulty === 'medium'
                    ? 'bg-amber-100 text-amber-700 border-0'
                    : 'bg-red-100 text-red-700 border-0'
                }`}
              >
                {PROBLEM_DIFFICULTY_LABELS[problem.difficulty as ProblemDifficulty]}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button
              className="text-sm font-semibold text-primary hover:underline text-left"
              onClick={() => navigate(`/content/problems/${problem.slug}`)}
            >
              {problem.title}
            </button>
            {problem.statementMd && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {problem.statementMd}
              </p>
            )}
            {problem.topics?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {problem.topics.map((t) => (
                  <Badge key={t} variant="outline" className="text-xs">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quiz question preview */}
      {isQuiz && assessment.questions && assessment.questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Questions ({assessment.questions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assessment.questions.slice(0, 5).map((q, idx) => (
                <div key={q.id} className="flex items-start gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-5 mt-0.5 shrink-0">
                    Q{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm line-clamp-2">{q.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {q.kind === 'mcq_single' ? 'Single Choice' : q.kind === 'mcq_multi' ? 'Multi Choice' : 'Short Answer'}
                      </Badge>
                      {q.weight !== undefined && (
                        <span className="text-[10px] text-muted-foreground">{q.weight} pts</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {assessment.questions.length > 5 && (
                <p className="text-xs text-muted-foreground pl-8">
                  +{assessment.questions.length - 5} more questions
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Student attempt summary */}
      {assessment.myAttemptCount !== undefined && assessment.myAttemptCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            You have attempted this {assessment.myAttemptCount} time
            {assessment.myAttemptCount !== 1 ? 's' : ''}.
            {assessment.myBestVerdict && (
              <> Best result: <strong>{assessment.myBestVerdict}</strong></>
            )}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/submissions?assessment=${assessment.id}`)}
          >
            View my submissions
          </Button>
        </div>
      )}
    </div>
  )
}
