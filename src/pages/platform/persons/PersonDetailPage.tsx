import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Shield, Loader2, User, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { usePerson, useImpersonate } from '@/hooks/usePersons'
import { PageHeader } from '@/components/shared/PageHeader'
import { UserStatusBadge } from '@/components/admin/UserStatusBadge'
import { RoleBadge } from '@/components/admin/RoleBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { formatDate } from '@/lib/utils/format'
import type { UserStatus } from '@/types/auth.types'

const impersonateSchema = z.object({
  caseId: z.string().max(100).optional(),
  justification: z.string().min(10, 'Provide a justification of at least 10 characters').max(500),
})

type ImpersonateFormValues = z.infer<typeof impersonateSchema>

function ImpersonateDialog({
  userId,
  userName,
  onClose,
}: {
  userId: string
  userName: string
  onClose: () => void
}) {
  const navigate = useNavigate()
  const { mutateAsync: impersonate, isPending } = useImpersonate()

  const form = useForm<ImpersonateFormValues>({
    resolver: zodResolver(impersonateSchema),
    defaultValues: { caseId: '', justification: '' },
  })

  const onSubmit = async (values: ImpersonateFormValues) => {
    try {
      await impersonate({
        userId,
        dto: {
          caseId: values.caseId || undefined,
          justification: values.justification,
        },
      })
      toast.success(`Now impersonating ${userName}`)
      onClose()
      navigate('/dashboard')
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      toast.error(msg ?? 'Impersonation failed.')
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-500" />
            Impersonate User
          </DialogTitle>
          <DialogDescription>
            You will assume the identity of <strong>{userName}</strong>. All actions will be logged
            in the audit trail.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            This action is audited. A justification is required and a case ID is recommended for
            support tickets.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="caseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Case ID (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="SUPPORT-1234" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe why impersonation is needed…"
                      rows={3}
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Start Impersonation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function PersonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [impersonateUserId, setImpersonateUserId] = useState<string | null>(null)

  const { data: person, isLoading, isError } = usePerson(id)

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    )
  }

  if (isError || !person) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Person not found.{' '}
        <button className="underline" onClick={() => navigate('/platform/persons')}>
          Back to search
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title={person.displayName}
        description={person.primaryEmail}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
      />

      {/* Person card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            Identity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs mb-1">Display Name</dt>
              <dd className="font-medium">{person.displayName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs mb-1">Platform Rating</dt>
              <dd className="font-medium tabular-nums">{person.platformRating}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs mb-1">Primary Email</dt>
              <dd>{person.primaryEmail}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs mb-1">Created</dt>
              <dd>{formatDate(person.createdAt)}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-muted-foreground text-xs mb-1">Person ID</dt>
              <dd className="font-mono text-xs text-muted-foreground">{person.id}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Linked users */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Linked Users
            <Badge variant="secondary" className="ml-2 text-xs">
              {person.users.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {person.users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No linked users.</p>
          ) : (
            person.users.map((u) => (
              <div key={u.id} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <RoleBadge role={u.primaryRole} />
                    <Badge variant="secondary" className="text-xs capitalize">
                      {u.tenantKind}
                    </Badge>
                    <UserStatusBadge status={u.status as UserStatus} />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-amber-600 border-amber-300 hover:bg-amber-50"
                    onClick={() => setImpersonateUserId(u.id)}
                  >
                    <Shield className="mr-1.5 h-3.5 w-3.5" />
                    Impersonate
                  </Button>
                </div>
                <Separator />
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  {u.tenantName && (
                    <div>
                      <dt className="text-muted-foreground">Tenant</dt>
                      <dd>{u.tenantName}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-muted-foreground">MFA</dt>
                    <dd>{u.mfaEnabled ? 'Enabled' : 'Disabled'}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">User ID</dt>
                    <dd className="font-mono text-muted-foreground">{u.id}</dd>
                  </div>
                </dl>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {impersonateUserId && (
        <ImpersonateDialog
          userId={impersonateUserId}
          userName={person.displayName}
          onClose={() => setImpersonateUserId(null)}
        />
      )}
    </div>
  )
}
