import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'
import { useSelfTenant, useUpdateTenant } from '@/hooks/useTenants'
import { PageHeader } from '@/components/shared/PageHeader'
import { TenantStatusBadge } from '@/components/admin/TenantStatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/format'
import { PLAN_LABELS } from '@/types/tenancy.types'

const updateSchema = z.object({
  name: z.string().min(2).max(255),
  primaryContactEmail: z.string().email().max(255).optional(),
})
type UpdateFormValues = z.infer<typeof updateSchema>

export function TenantOverviewPage() {
  const { data: tenant, isLoading, isError } = useSelfTenant()
  const { mutateAsync, isPending } = useUpdateTenant(tenant?.id ?? '')

  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateSchema),
    values: {
      name: tenant?.name ?? '',
      primaryContactEmail: tenant?.primaryContactEmail ?? '',
    },
  })

  const onSubmit = async (values: UpdateFormValues) => {
    try {
      await mutateAsync(values)
      toast.success('Institution details updated.')
    } catch {
      toast.error('Failed to update details.')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  if (isError || !tenant) {
    return <p className="text-muted-foreground">Failed to load institution details.</p>
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Institution Overview"
        description="View and manage your institution settings on Dezolver."
        actions={
          <div className="flex items-center gap-2">
            <TenantStatusBadge status={tenant.status} />
            {tenant.subscription?.planCode && (
              <Badge variant="outline">
                {PLAN_LABELS[tenant.subscription.planCode]}
              </Badge>
            )}
          </div>
        }
      />

      {/* Quick info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform URL</CardTitle>
          <CardDescription>Your institution's Dezolver subdomain.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <code className="text-sm bg-muted px-3 py-1.5 rounded font-mono">
            {tenant.subdomain}.dezolver.com
          </code>
          <a
            href={`https://${tenant.subdomain}.dezolver.com`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          </a>
        </CardContent>
      </Card>

      {/* Editable details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Institution Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution Name</FormLabel>
                    <FormControl>
                      <Input disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="primaryContactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Contact Email</FormLabel>
                    <FormControl>
                      <Input type="email" disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Read-only metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Plan</dt>
              <dd className="font-medium">
                {tenant.subscription?.planCode
                  ? PLAN_LABELS[tenant.subscription.planCode]
                  : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium capitalize">
                {tenant.subscription?.status ?? '—'}
              </dd>
            </div>
            {tenant.subscription?.trialEndsAt && (
              <div>
                <dt className="text-muted-foreground">Trial Ends</dt>
                <dd>{formatDate(tenant.subscription.trialEndsAt)}</dd>
              </div>
            )}
            {tenant.subscription?.currentPeriodEnd && !tenant.subscription.trialEndsAt && (
              <div>
                <dt className="text-muted-foreground">Renews</dt>
                <dd>{formatDate(tenant.subscription.currentPeriodEnd)}</dd>
              </div>
            )}
          </dl>
          <Separator className="my-3" />
          <p className="text-xs text-muted-foreground">
            Contact <strong>support@dezolver.com</strong> to upgrade or change your plan.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
