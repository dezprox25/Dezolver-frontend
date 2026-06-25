import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, UserPlus, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useInvitations, useCreateInvitation } from '@/hooks/useInvitations'
import { useCohorts } from '@/hooks/useCohorts'
import { PageHeader } from '@/components/shared/PageHeader'
import { InvitationStatusBadge } from '@/components/admin/UserStatusBadge'
import { RoleBadge } from '@/components/admin/RoleBadge'
import { InviteDialog } from '@/components/admin/InviteDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatRelativeTime, formatDate } from '@/lib/utils/format'
import type { InvitationStatus } from '@/types/tenancy.types'

export function UsersPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const tenantId = user?.tenantId ?? ''

  const [search, setSearch] = useState('')

  const { data: acceptedData, isLoading: loadingActive } = useInvitations(tenantId, {
    status: 'accepted' as InvitationStatus,
    limit: 100,
  })
  const { data: pendingData, isLoading: loadingPending } = useInvitations(tenantId, {
    status: 'pending' as InvitationStatus,
    limit: 100,
  })
  const { data: cohorts = [] } = useCohorts(tenantId)
  const { mutateAsync: createInvitation } = useCreateInvitation(tenantId)

  const accepted = acceptedData?.items ?? []
  const pending = pendingData?.items ?? []

  const filteredAccepted = search
    ? accepted.filter((i) => i.email.toLowerCase().includes(search.toLowerCase()))
    : accepted

  const filteredPending = search
    ? pending.filter((i) => i.email.toLowerCase().includes(search.toLowerCase()))
    : pending

  const cohortName = (cohortId: string | null | undefined) =>
    cohortId ? (cohorts.find((c) => c.id === cohortId)?.name ?? '—') : '—'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage members of your institution."
        actions={
          <InviteDialog
            tenantId={tenantId}
            cohorts={cohorts}
            onInvite={async (values) => { await createInvitation(values) }}
            trigger={
              <Button size="sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            }
          />
        }
      />

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active Members
            {accepted.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0 h-4">
                {accepted.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending Invitations
            {pending.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0 h-4">
                {pending.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Active members (accepted invitations) */}
        <TabsContent value="active" className="mt-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Cohort</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingActive ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-24 rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredAccepted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">
                          {search ? 'No members match your search' : 'No active members yet'}
                        </p>
                        {!search && (
                          <p className="text-xs text-muted-foreground">
                            Invite users and they will appear here once they accept.
                          </p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccepted.map((inv) => (
                    <TableRow
                      key={inv.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/tenant/users/${inv.id}`)}
                    >
                      <TableCell className="font-medium">{inv.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={inv.role} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cohortName(inv.cohortId)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {inv.acceptedAt ? formatRelativeTime(inv.acceptedAt) : formatDate(inv.createdAt)}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Pending invitations */}
        <TabsContent value="pending" className="mt-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Cohort</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingPending ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-20 rounded" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredPending.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <Card className="border-0">
                        <CardContent className="py-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            {search ? 'No pending invitations match your search' : 'No pending invitations'}
                          </p>
                        </CardContent>
                      </Card>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPending.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-medium">{inv.email}</TableCell>
                      <TableCell>
                        <RoleBadge role={inv.role} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {cohortName(inv.cohortId)}
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
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={() => navigate('/tenant/invitations')}>
              Manage All Invitations
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
