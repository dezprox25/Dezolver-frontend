import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { usePlans, useCreateSubscription, useTenantSubscription } from '@/hooks/useBilling'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { PlanCard } from '@/components/billing/PlanCard'
import { PlanComparisonTable } from '@/components/billing/PlanComparisonTable'
import { UpgradeDialog } from '@/components/billing/UpgradeDialog'
import { useRazorpayCheckout } from '@/components/billing/RazorpayCheckout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Plan, BillingCycle, CreateSubscriptionResponse } from '@/types/billing.types'

export function PlansPage() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [pendingPlan, setPendingPlan] = useState<string | null>(null)
  const [checkoutData, setCheckoutData] = useState<CreateSubscriptionResponse | null>(null)
  const [upgradeTarget, setUpgradeTarget] = useState<Plan | null>(null)
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)

  const appliesTo = user?.tenantKind === 'direct' ? 'direct' : 'college'
  const { data: plans, isLoading, isError, refetch } = usePlans(appliesTo)
  const { data: currentSub } = useTenantSubscription(user?.tenantId ?? undefined)
  const { mutateAsync: createSubscription } = useCreateSubscription()

  const hasActiveSub =
    !!currentSub && !['expired', 'cancelled'].includes(currentSub.status)

  const { openCheckout } = useRazorpayCheckout({
    orderId: checkoutData?.razorpay.orderId,
    subscriptionId: checkoutData?.razorpay.subscriptionId,
    amountInr: checkoutData?.amountInr,
    description: `Dezolver ${plans?.find((p) => p.code === pendingPlan)?.name ?? 'Subscription'}`,
    prefillName: user?.fullName,
    prefillEmail: user?.email,
    onSuccess: () => {
      toast.success(
        'Payment received. Your subscription will activate once confirmed by our system.',
        { duration: 8000 }
      )
      setPendingPlan(null)
      setCheckoutData(null)
    },
    onDismiss: () => {
      setPendingPlan(null)
      setCheckoutData(null)
    },
  })

  const handleNewSubscription = async (plan: Plan) => {
    if (!user?.tenantId) {
      toast.error('Could not determine your tenant. Please reload.')
      return
    }
    try {
      setPendingPlan(plan.code)
      const res = await createSubscription({
        planCode: plan.code,
        tenantId: user.tenantId,
        billingCycle,
      })
      setCheckoutData(res)
      await openCheckout()
    } catch {
      setPendingPlan(null)
      setCheckoutData(null)
      toast.error('Failed to initiate payment. Please try again.')
    }
  }

  const handleSelectPlan = (plan: Plan) => {
    if (hasActiveSub) {
      setUpgradeTarget(plan)
      setUpgradeDialogOpen(true)
    } else {
      handleNewSubscription(plan)
    }
  }

  const currentPlanCode = currentSub?.planCode

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !plans?.length) {
    return (
      <EmptyState
        title="No plans available"
        description="Contact support to set up your subscription."
        action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
      />
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Choose a Plan"
        description="Select the right plan for your institution."
        actions={
          hasActiveSub ? (
            <Button variant="outline" size="sm" onClick={() => navigate('/billing')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Billing
            </Button>
          ) : undefined
        }
      />

      <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          <strong>Note:</strong> Subscription activation after payment may require up to a few
          minutes. Contact support if your plan does not activate within 24 hours.
        </p>
      </div>

      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-lg border p-1">
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'annual'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setBillingCycle('annual')}
          >
            Annual
            <span className="ml-1.5 text-[10px] text-emerald-600 font-semibold">Save ~17%</span>
          </button>
        </div>
      </div>

      <Tabs defaultValue="cards">
        <TabsList>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
                isCurrentPlan={plan.code === currentPlanCode}
                isFeatured={i === 1}
                onSelect={() => handleSelectPlan(plan)}
                loading={pendingPlan === plan.code}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compare" className="mt-4">
          <div className="rounded-lg border p-4">
            <PlanComparisonTable
              plans={plans}
              billingCycle={billingCycle}
              currentPlanCode={currentPlanCode}
              onSelect={handleSelectPlan}
            />
          </div>
        </TabsContent>
      </Tabs>

      {upgradeTarget && currentSub && (
        <UpgradeDialog
          open={upgradeDialogOpen}
          onOpenChange={setUpgradeDialogOpen}
          currentSubscription={currentSub}
          targetPlan={upgradeTarget}
          onSuccess={() => {
            setUpgradeDialogOpen(false)
            setUpgradeTarget(null)
            navigate('/billing')
          }}
        />
      )}
    </div>
  )
}
