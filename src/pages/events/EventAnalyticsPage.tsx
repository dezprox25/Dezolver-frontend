import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, BarChart3, Users, Download, RefreshCw, AlertCircle,
} from 'lucide-react'
import { useEvent } from '@/hooks/useEvents'
import { useEventParticipants } from '@/hooks/useRegistration'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { EventStatusBadge } from '@/components/events/EventStatusBadge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { EventParticipant } from '@/services/api/registration.service'

// ─── Status color map ─────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  registered: 'bg-emerald-500',
  waitlisted: 'bg-amber-500',
  pending_payment: 'bg-blue-500',
  cancelled: 'bg-slate-400',
  refunded: 'bg-red-400',
}

const STATUS_LABELS: Record<string, string> = {
  registered: 'Registered',
  waitlisted: 'Waitlisted',
  pending_payment: 'Pending Payment',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

// ─── Horizontal bar chart ─────────────────────────────────────────────────────

function HBar({ data, total }: { data: { label: string; count: number; color: string }[]; total: number }) {
  if (total === 0) return <p className="text-sm text-muted-foreground">No data.</p>
  return (
    <div className="space-y-2.5">
      {data
        .filter((d) => d.count > 0)
        .map((item) => {
          const pct = Math.round((item.count / total) * 100)
          return (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-sm text-muted-foreground truncate">{item.label}</span>
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

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCsv(participants: EventParticipant[], eventTitle: string) {
  const header = ['User ID', 'Display Name', 'Email', 'Status', 'Source', 'Registered At']
  const rows = participants.map((p) => [
    p.userId,
    p.displayName ?? '',
    p.email ?? '',
    p.status,
    p.source ?? 'tenant',
    p.registeredAt ?? '',
  ])
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${eventTitle.replace(/\s+/g, '_')}_participants.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function EventAnalyticsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: event, isLoading: eventLoading } = useEvent(id)
  const {
    data: participantsData,
    isLoading: participantsLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEventParticipants(id)

  const participants = participantsData?.pages.flatMap((p) => p.items) ?? []

  const total = participants.length
  const capacity = event?.capacity ?? null

  const statusData = useMemo(() => {
    const seen = new Set<string>()
    const grouped: Record<string, number> = {}
    for (const p of participants) {
      seen.add(p.status)
      grouped[p.status] = (grouped[p.status] ?? 0) + 1
    }
    return Object.entries(grouped).map(([status, count]) => ({
      label: STATUS_LABELS[status] ?? status,
      count,
      color: STATUS_COLORS[status] ?? 'bg-slate-400',
    }))
  }, [participants])

  const sourceData = useMemo(() => [
    {
      label: 'Tenant (Internal)',
      count: participants.filter((p) => !p.source || p.source === 'tenant').length,
      color: 'bg-blue-500',
    },
    {
      label: 'External (Paid)',
      count: participants.filter((p) => p.source === 'external_paid').length,
      color: 'bg-purple-500',
    },
  ], [participants])

  const registeredCount = participants.filter((p) => p.status === 'registered').length
  const waitlistedCount = participants.filter((p) => p.status === 'waitlisted').length
  const capacityPct = capacity ? Math.min(Math.round((registeredCount / capacity) * 100), 100) : null

  if (eventLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  if (!event) {
    return (
      <EmptyState
        title="Event not found"
        action={
          <Button variant="outline" onClick={() => navigate('/events')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={`Analytics: ${event.title}`}
        description="Registration statistics and participant breakdown."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate(`/events/${id}/manage`)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Manage
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={participantsLoading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            {participants.length > 0 && (
              <Button size="sm" variant="outline" onClick={() => exportCsv(participants, event.title)}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
        }
      />

      <div className="flex items-center gap-2">
        <EventStatusBadge status={event.status} />
        <Badge variant="outline" className="text-xs capitalize">{event.kind}</Badge>
      </div>

      {/* Backend limitation notice */}
      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3">
        <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Analytics are derived from the registrations API in real-time (GET /events/:id/registrations).
          No dedicated analytics endpoint exists in the backend. Attendance tracking requires a
          missing backend API and is not available.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Registrations', value: participantsLoading ? '…' : total },
          { label: 'Confirmed', value: participantsLoading ? '…' : registeredCount },
          { label: 'Waitlisted', value: participantsLoading ? '…' : waitlistedCount },
          { label: 'Capacity', value: capacity ? `${registeredCount}/${capacity}` : 'Unlimited' },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              {participantsLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <p className="text-2xl font-bold">{value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Capacity bar */}
      {capacityPct !== null && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Capacity Utilization</CardTitle>
            <CardDescription>
              {registeredCount} confirmed of {capacity} maximum seats
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Filled</span>
                <span className="font-medium">{capacityPct}%</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-3 rounded-full transition-all ${
                    capacityPct >= 90
                      ? 'bg-red-500'
                      : capacityPct >= 70
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${capacityPct}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registration Status Breakdown</CardTitle>
          <CardDescription>
            Distribution across {total} registration{total !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {participantsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : (
            <HBar data={statusData} total={total} />
          )}
        </CardContent>
      </Card>

      {/* Source breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Participant Source</CardTitle>
          <CardDescription>Internal (tenant) vs external paid registrations</CardDescription>
        </CardHeader>
        <CardContent>
          {participantsLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <HBar data={sourceData} total={total} />
          )}
        </CardContent>
      </Card>

      {/* Participant roster */}
      {participants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Participant List ({total})
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {participants.map((p) => (
                <div key={p.userId} className="flex items-center justify-between py-2.5 gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{p.displayName ?? 'Unknown'}</p>
                    {p.email && (
                      <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {p.source === 'external_paid' && (
                      <Badge variant="outline" className="text-xs border-purple-400 text-purple-700">
                        Paid
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        p.status === 'registered'
                          ? 'border-emerald-400 text-emerald-700'
                          : p.status === 'waitlisted'
                          ? 'border-amber-400 text-amber-700'
                          : p.status === 'pending_payment'
                          ? 'border-blue-400 text-blue-700'
                          : 'border-slate-300 text-slate-600'
                      }`}
                    >
                      {STATUS_LABELS[p.status] ?? p.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {hasNextPage && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage && <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />}
                  Load more
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!participantsLoading && total === 0 && (
        <EmptyState
          title="No registrations yet"
          description="Analytics will appear when participants register."
          icon={<BarChart3 className="h-8 w-8 text-muted-foreground/30" />}
        />
      )}
    </div>
  )
}
