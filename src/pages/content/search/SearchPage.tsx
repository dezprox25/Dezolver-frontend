import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, BookOpen, Layers, Code2, Loader2 } from 'lucide-react'
import { useContentSearch } from '@/hooks/useContentSearch'
import { useDebounce } from '@/hooks/useDebounce'
import { ContentStatusBadge } from '@/components/content/ContentStatusBadge'
import { DifficultyBadge } from '@/components/content/DifficultyBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { SearchKind, SearchResultItem, Difficulty, ProblemDifficulty } from '@/types/content.types'

const KIND_ICON = {
  room: BookOpen,
  course: Layers,
  problem: Code2,
}

const KIND_LABEL = {
  room: 'Room',
  course: 'Course',
  problem: 'Problem',
}

const KIND_PATH = {
  room: (slug: string) => `/content/rooms/${slug}`,
  course: (slug: string) => `/content/courses/${slug}`,
  problem: (slug: string) => `/content/problems/${slug}`,
}

function ResultItem({ item }: { item: SearchResultItem }) {
  const navigate = useNavigate()
  const Icon = KIND_ICON[item.kind]

  return (
    <div
      className="flex items-start gap-4 px-4 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
      onClick={() => navigate(KIND_PATH[item.kind](item.slug))}
    >
      <div className="mt-0.5 rounded-md bg-muted/60 p-1.5 shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <p className="text-sm font-medium hover:underline truncate">{item.title}</p>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 capitalize shrink-0">
            {KIND_LABEL[item.kind]}
          </Badge>
        </div>
        {item.summary && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.summary}</p>
        )}
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          <ContentStatusBadge status={item.status} />
          {item.difficulty && (
            <DifficultyBadge
              difficulty={item.difficulty as Difficulty | ProblemDifficulty}
              variant={item.kind === 'problem' ? 'problem' : 'room'}
            />
          )}
          {item.skillTags?.slice(0, 3).map((t) => (
            <Badge key={t} variant="outline" className="text-[10px] px-1.5 py-0 h-4">{t}</Badge>
          ))}
          {item.domainCodes?.slice(0, 2).map((d) => (
            <Badge key={d} variant="outline" className="text-[10px] px-1.5 py-0 h-4">{d.toUpperCase()}</Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [kind, setKind] = useState<SearchKind>((searchParams.get('kind') as SearchKind) ?? 'all')

  const debouncedQuery = useDebounce(query, 350)
  const { data, isFetching, isError } = useContentSearch(debouncedQuery, kind)

  // Sync URL params
  useEffect(() => {
    const params: Record<string, string> = {}
    if (query) params.q = query
    if (kind !== 'all') params.kind = kind
    setSearchParams(params, { replace: true })
  }, [query, kind, setSearchParams])

  const items = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Search Content"
        description="Full-text search across rooms, courses, and problems."
      />

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9 pr-4"
            placeholder="Search rooms, courses, problems…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            aria-label="Search content"
          />
        </div>
        <Select value={kind} onValueChange={(v) => setKind(v as SearchKind)}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="room">Rooms</SelectItem>
            <SelectItem value="course">Courses</SelectItem>
            <SelectItem value="problem">Problems</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {debouncedQuery.trim().length < 2 ? (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Type at least 2 characters to search.</p>
        </div>
      ) : isFetching ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          Searching…
        </div>
      ) : isError ? (
        <EmptyState
          title="Search failed"
          description="The search service is unavailable. Try again later."
        />
      ) : items.length === 0 ? (
        <EmptyState
          title="No results"
          description={`No content matches "${query}".`}
          action={
            kind !== 'all' ? (
              <Button variant="outline" size="sm" onClick={() => setKind('all')}>
                Search all types
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="rounded-lg border">
          <div className="px-4 py-2 border-b bg-muted/20">
            <p className="text-xs text-muted-foreground">
              {total} result{total !== 1 ? 's' : ''} for{' '}
              <span className="font-medium text-foreground">"{query}"</span>
            </p>
          </div>
          <div className="divide-y">
            {items.map((item) => (
              <ResultItem key={`${item.kind}-${item.id}`} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
