import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, Users, Trophy, Play, ExternalLink,
  AlertCircle, Info, BarChart3, GraduationCap, UserCircle, Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import { useEvent } from '@/hooks/useEvents'
import { useRegisterEvent, useUnregisterEvent } from '@/hooks/useRegistration'
import { usePermissions } from '@/hooks/usePermissions'
import { usePublishEvent, useCancelEvent } from '@/hooks/useEvents'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { EventStatusBadge } from '@/components/events/EventStatusBadge'
import { EventTypeBadge } from '@/components/events/EventTypeBadge'
import { RegistrationStatusBadge } from '@/components/events/RegistrationStatusBadge'
import { EventCountdown } from '@/components/events/EventCountdown'
import { EventActionMenu } from '@/components/events/EventActionMenu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatDateTime, formatInitials } from '@/lib/utils/format'
import {
  canRegister,
  AUDIENCE_SCOPE_LABELS,
  type Event,
  type RegistrationPayment,
} from '@/types/event.types'

// ─── Razorpay loader ──────────────────────────────────────────────────────────

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as Window & { Razorpay?: unknown }).Razorpay) { resolve(); return }
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay'))
    document.body.appendChild(script)
  })
}

// ─── Paid Registration Dialog ─────────────────────────────────────────────────

interface PaymentDialogProps {
  payment: RegistrationPayment
  eventTitle: string
  userName: string
  userEmail: string
  onSuccess: () => void
  onDismiss: () => void
}

