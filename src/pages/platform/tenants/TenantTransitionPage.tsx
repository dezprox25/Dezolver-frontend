import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, GitBranch, Loader2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useTenant, useTransitionTenant } from '@/hooks/useTenants'
import { transitionTenantSchema, type TransitionTenantFormValues } from '@/lib/schemas/tenant.schemas'
import { PageHeader } from '@/components/shared/PageHeader'
import { TenantStatusBadge } from '@/components/admin/TenantStatusBadge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { VALID_TRANSITIONS, TENANT_STATUS_LABELS } from '@/types/tenancy.types'
import type { TenantStatus } from '@/types/tenancy.types'

const DESTRUCTIVE_TRANSITIONS: TenantStatus[] = ['suspended', 'cancelled']

const TRANSITION_REASON_SUGGESTIONS: Partial<Record<TenantStatus, string[]>> = {
  trial: ['Manual activation of trial'],
  active: ['Payment received', 'Manual activation by platform admin'],
  suspended: ['Invoice overdue', 'Compliance violation', 'Customer request'],
  cancelled: ['Subscription cancelled by customer', 'Non-renewal after expiry'],
  purged: ['30-day post-cancellation retention period elapsed'],
}

export function TenantTransitionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: tenant, isLoading } = useTenant(id)
  const { mutateAsync, isPending } = useTransitionTenant(id!)

  const validTargets = tenant ? (VALID_TRANSITIONS[tenant.status] ?? []) : []

  const form = useForm<TransitionTenantFormValues>({
    resolver: zodResolver(transitionTenantSchema),
    defaultValues: {
      to: validTargets[0] as TransitionTenantFormValues['to'] | undefined,
      reason: '',
      actorJustification: '',
    },
  })

  const selectedTo = form.watch('to')
  const isDestructive = selectedTo
    ? DESTRUCTIVE_TRANSITIONS.includes(selectedTo as TenantStatus)
    : false

  const onSubmit = async (values: TransitionTenantFormValues) => {
    try {
      const result = await mutateAsync(values)
      toast.success(`Tenant transitioned to ${TENANT_STATUS_LABELS[result.status]}.`)
      navigate(`/platform/tenants/${id}`, { replace: true })
    } catch (err) {
      const code = (
        err as { response?: { data?: { error?: { message?: string } } } }
      )?.response?.data?.error
      toast.error(code?.message ?? 'Transition failed.')
    }
  }

  if (isLoading || !tenant) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (validTargets.length === 0) {
    return (
      <div className="max-w-2xl space-y-6">
        <PageHeader
          title="Tenant Transition"
          actions={
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          }
        />
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              No transitions are available from the current status:{' '}
              <TenantStatusBadge status={tenant.status} />
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Tenant Lifecycle Transition"
        description={`Change the status of "${tenant.name}"`}
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <TenantStatusBadge status={tenant.status} />
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            {selectedTo && (
              <TenantStatusBadge status={selectedTo as TenantStatus} />
            )}
          </div>
          <CardDescription>
            Current status: <strong>{TENANT_STATUS_LABELS[tenant.status]}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transition To</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select target status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {validTargets.map((s) => (
                          <SelectItem key={s} value={s}>
                            {TENANT_STATUS_LABELS[s]}
                            {DESTRUCTIVE_TRANSITIONS.includes(s) ? ' ⚠' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason Code (optional)</FormLabel>
                    <Select
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(TRANSITION_REASON_SUGGESTIONS[selectedTo as TenantStatus] ?? []).map(
                          (r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          )
                        )}
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actorJustification"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Justification</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide justification for this transition…"
                        className="min-h-[80px]"
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This will be logged to the audit trail.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isDestructive && (
                <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <strong>Warning:</strong> This transition is destructive and may affect{' '}
                    {'users\' access to the platform'}
                    . Ensure this action is authorized.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={isDestructive ? 'destructive' : 'default'}
                  disabled={isPending}
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Transition
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
