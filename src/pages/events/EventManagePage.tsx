import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ArrowLeft, RefreshCw, Users, Clock, XCircle, BarChart3, Download,
} from 'lucide-react'
import { toast } from 'sonner'
import { useEvent, useCancelEvent, useExtendEvent } from '@/hooks/useEvents'
import { useEventParticipants } from '@/hooks/useRegistration'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { EventStatusBadge } from '@/components/events/EventStatusBadge'
import { ParticipantTable } from '@/components/events/ParticipantTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDateTime } from '@/lib/utils/format'
import type { EventParticipant } from '@/services/api/registration.service'

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCsv(participants: EventParticipant[], eventTitle: string) {
  const header = ['User ID', 'Display Name', 'Email', 'Status', 'Source', 'Registered At']
  const rows = participants.map((p) => [
    p.userId,
    p.displayName ?? '',
    p.email ?? '',
    p.status,
    p.source ?? 'tenant',
    p.registeredAt ?? '',
  ])
  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${eventTitle.replace(/\s+/g, '_')}_roster.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Extend form schema ───────────────────────────────────────────────────────

const extendSchema = z.object({
  newEndsAt: z.string().min(1, 'New end time is required'),
  reason: z.string().min(3, 'Reason is required').max(500),
})
type ExtendFormValues = z.infer<typeof extendSchema>

// ─── Page ─────────────────────────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Registered', value: 'registered' },
  { label: 'Waitlisted', value: 'waitlisted' },
  { label: 'Pending Payment', value: 'pending_payment' },
  { label: 'Cancelled', value: 'cancelled' },
]

export function EventManagePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: event, isLoading: eventLoading } = useEvent(id)
  const {
    data: participantsData,
    isLoading: participantsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useEventParticipants(id)

  const { mutateAsync: cancel, isPending: cancelling } = useCancelEvent()
  const { mutateAsync: extend, isPending: extending } = useExtendEvent()

  const [confirmCancel, setConfirmCancel] = useState(false)
  const [extendOpen, setExtendOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const extendForm = useForm<ExtendFormValues>({
    resolver: zodResolver(extendSchema),
    defaultValues: { newEndsAt: '', reason: '' },
  })

  const allParticipants = participantsData?.pages.flatMap((p) => p.items) ?? []
  const participants =
    statusFilter === 'all'
      ? allParticipants
      : allParticipants.filter((p) => p.status === statusFilter)

  const registeredCount = allParticipants.filter((p) => p.status === 'registered').length
  const waitlistedCount = allParticipants.filter((p) => p.status === 'waitlisted').length
  const pendingCount = allParticipants.filter((p) => p.status === 'pending_payment').length

  const onExtend = async (values: ExtendFormValues) => {
    if (!id) return
    try {
      await extend({
        id,
        dto: {
          newEndsAt: new Date(values.newEndsAt).toISOString(),
          reason: values.reason,
        },
      })
      toast.success('Event extended.')
      setExtendOpen(false)
      extendForm.reset()
    } catch {
      toast.error('Failed to extend event.')
    }
  }

  if (eventLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  if (!event) {
    return (
      <EmptyState
        title="Event not found"
        action={
          <Button variant="outline" onClick={() => navigate('/events')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={`Manage: ${event.title}`}
        description="Organizer dashboard — roster, controls, and event management."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate(`/events/${id}`)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/events/${id}/analytics`)}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
            {event.status === 'live' && (
              <Button variant="outline" size="sm" onClick={() => setExtendOpen(true)}>
                <Clock className="mr-2 h-4 w-4" />
                Extend
              </Button>
            )}
            {!['completed', 'cancelled', 'grading'].includes(event.status) && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive border-destructive/40 hover:bg-destructive/10"
                onClick={() => setConfirmCancel(true)}
                disabled={cancelling}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Event
              </Button>
            )}
          </div>
        }
      />

      {/* Status */}
      <div className="flex flex-wrap items-center gap-2">
        <EventStatusBadge status={event.status} />
        <Badge variant="outline" className="text-xs capitalize">{event.kind}</Badge>
      </div>

      {/* Event summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground mb-1">Starts At</dt>
              <dd>{formatDateTime(event.startsAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground mb-1">Ends At</dt>
              <dd>{formatDateTime(event.endsAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Users className="h-3 w-3" />
                Registered
              </dt>
              <dd className="font-medium text-emerald-700">
                {registeredCount}
                {event.capacity ? ` / ${event.capacity}` : ''}
              </dd>
            </div>
            {waitlistedCount > 0 && (
              <div>
                <dt className="text-xs text-muted-foreground mb-1">Waitlisted</dt>
                <dd className="font-medium text-amber-700">{waitlistedCount}</dd>
              </div>
            )}
            {pendingCount > 0 && (
              <div>
                <dt className="text-xs text-muted-foreground mb-1">Pending Payment</dt>
                <dd className="font-medium text-blue-700">{pendingCount}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Roster */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold">Registered Participants</h2>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="text-xs">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {allParticipants.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={() => exportCsv(allParticipants, event.title)}
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Export CSV
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => refetch()} aria-label="Refresh">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {participantsLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
          </div>
        ) : participants.length === 0 ? (
          <EmptyState
            title="No participants"
            description={statusFilter !== 'all' ? 'No participants match this filter.' : 'No one has registered yet.'}
          />
        ) : (
          <ParticipantTable participants={participants} />
        )}

        {hasNextPage && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage && <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />}
            Load more
          </Button>
        )}
      </div>

      {/* Confirm cancel */}
      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Event?</DialogTitle>
            <DialogDescription>
              All registrations will be notified. Paid registrations may require manual refunds.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancel(false)}>Keep Event</Button>
            <Button
              variant="destructive"
              disabled={cancelling}
              onClick={async () => {
                try {
                  await cancel(event.id)
                  toast.success('Event cancelled.')
                  setConfirmCancel(false)
                } catch {
                  toast.error('Failed to cancel event.')
                }
              }}
            >
              {cancelling ? 'Cancelling…' : 'Cancel Event'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend dialog */}
      <Dialog open={extendOpen} onOpenChange={setExtendOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Extend Event</DialogTitle>
            <DialogDescription>
              This action is audited. Provide a reason for the extension.
            </DialogDescription>
          </DialogHeader>
          <Form {...extendForm}>
            <form onSubmit={extendForm.handleSubmit(onExtend)} className="space-y-4">
              <FormField control={extendForm.control} name="newEndsAt" render={({ field }) => (
                <FormItem>
                  <FormLabel>New End Time</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" disabled={extending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={extendForm.control} name="reason" render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea rows={2} placeholder="Technical issues, extra time…" disabled={extending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setExtendOpen(false)} disabled={extending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={extending}>
                  {extending ? 'Extending…' : 'Extend Event'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
