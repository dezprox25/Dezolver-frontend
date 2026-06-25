import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, AlertCircle } from 'lucide-react'
import { useCareerMaps } from '@/hooks/useCareerMaps'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DOMAIN_LABELS } from '@/types/path.types'

export function CareerMapsPage() {
  const navigate = useNavigate()
  const [domain, setDomain] = useState('all')
  const { data: maps, isLoading, isError, refetch } = useCareerMaps(domain !== 'all' ? domain : undefined)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Career Maps"
        description="Outcome-grouped learning paths by career domain."
      />

      {/* Backend notice */}
      <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          Backend paths module is in skeleton state. Career maps may return empty results.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={domain} onValueChange={setDomain}>
          <SelectTrigger className="w-44" aria-label="Filter by domain">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Domains</SelectItem>
            {Object.entries(DOMAIN_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-lg" />)}
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load career maps"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : !maps || maps.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-8 w-8 text-muted-foreground/50" />}
          title="No career maps yet"
          description="Career maps will be available as content is published."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {maps.map((map) => (
            <Card
              key={map.id}
              role="button"
              tabIndex={0}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/career-maps/${map.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate(`/career-maps/${map.id}`)
                }
              }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-semibold">{map.title}</CardTitle>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    {DOMAIN_LABELS[map.domainCode] ?? map.domainCode}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {map.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{map.description}</p>
                )}
                {map.outcomeStatement && (
                  <p className="text-xs text-muted-foreground/80 line-clamp-1 italic">
                    {map.outcomeStatement}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {map.paths.length} path{map.paths.length !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
