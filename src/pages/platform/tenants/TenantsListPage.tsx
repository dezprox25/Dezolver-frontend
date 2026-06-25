import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Building2, Search, RefreshCw } from 'lucide-react'
import { useTenants } from '@/hooks/useTenants'
import { PageHeader } from '@/components/shared/PageHeader'
import { TenantStatusBadge } from '@/components/admin/TenantStatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
import { formatDate } from '@/lib/utils/format'
import type { TenantStatus, TenantKind } from '@/types/tenancy.types'
import { PLAN_LABELS } from '@/types/tenancy.types'

const STATUS_OPTIONS: { label: string; value: TenantStatus | 'all' }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Trial', value: 'trial' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Expired', value: 'expired' },
  { label: 'Cancelled', value: 'cancelled' },
]

export function TenantsListPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<TenantStatus | 'all'>('all')
  const [kindFilter, setKindFilter] = useState<TenantKind | 'all'>('all')
  const [search, setSearch] = useState('')

  const params = {
    ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    ...(kindFilter !== 'all' ? { kind: kindFilter } : {}),
    limit: 20,
  }

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useTenants(params)

  const allTenants = data?.pages.flatMap((p) => p.items) ?? []

  // Client-side name search (backend doesn't support text search on tenants)
  const filtered = search
    ? allTenants.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.subdomain.toLowerCase().includes(search.toLowerCase())
      )
    : allTenants

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tenants"
        description="Manage all college and direct-subscriber tenants on the platform."
        actions={
          <Button onClick={() => navigate('/platform/tenants/new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Tenant
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name or subdomain…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as TenantStatus | 'all')}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={kindFilter}
          onValueChange={(v) => setKindFilter(v as TenantKind | 'all')}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Kinds</SelectItem>
            <SelectItem value="college">College</SelectItem>
            <SelectItem value="direct">Direct</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" onClick={() => refetch()} title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Subdomain</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-24 rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Failed to load tenants.{' '}
                  <button onClick={() => refetch()} className="underline">
                    Retry
                  </button>
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No tenants found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((tenant) => (
                <TableRow
                  key={tenant.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/platform/tenants/${tenant.id}`)}
                >
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {tenant.subdomain}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize text-xs">
                      {tenant.kind}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <TenantStatusBadge status={tenant.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {tenant.subscription?.planCode
                      ? PLAN_LABELS[tenant.subscription.planCode]
                      : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(tenant.createdAt)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
