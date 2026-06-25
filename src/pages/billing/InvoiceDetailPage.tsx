import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useInvoice, useDownloadInvoice } from '@/hooks/useInvoices'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { InvoiceStatusBadge } from '@/components/billing/InvoiceStatusBadge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatCurrency } from '@/lib/utils/format'

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: invoice, isLoading, isError } = useInvoice(id)
  const { mutateAsync: download, isPending: downloading } = useDownloadInvoice()

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  if (isError || !invoice) {
    return (
      <EmptyState
        title="Invoice not found"
        action={
          <Button variant="outline" onClick={() => navigate('/billing/invoices')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6 max-w-xl">
      <PageHeader
        title={invoice.invoiceNumber ?? `Invoice ${invoice.id.slice(0, 8)}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/billing/invoices')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {invoice.status === 'paid' && (
              <Button
                size="sm"
                disabled={downloading}
                onClick={() =>
                  download(invoice.id).catch(() => toast.error('Download failed.'))
                }
              >
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>
        }
      />

      <div className="flex items-center gap-2">
        <InvoiceStatusBadge status={invoice.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {invoice.invoiceNumber && (
              <div>
                <dt className="text-xs text-muted-foreground mb-1">Invoice Number</dt>
                <dd className="font-mono text-xs">{invoice.invoiceNumber}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted-foreground mb-1">Status</dt>
              <dd><InvoiceStatusBadge status={invoice.status} /></dd>
            </div>
            {invoice.issuedAt && (
              <div>
                <dt className="text-xs text-muted-foreground mb-1">Issued</dt>
                <dd>{formatDate(invoice.issuedAt)}</dd>
              </div>
            )}
            {invoice.paidAt && (
              <div>
                <dt className="text-xs text-muted-foreground mb-1">Paid</dt>
                <dd>{formatDate(invoice.paidAt)}</dd>
              </div>
            )}
            {invoice.billingPeriodStart && invoice.billingPeriodEnd && (
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground mb-1">Billing Period</dt>
                <dd>
                  {formatDate(invoice.billingPeriodStart)} → {formatDate(invoice.billingPeriodEnd)}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Line items */}
      {invoice.lineItems && invoice.lineItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invoice.lineItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.description}</span>
                  <span className="font-medium">{formatCurrency(item.totalAmountInr, 'INR')}</span>
                </div>
              ))}
              <Separator className="my-2" />
              {invoice.taxAmountInr != null && invoice.taxAmountInr > 0 && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Tax (GST)</span>
                  <span>{formatCurrency(invoice.taxAmountInr, 'INR')}</span>
                </div>
              )}
              <div className="flex items-center justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(invoice.totalAmountInr ?? invoice.amountInr, 'INR')}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-start gap-2 text-xs text-muted-foreground rounded-md border p-3">
        <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
        Invoice PDF generation may return HTML content in the current backend version (same Puppeteer limitation as certificates).
      </div>
    </div>
  )
}
