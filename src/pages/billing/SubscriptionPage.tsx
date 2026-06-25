import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useSubscription, useCancelSubscription } from '@/hooks/useBilling'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { BillingSummary } from '@/components/billing/BillingSummary'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { CancelSubscriptionDto } from '@/types/billing.types'

export function SubscriptionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [effective, setEffective] = useState<CancelSubscriptionDto['effective']>('period_end')

  const { data: subscription, isLoading, isError } = useSubscription(id)
  const { mutateAsync: cancel, isPending: cancelling } = useCancelSubscription()

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  if (isError || !subscription) {
    return (
      <EmptyState
        title="Subscription not found"
        action={
          <Button variant="outline" onClick={() => navigate('/billing')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
    )
  }

  const canCancel = !['cancelled', 'expired'].includes(subscription.status)

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Subscription Management"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/billing')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />

      <BillingSummary subscription={subscription} />

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate('/billing/plans')}>
          Change Plan
        </Button>
        {canCancel && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/40 hover:bg-destructive/10"
            onClick={() => setCancelOpen(true)}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Subscription
          </Button>
        )}
      </div>

      {/* Payment methods note */}
      <div className="flex items-start gap-2 text-xs text-muted-foreground rounded-md border p-3">
        <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        Payments are processed via Razorpay. Card/UPI details are managed within the Razorpay checkout.
        We do not store payment credentials.
      </div>

      {/* Cancel dialog */}
      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Choose when to cancel your{' '}
              <strong>{subscription.planName ?? subscription.planCode}</strong> subscription.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Select
              value={effective}
              onValueChange={(v) => setEffective(v as CancelSubscriptionDto['effective'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="period_end">At end of billing period</SelectItem>
                <SelectItem value="immediate">Immediately</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)} disabled={cancelling}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              disabled={cancelling}
              onClick={async () => {
                try {
                  await cancel({ id: subscription.id, dto: { effective } })
                  toast.success('Subscription cancelled.')
                  setCancelOpen(false)
                  navigate('/billing')
                } catch {
                  toast.error('Cancellation failed.')
                }
              }}
            >
              {cancelling ? 'Cancelling…' : 'Confirm Cancellation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
