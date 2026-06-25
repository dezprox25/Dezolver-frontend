import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Settings2, GitBranch } from 'lucide-react'
import { useTenant } from '@/hooks/useTenants'
import { useCohorts } from '@/hooks/useCohorts'
import { useInvitations } from '@/hooks/useInvitations'
import { useCreateInvitation } from '@/hooks/useInvitations'
import { PageHeader } from '@/components/shared/PageHeader'
import { TenantStatusBadge } from '@/components/admin/TenantStatusBadge'
import { InvitationStatusBadge } from '@/components/admin/UserStatusBadge'
import { RoleBadge } from '@/components/admin/RoleBadge'
import { InviteDialog } from '@/components/admin/InviteDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatRelativeTime } from '@/lib/utils/format'
import { PLAN_LABELS, VALID_TRANSITIONS } from '@/types/tenancy.types'

export function TenantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: tenant, isLoading, isError } = useTenant(id)
  const { data: cohorts = [] } = useCohorts(id)
  const { data: invitationsData } = useInvitations(id, { limit: 50 })
  const invitations = invitationsData?.items ?? []
  const { mutateAsync: invite } = useCreateInvitation(id!)

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    )
  }

  if (isError || !tenant) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Tenant not found.{' '}
        <button className="underline" onClick={() => navigate('/platform/tenants')}>
          Back to list
        </button>
      </div>
    )
  }

  const validTransitions = VALID_TRANSITIONS[tenant.status] ?? []

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title={tenant.name}
        description={`${tenant.subdomain}.dezolver.com`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {validTransitions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/platform/tenants/${tenant.id}/transition`)}
              >
                <GitBranch className="mr-2 h-4 w-4" />
                Transition
              </Button>
            )}
            <Button size="sm" onClick={() => navigate(`/platform/tenants/${tenant.id}/config`)}>
              <Settings2 className="mr-2 h-4 w-4" />
              Config
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cohorts">
            Cohorts
            {cohorts.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0 h-4">
                {cohorts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations
            {invitations.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0 h-4">
                {invitations.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Overview ─────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <TenantStatusBadge status={tenant.status} />
                {tenant.statusChangedAt && (
                  <p className="text-xs text-muted-foreground">
                    Changed {formatRelativeTime(tenant.statusChangedAt)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-sm font-medium">
                  {tenant.subscription?.planCode
                    ? PLAN_LABELS[tenant.subscription.planCode]
                    : '—'}
                </p>
                {tenant.subscription?.trialEndsAt && (
                  <p className="text-xs text-muted-foreground">
                    Trial ends {formatDate(tenant.subscription.trialEndsAt)}
                  </p>
                )}
                {tenant.subscription?.currentPeriodEnd && !tenant.subscription.trialEndsAt && (
                  <p className="text-xs text-muted-foreground">
                    Renews {formatDate(tenant.subscription.currentPeriodEnd)}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Kind</dt>
                  <dd className="font-medium capitalize">{tenant.kind}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Subdomain</dt>
                  <dd className="font-mono text-xs flex items-center gap-1">
                    {tenant.subdomain}.dezolver.com
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </dd>
                </div>
                {tenant.primaryContactEmail && (
                  <div>
                    <dt className="text-muted-foreground">Contact Email</dt>
                    <dd>{tenant.primaryContactEmail}</dd>
                  </div>
                )}
                {tenant.primaryDomain && (
                  <div>
                    <dt className="text-muted-foreground">Primary Domain</dt>
                    <dd className="uppercase text-xs font-medium">{tenant.primaryDomain}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{formatDate(tenant.createdAt)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Tenant ID</dt>
                  <dd className="font-mono text-xs text-muted-foreground truncate">{tenant.id}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Cohorts ───────────────────────────────────────────────── */}
        <TabsContent value="cohorts" className="mt-4">
          {cohorts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No cohorts created yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {cohorts.map((cohort) => (
                <Card key={cohort.id}>
                  <CardContent className="pt-4">
                    <p className="font-medium text-sm">{cohort.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cohort.academicYear ?? 'No academic year'}
                    </p>
                    <Separator className="my-2" />
                    <p className="text-xs text-muted-foreground font-mono">{cohort.id}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Invitations ───────────────────────────────────────────── */}
        <TabsContent value="invitations" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              {invitations.length} invitation{invitations.length !== 1 ? 's' : ''}
            </p>
            <InviteDialog
              tenantId={id!}
              cohorts={cohorts}
              onInvite={async (values) => { await invite(values) }}
            />
          </div>

          {invitations.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No invitations sent yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-lg border divide-y">
              {invitations.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{inv.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Invited {formatRelativeTime(inv.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <RoleBadge role={inv.role} />
                    <InvitationStatusBadge status={inv.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
