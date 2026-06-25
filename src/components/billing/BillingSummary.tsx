import { CreditCard, Calendar, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import type { Subscription } from '@/types/billing.types'

interface BillingSummaryProps {
  subscription: Subscription
  onUpgrade?: () => void
  onCancel?: () => void
  onRetry?: () => void
}

export function BillingSummary({ subscription }: BillingSummaryProps) {
  const isPastDue = subscription.status === 'past_due'
  const isSuspended = subscription.status === 'suspended'

  return (
    <Card className={isPastDue || isSuspended ? 'border-amber-400' : ''}>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Current Subscription</span>
          <SubscriptionStatusBadge status={subscription.status} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {(isPastDue || isSuspended) && (
          <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs text-amber-700">
              {isPastDue && <p><strong>Payment overdue.</strong> Please retry payment to keep your subscription active.</p>}
              {isSuspended && <p><strong>Subscription suspended.</strong> Contact support to reactivate.</p>}
            </div>
          </div>
        )}

        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground mb-1">Plan</dt>
            <dd className="font-medium">{subscription.planName ?? subscription.planCode}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground mb-1">Billing Cycle</dt>
            <dd className="capitalize">{subscription.billingCycle}</dd>
          </div>
          {subscription.amountInr && (
            <div>
              <dt className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <CreditCard className="h-3 w-3" />
                Amount
              </dt>
              <dd>{formatCurrency(subscription.amountInr, 'INR')}</dd>
            </div>
          )}
          {subscription.currentPeriodEnd && (
            <div>
              <dt className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Renews
              </dt>
              <dd>{formatDate(subscription.currentPeriodEnd)}</dd>
            </div>
          )}
          {subscription.trialEndsAt && subscription.status === 'trial' && (
            <div>
              <dt className="text-xs text-muted-foreground mb-1">Trial Ends</dt>
              <dd>{formatDate(subscription.trialEndsAt)}</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  )
}
