import { useState } from 'react'
import { Mail, Search, Trash2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { useInvitations, useCreateInvitation, useRevokeInvitation } from '@/hooks/useInvitations'
import { useCohorts } from '@/hooks/useCohorts'
import { PageHeader } from '@/components/shared/PageHeader'
import { InvitationStatusBadge } from '@/components/admin/UserStatusBadge'
import { RoleBadge } from '@/components/admin/RoleBadge'
import { InviteDialog } from '@/components/admin/InviteDialog'
import { BulkActionToolbar } from '@/components/admin/BulkActionToolbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatRelativeTime, formatDate } from '@/lib/utils/format'
import type { InvitationStatus } from '@/types/tenancy.types'

export function InvitationsPage() {
  const user = useAuthStore((s) => s.user)
  const tenantId = user?.tenantId ?? ''

  const [statusFilter, setStatusFilter] = useState<InvitationStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [revokeTarget, setRevokeTarget] = useState<string | null>(null)

  const params = statusFilter !== 'all' ? { status: statusFilter } : {}
  const { data: invitationsData, isLoading, isError } = useInvitations(tenantId, params)
  const invitations = invitationsData?.items ?? []
  const { data: cohorts = [] } = useCohorts(tenantId)

  const { mutateAsync: createInvitation } = useCreateInvitation(tenantId)
  const { mutateAsync: revokeInvitation, isPending: isRevoking } = useRevokeInvitation(tenantId)

  const filtered = search
    ? invitations.filter((i) => i.email.toLowerCase().includes(search.toLowerCase()))
    : invitations

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((i) => i.id)))
    }
  }

  const handleRevoke = async (invId: string) => {
    try {
      await revokeInvitation(invId)
      toast.success('Invitation revoked.')
    } catch {
      toast.error('Failed to revoke invitation.')
    } finally {
      setRevokeTarget(null)
      setSelected((prev) => {
        const next = new Set(prev)
        next.delete(invId)
        return next
      })
    }
  }

  const handleBulkRevoke = async () => {
    const ids = [...selected].filter(
      (id) => invitations.find((i) => i.id === id)?.status === 'pending'
    )
    if (ids.length === 0) {
      toast.info('Only pending invitations can be revoked.')
      return
    }
    for (const id of ids) {
      await handleRevoke(id)
    }
    setSelected(new Set())
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invitations"
        description="Manage user invitations. Active members appear once they accept."
        actions={
          <InviteDialog
            tenantId={tenantId}
            cohorts={cohorts}
            onInvite={async (values) => { await createInvitation(values) }}
          />
        }
      />

      {/* Notice about user list limitation */}
      <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950">
        <AlertCircle className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-700 dark:text-blue-400">
          This view shows invitation records. Accepted invitations indicate active members.
          A full member directory will be available in a future platform update.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as InvitationStatus | 'all')}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="revoked">Revoked</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk toolbar */}
      <BulkActionToolbar
        selectedCount={selected.size}
        onClearSelection={() => setSelected(new Set())}
        actions={[
          {
            label: 'Revoke Selected',
            icon: Trash2,
            variant: 'destructive',
            onClick: handleBulkRevoke,
          },
        ]}
      />

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-input accent-primary"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Cohort</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Invited</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-20 rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  Failed to load invitations.
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Mail className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No invitations found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((inv) => (
                <TableRow
                  key={inv.id}
                  className={selected.has(inv.id) ? 'bg-primary/5' : undefined}
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-input accent-primary"
                      checked={selected.has(inv.id)}
                      onChange={() => toggleSelect(inv.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{inv.email}</TableCell>
                  <TableCell>
                    <RoleBadge role={inv.role} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {inv.cohortName ?? cohorts.find((c) => c.id === inv.cohortId)?.name ?? '—'}
                  </TableCell>
                  <TableCell>
                    <InvitationStatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeTime(inv.createdAt)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(inv.expiresAt)}
                  </TableCell>
                  <TableCell>
                    {inv.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setRevokeTarget(inv.id)}
                        title="Revoke invitation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Revoke confirmation dialog */}
      <Dialog open={!!revokeTarget} onOpenChange={() => setRevokeTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Revoke Invitation?</DialogTitle>
            <DialogDescription>
              The invitation link will be immediately invalidated. You can send a new invitation
              afterwards.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isRevoking}
              onClick={() => revokeTarget && handleRevoke(revokeTarget)}
            >
              Revoke
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
