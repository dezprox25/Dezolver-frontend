import { ChevronRight } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge'
import { formatDate, formatCurrency } from '@/lib/utils/format'
import type { Subscription } from '@/types/billing.types'

interface SubscriptionTableProps {
  subscriptions: Subscription[]
  onSelect?: (sub: Subscription) => void
}

export function SubscriptionTable({ subscriptions, onSelect }: SubscriptionTableProps) {
  if (subscriptions.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">No subscriptions.</p>
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Amount</TableHead>
            <TableHead className="hidden lg:table-cell">Renewal</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions.map((sub) => (
            <TableRow
              key={sub.id}
              role={onSelect ? 'button' : undefined}
              tabIndex={onSelect ? 0 : undefined}
              className={onSelect ? 'cursor-pointer hover:bg-muted/30' : ''}
              onClick={() => onSelect?.(sub)}
              onKeyDown={(e) => {
                if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault()
                  onSelect(sub)
                }
              }}
            >
              <TableCell className="text-sm font-medium">
                {sub.planName ?? sub.planCode}
              </TableCell>
              <TableCell>
                <SubscriptionStatusBadge status={sub.status} />
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm">
                {sub.amountInr ? formatCurrency(sub.amountInr, 'INR') : '—'}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground whitespace-nowrap">
                {sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : '—'}
              </TableCell>
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
