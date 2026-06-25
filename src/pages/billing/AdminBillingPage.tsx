import { useState } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'
import { usePayments, usePayouts } from '@/hooks/usePayments'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { PayoutTable } from '@/components/billing/PayoutTable'
import { RefundDialog } from '@/components/billing/RefundDialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils/format'
import { PAYMENT_STATUS_LABELS } from '@/types/billing.types'
import type { Payment } from '@/types/billing.types'

function PaymentsRefundTab() {
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null)
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = usePayments()

  const payments = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Issue refunds for captured payments. Only platform admins can trigger refunds.
        </p>
        <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3">
        <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          Refunds are processed via Razorpay and typically reflect within 5–7 business days.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 rounded-lg" />
      ) : isError ? (
        <EmptyState
          title="Failed to load payments"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : payments.length === 0 ? (
        <EmptyState title="No payments found" description="Payment records will appear here." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-xs">
                    {payment.razorpayPaymentId ?? payment.id.slice(0, 8) + '…'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        payment.status === 'captured'
                          ? 'border-emerald-500 text-emerald-700'
                          : payment.status === 'failed'
                          ? 'border-red-400 text-red-600'
                          : payment.status === 'refunded'
                          ? 'border-slate-400 text-slate-600'
                          : 'border-slate-300 text-slate-500'
                      }`}
                    >
                      {PAYMENT_STATUS_LABELS[payment.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm capitalize hidden md:table-cell">
                    {payment.method ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formatCurrency(payment.amountInr, 'INR')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                    {formatDate(payment.createdAt)}
                  </TableCell>
                  <TableCell>
                    {payment.status === 'captured' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => setRefundTarget(payment)}
                      >
                        Refund
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Load more
          </Button>
        </div>
      )}

      {refundTarget && (
        <RefundDialog
          open={!!refundTarget}
          onOpenChange={(open) => { if (!open) setRefundTarget(null) }}
          payment={refundTarget}
          onSuccess={() => setRefundTarget(null)}
        />
      )}
    </div>
  )
}

function PayoutsTab() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = usePayouts()

  const payouts = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Monthly college payouts. Initiate NEFT transfers for pending settlements.
        </p>
        <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 rounded-lg" />
      ) : isError ? (
        <EmptyState
          title="Failed to load payouts"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : (
        <PayoutTable payouts={payouts} />
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}

export function AdminBillingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing Administration"
        description="Manage college payouts and issue refunds."
      />

      <Tabs defaultValue="payouts">
        <TabsList>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts" className="mt-4">
          <PayoutsTab />
        </TabsContent>

        <TabsContent value="refunds" className="mt-4">
          <PaymentsRefundTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
