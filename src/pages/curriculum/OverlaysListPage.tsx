import { useNavigate } from 'react-router-dom'
import { RefreshCw, ChevronRight, Layers } from 'lucide-react'
import { useOverlays } from '@/hooks/useCurriculum'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { OverlayStatusBadge } from '@/components/curriculum/OverlayStatusBadge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils/format'

export function OverlaysListPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const { data: overlays, isLoading, isError, refetch } = useOverlays(user?.tenantId ?? undefined)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Curriculum Overlays"
        description="Manage cohort-specific syllabus customisations for your institution."
        actions={
          <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      <div className="flex items-start gap-2 rounded-lg border p-3 text-sm text-muted-foreground">
        <Layers className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          Overlays let you customise the platform syllabus for each cohort — hide nodes,
          rename topics, remap content, or add cohort-specific material without forking the
          original syllabus.
        </span>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 rounded-lg" />
      ) : isError ? (
        <EmptyState
          title="Failed to load overlays"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : !overlays?.length ? (
        <EmptyState
          icon={<Layers className="h-8 w-8 text-muted-foreground/50" />}
          title="No overlays yet"
          description="Overlays are created automatically when you customise a syllabus node for a cohort."
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Overlay ID</TableHead>
                <TableHead>Syllabus</TableHead>
                <TableHead>Cohort</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {overlays.map((overlay) => (
                <TableRow
                  key={overlay.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => navigate(`/tenant/curriculum/overlays/${overlay.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/tenant/curriculum/overlays/${overlay.id}`)
                    }
                  }}
                >
                  <TableCell className="font-mono text-xs">
                    {overlay.id.slice(0, 8)}…
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {overlay.syllabusId.slice(0, 8)}…
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {overlay.cohortId.slice(0, 8)}…
                  </TableCell>
                  <TableCell>
                    <OverlayStatusBadge status={overlay.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                    {formatDate(overlay.createdAt)}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
