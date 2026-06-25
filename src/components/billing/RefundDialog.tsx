import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useIssueRefund } from '@/hooks/usePayments'
import { formatCurrency } from '@/lib/utils/format'
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Payment } from '@/types/billing.types'

const schema = z.object({
  amountInr: z.number().positive('Amount must be positive').optional(),
  reason: z.string().min(3, 'Reason is required').max(100, 'Max 100 characters'),
})

type FormValues = z.infer<typeof schema>

interface RefundDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Payment
  onSuccess?: () => void
}

export function RefundDialog({ open, onOpenChange, payment, onSuccess }: RefundDialogProps) {
  const { mutateAsync: issueRefund, isPending } = useIssueRefund()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amountInr: undefined,
      reason: '',
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await issueRefund({
        paymentId: payment.id,
        amountInr: values.amountInr,
        reason: values.reason,
      })
      toast.success('Refund issued successfully.')
      form.reset()
      onOpenChange(false)
      onSuccess?.()
    } catch {
      toast.error('Failed to issue refund. Please try again.')
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!isPending) {
      form.reset()
      onOpenChange(open)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Issue Refund</DialogTitle>
          <DialogDescription>
            Refund for payment{' '}
            <span className="font-mono text-xs">
              {payment.razorpayPaymentId ?? payment.id.slice(0, 8)}
            </span>
            {' '}— max {formatCurrency(payment.amountInr, 'INR')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amountInr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (INR)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min={1}
                      max={payment.amountInr}
                      placeholder={`Max ${payment.amountInr}`}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? Number(e.target.value) : undefined)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Leave blank for full refund of {formatCurrency(payment.amountInr, 'INR')}.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Duplicate payment, customer request…"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? 'Processing…' : 'Issue Refund'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
