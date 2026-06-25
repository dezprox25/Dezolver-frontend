import { useNavigate } from 'react-router-dom'
import {
  Building2,
  ShieldCheck,
  Flag,
  BarChart3,
  Activity,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react'
import { useTenants } from '@/hooks/useTenants'
import { useFeatureFlags } from '@/hooks/usePlatform'
import { useSystemHealth } from '@/hooks/useHealth'
import { useAuditEntries } from '@/hooks/useAudit'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelativeTime } from '@/lib/utils/format'
import type { HealthStatus } from '@/types/platform.types'

// ─── Health indicator ─────────────────────────────────────────────────────────

function HealthIndicator({ status }: { status: HealthStatus | undefined }) {
  if (!status)
    return <span className="inline-flex h-2.5 w-2.5 rounded-full bg-muted animate-pulse" />
  if (status === 'healthy')
    return <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
  if (status === 'degraded')
    return <span className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" />
  return <span className="inline-flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ComponentType<{ className?: string }>
  loading?: boolean
  onClick?: () => void
}

function StatCard({ title, value, description, icon: Icon, loading, onClick }: StatCardProps) {
  return (
    <Card
      className={onClick ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Quick action card ────────────────────────────────────────────────────────

interface QuickLinkProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  path: string
}

function QuickLink({ title, description, icon: Icon, path }: QuickLinkProps) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(path)}
      className="flex items-start gap-3 rounded-lg border p-4 text-left hover:bg-muted/50 transition-colors w-full"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0 mt-1" />
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PlatformDashboardPage() {
  const navigate = useNavigate()

  const { data: tenantsData, isLoading: tenantsLoading, refetch } = useTenants({ limit: 200 })
  const { data: healthData, isLoading: healthLoading } = useSystemHealth()
  const { data: flags = [], isLoading: flagsLoading } = useFeatureFlags()
  const { data: auditData } = useAuditEntries({ limit: 5 })

  const allTenants = tenantsData?.pages.flatMap((p) => p.items) ?? []
  const activeTenants = allTenants.filter((t) => t.status === 'active').length
  const trialTenants = allTenants.filter((t) => t.status === 'trial').length
  const totalTenants = allTenants.length

  const enabledFlags = flags.filter((f) => f.enabled).length
  const recentAudit = auditData?.pages.flatMap((p) => p.items).slice(0, 5) ?? []

  const healthStatus = healthData?.status

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Dashboard"
        description="System overview for platform administrators."
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tenants"
          value={tenantsLoading ? '…' : totalTenants}
          description={
            tenantsLoading
              ? undefined
              : `${activeTenants} active · ${trialTenants} trial`
          }
          icon={Building2}
          loading={tenantsLoading}
          onClick={() => navigate('/platform/tenants')}
        />
        <StatCard
          title="Feature Flags"
          value={flagsLoading ? '…' : `${enabledFlags} / ${flags.length}`}
          description="enabled flags"
          icon={Flag}
          loading={flagsLoading}
          onClick={() => navigate('/platform/flags')}
        />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              System Health
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="flex items-center gap-2">
                <HealthIndicator status={healthStatus} />
                <span className="text-lg font-semibold capitalize">
                  {healthStatus ?? 'Unknown'}
                </span>
              </div>
            )}
            {healthData && (
              <p className="mt-1 text-xs text-muted-foreground">
                v{healthData.version}
              </p>
            )}
          </CardContent>
        </Card>
        <StatCard
          title="Audit Events"
          value={recentAudit.length > 0 ? 'Recent' : '—'}
          description="platform activity log"
          icon={ShieldCheck}
          onClick={() => navigate('/platform/audit')}
        />
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tenant status breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tenant Status</CardTitle>
            <CardDescription>Distribution across lifecycle states</CardDescription>
          </CardHeader>
          <CardContent>
            {tenantsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 rounded" />
                ))}
              </div>
            ) : allTenants.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tenants yet.</p>
            ) : (
              <div className="space-y-2">
                {(
                  [
                    ['active', 'emerald'],
                    ['trial', 'blue'],
                    ['suspended', 'amber'],
                    ['pending', 'slate'],
                    ['expired', 'red'],
                    ['cancelled', 'slate'],
                  ] as [string, string][]
                )
                  .map(([status, color]) => {
                    const count = allTenants.filter((t) => t.status === status).length
                    if (count === 0) return null
                    const pct = Math.round((count / totalTenants) * 100)
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className="w-20 shrink-0 text-sm capitalize text-muted-foreground">
                          {status}
                        </span>
                        <div className="flex-1 overflow-hidden rounded-full bg-muted h-2">
                          <div
                            className={`h-2 rounded-full bg-${color}-500`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-sm font-medium">{count}</span>
                      </div>
                    )
                  })
                  .filter(Boolean)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent audit activity */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription>Latest platform audit events</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => navigate('/platform/audit')}
            >
              View all
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentAudit.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {recentAudit.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted">
                      <ShieldCheck className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{entry.action}</p>
                      {entry.actorEmail && (
                        <p className="text-xs text-muted-foreground truncate">
                          by {entry.actorEmail}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(entry.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Health detail */}
      {healthData?.checks && Object.keys(healthData.checks).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Health Checks</CardTitle>
            <CardDescription>Component-level diagnostics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(healthData.checks).map(([name, check]) => (
                <div
                  key={name}
                  className="flex items-center gap-3 rounded-lg border px-4 py-3"
                >
                  {check.status === 'healthy' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : check.status === 'degraded' ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium capitalize">{name}</p>
                    {check.latencyMs !== undefined && (
                      <p className="text-xs text-muted-foreground">{check.latencyMs}ms</p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className={`ml-auto text-xs shrink-0 ${
                      check.status === 'healthy'
                        ? 'border-emerald-500 text-emerald-700'
                        : check.status === 'degraded'
                        ? 'border-amber-500 text-amber-700'
                        : 'border-red-500 text-red-700'
                    }`}
                  >
                    {check.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick links */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Quick Access
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLink
            title="Tenant Management"
            description="View, create, and manage college tenants"
            icon={Building2}
            path="/platform/tenants"
          />
          <QuickLink
            title="Feature Flags"
            description="Enable or disable platform-wide features"
            icon={Flag}
            path="/platform/flags"
          />
          <QuickLink
            title="Audit Logs"
            description="Browse security and compliance events"
            icon={ShieldCheck}
            path="/platform/audit"
          />
          <QuickLink
            title="Analytics"
            description="Platform usage and tenant metrics"
            icon={BarChart3}
            path="/platform/analytics"
          />
          <QuickLink
            title="Billing Admin"
            description="Manage payouts and issue refunds"
            icon={CreditCard}
            path="/platform/billing"
          />
          <QuickLink
            title="System Health"
            description="Monitor health and manage launch phase"
            icon={Activity}
            path="/platform/health"
          />
        </div>
      </div>
    </div>
  )
}
