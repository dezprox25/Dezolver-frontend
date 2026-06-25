import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useEvent, useUpdateEvent } from '@/hooks/useEvents'
import { PageHeader } from '@/components/shared/PageHeader'
import { EventStatusBadge } from '@/components/events/EventStatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'

const schema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().max(5000).optional(),
  registrationOpensAt: z.string().optional(),
  registrationClosesAt: z.string().optional(),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  capacity: z.number().int().positive().optional(),
})

type FormValues = z.infer<typeof schema>

function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return ''
  // Convert ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
  try {
    const d = new Date(iso)
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
  } catch {
    return ''
  }
}

export function EventEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: event, isLoading, isError } = useEvent(id)
  const { mutateAsync: update, isPending } = useUpdateEvent()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      startsAt: '',
      endsAt: '',
    },
  })

  useEffect(() => {
    if (!event) return
    form.reset({
      title: event.title,
      description: event.description ?? '',
      registrationOpensAt: toLocalInput(event.registrationOpensAt),
      registrationClosesAt: toLocalInput(event.registrationClosesAt),
      startsAt: toLocalInput(event.startsAt),
      endsAt: toLocalInput(event.endsAt),
      capacity: event.capacity ?? undefined,
    })
  }, [event, form])

  const onSubmit = async (values: FormValues) => {
    if (!event) return
    try {
      await update({
        id: event.id,
        dto: {
          title: values.title,
          description: values.description || undefined,
          registrationOpensAt: values.registrationOpensAt
            ? new Date(values.registrationOpensAt).toISOString()
            : undefined,
          registrationClosesAt: values.registrationClosesAt
            ? new Date(values.registrationClosesAt).toISOString()
            : undefined,
          startsAt: new Date(values.startsAt).toISOString(),
          endsAt: new Date(values.endsAt).toISOString(),
          capacity: values.capacity,
        },
      })
      toast.success('Event updated.')
      navigate(`/events/${event.id}`)
    } catch {
      toast.error('Failed to update event.')
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

  if (isError || !event) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Event not found.{' '}
        <button className="underline" onClick={() => navigate('/events')}>Back</button>
      </div>
    )
  }

  if (event.status !== 'draft') {
    return (
      <div className="max-w-xl py-16 mx-auto text-center space-y-3">
        <EventStatusBadge status={event.status} />
        <p className="text-sm text-muted-foreground">Only draft events can be edited.</p>
        <Button variant="outline" size="sm" onClick={() => navigate(`/events/${event.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title={`Edit: ${event.title}`}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(`/events/${event.id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl><Input disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea rows={3} disabled={isPending} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Schedule</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="registrationOpensAt" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Opens</FormLabel>
                    <FormControl><Input type="datetime-local" disabled={isPending} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="registrationClosesAt" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Closes</FormLabel>
                    <FormControl><Input type="datetime-local" disabled={isPending} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="startsAt" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starts At</FormLabel>
                    <FormControl><Input type="datetime-local" disabled={isPending} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="endsAt" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ends At</FormLabel>
                    <FormControl><Input type="datetime-local" disabled={isPending} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="capacity" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Unlimited"
                        disabled={isPending}
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <Separator />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate(`/events/${event.id}`)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
