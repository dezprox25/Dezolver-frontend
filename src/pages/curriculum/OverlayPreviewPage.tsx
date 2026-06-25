import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react'
import { usePreviewOverlay } from '@/hooks/useCurriculum'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { OperationTypeBadge } from '@/components/curriculum/OperationTypeBadge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function OverlayPreviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: preview, isLoading, isError, refetch } = usePreviewOverlay(id)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overlay Preview"
        description="Operations that will be applied to the base syllabus for this cohort."
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

      <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          <strong>Preview shows applied operations.</strong> The full merged-tree view (with
          operations computed against the base syllabus) requires the effective-syllabus
          resolver to run in the backend. For a live student view, visit{' '}
          <strong>/me/syllabus</strong>.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 rounded-lg" />
      ) : isError ? (
        <EmptyState
          title="Failed to load preview"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : !preview ? (
        <EmptyState title="No preview available" />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Overlay ID</p>
              <p className="font-mono text-xs">{preview.overlayId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Syllabus ID</p>
              <p className="font-mono text-xs">{preview.syllabusId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cohort ID</p>
              <p className="font-mono text-xs">{preview.cohortId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Operations</p>
              <Badge variant="secondary" className="text-xs">{preview.operations.length}</Badge>
            </div>
          </div>

          {preview.operations.length === 0 ? (
            <EmptyState
              title="No operations in this overlay"
              description="Add operations on the Overlay Detail page."
            />
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Seq</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target Node</TableHead>
                    <TableHead className="hidden md:table-cell">Payload</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.operations.map((op) => (
                    <TableRow key={op.id}>
                      <TableCell className="text-sm text-muted-foreground">{op.sequence}</TableCell>
                      <TableCell>
                        <OperationTypeBadge type={op.operationType} />
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {op.targetNodeId.slice(0, 12)}…
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                        {Object.keys(op.payload).length > 0
                          ? JSON.stringify(op.payload)
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
