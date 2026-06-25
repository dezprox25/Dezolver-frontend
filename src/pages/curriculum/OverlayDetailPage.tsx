import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, RefreshCw, Eye, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  useOverlayOperations,
  useRemoveOperation,
  useActivateOverlay,
} from '@/hooks/useCurriculum'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { OperationTypeBadge } from '@/components/curriculum/OperationTypeBadge'
import { AddOperationDialog } from '@/components/curriculum/AddOperationDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils/format'
import type { OverlayOperation } from '@/types/curriculum.types'

export function OverlayDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [addOpOpen, setAddOpOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<OverlayOperation | null>(null)
  const [activateOpen, setActivateOpen] = useState(false)

  const {
    data: operations,
    isLoading,
    isError,
    refetch,
  } = useOverlayOperations(id)

  const { mutateAsync: removeOp, isPending: removing } = useRemoveOperation()
  const { mutateAsync: activate, isPending: activating } = useActivateOverlay()

  const handleRemove = async () => {
    if (!deleteTarget || !id) return
    try {
      await removeOp({ overlayId: id, opId: deleteTarget.id })
      toast.success('Operation removed.')
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to remove operation.')
    }
  }

  const handleActivate = async () => {
    if (!id) return
    try {
      await activate(id)
      toast.success('Overlay activated. It is now the live customisation for this cohort.')
      setActivateOpen(false)
    } catch {
      toast.error('Failed to activate overlay.')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overlay Operations"
        description={`Overlay ${id?.slice(0, 8)}…`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/tenant/curriculum/overlays')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/tenant/curriculum/overlays/${id}/preview`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/tenant/curriculum/overlays/${id}/conflicts`)}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Check Conflicts
            </Button>
            <Button size="sm" onClick={() => setActivateOpen(true)}>
              <Zap className="mr-2 h-4 w-4" />
              Activate
            </Button>
          </div>
        }
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Operations</h2>
          <Badge variant="secondary" className="text-xs">
            {operations?.length ?? 0} total
          </Badge>
        </div>
        <Button size="sm" variant="outline" onClick={() => setAddOpOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Operation
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 rounded-lg" />
      ) : isError ? (
        <EmptyState
          title="Failed to load operations"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : !operations?.length ? (
        <EmptyState
          title="No operations yet"
          description="Add operations to customise this syllabus for the cohort."
          action={
            <Button onClick={() => setAddOpOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Operation
            </Button>
          }
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target Node</TableHead>
                <TableHead className="hidden md:table-cell">Payload</TableHead>
                <TableHead className="hidden lg:table-cell">Added</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {operations.map((op) => (
                <TableRow key={op.id}>
                  <TableCell className="text-muted-foreground text-sm">{op.sequence}</TableCell>
                  <TableCell>
                    <OperationTypeBadge type={op.operationType} />
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {op.targetNodeId.slice(0, 8)}…
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden md:table-cell max-w-[200px] truncate">
                    {Object.keys(op.payload).length > 0
                      ? JSON.stringify(op.payload)
                      : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                    {formatDate(op.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(op)}
                      aria-label="Remove operation"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AddOperationDialog
        open={addOpOpen}
        onOpenChange={setAddOpOpen}
        overlayId={id!}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove Operation</DialogTitle>
            <DialogDescription>
              Remove sequence #{deleteTarget?.sequence}{' '}
              <strong>{deleteTarget?.operationType}</strong> operation? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={removing}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={removing}>
              {removing ? 'Removing…' : 'Remove'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={activateOpen} onOpenChange={(open) => { if (!open && !activating) setActivateOpen(false) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Activate Overlay
            </DialogTitle>
            <DialogDescription>
              This will archive any currently-active overlay for the same syllabus and cohort,
              and make this overlay live. Students will see the updated curriculum immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setActivateOpen(false)} disabled={activating}>
              Cancel
            </Button>
            <Button onClick={handleActivate} disabled={activating}>
              {activating ? 'Activating…' : 'Activate Overlay'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
