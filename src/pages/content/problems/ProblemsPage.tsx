import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, RefreshCw, Code2, ChevronRight } from 'lucide-react'
import { useProblems } from '@/hooks/useProblems'
import { usePermissions } from '@/hooks/usePermissions'
import { useDebounce } from '@/hooks/useDebounce'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { ContentStatusBadge } from '@/components/content/ContentStatusBadge'
import { DifficultyBadge } from '@/components/content/DifficultyBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { ProblemDifficulty, ContentStatus } from '@/types/content.types'

export function ProblemsPage() {
  const navigate = useNavigate()
  const canAuthor = usePermissions('manage:problem')
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState<ProblemDifficulty | 'all'>('all')
  const [status, setStatus] = useState<ContentStatus | 'all'>('all')
  const debouncedSearch = useDebounce(search, 350)

  const params = {
    ...(debouncedSearch ? { q: debouncedSearch } : {}),
    ...(difficulty !== 'all' ? { difficulty } : {}),
    ...(status !== 'all' ? { status } : {}),
    limit: 25,
  }

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useProblems(params)

  const problems = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Problems"
        description="Coding challenges and MCQ questions."
        actions={
          canAuthor ? (
            <Button onClick={() => navigate('/content/problems/create')}>
              <Plus className="mr-2 h-4 w-4" />
              New Problem
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search problems…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={difficulty} onValueChange={(v) => setDifficulty(v as ProblemDifficulty | 'all')}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as ContentStatus | 'all')}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-lg border divide-y">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load problems"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : problems.length === 0 ? (
        <EmptyState
          icon={<Code2 className="h-8 w-8 text-muted-foreground/50" />}
          title="No problems found"
          description={search ? 'Try a different search.' : 'Create the first problem to get started.'}
          action={
            canAuthor ? (
              <Button onClick={() => navigate('/content/problems/create')}>
                <Plus className="mr-2 h-4 w-4" /> New Problem
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-lg border divide-y">
          {problems.map((problem) => (
            <div
              key={problem.id}
              className="group flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => navigate(`/content/problems/${problem.slug}`)}
            >
              <Code2 className="h-4 w-4 text-muted-foreground/60 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {problem.title}
                </p>
                {problem.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {problem.topics.slice(0, 3).map((t) => (
                      <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                        {t}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <DifficultyBadge difficulty={problem.difficulty} variant="problem" />
              <ContentStatusBadge status={problem.status} />
              <ChevronRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors shrink-0" />
            </div>
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
