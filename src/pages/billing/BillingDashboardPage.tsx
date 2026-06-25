import { useNavigate } from 'react-router-dom'
import { CreditCard, RefreshCw, AlertTriangle, Receipt, History } from 'lucide-react'
import { toast } from 'sonner'
import { useTenantSubscription, useBillingUpdates, useRetryPayment } from '@/hooks/useBilling'
import { useInvoices } from '@/hooks/useInvoices'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { BillingSummary } from '@/components/billing/BillingSummary'
import { InvoiceTable } from '@/components/billing/InvoiceTable'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function BillingDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const {
    data: activeSubscription,
    isLoading: subLoading,
    refetch: refetchSub,
    isError: subError,
  } = useTenantSubscription(user?.tenantId ?? undefined)

  const {
    data: invoicesData,
    isLoading: invLoading,
  } = useInvoices({ limit: 5 })

  const { mutateAsync: retry, isPending: retrying } = useRetryPayment()

  useBillingUpdates((event) => {
    if (event.type === 'payment:failed') {
      toast.error('Payment failed. Please retry or update your payment method.')
    } else if (event.type === 'subscription:changed') {
      toast.info('Subscription status updated.')
    }
    refetchSub()
  })

  const invoices = invoicesData?.pages.flatMap((p) => p.items) ?? []
  const hasSubscription = !!activeSubscription && !subError

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Manage your subscription and payment history."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/billing/plans')}>
              <CreditCard className="mr-2 h-4 w-4" />
              {hasSubscription ? 'Change Plan' : 'View Plans'}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => refetchSub()} aria-label="Refresh">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      {subLoading ? (
        <Skeleton className="h-48 rounded-lg" />
      ) : hasSubscription ? (
        <div className="space-y-4">
          <BillingSummary subscription={activeSubscription} />

          {activeSubscription.status === 'past_due' && (
            <Button
              onClick={async () => {
                try {
                  await retry(activeSubscription.id)
                  toast.info('Payment retry initiated. Your subscription will activate once confirmed.')
                } catch {
                  toast.error('Retry failed. Please try again.')
                }
              }}
              disabled={retrying}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              {retrying ? 'Processing…' : 'Retry Payment'}
            </Button>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/billing/subscription/${activeSubscription.id}`)}
            >
              Manage Subscription
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/billing/invoices')}
            >
              <Receipt className="mr-2 h-3.5 w-3.5" />
              Invoices
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/billing/payments')}
            >
              <History className="mr-2 h-3.5 w-3.5" />
              Payment History
            </Button>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<CreditCard className="h-8 w-8 text-muted-foreground/50" />}
          title="No active subscription"
          description="Choose a plan to unlock the full Dezolver platform for your institution."
          action={
            <Button onClick={() => navigate('/billing/plans')}>
              View Plans
            </Button>
          }
        />
      )}

      {/* Recent invoices */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Recent Invoices</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/billing/invoices')}>
              View all
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {invLoading ? (
            <Skeleton className="h-32 rounded-lg" />
          ) : invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No invoices yet.</p>
          ) : (
            <InvoiceTable invoices={invoices.slice(0, 5)} showDownload />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
