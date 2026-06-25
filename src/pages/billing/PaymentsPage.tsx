import { useNavigate } from 'react-router-dom'
import { RefreshCw, CreditCard, ChevronRight } from 'lucide-react'
import { usePayments } from '@/hooks/usePayments'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import { PAYMENT_STATUS_LABELS } from '@/types/billing.types'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'

const STATUS_CLASSES: Record<string, string> = {
  captured: 'border-emerald-500 text-emerald-700',
  failed: 'border-red-400 text-red-600',
  refunded: 'border-slate-400 text-slate-600',
  partially_refunded: 'border-amber-400 text-amber-700',
  pending: 'border-slate-300 text-slate-500',
}

export function PaymentsPage() {
  const navigate = useNavigate()
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    usePayments()

  const payments = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment History"
        description="All payment transactions on your account."
        actions={
          <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-48 rounded-lg" />
      ) : isError ? (
        <EmptyState
          title="Failed to load payments"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-8 w-8 text-muted-foreground/50" />}
          title="No payments yet"
          description="Your payment history will appear here."
        />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow
                  key={payment.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => navigate(`/billing/payments/${payment.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/billing/payments/${payment.id}`)
                    }
                  }}
                >
                  <TableCell className="font-mono text-xs">
                    {payment.razorpayPaymentId ?? payment.id.slice(0, 8) + '…'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs ${STATUS_CLASSES[payment.status] ?? ''}`}
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
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell whitespace-nowrap">
                    {formatDate(payment.createdAt)}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Load more
          </Button>
        </div>
      )}
    </div>
  )
}
