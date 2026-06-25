import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowUpCircle, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useOverlayConflicts, useUpgradeOverlay } from '@/hooks/useCurriculum'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function OverlayUpgradePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [upgraded, setUpgraded] = useState(false)
  const [upgradeResult, setUpgradeResult] = useState<{ conflictsRemoved: number } | null>(null)

  const { data: conflicts, isLoading, isError, refetch } = useOverlayConflicts(id)
  const { mutateAsync: upgrade, isPending: upgrading } = useUpgradeOverlay()

  const handleUpgrade = async () => {
    if (!id) return
    try {
      const result = await upgrade(id)
      setUpgradeResult({ conflictsRemoved: result.conflictsRemoved })
      setUpgraded(true)
      toast.success(`Overlay upgraded. ${result.conflictsRemoved} conflicting operation(s) removed.`)
    } catch {
      toast.error('Upgrade failed. Please try again.')
    }
  }

  const hasConflicts = (conflicts?.conflicts.length ?? 0) > 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overlay Upgrade"
        description="Remove conflicting operations and bring this overlay up to the current syllabus baseline."
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

      {upgraded && upgradeResult ? (
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-emerald-800">Upgrade complete</p>
              <p className="text-xs text-emerald-700">
                {upgradeResult.conflictsRemoved} conflicting operation
                {upgradeResult.conflictsRemoved !== 1 ? 's' : ''} removed.
                Your overlay is now aligned with the current syllabus.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/tenant/curriculum/overlays/${id}`)}
            >
              View Overlay
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/tenant/curriculum/overlays/${id}/conflicts`)}
            >
              Re-check Conflicts
            </Button>
          </div>
        </div>
      ) : isLoading ? (
        <Skeleton className="h-48 rounded-lg" />
      ) : isError ? (
        <EmptyState
          title="Failed to load conflict data"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : !conflicts ? (
        <EmptyState title="No data" />
      ) : (
        <div className="space-y-6">
          {hasConflicts ? (
            <>
              <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  The upgrade will <strong>permanently delete</strong> the{' '}
                  {conflicts.conflicts.length} conflicting operation
                  {conflicts.conflicts.length !== 1 ? 's' : ''} listed below.
                  Valid operations will be kept intact.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  Conflicting Operations to Remove
                  <Badge variant="destructive" className="text-xs">
                    {conflicts.conflicts.length}
                  </Badge>
                </h3>
                {conflicts.conflicts.map((conflict) => (
                  <Card key={conflict.opId} className="border-red-200">
                    <CardHeader className="py-2 px-4">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                        <span className="font-mono text-xs">{conflict.opId.slice(0, 8)}…</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-0 pb-2 px-4">
                      <p className="text-xs text-muted-foreground">{conflict.reason}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full sm:w-auto"
              >
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                {upgrading
                  ? 'Upgrading…'
                  : `Remove ${conflicts.conflicts.length} Conflict${conflicts.conflicts.length !== 1 ? 's' : ''} & Upgrade`}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-700">
                  <strong>No conflicts found.</strong> This overlay is already aligned with the
                  current syllabus baseline.
                </p>
              </div>
              <EmptyState
                icon={<CheckCircle2 className="h-8 w-8 text-emerald-500/50" />}
                title="Overlay is up to date"
                description="No upgrade needed. All operations are valid."
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
      )}
    </div>
  )
}
