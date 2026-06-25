import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RefreshCw, BookOpen, AlertCircle } from 'lucide-react'
import { usePaths } from '@/hooks/usePaths'
import { usePermissions } from '@/hooks/usePermissions'
import { useDebounce } from '@/hooks/useDebounce'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { PathCard } from '@/components/paths/PathCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DOMAIN_LABELS, type PathKind } from '@/types/path.types'

export function PathsPage() {
  const navigate = useNavigate()
  const canAuthor = usePermissions('manage:assessment')

  const [search, setSearch] = useState('')
  const [domain, setDomain] = useState('all')
  const [tab, setTab] = useState<PathKind | 'all'>('all')
  const debouncedSearch = useDebounce(search, 350)

  const params = {
    ...(tab !== 'all' ? { kind: tab } : {}),
    ...(domain !== 'all' ? { domain } : {}),
    limit: 30,
  }

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    usePaths(params)

  const allPaths = data?.pages.flatMap((p) => p.items) ?? []
  const filtered = debouncedSearch
    ? allPaths.filter((p) => p.title.toLowerCase().includes(debouncedSearch.toLowerCase()))
    : allPaths

  const renderGrid = (paths: typeof filtered) =>
    paths.length === 0 ? (
      <EmptyState
        icon={<BookOpen className="h-8 w-8 text-muted-foreground/50" />}
        title="No paths found"
        description={search ? 'Try a different search term.' : 'Check back later.'}
      />
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {paths.map((p) => <PathCard key={p.id} path={p} />)}
      </div>
    )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Learning Paths"
        description="Structured learning journeys from beginner to advanced."
        actions={
          canAuthor ? (
            <Button onClick={() => navigate('/paths/create')}>
              <Plus className="mr-2 h-4 w-4" /> New Path
            </Button>
          ) : undefined
        }
      />

      {/* Backend skeleton notice */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          <strong>Backend Status:</strong> The paths module is in skeleton state (no service layer, no pagination).
          Paths may not be populated yet. Empty states are expected.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          className="w-48 sm:w-64"
          placeholder="Search paths…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search paths"
        />
        <Select value={domain} onValueChange={setDomain}>
          <SelectTrigger className="w-40" aria-label="Filter by domain">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {Object.entries(DOMAIN_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-lg" />)}
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load paths"
          description="Backend may not have path data yet."
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : (
        <Tabs value={tab} onValueChange={(v) => setTab(v as PathKind | 'all')}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="default">Platform</TabsTrigger>
            <TabsTrigger value="curated">Curated</TabsTrigger>
            <TabsTrigger value="personalized">My Paths</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">{renderGrid(filtered)}</TabsContent>
          <TabsContent value="default" className="mt-4">{renderGrid(filtered)}</TabsContent>
          <TabsContent value="curated" className="mt-4">{renderGrid(filtered)}</TabsContent>
          <TabsContent value="personalized" className="mt-4">{renderGrid(filtered)}</TabsContent>
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
