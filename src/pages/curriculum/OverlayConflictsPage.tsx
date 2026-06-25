import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, ArrowUpCircle } from 'lucide-react'
import { useOverlayConflicts } from '@/hooks/useCurriculum'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function OverlayConflictsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: result, isLoading, isError, refetch } = useOverlayConflicts(id)

  const hasConflicts = (result?.conflicts.length ?? 0) > 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Conflict Check"
        description="Operations referencing nodes that no longer exist in the base syllabus."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/tenant/curriculum/overlays/${id}`)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Overlay
            </Button>
            <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <Skeleton className="h-48 rounded-lg" />
      ) : isError ? (
        <EmptyState
          title="Failed to check conflicts"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : !result ? (
        <EmptyState title="No data" />
      ) : hasConflicts ? (
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/20 p-3">
            <AlertTriangle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-700">
              <strong>{result.conflicts.length} conflict{result.conflicts.length !== 1 ? 's' : ''} found.</strong>{' '}
              These operations reference nodes that have been deleted or moved in the base syllabus.
              Run the <strong>Upgrade</strong> workflow to remove conflicting operations and bring
              this overlay up to date.
            </div>
          </div>

          <div className="space-y-2">
            {result.conflicts.map((conflict) => (
              <Card key={conflict.opId} className="border-red-200">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                    Operation conflict
                    <Badge variant="outline" className="font-mono text-[10px] border-red-300 text-red-600">
                      {conflict.opId.slice(0, 8)}…
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-0 pb-3 px-4">
                  <p className="text-xs text-muted-foreground">{conflict.reason}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => navigate(`/tenant/curriculum/overlays/${id}/upgrade`)}
            >
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Resolve Conflicts
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 p-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-700">
              <strong>No conflicts detected.</strong> All operations reference nodes that still
              exist in the base syllabus.
            </p>
          </div>

          <EmptyState
            icon={<CheckCircle2 className="h-8 w-8 text-emerald-600/50" />}
            title="Overlay is clean"
            description="All operations are valid and ready to be activated."
            action={
              <Button
                variant="outline"
                onClick={() => navigate(`/tenant/curriculum/overlays/${id}`)}
              >
                Back to Overlay
              </Button>
            }
          />
        </div>
      )}
    </div>
  )
}
