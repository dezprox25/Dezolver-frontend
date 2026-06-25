import { useState } from 'react'
import {
  Activity,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  GitBranch,
  ChevronRight,
  Info,
} from 'lucide-react'
import { useSystemHealth } from '@/hooks/useHealth'
import { useLaunchStatus, useAdvanceLaunchPhase, usePlatformVersion, usePlatformTime } from '@/hooks/usePlatform'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { formatDateTime } from '@/lib/utils/format'
import { LAUNCH_PHASE_LABELS, HEALTH_STATUS_LABELS } from '@/types/platform.types'
import type { HealthStatus, LaunchPhase } from '@/types/platform.types'

// ─── Health indicator ─────────────────────────────────────────────────────────

function HealthBadge({ status }: { status: HealthStatus }) {
  if (status === 'healthy')
    return (
      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
        <CheckCircle2 className="mr-1 h-3 w-3" />
        {HEALTH_STATUS_LABELS[status]}
      </Badge>
    )
  if (status === 'degraded')
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-300">
        <AlertTriangle className="mr-1 h-3 w-3" />
        {HEALTH_STATUS_LABELS[status]}
      </Badge>
    )
  return (
    <Badge className="bg-red-100 text-red-800 border-red-300">
      <XCircle className="mr-1 h-3 w-3" />
      {HEALTH_STATUS_LABELS[status]}
    </Badge>
  )
}

function CheckIcon({ status }: { status: HealthStatus }) {
  if (status === 'healthy') return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
  if (status === 'degraded') return <AlertTriangle className="h-4 w-4 text-amber-500" />
  return <XCircle className="h-4 w-4 text-red-500" />
}

// ─── Launch phase stepper ─────────────────────────────────────────────────────

const PHASE_ORDER: LaunchPhase[] = ['pre_launch', 'beta', 'limited_ga', 'full_ga']

