import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { InvoiceStatus } from '@/types/billing.types'
import { INVOICE_STATUS_LABELS } from '@/types/billing.types'

const statusStyles: Record<InvoiceStatus, string> = {
  draft: 'border-slate-300 text-slate-500',
  issued: 'border-blue-400 text-blue-600',
  paid: 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20',
  void: 'border-slate-300 text-slate-400 line-through opacity-60',
  uncollectible: 'border-red-300 text-red-500',
}

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus
  className?: string
}

export function InvoiceStatusBadge({ status, className }: InvoiceStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium', statusStyles[status], className)}
    >
      {INVOICE_STATUS_LABELS[status]}
    </Badge>
  )
}
