import { useState } from 'react'
import { ShieldCheck, Search, RefreshCw, Clock, Filter } from 'lucide-react'
import { useAuditEntries } from '@/hooks/useAudit'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatDateTime, formatRelativeTime } from '@/lib/utils/format'
import type { AuditEntry, ListAuditParams } from '@/types/platform.types'

// ─── Action colour tagging ────────────────────────────────────────────────────

const SECURITY_ACTIONS = new Set([
  'auth.login',
  'auth.logout',
  'auth.logout_all',
  'auth.mfa_enroll',
  'auth.mfa_disable',
  'auth.password_reset',
  'user.impersonate',
  'tenant.transition',
  'tenant.suspended',
])

function actionBadgeClass(action: string): string {
  if (SECURITY_ACTIONS.has(action)) return 'border-amber-500 text-amber-700'
  if (action.startsWith('tenant.')) return 'border-blue-500 text-blue-700'
  if (action.startsWith('billing.')) return 'border-emerald-500 text-emerald-700'
  if (action.startsWith('certificate.')) return 'border-purple-500 text-purple-700'
  return 'border-slate-300 text-slate-600'
}

// ─── Entry row ────────────────────────────────────────────────────────────────

function AuditRow({ entry }: { entry: AuditEntry }) {
  const meta = entry.metadata ? JSON.stringify(entry.metadata, null, 2) : null
  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground cursor-default">
                {formatRelativeTime(entry.createdAt)}
              </span>
            </TooltipTrigger>
            <TooltipContent>{formatDateTime(entry.createdAt)}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={`text-xs font-mono ${actionBadgeClass(entry.action)}`}>
          {entry.action}
        </Badge>
      </TableCell>
      <TableCell className="text-sm hidden md:table-cell">
        {entry.actorEmail ?? (
          <span className="font-mono text-xs text-muted-foreground">
            {entry.actorId.slice(0, 8)}…
          </span>
        )}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground hidden lg:table-cell capitalize">
        {entry.actorRole ?? '—'}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
        {entry.targetId ? (
          <span className="font-mono">{entry.targetId.slice(0, 12)}…</span>
        ) : (
          '—'
        )}
      </TableCell>
      <TableCell className="hidden xl:table-cell">
        {meta && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="text-xs cursor-pointer">
                  View
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <pre className="text-[10px] whitespace-pre-wrap">{meta}</pre>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </TableCell>
    </TableRow>
  )
}

// ─── Audit table ─────────────────────────────────────────────────────────────

function AuditTable({ params }: { params: Omit<ListAuditParams, 'cursor'> }) {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useAuditEntries(params)

  const entries = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Time</TableHead>
              <TableHead>Action</TableHead>
              <TableHead className="hidden md:table-cell">Actor</TableHead>
              <TableHead className="hidden lg:table-cell">Role</TableHead>
              <TableHead className="hidden lg:table-cell">Target</TableHead>
              <TableHead className="hidden xl:table-cell w-16">Meta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Failed to load audit entries.{' '}
                  <button onClick={() => refetch()} className="underline">
                    Retry
                  </button>
                </TableCell>
              </TableRow>
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12">
                  <EmptyState
                    title="No audit entries"
                    description="No events match the current filters."
                    icon={<ShieldCheck className="h-8 w-8 text-muted-foreground/30" />}
                  />
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => <AuditRow key={entry.id} entry={entry} />)
            )}
          </TableBody>
        </Table>
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Activity timeline view ───────────────────────────────────────────────────

function ActivityTimeline({ params }: { params: Omit<ListAuditParams, 'cursor'> }) {
  const { data, isLoading, isError } = useAuditEntries(params)
  const entries = data?.pages.flatMap((p) => p.items) ?? []

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError)
    return <p className="text-muted-foreground text-sm">Failed to load activity.</p>

  if (entries.length === 0)
    return <EmptyState title="No activity" description="No events to display." />

  return (
    <div className="relative space-y-0">
      {entries.map((entry, idx) => (
        <div key={entry.id} className="flex gap-4 pb-6 relative">
          {/* Connector line */}
          {idx < entries.length - 1 && (
            <div className="absolute left-3.5 top-8 h-full w-px bg-border" />
          )}
          <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 border">
            <Clock className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={`text-xs font-mono ${actionBadgeClass(entry.action)}`}
              >
                {entry.action}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatRelativeTime(entry.createdAt)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {entry.actorEmail ?? `Actor ${entry.actorId.slice(0, 8)}`}
              {entry.actorRole && (
                <span className="capitalize"> · {entry.actorRole}</span>
              )}
            </p>
            {entry.targetId && (
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                Target: {entry.targetId}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TARGET_TYPE_OPTIONS = [
  { label: 'All Types', value: 'all' },
  { label: 'Tenant', value: 'tenant' },
  { label: 'User', value: 'user' },
  { label: 'Certificate', value: 'certificate' },
  { label: 'Event', value: 'event' },
  { label: 'Subscription', value: 'subscription' },
]

export function AuditLogsPage() {
  const [search, setSearch] = useState('')
  const [targetType, setTargetType] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all')

  const baseParams: Omit<ListAuditParams, 'cursor'> = {
    ...(targetType !== 'all' ? { targetType } : {}),
    limit: 25,
  }

  const securityParams: Omit<ListAuditParams, 'cursor'> = {
    ...baseParams,
    action: 'auth.',
  }

  // Client-side filter by action text search
  const params = search ? { ...baseParams, action: search } : baseParams

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Platform-wide security events and compliance activity."
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Filter by action (e.g. tenant.created)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select
          value={targetType}
          onValueChange={setTargetType}
        >
          <SelectTrigger className="w-40">
            <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TARGET_TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <AuditTable params={params} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <ActivityTimeline params={params} />
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <AuditTable params={securityParams} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
