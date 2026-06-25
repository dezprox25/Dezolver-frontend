import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, RefreshCw, Layers, BookOpen, Clock, ChevronRight } from 'lucide-react'
import { useCourses } from '@/hooks/useCourses'
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
import type { ContentStatus } from '@/types/content.types'

export function CoursesPage() {
  const navigate = useNavigate()
  const canAuthor = usePermissions('publish:content')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all')
  const debouncedSearch = useDebounce(search, 350)

  const params = {
    ...(debouncedSearch ? { q: debouncedSearch } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    limit: 20,
  }

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useCourses(params)

  const courses = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Courses"
        description="Ordered collections of learning rooms."
        actions={
          canAuthor ? (
            <Button onClick={() => navigate('/content/courses/create')}>
              <Plus className="mr-2 h-4 w-4" />
              New Course
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ContentStatus | 'all')}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load courses"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : courses.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-8 w-8 text-muted-foreground/50" />}
          title="No courses found"
          description={search ? 'Try a different search.' : 'Create the first course to get started.'}
          action={
            canAuthor ? (
              <Button onClick={() => navigate('/content/courses/create')}>
                <Plus className="mr-2 h-4 w-4" /> New Course
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group flex flex-col gap-3 rounded-lg border bg-card p-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
              onClick={() => navigate(`/content/courses/${course.slug}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <ContentStatusBadge status={course.status} />
                <ChevronRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors shrink-0 mt-0.5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-snug line-clamp-2">{course.title}</h3>
                {course.summary && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.summary}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-auto">
                <DifficultyBadge difficulty={course.difficulty} />
                <Badge variant="secondary" className="text-xs gap-1">
                  <BookOpen className="h-3 w-3" />
                  {course.roomCount ?? course.rooms.length} rooms
                </Badge>
                {course.estimatedMinutes && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Clock className="h-3 w-3" />
                    {course.estimatedMinutes}m
                  </Badge>
                )}
              </div>
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
