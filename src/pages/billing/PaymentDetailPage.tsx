import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { usePayment } from '@/hooks/usePayments'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatDateTime } from '@/lib/utils/format'
import { PAYMENT_STATUS_LABELS } from '@/types/billing.types'

const STATUS_CLASSES: Record<string, string> = {
  captured: 'border-emerald-500 text-emerald-700',
  failed: 'border-red-400 text-red-600',
  refunded: 'border-slate-400 text-slate-600',
  partially_refunded: 'border-amber-400 text-amber-700',
  pending: 'border-slate-300 text-slate-500',
}

export function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: payment, isLoading, isError } = usePayment(id)

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    )
  }

  if (isError || !payment) {
    return (
      <EmptyState
        title="Payment not found"
        action={
          <Button variant="outline" onClick={() => navigate('/billing/payments')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
    )
  }

  const rows: Array<{ label: string; value: React.ReactNode }> = [
    {
      label: 'Internal ID',
      value: <span className="font-mono text-xs">{payment.id}</span>,
    },
    ...(payment.razorpayPaymentId
      ? [{
          label: 'Razorpay Payment ID',
          value: (
            <span className="font-mono text-xs flex items-center gap-1">
              {payment.razorpayPaymentId}
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
            </span>
          ),
        }]
      : []),
    ...(payment.razorpayOrderId
      ? [{
          label: 'Razorpay Order ID',
          value: <span className="font-mono text-xs">{payment.razorpayOrderId}</span>,
        }]
      : []),
    {
      label: 'Status',
      value: (
        <Badge
          variant="outline"
          className={`text-xs ${STATUS_CLASSES[payment.status] ?? ''}`}
        >
          {PAYMENT_STATUS_LABELS[payment.status]}
        </Badge>
      ),
    },
    {
      label: 'Amount',
      value: <span className="font-semibold">{formatCurrency(payment.amountInr, 'INR')}</span>,
    },
    ...(payment.method
      ? [{ label: 'Method', value: <span className="capitalize">{payment.method}</span> }]
      : []),
    {
      label: 'Created',
      value: formatDateTime(payment.createdAt),
    },
    ...(payment.capturedAt
      ? [{ label: 'Captured', value: formatDateTime(payment.capturedAt) }]
      : []),
    ...(payment.invoiceId
      ? [{
          label: 'Invoice',
          value: (
            <Button
              variant="link"
              className="h-auto p-0 text-xs"
              onClick={() => navigate(`/billing/invoices/${payment.invoiceId}`)}
            >
              View Invoice
            </Button>
          ),
        }]
      : []),
  ]

  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader
        title="Payment Detail"
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/billing/payments')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            {rows.map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-4 text-sm">
                <dt className="text-muted-foreground shrink-0">{label}</dt>
                <dd className="text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
