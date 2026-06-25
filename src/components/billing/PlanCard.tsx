import { CheckCircle2, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import { formatCurrencyINR } from '@/types/billing.types'
import type { Plan, BillingCycle } from '@/types/billing.types'

const FEATURE_LABELS: Record<string, string> = {
  events_competitions: 'Events & Competitions',
  assessments: 'Assessments & Judge',
  certificates: 'Certificate Issuance',
  analytics: 'Advanced Analytics',
  sso: 'SSO (SAML/OIDC)',
  paths: 'Learning Paths',
  curriculum: 'Curriculum Management',
}

interface PlanCardProps {
  plan: Plan
  billingCycle: BillingCycle
  isCurrentPlan?: boolean
  isFeatured?: boolean
  onSelect?: () => void
  loading?: boolean
}

export function PlanCard({
  plan,
  billingCycle,
  isCurrentPlan,
  isFeatured,
  onSelect,
  loading,
}: PlanCardProps) {
  const price = billingCycle === 'annual' ? plan.pricing.annual : plan.pricing.monthly
  const annualSaving = plan.pricing.monthly * 12 - plan.pricing.annual

  return (
    <Card
      className={cn(
        'relative flex flex-col',
        isFeatured && 'border-primary shadow-lg ring-1 ring-primary',
        isCurrentPlan && 'border-emerald-500 ring-1 ring-emerald-500'
      )}
    >
      {isFeatured && !isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground text-[10px] px-2 flex items-center gap-1">
            <Zap className="h-2.5 w-2.5" />
            Popular
          </Badge>
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-emerald-600 text-white text-[10px] px-2">Current Plan</Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <CardTitle className="text-base">{plan.name}</CardTitle>
        {plan.description && (
          <p className="text-xs text-muted-foreground">{plan.description}</p>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Pricing */}
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold">{formatCurrencyINR(price)}</span>
            <span className="text-xs text-muted-foreground">/{billingCycle === 'annual' ? 'yr' : 'mo'}</span>
          </div>
          {billingCycle === 'annual' && annualSaving > 0 && (
            <p className="text-xs text-emerald-600 mt-0.5">
              Save {formatCurrencyINR(annualSaving)} annually
            </p>
          )}
        </div>

        {/* Key limits */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {plan.features.maxStudents && (
            <p>Up to {plan.features.maxStudents.toLocaleString('en-IN')} students</p>
          )}
          {plan.features.maxFaculty && (
            <p>Up to {plan.features.maxFaculty} faculty</p>
          )}
          {plan.features.support && (
            <p className="capitalize">{plan.features.support} support</p>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-1.5 flex-1">
          {Object.entries(FEATURE_LABELS).map(([key, label]) => {
            const included = plan.features[key]
            return (
              <li
                key={key}
                className={cn(
                  'flex items-center gap-2 text-xs',
                  included ? 'text-foreground' : 'text-muted-foreground/40 line-through'
                )}
              >
                <CheckCircle2
                  className={cn(
                    'h-3.5 w-3.5 shrink-0',
                    included ? 'text-emerald-600' : 'text-muted-foreground/30'
                  )}
                />
                {label}
              </li>
            )
          })}
        </ul>

        {/* Action */}
        {!isCurrentPlan && onSelect && (
          <Button
            onClick={onSelect}
            disabled={loading}
            variant={isFeatured ? 'default' : 'outline'}
            className="w-full"
            size="sm"
          >
            {loading ? 'Processing…' : 'Choose Plan'}
          </Button>
        )}
        {isCurrentPlan && (
          <Button variant="outline" className="w-full" size="sm" disabled>
            Current Plan
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
