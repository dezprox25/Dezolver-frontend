import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createInvitationSchema, type CreateInvitationFormValues } from '@/lib/schemas/tenant.schemas'
import { ROLE_LABELS } from '@/lib/permissions/roles'
import type { Cohort } from '@/types/tenancy.types'
import { useState } from 'react'

const INVITABLE_ROLES = ['student', 'faculty', 'coordinator', 'college_admin'] as const

interface InviteDialogProps {
  tenantId: string
  cohorts?: Cohort[]
  onInvite: (values: CreateInvitationFormValues) => Promise<void>
  trigger?: React.ReactNode
}

export function InviteDialog({ cohorts = [], onInvite, trigger }: InviteDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<CreateInvitationFormValues>({
    resolver: zodResolver(createInvitationSchema),
    defaultValues: { email: '', role: 'student', cohortId: null },
  })

  const onSubmit = async (values: CreateInvitationFormValues) => {
    try {
      await onInvite(values)
      toast.success(`Invitation sent to ${values.email}`)
      form.reset()
      setOpen(false)
    } catch (err) {
      const code = (
        err as { response?: { data?: { error?: { code?: string; message?: string } } } }
      )?.response?.data?.error
      toast.error(code?.message ?? 'Failed to send invitation.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a user</DialogTitle>
          <DialogDescription>
            Send an invitation email to add someone to your institution.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="student@college.edu"
                      autoComplete="off"
                      disabled={form.formState.isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={form.formState.isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INVITABLE_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {cohorts.length > 0 && (
              <FormField
                control={form.control}
                name="cohortId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cohort (optional)</FormLabel>
                    <Select
                      value={field.value ?? 'none'}
                      onValueChange={(v) => field.onChange(v === 'none' ? null : v)}
                      disabled={form.formState.isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No cohort" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No cohort</SelectItem>
                        {cohorts.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                            {c.academicYear ? ` (${c.academicYear})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Send invitation
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
