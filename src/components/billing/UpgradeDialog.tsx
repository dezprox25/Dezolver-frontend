import { useState } from 'react'
import { ArrowRight, AlertCircle, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useUpgradeSubscription } from '@/hooks/useBilling'
import { useRazorpayCheckout } from './RazorpayCheckout'
import { useAuthStore } from '@/store/authStore'
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge'
import { formatCurrencyINR } from '@/types/billing.types'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { Plan, Subscription } from '@/types/billing.types'

interface UpgradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentSubscription: Subscription
  targetPlan: Plan
  onSuccess: () => void
}

export function UpgradeDialog({
  open,
  onOpenChange,
  currentSubscription,
  targetPlan,
  onSuccess,
}: UpgradeDialogProps) {
  const user = useAuthStore((s) => s.user)
  const [orderId, setOrderId] = useState<string | undefined>(undefined)
  const [amountInr, setAmountInr] = useState<number | undefined>(undefined)
  const [step, setStep] = useState<'confirm' | 'processing'>('confirm')

  const { mutateAsync: upgrade, isPending } = useUpgradeSubscription()

  const isDowngrade =
    targetPlan.pricing.monthly < (currentSubscription.amountInr ?? Infinity)

  const { openCheckout } = useRazorpayCheckout({
    orderId,
    amountInr,
    description: `Dezolver ${targetPlan.name} — ${isDowngrade ? 'Downgrade' : 'Upgrade'}`,
    prefillName: user?.fullName,
    prefillEmail: user?.email,
    onSuccess: () => {
      toast.success(
        `${isDowngrade ? 'Downgrade' : 'Upgrade'} to ${targetPlan.name} submitted. Your plan will update once confirmed.`,
        { duration: 8000 }
      )
      setOrderId(undefined)
      setAmountInr(undefined)
      setStep('confirm')
      onSuccess()
    },
    onDismiss: () => {
      setOrderId(undefined)
      setAmountInr(undefined)
      setStep('confirm')
    },
  })

  const handleConfirm = async () => {
    setStep('processing')
    try {
      const res = await upgrade({
        id: currentSubscription.id,
        dto: { planCode: targetPlan.code },
      })

      if (res.razorpay?.orderId) {
        setOrderId(res.razorpay.orderId)
        setAmountInr(res.razorpay.amountInr)
        await openCheckout()
      } else {
        toast.success(`Plan changed to ${targetPlan.name}.`)
        onSuccess()
      }
    } catch {
      toast.error('Plan change failed. Please try again.')
      setStep('confirm')
    }
  }

  const handleClose = (open: boolean) => {
    if (!isPending) {
      setStep('confirm')
      onOpenChange(open)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            {isDowngrade ? 'Downgrade Plan' : 'Upgrade Plan'}
          </DialogTitle>
          <DialogDescription>
            {isDowngrade
              ? 'Your plan will be downgraded at the end of the current billing period.'
              : 'A pro-rated charge covers the remainder of your current billing period.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 rounded-lg border p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Current</p>
              <p className="text-sm font-medium">{currentSubscription.planName ?? currentSubscription.planCode}</p>
              <SubscriptionStatusBadge status={currentSubscription.status} />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 rounded-lg border border-primary/50 bg-primary/5 p-3 space-y-1">
              <p className="text-xs text-muted-foreground">New</p>
              <p className="text-sm font-medium text-primary">{targetPlan.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrencyINR(targetPlan.pricing.monthly)}/mo
              </p>
            </div>
          </div>

          <Separator />

          {!isDowngrade && (
            <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 p-3">
              <AlertCircle className="h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                A pro-rated Razorpay payment will be created for the remaining days in your
                billing period. Your plan activates after payment confirmation.
              </p>
            </div>
          )}

          {isDowngrade && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-3">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Your current plan remains active until the end of the billing period. No
                refund is issued for unused time.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isPending || step === 'processing'}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isPending || step === 'processing'}
            variant={isDowngrade ? 'destructive' : 'default'}
          >
            {isPending || step === 'processing'
              ? 'Processing…'
              : isDowngrade
              ? 'Confirm Downgrade'
              : 'Proceed to Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
