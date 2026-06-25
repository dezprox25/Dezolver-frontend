import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, BookOpen } from 'lucide-react'
import { useCareerMap } from '@/hooks/useCareerMaps'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DOMAIN_LABELS, PATH_KIND_LABELS } from '@/types/path.types'

export function CareerMapDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: map, isLoading, isError } = useCareerMap(id)

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  if (isError || !map) {
    return (
      <EmptyState
        title="Career map not found"
        action={
          <Button variant="outline" onClick={() => navigate('/career-maps')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" className="-ml-2 mb-2" onClick={() => navigate('/career-maps')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">{map.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{DOMAIN_LABELS[map.domainCode] ?? map.domainCode}</Badge>
          </div>
        </div>
      </div>

      {map.description && (
        <p className="text-sm text-muted-foreground">{map.description}</p>
      )}

      {map.outcomeStatement && (
        <div className="rounded-lg bg-muted/30 border px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Career Outcome
          </p>
          <p className="text-sm">{map.outcomeStatement}</p>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold">Learning Paths ({map.paths.length})</h2>
        {map.paths.map((p) => (
          <Card
            key={p.id}
            role="button"
            tabIndex={0}
            className="cursor-pointer hover:shadow-sm transition-shadow"
            onClick={() => navigate(`/paths/${p.id}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                navigate(`/paths/${p.id}`)
              }
            }}
          >
            <CardContent className="p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{p.title}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{PATH_KIND_LABELS[p.kind]}</span>
                  {p.stepCount != null && (
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {p.stepCount} steps
                    </span>
                  )}
                  {p.estimatedMinutes && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.round(p.estimatedMinutes / 60)}h
                    </span>
                  )}
                </div>
              </div>
              <Button variant="outline" size="sm" className="shrink-0">View</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
