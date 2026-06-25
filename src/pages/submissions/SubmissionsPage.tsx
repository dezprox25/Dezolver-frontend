import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { RefreshCw, Code2, ChevronRight } from 'lucide-react'
import { useMySubmissions } from '@/hooks/useSubmissions'
import { useDebounce } from '@/hooks/useDebounce'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { VerdictBadge } from '@/components/assessment/VerdictBadge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatRelativeTime } from '@/lib/utils/format'
import type { SubmissionVerdict } from '@/types/assessment.types'

const VERDICT_OPTIONS: Array<{ label: string; value: SubmissionVerdict | 'all' }> = [
  { label: 'All Verdicts', value: 'all' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Wrong Answer', value: 'wrong_answer' },
  { label: 'TLE', value: 'time_limit_exceeded' },
  { label: 'Runtime Error', value: 'runtime_error' },
  { label: 'Compilation Error', value: 'compilation_error' },
  { label: 'Partial', value: 'partial' },
]

export function SubmissionsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const presetAssessment = searchParams.get('assessment') ?? ''

  const [verdict, setVerdict] = useState<SubmissionVerdict | 'all'>('all')
  const [language, setLanguage] = useState<string>('all')
  const debouncedAssessment = useDebounce(presetAssessment, 300)

  const params = {
    ...(debouncedAssessment ? { assessment: debouncedAssessment } : {}),
    ...(verdict !== 'all' ? { verdict } : {}),
    ...(language !== 'all' ? { language } : {}),
    limit: 25,
  }

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useMySubmissions(params)

  const submissions = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Submissions"
        description="Review your submission history."
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={verdict} onValueChange={(v) => setVerdict(v as SubmissionVerdict | 'all')}>
          <SelectTrigger className="w-40" aria-label="Filter by verdict">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VERDICT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-36" aria-label="Filter by language">
            <SelectValue placeholder="All Languages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
            <SelectItem value="c">C</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="go">Go</SelectItem>
            <SelectItem value="rust">Rust</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          aria-label="Refresh submissions"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {['Assessment', 'Verdict', 'Score', 'Language', 'Time', 'Submitted'].map((h) => (
                  <TableHead key={h}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load submissions"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={<Code2 className="h-8 w-8 text-muted-foreground/50" />}
          title="No submissions yet"
          description="Submit code in an assessment to see results here."
          action={
            <Button variant="outline" onClick={() => navigate('/assessments')}>
              Browse assessments
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assessment</TableHead>
                <TableHead>Verdict</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Language</TableHead>
                <TableHead className="hidden md:table-cell">Runtime</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((sub) => (
                <TableRow
                  key={sub.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => navigate(`/submissions/${sub.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/submissions/${sub.id}`)
                    }
                  }}
                >
                  <TableCell className="font-medium text-sm">
                    {sub.assessmentTitle ?? sub.assessmentId.slice(0, 8) + '…'}
                  </TableCell>
                  <TableCell>
                    <VerdictBadge verdict={sub.verdict} />
                  </TableCell>
                  <TableCell className="text-sm">
                    {sub.score != null ? `${sub.score}%` : '—'}
                  </TableCell>
                  <TableCell>
                    {sub.language ? (
                      <Badge variant="secondary" className="text-xs">
                        {sub.language}
                      </Badge>
                    ) : '—'}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {sub.executionTimeMs != null ? `${sub.executionTimeMs}ms` : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {formatRelativeTime(sub.submittedAt)}
                  </TableCell>
                  <TableCell>
                    <ChevronRight
                      className="h-4 w-4 text-muted-foreground/50"
                      aria-hidden="true"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
