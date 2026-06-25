import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, RefreshCw, FileText, Clock, ChevronRight,
} from 'lucide-react'
import { useAssessments } from '@/hooks/useAssessments'
import { usePermissions } from '@/hooks/usePermissions'
import { useDebounce } from '@/hooks/useDebounce'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { AssessmentStatusBadge } from '@/components/assessment/AssessmentStatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatRelativeTime } from '@/lib/utils/format'
import type { AssessmentStatus, AssessmentKind } from '@/types/assessment.types'
import { ASSESSMENT_KIND_LABELS } from '@/types/assessment.types'

export function AssessmentsPage() {
  const navigate = useNavigate()
  const canManage = usePermissions('manage:assessment')
  const canCreate = usePermissions('create:assessment')

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AssessmentStatus | 'all'>('all')
  const [kind, setKind] = useState<AssessmentKind | 'all'>('all')
  const debouncedSearch = useDebounce(search, 350)

  const params = {
    ...(status !== 'all' ? { status } : {}),
    ...(kind !== 'all' ? { kind } : {}),
    limit: 25,
  }

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useAssessments(params)

  const assessments = data?.pages.flatMap((p) => p.items) ?? []

  // Client-side search (backend may not support text search on assessments)
  const filtered = debouncedSearch
    ? assessments.filter((a) =>
        a.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : assessments

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessments"
        description="Coding challenges, quizzes, and practice problems."
        actions={
          (canCreate || canManage) ? (
            <Button onClick={() => navigate('/assessments/create')}>
              <Plus className="mr-2 h-4 w-4" />
              New Assessment
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search assessments…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search assessments"
          />
        </div>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as AssessmentStatus | 'all')}
        >
          <SelectTrigger className="w-36" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={kind}
          onValueChange={(v) => setKind(v as AssessmentKind | 'all')}
        >
          <SelectTrigger className="w-36" aria-label="Filter by type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="coding_problem">Coding</SelectItem>
            <SelectItem value="mcq_single">MCQ Single</SelectItem>
            <SelectItem value="mcq_multi">MCQ Multi</SelectItem>
            <SelectItem value="short_answer">Short Answer</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          aria-label="Refresh assessments"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="rounded-lg border divide-y">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 flex-1 max-w-xs" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load assessments"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8 text-muted-foreground/50" />}
          title="No assessments found"
          description={
            search
              ? 'Try a different search term.'
              : 'Create an assessment to get started.'
          }
          action={
            (canCreate || canManage) ? (
              <Button onClick={() => navigate('/assessments/create')}>
                <Plus className="mr-2 h-4 w-4" /> New Assessment
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-lg border divide-y">
          {filtered.map((assessment) => (
            <div
              key={assessment.id}
              role="button"
              tabIndex={0}
              className="group flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => navigate(`/assessments/${assessment.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate(`/assessments/${assessment.id}`)
                }
              }}
            >
              <FileText
                className="h-4 w-4 text-muted-foreground/60 shrink-0"
                aria-hidden="true"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {assessment.title}
                </p>
                {assessment.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {assessment.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="text-xs hidden sm:flex">
                  {ASSESSMENT_KIND_LABELS[assessment.kind]}
                </Badge>
                <AssessmentStatusBadge status={assessment.status ?? 'draft'} />
                {(assessment.timeLimitMinutes ?? assessment.config?.timeLimitMinutes) && (
                  <Badge variant="outline" className="text-xs hidden md:flex gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {assessment.timeLimitMinutes ?? assessment.config?.timeLimitMinutes}m
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground hidden lg:block whitespace-nowrap">
                  {formatRelativeTime(assessment.createdAt)}
                </span>
                <ChevronRight
                  className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors"
                  aria-hidden="true"
                />
              </div>
            </div>
          ))}
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
