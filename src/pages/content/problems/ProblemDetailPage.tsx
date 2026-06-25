import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useProblem, usePublishProblem } from '@/hooks/useProblems'
import { usePermissions } from '@/hooks/usePermissions'
import { PageHeader } from '@/components/shared/PageHeader'
import { ContentStatusBadge } from '@/components/content/ContentStatusBadge'
import { DifficultyBadge } from '@/components/content/DifficultyBadge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/utils/format'

export function ProblemDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const canManage = usePermissions('manage:problem')

  const { data: problem, isLoading, isError } = useProblem(slug)
  const { mutateAsync: publishProblem, isPending: publishing } = usePublishProblem()

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    )
  }

  if (isError || !problem) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Problem not found.{' '}
        <button className="underline" onClick={() => navigate('/content/problems')}>Back</button>
      </div>
    )
  }

  const sampleCases = problem.testCases?.filter((tc) => tc.isSample) ?? []
  const hiddenCount = (problem.testCases?.length ?? 0) - sampleCases.length

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title={problem.title}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/content/problems')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {canManage && problem.status === 'draft' && (
              <Button
                size="sm"
                disabled={publishing}
                onClick={() => {
                  publishProblem({ problemId: problem.id, slug: problem.slug })
                    .then(() => toast.success('Problem published.'))
                    .catch(() => toast.error('Failed to publish.'))
                }}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )}
          </div>
        }
      />

      {/* Meta strip */}
      <div className="flex flex-wrap items-center gap-2">
        <ContentStatusBadge status={problem.status} />
        <DifficultyBadge difficulty={problem.difficulty} variant="problem" />
        {problem.topics.map((t) => (
          <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
        ))}
        {problem.companies.map((c) => (
          <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
        ))}
      </div>

      <Tabs defaultValue="statement">
        <TabsList>
          <TabsTrigger value="statement">Statement</TabsTrigger>
          <TabsTrigger value="test-cases">
            Test Cases
            {(problem.testCases?.length ?? 0) > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0 h-4">
                {problem.testCases?.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        {/* Statement */}
        <TabsContent value="statement" className="mt-4 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Problem Statement</CardTitle></CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                {problem.statementMd}
              </pre>
            </CardContent>
          </Card>
          {problem.inputFormat && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Input Format</CardTitle></CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-xs text-muted-foreground">{problem.inputFormat}</pre>
              </CardContent>
            </Card>
          )}
          {problem.outputFormat && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Output Format</CardTitle></CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-xs text-muted-foreground">{problem.outputFormat}</pre>
              </CardContent>
            </Card>
          )}
          {problem.constraints && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Constraints</CardTitle></CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-xs font-mono text-muted-foreground">{problem.constraints}</pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Test Cases */}
        <TabsContent value="test-cases" className="mt-4 space-y-4">
          {sampleCases.length === 0 && hiddenCount === 0 ? (
            <p className="text-sm text-muted-foreground">No test cases yet.</p>
          ) : (
            <>
              {sampleCases.map((tc) => (
                <Card key={tc.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Sample {tc.index}
                      {tc.explanation && (
                        <span className="text-xs font-normal text-muted-foreground ml-2">{tc.explanation}</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Input</p>
                      <pre className="rounded-md bg-muted/40 px-3 py-2 text-xs font-mono whitespace-pre-wrap">
                        {tc.input ?? '(empty)'}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Expected Output</p>
                      <pre className="rounded-md bg-muted/40 px-3 py-2 text-xs font-mono whitespace-pre-wrap">
                        {tc.expectedOutput ?? '(empty)'}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {hiddenCount > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 shrink-0" />
                  <span>{hiddenCount} hidden test case{hiddenCount > 1 ? 's' : ''} — only visible to content managers and platform admins</span>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Configuration */}
        <TabsContent value="config" className="mt-4">
          <Card>
            <CardContent className="pt-4">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground mb-1">Time Limit</dt>
                  <dd>{problem.timeLimitMs} ms</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground mb-1">Memory Limit</dt>
                  <dd>{problem.memoryLimitMb} MB</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground mb-1">Allowed Languages</dt>
                  <dd className="flex flex-wrap gap-1">
                    {problem.allowedLanguages.map((l) => (
                      <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground mb-1">Created</dt>
                  <dd>{formatRelativeTime(problem.createdAt)}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs text-muted-foreground mb-1">Problem ID</dt>
                  <dd className="font-mono text-xs text-muted-foreground">{problem.id}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />
      <p className="text-xs text-muted-foreground">Slug: <span className="font-mono">{problem.slug}</span></p>
    </div>
  )
}
