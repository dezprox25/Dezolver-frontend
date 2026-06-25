import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, RefreshCw, Trash2, Globe, Archive } from 'lucide-react'
import { toast } from 'sonner'
import { useSyllabus, usePublishSyllabus, useArchiveSyllabus, useDeleteNode } from '@/hooks/useCurriculum'
import { buildNodeTree } from '@/types/curriculum.types'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { SyllabusTree } from '@/components/curriculum/SyllabusTree'
import { SyllabusStatusBadge } from '@/components/curriculum/SyllabusStatusBadge'
import { AddNodeDialog } from '@/components/curriculum/AddNodeDialog'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { SyllabusNode } from '@/types/curriculum.types'

export function SyllabusDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [addNodeOpen, setAddNodeOpen] = useState(false)
  const [addNodeParent, setAddNodeParent] = useState<SyllabusNode | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SyllabusNode | null>(null)
  const [lifecycleDialog, setLifecycleDialog] = useState<'publish' | 'archive' | null>(null)

  const { data: syllabus, isLoading, isError, refetch } = useSyllabus(id)
  const { mutateAsync: publish, isPending: publishing } = usePublishSyllabus()
  const { mutateAsync: archive, isPending: archiving } = useArchiveSyllabus()
  const { mutateAsync: deleteNode, isPending: deleting } = useDeleteNode()

  const handlePublish = async () => {
    try {
      await publish(id!)
      toast.success('Syllabus published.')
      setLifecycleDialog(null)
    } catch {
      toast.error('Failed to publish syllabus.')
    }
  }

  const handleArchive = async () => {
    try {
      await archive(id!)
      toast.success('Syllabus archived.')
      setLifecycleDialog(null)
    } catch {
      toast.error('Failed to archive syllabus.')
    }
  }

  const handleDeleteNode = async () => {
    if (!deleteTarget || !id) return
    try {
      await deleteNode({ syllabusId: id, nodeId: deleteTarget.id })
      toast.success('Node removed.')
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to remove node.')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  if (isError || !syllabus) {
    return (
      <EmptyState
        title="Syllabus not found"
        action={
          <Button variant="outline" onClick={() => navigate('/curriculum/syllabi')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
    )
  }

  const isDraft = syllabus.status === 'draft'
  const isPublished = syllabus.status === 'published'
  const tree = buildNodeTree(syllabus.nodes ?? [])

  const nodeActions = (node: SyllabusNode) => (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => { e.stopPropagation(); setAddNodeParent(node); setAddNodeOpen(true) }}
        aria-label="Add child"
      >
        <Plus className="h-3 w-3" />
      </Button>
      {isDraft && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={(e) => { e.stopPropagation(); setDeleteTarget(node) }}
          aria-label="Delete node"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </>
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title={syllabus.title}
        description={syllabus.description ?? undefined}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/curriculum/syllabi')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
            {isDraft && (
              <Button size="sm" onClick={() => setLifecycleDialog('publish')}>
                <Globe className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )}
            {isPublished && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLifecycleDialog('archive')}
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            )}
          </div>
        }
      />

      <div className="flex items-center gap-2">
        <SyllabusStatusBadge status={syllabus.status} />
        <span className="text-xs text-muted-foreground">
          {(syllabus.nodes ?? []).length} nodes
        </span>
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Curriculum Tree</h2>
        {isDraft && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setAddNodeParent(null); setAddNodeOpen(true) }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Root Node
          </Button>
        )}
      </div>

      {tree.length > 0 ? (
        <SyllabusTree nodes={tree} actions={nodeActions} className="rounded-lg border p-2" />
      ) : (
        <EmptyState
          title="No nodes yet"
          description={isDraft ? 'Add your first root node to build the curriculum tree.' : 'This syllabus has no content.'}
          action={
            isDraft ? (
              <Button onClick={() => { setAddNodeParent(null); setAddNodeOpen(true) }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Node
              </Button>
            ) : undefined
          }
        />
      )}

      <AddNodeDialog
        open={addNodeOpen}
        onOpenChange={setAddNodeOpen}
        syllabusId={id!}
        parentNode={addNodeParent}
        onSuccess={() => setAddNodeParent(null)}
      />

      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Node</DialogTitle>
            <DialogDescription>
              Remove <strong>"{deleteTarget?.title}"</strong> and all its children? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNode} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={lifecycleDialog === 'publish'} onOpenChange={(open) => { if (!open) setLifecycleDialog(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Publish Syllabus</DialogTitle>
            <DialogDescription>
              Once published, this syllabus becomes immutable. New versions require creating a new
              draft syllabus. Confirm to proceed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setLifecycleDialog(null)} disabled={publishing}>
              Cancel
            </Button>
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? 'Publishing…' : 'Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={lifecycleDialog === 'archive'} onOpenChange={(open) => { if (!open) setLifecycleDialog(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Archive Syllabus</DialogTitle>
            <DialogDescription>
              Archived syllabi are no longer visible to students and cannot be reactivated. Confirm to proceed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setLifecycleDialog(null)} disabled={archiving}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleArchive} disabled={archiving}>
              {archiving ? 'Archiving…' : 'Archive'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
