import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RefreshCw, Calendar, Filter } from 'lucide-react'
import { useEvents } from '@/hooks/useEvents'
import { usePermissions } from '@/hooks/usePermissions'
import { useDebounce } from '@/hooks/useDebounce'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { EventCard } from '@/components/events/EventCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import { Label } from '@/components/ui/label'
import type { EventKind, EventStatus, AudienceScope } from '@/types/event.types'
import { isEventActive, isEventUpcoming, isEventPast, AUDIENCE_SCOPE_LABELS } from '@/types/event.types'

const STATUS_OPTIONS: Array<{ label: string; value: EventStatus | 'all' }> = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
  { label: 'Registration Open', value: 'registration_open' },
  { label: 'Live', value: 'live' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

const AUDIENCE_OPTIONS: Array<{ label: string; value: AudienceScope | 'all' }> = [
  { label: 'All Audiences', value: 'all' },
  ...Object.entries(AUDIENCE_SCOPE_LABELS).map(([value, label]) => ({
    label,
    value: value as AudienceScope,
  })),
]

export function EventsPage() {
  const navigate = useNavigate()
  const canCreate = usePermissions('create:event')
  const canManage = usePermissions('manage:assessment')

  const [search, setSearch] = useState('')
  const [kind, setKind] = useState<EventKind | 'all'>('all')
  const [status, setStatus] = useState<EventStatus | 'all'>('all')
  const [audienceScope, setAudienceScope] = useState<AudienceScope | 'all'>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const debouncedSearch = useDebounce(search, 350)

  const params = {
    ...(kind !== 'all' ? { kind } : {}),
    ...(status !== 'all' ? { status } : {}),
    ...(audienceScope !== 'all' ? { audienceScope } : {}),
    ...(fromDate ? { from: new Date(fromDate).toISOString() } : {}),
    ...(toDate ? { to: new Date(toDate).toISOString() } : {}),
    limit: 30,
  }

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useEvents(params)

  const allEvents = data?.pages.flatMap((p) => p.items) ?? []

  const filtered = debouncedSearch
    ? allEvents.filter((e) =>
        e.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : allEvents

  const upcoming = filtered.filter((e) => isEventUpcoming(e.status))
  const active = filtered.filter((e) => isEventActive(e.status))
  const past = filtered.filter((e) => isEventPast(e.status))
  const draft = filtered.filter((e) => e.status === 'draft')

  const canSeeAll = canCreate || canManage
  const hasDateFilter = !!fromDate || !!toDate
  const hasAudienceFilter = audienceScope !== 'all'

  const clearFilters = () => {
    setKind('all')
    setStatus('all')
    setAudienceScope('all')
    setFromDate('')
    setToDate('')
    setSearch('')
  }

  const activeFilterCount = [
    kind !== 'all',
    status !== 'all',
    audienceScope !== 'all',
    !!fromDate,
    !!toDate,
  ].filter(Boolean).length

  const renderGrid = (events: typeof filtered) =>
    events.length === 0 ? (
      <EmptyState
        icon={<Calendar className="h-8 w-8 text-muted-foreground/50" />}
        title="No events found"
        description={search || activeFilterCount > 0 ? 'Try different filters.' : 'Check back later.'}
        action={
          activeFilterCount > 0 ? (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : undefined
        }
      />
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((e) => <EventCard key={e.id} event={e} />)}
      </div>
    )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Events"
        description="Workshops, competitions, and coding challenges."
        actions={
          (canCreate || canManage) ? (
            <Button onClick={() => navigate('/events/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="w-48 sm:w-64"
          placeholder="Search events…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search events"
        />

        <Select value={kind} onValueChange={(v) => setKind(v as EventKind | 'all')}>
          <SelectTrigger className="w-36" aria-label="Filter by type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="competition">Competition</SelectItem>
          </SelectContent>
        </Select>

        {canSeeAll && (
          <Select value={status} onValueChange={(v) => setStatus(v as EventStatus | 'all')}>
            <SelectTrigger className="w-44" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* More filters popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-3.5 w-3.5" />
              More filters
              {(activeFilterCount - (kind !== 'all' ? 1 : 0) - (status !== 'all' ? 1 : 0)) > 0 && (
                <span className="ml-1 rounded-full bg-primary text-primary-foreground text-[10px] px-1.5 py-0 font-semibold">
                  {activeFilterCount - (kind !== 'all' ? 1 : 0) - (status !== 'all' ? 1 : 0)}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 space-y-4" align="start">
            <div className="space-y-1.5">
              <Label className="text-xs">Audience Scope</Label>
              <Select
                value={audienceScope}
                onValueChange={(v) => setAudienceScope(v as AudienceScope | 'all')}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-sm">
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">From Date</Label>
                <Input
                  type="date"
                  className="h-8 text-sm"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">To Date</Label>
                <Input
                  type="date"
                  className="h-8 text-sm"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            {(hasDateFilter || hasAudienceFilter) && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  setAudienceScope('all')
                  setFromDate('')
                  setToDate('')
                }}
              >
                Clear extra filters
              </Button>
            )}
          </PopoverContent>
        </Popover>

        <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={clearFilters}>
            Clear all
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load events"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : (
        <Tabs defaultValue={active.length > 0 ? 'active' : 'upcoming'}>
          <TabsList>
            {active.length > 0 && (
              <TabsTrigger value="active">Live ({active.length})</TabsTrigger>
            )}
            <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
            {canSeeAll && draft.length > 0 && (
              <TabsTrigger value="draft">Draft ({draft.length})</TabsTrigger>
            )}
          </TabsList>

          {active.length > 0 && (
            <TabsContent value="active" className="mt-4">{renderGrid(active)}</TabsContent>
          )}
          <TabsContent value="upcoming" className="mt-4">{renderGrid(upcoming)}</TabsContent>
          <TabsContent value="past" className="mt-4">{renderGrid(past)}</TabsContent>
          {canSeeAll && draft.length > 0 && (
            <TabsContent value="draft" className="mt-4">{renderGrid(draft)}</TabsContent>
          )}
        </Tabs>
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
