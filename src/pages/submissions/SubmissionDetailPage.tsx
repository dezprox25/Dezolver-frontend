import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Code2, Cpu, Clock, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useSubmission, useJudgeRun, useRerunSubmission } from '@/hooks/useSubmissions'
import { usePermissions } from '@/hooks/usePermissions'
import { PageHeader } from '@/components/shared/PageHeader'
import { VerdictBadge } from '@/components/assessment/VerdictBadge'
import { VerdictPanel } from '@/components/assessment/VerdictPanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDateTime } from '@/lib/utils/format'

export function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const canRerun = usePermissions('rerun:submission')
  const canViewFull = usePermissions('view:submission')

  const { data: submission, isLoading, isError } = useSubmission(id)
  const { data: judgeRun } = useJudgeRun(canViewFull ? id : undefined)
  const { mutateAsync: rerun, isPending: rerunning } = useRerunSubmission()

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (isError || !submission) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Submission not found.{' '}
        <button className="underline" onClick={() => navigate('/submissions')}>
          Back
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Submission Detail"
        description={submission.assessmentTitle ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {canRerun && (
              <Button
                variant="outline"
                size="sm"
                disabled={rerunning}
                onClick={() => {
                  rerun({ id: submission.id })
                    .then(() => toast.success('Rerun queued.'))
                    .catch(() => toast.error('Rerun failed.'))
                }}
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5" />
                Rerun
              </Button>
            )}
          </div>
        }
      />

      {/* Summary strip */}
      <div className="flex flex-wrap items-center gap-3">
        <VerdictBadge verdict={submission.verdict} />
        {submission.score != null && (
          <Badge variant="secondary">Score: {submission.score}%</Badge>
        )}
        {submission.language && (
          <Badge variant="outline" className="text-xs">{submission.language}</Badge>
        )}
        {submission.executionTimeMs != null && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" /> {submission.executionTimeMs}ms
          </span>
        )}
        {submission.memoryUsedKb != null && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Cpu className="h-3 w-3" /> {(submission.memoryUsedKb / 1024).toFixed(1)}MB
          </span>
        )}
      </div>

      <Tabs defaultValue="verdict">
        <TabsList>
          <TabsTrigger value="verdict">Verdict</TabsTrigger>
          {submission.sourceCode && <TabsTrigger value="code">Code</TabsTrigger>}
          {judgeRun && <TabsTrigger value="judge">Judge Run</TabsTrigger>}
          {submission.clientMetadata && canViewFull && (
            <TabsTrigger value="signals">Anti-Cheat</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="verdict" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <VerdictPanel submission={submission} />
            </CardContent>
          </Card>

          <div className="mt-4">
            <Card>
              <CardContent className="pt-4">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground mb-1">Submitted</dt>
                    <dd>{formatDateTime(submission.submittedAt)}</dd>
                  </div>
                  {submission.gradedAt && (
                    <div>
                      <dt className="text-xs text-muted-foreground mb-1">Graded</dt>
                      <dd>{formatDateTime(submission.gradedAt)}</dd>
                    </div>
                  )}
                  {submission.attemptNumber && (
                    <div>
                      <dt className="text-xs text-muted-foreground mb-1">Attempt</dt>
                      <dd>#{submission.attemptNumber}</dd>
                    </div>
                  )}
                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground mb-1">Submission ID</dt>
                    <dd className="font-mono text-xs text-muted-foreground">{submission.id}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {submission.sourceCode && (
          <TabsContent value="code" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                  Source Code
                  {submission.language && (
                    <Badge variant="secondary" className="text-xs">{submission.language}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <pre className="text-xs font-mono leading-relaxed whitespace-pre-wrap p-3 rounded-md bg-muted/40">
                    {submission.sourceCode}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {judgeRun && (
          <TabsContent value="judge" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Raw Judge Run</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
                  {judgeRun.startedAt && (
                    <div>
                      <dt className="text-xs text-muted-foreground">Started</dt>
                      <dd>{formatDateTime(judgeRun.startedAt)}</dd>
                    </div>
                  )}
                  {judgeRun.completedAt && (
                    <div>
                      <dt className="text-xs text-muted-foreground">Completed</dt>
                      <dd>{formatDateTime(judgeRun.completedAt)}</dd>
                    </div>
                  )}
                </dl>
                <Separator className="mb-4" />
                <ScrollArea className="h-60">
                  <pre className="text-xs font-mono p-2 bg-muted/40 rounded whitespace-pre-wrap">
                    {JSON.stringify(judgeRun.rawResponse ?? judgeRun.testCaseResults, null, 2)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {submission.clientMetadata && canViewFull && (
          <TabsContent value="signals" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Anti-Cheat Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Time on Task</dt>
                    <dd>
                      {submission.clientMetadata.timeOnTaskMs != null
                        ? `${Math.round(submission.clientMetadata.timeOnTaskMs / 1000)}s`
                        : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Paste Events</dt>
                    <dd>{submission.clientMetadata.pasteEventCount ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Tab Blurs</dt>
                    <dd>{submission.clientMetadata.tabBlurCount ?? 0}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Window Blurs</dt>
                    <dd>{submission.clientMetadata.windowBlurCount ?? 0}</dd>
                  </div>
                </dl>
                <p className="text-xs text-muted-foreground mt-4">
                  Signals are collected client-side and submitted with the code. They are
                  indicators only — not deterministic proof of academic dishonesty.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