function LaunchPhaseStep({
  phase,
  current,
}: {
  phase: LaunchPhase
  current: LaunchPhase | undefined
}) {
  const currentIdx = current ? PHASE_ORDER.indexOf(current) : -1
  const phaseIdx = PHASE_ORDER.indexOf(phase)
  const isDone = phaseIdx < currentIdx
  const isActive = phaseIdx === currentIdx

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium ${
          isDone
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : isActive
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-muted bg-muted text-muted-foreground'
        }`}
      >
        {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : phaseIdx + 1}
      </div>
      <span
        className={`text-sm ${
          isActive ? 'font-semibold' : isDone ? 'text-muted-foreground' : 'text-muted-foreground/60'
        }`}
      >
        {LAUNCH_PHASE_LABELS[phase]}
      </span>
    </div>
  )
}

// ─── Advance phase dialog ─────────────────────────────────────────────────────

function AdvancePhaseDialog({ nextPhase }: { nextPhase: LaunchPhase }) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const { mutateAsync: advance, isPending } = useAdvanceLaunchPhase()

  async function handleAdvance() {
    await advance({ notes: notes.trim() || undefined })
    setOpen(false)
    setNotes('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="default">
          <ChevronRight className="mr-2 h-4 w-4" />
          Advance to {LAUNCH_PHASE_LABELS[nextPhase]}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Advance Launch Phase</DialogTitle>
          <DialogDescription>
            This will move the platform from the current phase to{' '}
            <strong>{LAUNCH_PHASE_LABELS[nextPhase]}</strong>. This action is irreversible.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              Advancing the launch phase is a platform-wide action. Ensure all prerequisites are
              met before proceeding.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="advance-notes">Notes (optional)</Label>
            <Textarea
              id="advance-notes"
              placeholder="Reason or release notes for this phase advance…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleAdvance} disabled={isPending}>
            {isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Advance
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SystemHealthPage() {
  const { data: health, isLoading: healthLoading, refetch: refetchHealth } = useSystemHealth()
  const { data: launchStatus, isLoading: launchLoading } = useLaunchStatus()
  const { data: version } = usePlatformVersion()
  const { data: serverTime } = usePlatformTime()

  const hasChecks = health?.checks && Object.keys(health.checks).length > 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Health"
        description="Platform health monitoring and launch phase controls."
        actions={
          <Button variant="outline" size="sm" onClick={() => refetchHealth()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {/* Backend limitation notice */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3">
        <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Queue monitoring, background job stats, and outbox pipeline metrics are not yet available
          via API. These require /admin/v1/outbox/stats and related endpoints (currently missing
          from the backend).
        </p>
      </div>

      {/* Top row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Overall health */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Health
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : health ? (
              <div className="space-y-2">
                <HealthBadge status={health.status} />
                <p className="text-xs text-muted-foreground">{health.container}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Unavailable</p>
            )}
          </CardContent>
        </Card>

        {/* Version */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Version</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {health ? (
              <div className="space-y-1">
                <p className="text-lg font-bold font-mono">v{health.version}</p>
                {health.gitSha && (
                  <p className="text-xs text-muted-foreground font-mono">
                    {health.gitSha.slice(0, 8)}
                  </p>
                )}
                {version?.environment && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {version.environment}
                  </Badge>
                )}
              </div>
            ) : (
              <Skeleton className="h-7 w-20" />
            )}
          </CardContent>
        </Card>

        {/* Server time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Server Time
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {serverTime ? (
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {formatDateTime(serverTime.serverTime)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {serverTime.timezone ?? 'UTC'}
                </p>
              </div>
            ) : (
              <Skeleton className="h-7 w-32" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Health checks */}
      {(healthLoading || hasChecks) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Component Health Checks</CardTitle>
            <CardDescription>Individual service and dependency status</CardDescription>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : !hasChecks ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                No granular health checks exposed by backend.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(health!.checks!).map(([name, check]) => (
                  <div
                    key={name}
                    className="flex items-center gap-3 rounded-lg border px-4 py-3"
                  >
                    <CheckIcon status={check.status} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium capitalize">{name}</p>
                      {check.message && (
                        <p className="text-xs text-muted-foreground truncate">{check.message}</p>
                      )}
                    </div>
                    {check.latencyMs !== undefined && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {check.latencyMs}ms
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Launch phase */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Launch Phase</CardTitle>
          <CardDescription>
            Control the platform's launch phase rollout progression
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {launchLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                {PHASE_ORDER.map((phase, idx) => (
                  <div key={phase} className="flex items-center gap-2">
                    <LaunchPhaseStep phase={phase} current={launchStatus?.currentPhase} />
                    {idx < PHASE_ORDER.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
                    )}
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Current phase:{' '}
                    <strong>
                      {launchStatus?.currentPhase
                        ? LAUNCH_PHASE_LABELS[launchStatus.currentPhase]
                        : 'Unknown'}
                    </strong>
                  </p>
                  {launchStatus?.advancedAt && (
                    <p className="text-xs text-muted-foreground">
                      Advanced {formatDateTime(launchStatus.advancedAt)}
                      {launchStatus.advancedBy && ` by ${launchStatus.advancedBy}`}
                    </p>
                  )}
                  {launchStatus?.notes && (
                    <p className="text-xs text-muted-foreground italic">
                      "{launchStatus.notes}"
                    </p>
                  )}
                </div>

                {launchStatus?.nextPhase && (
                  <AdvancePhaseDialog nextPhase={launchStatus.nextPhase} />
                )}
                {!launchStatus?.nextPhase && launchStatus?.currentPhase === 'full_ga' && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Full General Availability
                  </Badge>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Queue & jobs — limitation notice */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Queue &amp; Background Jobs</CardTitle>
          <CardDescription>Async pipeline health and job status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Queue monitoring not available
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1 max-w-sm">
                The backend does not yet expose <code>/admin/v1/outbox/stats</code> or
                queue health endpoints. These are tracked as P2 backend tasks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance controls — limitation notice */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Maintenance Controls</CardTitle>
          <CardDescription>Emergency lockdown and session management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground/30" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Maintenance controls not available
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1 max-w-sm">
                Emergency lockdown (<code>/admin/v1/security/lockdown</code>), session revocation
                (<code>/admin/v1/security/revoke-sessions</code>), and read-only mode require
                backend endpoints that are currently missing.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
