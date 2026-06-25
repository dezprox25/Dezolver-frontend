import { useState } from 'react'
import { toast } from 'sonner'
import { Play, RefreshCw } from 'lucide-react'
import { useInitiatePayout } from '@/hooks/usePayments'
import { formatCurrency } from '@/lib/utils/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PAYOUT_STATUS_LABELS } from '@/types/billing.types'
import type { CollegePayout, PayoutStatus } from '@/types/billing.types'

const STATUS_VARIANTS: Record<PayoutStatus, string> = {
  pending: 'border-amber-400 text-amber-700',
  processing: 'border-blue-400 text-blue-700',
  completed: 'border-emerald-500 text-emerald-700',
  failed: 'border-red-400 text-red-600',
}

interface PayoutTableProps {
  payouts: CollegePayout[]
}

export function PayoutTable({ payouts }: PayoutTableProps) {
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const { mutateAsync: initiate, isPending } = useInitiatePayout()

  const handleInitiate = async () => {
    if (!confirmId) return
    try {
      await initiate({ id: confirmId })
      toast.success('Payout initiated successfully.')
    } catch {
      toast.error('Failed to initiate payout.')
    } finally {
      setConfirmId(null)
    }
  }

  if (payouts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">No payouts found.</p>
    )
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="hidden md:table-cell">Gross</TableHead>
              <TableHead className="hidden md:table-cell">Platform Fee</TableHead>
              <TableHead className="hidden lg:table-cell">Refunded</TableHead>
              <TableHead>Net</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {payouts.map((payout) => (
              <TableRow key={payout.id}>
                <TableCell className="text-sm font-medium truncate max-w-[120px]">
                  {payout.tenantName ?? payout.tenantId.slice(0, 8) + '…'}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {payout.periodMonth}
                </TableCell>
                <TableCell className="text-sm hidden md:table-cell">
                  {formatCurrency(payout.grossInr, 'INR')}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                  -{formatCurrency(payout.platformFeeInr, 'INR')}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                  {payout.refundedInr > 0 ? `-${formatCurrency(payout.refundedInr, 'INR')}` : '—'}
                </TableCell>
                <TableCell className="text-sm font-semibold">
                  {formatCurrency(payout.netInr, 'INR')}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs ${STATUS_VARIANTS[payout.status]}`}
                  >
                    {PAYOUT_STATUS_LABELS[payout.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {payout.status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setConfirmId(payout.id)}
                      disabled={isPending}
                    >
                      <Play className="mr-1 h-3 w-3" />
                      Initiate
                    </Button>
                  )}
                  {payout.status === 'processing' && (
                    <RefreshCw className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!confirmId} onOpenChange={(open) => { if (!open && !isPending) setConfirmId(null) }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Initiate Payout</DialogTitle>
            <DialogDescription>
              This will trigger a manual NEFT payout to the college. The action cannot be undone.
              Confirm to proceed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmId(null)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleInitiate} disabled={isPending}>
              {isPending ? 'Processing…' : 'Initiate Payout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
