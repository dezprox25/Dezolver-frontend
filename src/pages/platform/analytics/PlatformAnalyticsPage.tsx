import { useMemo } from 'react'
import { BarChart3, AlertCircle, Building2, RefreshCw, TrendingUp } from 'lucide-react'
import { useTenants } from '@/hooks/useTenants'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils/format'
import { PLAN_LABELS, TENANT_STATUS_LABELS } from '@/types/tenancy.types'
import type { TenantStatus, PlanCode } from '@/types/tenancy.types'

const STATUS_COLORS: Record<TenantStatus, string> = {
  active: 'bg-emerald-500',
  trial: 'bg-blue-500',
  suspended: 'bg-amber-500',
  pending: 'bg-slate-400',
  expired: 'bg-red-400',
  cancelled: 'bg-slate-300',
  purged: 'bg-slate-200',
}

const PLAN_COLORS: Partial<Record<PlanCode, string>> = {
  starter: 'bg-slate-400',
  professional: 'bg-blue-500',
  enterprise: 'bg-purple-500',
  unlimited: 'bg-emerald-500',
}

// ─── Bar chart (pure CSS) ─────────────────────────────────────────────────────

interface BarChartProps {
  data: { label: string; count: number; color: string }[]
  total: number
}

function HorizontalBarChart({ data, total }: BarChartProps) {
  if (total === 0) return <p className="text-sm text-muted-foreground">No data.</p>
  return (
    <div className="space-y-2.5">
      {data
        .filter((d) => d.count > 0)
        .sort((a, b) => b.count - a.count)
        .map((item) => {
          const pct = Math.round((item.count / total) * 100)
          return (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-28 shrink-0 text-sm text-muted-foreground truncate">
                {item.label}
              </span>
              <div className="flex-1 overflow-hidden rounded-full bg-muted h-2">
                <div
                  className={`h-2 rounded-full transition-all ${item.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-8 text-right text-sm font-medium">{item.count}</span>
              <span className="w-8 text-right text-xs text-muted-foreground">{pct}%</span>
            </div>
          )
        })}
    </div>
  )
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  delta,
  icon: Icon,
  loading,
}: {
  title: string
  value: string | number
  delta?: string
  icon: React.ComponentType<{ className?: string }>
  loading?: boolean
}) {
  return (
    <Card>
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
        {delta && <p className="mt-1 text-xs text-muted-foreground">{delta}</p>}
      </CardContent>
    </Card>
  )
}

// ─── Tenant growth table ──────────────────────────────────────────────────────

interface GrowthEntry {
  month: string
  count: number
}

function growthByMonth(dates: string[]): GrowthEntry[] {
  const counts: Record<string, number> = {}
  for (const d of dates) {
    const key = d.slice(0, 7) // "YYYY-MM"
    counts[key] = (counts[key] ?? 0) + 1
  }
  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, count]) => ({ month, count }))
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function PlatformAnalyticsPage() {
  const { data: tenantsData, isLoading, refetch } = useTenants({ limit: 200 })
  const allTenants = tenantsData?.pages.flatMap((p) => p.items) ?? []

  const totalTenants = allTenants.length
  const activeTenants = allTenants.filter((t) => t.status === 'active').length
  const trialTenants = allTenants.filter((t) => t.status === 'trial').length
  const collegeTenants = allTenants.filter((t) => t.kind === 'college').length
  const directTenants = allTenants.filter((t) => t.kind === 'direct').length

  const statusData = useMemo(() => {
    return (Object.keys(STATUS_COLORS) as TenantStatus[]).map((status) => ({
      label: TENANT_STATUS_LABELS[status],
      count: allTenants.filter((t) => t.status === status).length,
      color: STATUS_COLORS[status],
    }))
  }, [allTenants])

  const planData = useMemo(() => {
    const planCodes: PlanCode[] = ['starter', 'professional', 'enterprise', 'unlimited']
    const result = planCodes.map((planCode) => ({
      label: PLAN_LABELS[planCode],
      count: allTenants.filter((t) => t.subscription?.planCode === planCode).length,
      color: PLAN_COLORS[planCode] ?? 'bg-slate-400',
    }))
    const noPlan = allTenants.filter((t) => !t.subscription?.planCode).length
    if (noPlan > 0) result.push({ label: 'No Plan', count: noPlan, color: 'bg-slate-200' })
    return result
  }, [allTenants])

  const growthData = useMemo(
    () => growthByMonth(allTenants.map((t) => t.createdAt)),
    [allTenants]
  )

  const expectedStudents = useMemo(
    () => allTenants.reduce((sum, t) => sum + (t.expectedStudentCount ?? 0), 0),
    [allTenants]
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Analytics"
        description="Tenant and subscription metrics derived from live data."
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        }
      />

      {/* Backend limitation notice */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3">
        <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          No dedicated analytics API is available in the backend. All metrics are derived from
          the tenants and subscriptions APIs in real-time. Event-level usage analytics (active
          users, DAU, content views) require a dedicated aggregation endpoint.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Tenants"
          value={isLoading ? '…' : totalTenants}
          delta={`${collegeTenants} college · ${directTenants} direct`}
          icon={Building2}
          loading={isLoading}
        />
        <KpiCard
          title="Active Tenants"
          value={isLoading ? '…' : activeTenants}
          delta={`${Math.round((activeTenants / (totalTenants || 1)) * 100)}% of total`}
          icon={TrendingUp}
          loading={isLoading}
        />
        <KpiCard
          title="Trial Tenants"
          value={isLoading ? '…' : trialTenants}
          delta="potential conversions"
          icon={BarChart3}
          loading={isLoading}
        />
        <KpiCard
          title="Expected Students"
          value={isLoading ? '…' : expectedStudents.toLocaleString('en-IN')}
          delta="sum across all tenants"
          icon={Building2}
          loading={isLoading}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tenant by status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tenants by Status</CardTitle>
            <CardDescription>Lifecycle distribution across {totalTenants} tenants</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full rounded" />
                ))}
              </div>
            ) : (
              <HorizontalBarChart data={statusData} total={totalTenants} />
            )}
          </CardContent>
        </Card>

        {/* Tenant by plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tenants by Plan</CardTitle>
            <CardDescription>Subscription plan distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-full rounded" />
                ))}
              </div>
            ) : (
              <HorizontalBarChart data={planData} total={totalTenants} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Growth timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tenant Growth (Last 6 Months)</CardTitle>
          <CardDescription>New tenants created per month</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : growthData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No growth data available.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-end gap-3 h-24">
                {growthData.map((entry) => {
                  const maxCount = Math.max(...growthData.map((d) => d.count), 1)
                  const pct = Math.round((entry.count / maxCount) * 100)
                  return (
                    <div key={entry.month} className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-xs font-medium">{entry.count}</span>
                      <div className="w-full rounded-t bg-primary/80" style={{ height: `${pct}%`, minHeight: 4 }} />
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-3">
                {growthData.map((entry) => (
                  <div key={entry.month} className="flex-1 text-center text-[10px] text-muted-foreground">
                    {entry.month.slice(5)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tenant table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Tenants</CardTitle>
          <CardDescription>Last 10 tenants created</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <div className="divide-y">
              {allTenants
                .slice()
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .slice(0, 10)
                .map((tenant) => (
                  <div key={tenant.id} className="flex items-center justify-between py-2.5 gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{tenant.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {tenant.subdomain}.dezolver.com
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {tenant.kind}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          tenant.status === 'active'
                            ? 'border-emerald-500 text-emerald-700'
                            : tenant.status === 'trial'
                            ? 'border-blue-500 text-blue-700'
                            : 'border-slate-300 text-slate-600'
                        }`}
                      >
                        {TENANT_STATUS_LABELS[tenant.status]}
                      </Badge>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(tenant.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