function PaidRegistrationDialog({
  payment,
  eventTitle,
  userName,
  userEmail,
  onSuccess,
  onDismiss,
}: PaymentDialogProps) {
  const [processing, setProcessing] = useState(false)

  const openCheckout = useCallback(async () => {
    setProcessing(true)
    try {
      await loadRazorpayScript()
      const RazorpayClass = (window as Window & { Razorpay?: new (opts: unknown) => { open: () => void } }).Razorpay
      if (!RazorpayClass) throw new Error('Razorpay not loaded')

      const rzp = new RazorpayClass({
        key: payment.publicKey,
        order_id: payment.razorpayOrderId,
        amount: payment.amount * 100, // convert INR → paise
        currency: payment.currency,
        name: 'Dezolver',
        description: `Registration: ${eventTitle}`,
        prefill: { name: userName, email: userEmail },
        handler: () => {
          toast.success('Payment submitted. Your registration will be confirmed shortly.', {
            duration: 8000,
          })
          onSuccess()
        },
        modal: { ondismiss: () => { setProcessing(false); onDismiss() } },
      })
      rzp.open()
    } catch {
      toast.error('Could not load payment gateway. Please try again.')
      setProcessing(false)
    }
  }, [payment, eventTitle, userName, userEmail, onSuccess, onDismiss])

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onDismiss() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Registration</DialogTitle>
          <DialogDescription>
            This event requires a registration fee. You will be redirected to Razorpay to
            complete payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border px-4 py-3">
            <span className="text-sm text-muted-foreground">Registration fee</span>
            <span className="text-lg font-bold">
              ₹{payment.amount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Payment confirmation via backend webhook is not yet fully operational. After
              payment, your registration status may remain pending for a short time.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onDismiss} disabled={processing}>Cancel</Button>
          <Button onClick={openCheckout} disabled={processing}>
            {processing ? 'Opening Payment…' : `Pay ₹${payment.amount.toLocaleString('en-IN')}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const canManage = usePermissions('manage:assessment')
  const canCreateEvent = usePermissions('create:event')
  const canSubmit = usePermissions('create:submission')

  const { data: event, isLoading, isError } = useEvent(id)
  const { mutateAsync: register, isPending: registering } = useRegisterEvent()
  const { mutateAsync: unregister, isPending: unregistering } = useUnregisterEvent()
  const { mutateAsync: publish, isPending: publishing } = usePublishEvent()
  const { mutateAsync: cancel, isPending: cancelling } = useCancelEvent()

  const [confirmCancel, setConfirmCancel] = useState(false)
  const [pendingPayment, setPendingPayment] = useState<RegistrationPayment | null>(null)

  const organizer = canManage || canCreateEvent

  const handleRegister = async (ev: Event) => {
    try {
      const res = await register(ev.id)
      if (res.status === 'registered') {
        toast.success('You are now registered!')
      } else if (res.status === 'waitlisted') {
        toast.info("You've been added to the waitlist.")
      } else if (res.status === 'pending_payment' && res.payment) {
        setPendingPayment(res.payment)
      }
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      toast.error(msg ?? 'Registration failed.')
    }
  }

  const handleUnregister = async (ev: Event) => {
    try {
      await unregister(ev.id)
      toast.success('Registration withdrawn.')
    } catch {
      toast.error('Could not withdraw registration.')
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (isError || !event) {
    return (
      <EmptyState
        title="Event not found"
        action={
          <Button variant="outline" onClick={() => navigate('/events')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to events
          </Button>
        }
      />
    )
  }

  const reg = event.myRegistration
  const isRegistered = reg?.status === 'registered'
  const isLive = event.status === 'live'
  const isCompleted = event.status === 'completed'
  const problems = event.config?.problems ?? []
  const speakers = event.config?.speakers ?? []
  const agenda = event.config?.agenda ?? []
  const materials = event.config?.materials ?? []
  const isPaidEvent = event.audienceScope === 'tenant_open' && (event.audienceFilter?.priceInr ?? 0) > 0

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title={event.title}
        description={event.description ?? undefined}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate('/events')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            {/* Student: register */}
            {canSubmit && canRegister(event) && !reg && (
              <Button size="sm" onClick={() => handleRegister(event)} disabled={registering}>
                {registering ? 'Registering…' : (isPaidEvent ? `Register — ₹${event.audienceFilter?.priceInr}` : 'Register')}
              </Button>
            )}

            {/* Student: withdraw */}
            {canSubmit && isRegistered && event.status === 'registration_open' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUnregister(event)}
                disabled={unregistering}
              >
                Withdraw
              </Button>
            )}

            {/* Student: join live event */}
            {canSubmit && isLive && isRegistered && event.kind === 'competition' && (
              <Button size="sm" onClick={() => navigate(`/events/${event.id}/live`)}>
                <Play className="mr-2 h-4 w-4" />
                Join Competition
              </Button>
            )}

            {/* View results */}
            {(isCompleted || event.status === 'grading') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/events/${event.id}/results`)}
              >
                <Trophy className="mr-2 h-4 w-4" />
                Results
              </Button>
            )}

            {/* Organizer analytics */}
            {organizer && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/events/${event.id}/analytics`)}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            )}

            {/* Organizer menu */}
            <EventActionMenu
              event={event}
              canManage={organizer}
              onPublish={async () => {
                try {
                  await publish(event.id)
                  toast.success('Event published.')
                } catch {
                  toast.error('Publish failed.')
                }
              }}
              onCancel={() => setConfirmCancel(true)}
              disabled={publishing || cancelling}
            />
          </div>
        }
      />

      {/* Status strip */}
      <div className="flex flex-wrap items-center gap-2">
        <EventStatusBadge status={event.status} />
        <EventTypeBadge kind={event.kind} />
        <Badge variant="outline" className="text-xs capitalize">
          {AUDIENCE_SCOPE_LABELS[event.audienceScope]}
        </Badge>
        {isPaidEvent && (
          <Badge variant="outline" className="text-xs border-emerald-400 text-emerald-700">
            ₹{event.audienceFilter?.priceInr} / external
          </Badge>
        )}
        {reg && <RegistrationStatusBadge status={reg.status} />}
      </div>

      {/* Countdowns */}
      {isLive && (
        <div className="flex items-center gap-3">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Event ends in</span>
          <EventCountdown targetDate={event.endsAt} label="" />
        </div>
      )}
      {event.status === 'registration_open' && event.startsAt && (
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Starts in</span>
          <EventCountdown targetDate={event.startsAt} label="" />
        </div>
      )}

      {/* Waitlist notice */}
      {reg?.status === 'waitlisted' && (
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-3">
          <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700 dark:text-blue-400">
            You are on the waitlist. You'll be automatically registered if a spot opens up.
          </p>
        </div>
      )}

      {/* Certificate link (completed events) */}
      {isCompleted && isRegistered && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3">
          <GraduationCap className="h-4 w-4 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-700 dark:text-emerald-400 flex-1">
            Event completed. Check your certificates if eligible.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-emerald-400 text-emerald-700"
            onClick={() => navigate('/me/certificates')}
          >
            My Certificates
          </Button>
        </div>
      )}

      {/* Schedule card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {event.registrationOpensAt && (
              <div>
                <dt className="text-xs text-muted-foreground mb-1">Registration Opens</dt>
                <dd>{formatDateTime(event.registrationOpensAt)}</dd>
              </div>
            )}
            {event.registrationClosesAt && (
              <div>
                <dt className="text-xs text-muted-foreground mb-1">Registration Closes</dt>
                <dd>{formatDateTime(event.registrationClosesAt)}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted-foreground mb-1">Starts At</dt>
              <dd>{formatDateTime(event.startsAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground mb-1">Ends At</dt>
              <dd>{formatDateTime(event.endsAt)}</dd>
            </div>
            {event.capacity && (
              <div>
                <dt className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Capacity
                </dt>
                <dd>
                  {event.registrationCount ?? 0} / {event.capacity} registered
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Workshop agenda */}
      {event.kind === 'workshop' && agenda.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Agenda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-0">
              {agenda.map((item, idx) => (
                <div key={idx} className="flex gap-4 pb-5 relative">
                  {idx < agenda.length - 1 && (
                    <div className="absolute left-3.5 top-8 h-full w-px bg-border" />
                  )}
                  <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 border text-xs font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs font-mono">{item.time}</Badge>
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
                    )}
                    {item.speakerName && (
                      <p className="text-xs text-muted-foreground mt-0.5 italic">
                        — {item.speakerName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Speakers */}
      {speakers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <UserCircle className="h-4 w-4 text-muted-foreground" />
              Speakers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {speakers.map((speaker, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    {speaker.avatarUrl ? (
                      <img src={speaker.avatarUrl} alt={speaker.name} />
                    ) : (
                      <AvatarFallback className="text-xs">
                        {formatInitials(speaker.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{speaker.name}</p>
                    {speaker.title && (
                      <p className="text-xs text-muted-foreground">{speaker.title}</p>
                    )}
                    {speaker.bio && (
                      <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2">
                        {speaker.bio}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Materials */}
      {materials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {materials.map((mat, idx) => (
                <a
                  key={idx}
                  href={mat.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted/50 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  {mat.title}
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competition problems */}
      {event.kind === 'competition' && problems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              Problems ({problems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {problems
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((p, i) => (
                  <div
                    key={p.problemId}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground w-5">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm font-medium">
                        {p.title ?? `Problem ${i + 1}`}
                      </span>
                      {p.difficulty && (
                        <Badge variant="secondary" className="text-[10px]">{p.difficulty}</Badge>
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs">{p.points} pts</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard link */}
      {(isLive || isCompleted) && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/events/${event.id}/leaderboard`)}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View Leaderboard
          </Button>
        </div>
      )}

      {/* Organizer info */}
      {organizer && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          Event ID: <span className="font-mono">{event.id}</span>
          <Separator orientation="vertical" className="h-3" />
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground"
            onClick={() => navigate(`/events/${event.id}/manage`)}
          >
            Manage Event
          </Button>
        </div>
      )}

      {/* Paid registration dialog */}
      {pendingPayment && (
        <PaidRegistrationDialog
          payment={pendingPayment}
          eventTitle={event.title}
          userName={user?.fullName ?? ''}
          userEmail={user?.email ?? ''}
          onSuccess={() => setPendingPayment(null)}
          onDismiss={() => setPendingPayment(null)}
        />
      )}

      {/* Cancel confirm dialog */}
      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Event?</DialogTitle>
            <DialogDescription>
              This will cancel the event and notify all registered participants. This cannot be undone.
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
    </div>
  )
}
