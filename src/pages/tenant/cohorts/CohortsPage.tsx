import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Users, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { useCohorts, useCreateCohort } from '@/hooks/useCohorts'
import { createCohortSchema, type CreateCohortFormValues } from '@/lib/schemas/tenant.schemas'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

function CreateCohortDialog({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false)
  const { mutateAsync, isPending } = useCreateCohort(tenantId)

  const form = useForm<CreateCohortFormValues>({
    resolver: zodResolver(createCohortSchema),
    defaultValues: { name: '', academicYear: '' },
  })

  const onSubmit = async (values: CreateCohortFormValues) => {
    try {
      const cohort = await mutateAsync(values)
      toast.success(`Cohort "${cohort.name}" created.`)
      form.reset()
      setOpen(false)
    } catch {
      toast.error('Failed to create cohort.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          New Cohort
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Create Cohort</DialogTitle>
          <DialogDescription>Add a new student cohort to your institution.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cohort Name</FormLabel>
                  <FormControl>
                    <Input placeholder="CSE 2025" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="academicYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Year (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="2025-26" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function CohortsPage() {
  const user = useAuthStore((s) => s.user)
  const tenantId = user?.tenantId ?? ''

  const { data: cohorts = [], isLoading, isError } = useCohorts(tenantId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cohorts"
        description="Organize students into cohorts by batch or academic year."
        actions={<CreateCohortDialog tenantId={tenantId} />}
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-muted-foreground text-sm">Failed to load cohorts.</p>
      ) : cohorts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-14 text-center">
            <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-medium">No cohorts yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a cohort to start organizing students by batch.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cohorts.map((cohort) => (
            <Card key={cohort.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{cohort.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {cohort.academicYear && (
                  <p className="text-sm text-muted-foreground">{cohort.academicYear}</p>
                )}
                {cohort.memberCount !== undefined && (
                  <p className="text-sm">
                    <span className="font-medium">{cohort.memberCount}</span>
                    <span className="text-muted-foreground"> members</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Created {formatDate(cohort.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
