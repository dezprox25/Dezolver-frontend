import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Search, RefreshCw, BookOpen, Clock, ChevronRight,
} from 'lucide-react'
import { useRooms } from '@/hooks/useRooms'
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
import type { ContentStatus, Difficulty } from '@/types/content.types'
import { DOMAIN_CODE_LABELS } from '@/types/content.types'

const STATUS_OPTIONS: { label: string; value: ContentStatus | 'all' }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'In Review', value: 'review' },
  { label: 'Published', value: 'published' },
  { label: 'Archived', value: 'archived' },
]

const DIFFICULTY_OPTIONS: { label: string; value: Difficulty | 'all' }[] = [
  { label: 'All Levels', value: 'all' },
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
  { label: 'Expert', value: 'expert' },
]

export function RoomsPage() {
  const navigate = useNavigate()
  const canAuthor = usePermissions('publish:content')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContentStatus | 'all'>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all')
  const [domainFilter, setDomainFilter] = useState<string>('all')
  const debouncedSearch = useDebounce(search, 350)

  const params = {
    ...(debouncedSearch ? { q: debouncedSearch } : {}),
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    ...(difficultyFilter !== 'all' ? { difficulty: difficultyFilter } : {}),
    ...(domainFilter !== 'all' ? { domain: domainFilter } : {}),
    limit: 20,
  }

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useRooms(params)

  const rooms = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rooms"
        description="Learning units — block-based content rooms."
        actions={
          canAuthor ? (
            <Button onClick={() => navigate('/content/rooms/create')}>
              <Plus className="mr-2 h-4 w-4" />
              New Room
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
            placeholder="Search rooms…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ContentStatus | 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={(v) => setDifficultyFilter(v as Difficulty | 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTY_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={domainFilter} onValueChange={setDomainFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Domains" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {Object.entries(DOMAIN_CODE_LABELS).map(([code, label]) => (
              <SelectItem key={code} value={code}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={() => refetch()} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Room cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load rooms"
          description="Check your connection and try again."
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : rooms.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-8 w-8 text-muted-foreground/50" />}
          title="No rooms found"
          description={search ? 'Try a different search term.' : 'Create the first room to get started.'}
          action={
            canAuthor ? (
              <Button onClick={() => navigate('/content/rooms/create')}>
                <Plus className="mr-2 h-4 w-4" /> New Room
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="group flex flex-col gap-3 rounded-lg border bg-card p-4 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
              onClick={() => navigate(`/content/rooms/${room.slug}`)}
            >
              <div className="flex items-start justify-between gap-2">
                <ContentStatusBadge status={room.status} />
                <ChevronRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors shrink-0 mt-0.5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-snug line-clamp-2">{room.title}</h3>
                {room.summary && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{room.summary}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mt-auto">
                <DifficultyBadge difficulty={room.difficulty} />
                {room.estimatedMinutes && (
                  <Badge variant="secondary" className="text-xs gap-1">
                    <Clock className="h-3 w-3" />
                    {room.estimatedMinutes}m
                  </Badge>
                )}
                {room.domainCodes.slice(0, 2).map((code) => (
                  <Badge key={code} variant="outline" className="text-xs">
                    {code.toUpperCase()}
                  </Badge>
                ))}
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
