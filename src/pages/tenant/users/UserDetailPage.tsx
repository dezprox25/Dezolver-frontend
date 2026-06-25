import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Calendar, Users } from 'lucide-react'
import { useInvitations } from '@/hooks/useInvitations'
import { useCohorts } from '@/hooks/useCohorts'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { InvitationStatusBadge } from '@/components/admin/UserStatusBadge'
import { RoleBadge } from '@/components/admin/RoleBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatDateTime } from '@/lib/utils/format'
import { ROLE_LABELS } from '@/lib/permissions/roles'

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const tenantId = user?.tenantId ?? ''

  const { data: invitationsData, isLoading } = useInvitations(tenantId, { limit: 200 })
  const { data: cohorts = [] } = useCohorts(tenantId)

  const invitation = invitationsData?.items.find((i) => i.id === id)
  const cohort = cohorts.find((c) => c.id === invitation?.cohortId)

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        User record not found.{' '}
        <button className="underline" onClick={() => navigate('/tenant/users')}>
          Back to Users
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader
        title={invitation.email}
        description={ROLE_LABELS[invitation.role]}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/tenant/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            Member Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Status</p>
              <InvitationStatusBadge status={invitation.status} />
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Role</p>
              <RoleBadge role={invitation.role} />
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Email</p>
              <p className="font-medium">{invitation.email}</p>
            </div>
            {cohort && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Cohort</p>
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{cohort.name}</span>
                  {cohort.academicYear && (
                    <span className="text-muted-foreground">({cohort.academicYear})</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Invited
              </p>
              <p>{formatDateTime(invitation.createdAt)}</p>
            </div>
            {invitation.acceptedAt && (
              <div>
                <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Joined
                </p>
                <p>{formatDateTime(invitation.acceptedAt)}</p>
              </div>
            )}
            {invitation.status === 'pending' && (
              <div>
                <p className="text-muted-foreground text-xs mb-1">Expires</p>
                <p>{formatDate(invitation.expiresAt)}</p>
              </div>
            )}
          </div>

          <Separator />

          <div>
            <p className="text-muted-foreground text-xs mb-1">Invitation ID</p>
            <p className="font-mono text-xs text-muted-foreground">{invitation.id}</p>
          </div>
        </CardContent>
      </Card>

      {invitation.status === 'pending' && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/tenant/invitations')}
          >
            Manage Invitation
          </Button>
        </div>
      )}
    </div>
  )
}
