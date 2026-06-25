import { Download, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { InvoiceStatusBadge } from './InvoiceStatusBadge'
import { useDownloadInvoice } from '@/hooks/useInvoices'
import { toast } from 'sonner'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import type { Invoice } from '@/types/billing.types'

interface InvoiceTableProps {
  invoices: Invoice[]
  showDownload?: boolean
}

export function InvoiceTable({ invoices, showDownload = true }: InvoiceTableProps) {
  const navigate = useNavigate()
  const { mutateAsync: download } = useDownloadInvoice()

  if (invoices.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">No invoices yet.</p>
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead>Amount</TableHead>
            {showDownload && <TableHead className="w-16" />}
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv) => (
            <TableRow
              key={inv.id}
              role="button"
              tabIndex={0}
              className="cursor-pointer hover:bg-muted/30"
              onClick={() => navigate(`/billing/invoices/${inv.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate(`/billing/invoices/${inv.id}`)
                }
              }}
            >
              <TableCell className="text-sm font-mono text-xs">
                {inv.invoiceNumber ?? inv.id.slice(0, 8) + '…'}
              </TableCell>
              <TableCell>
                <InvoiceStatusBadge status={inv.status} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground hidden sm:table-cell whitespace-nowrap">
                {inv.issuedAt ? formatDate(inv.issuedAt) : '—'}
              </TableCell>
              <TableCell className="text-sm font-medium">
                {formatCurrency(inv.totalAmountInr ?? inv.amountInr, 'INR')}
              </TableCell>
              {showDownload && (
                <TableCell>
                  {inv.status === 'paid' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation()
                        download(inv.id).catch(() => toast.error('Download failed.'))
                      }}
                      aria-label={`Download invoice ${inv.invoiceNumber}`}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </TableCell>
              )}
              <TableCell>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
