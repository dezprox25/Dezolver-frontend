import { CheckCircle2, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrencyINR } from '@/types/billing.types'
import type { Plan, BillingCycle } from '@/types/billing.types'

const FEATURE_ROWS: Array<{ key: string; label: string }> = [
  { key: 'maxStudents', label: 'Students' },
  { key: 'maxFaculty', label: 'Faculty' },
  { key: 'assessments', label: 'Assessments' },
  { key: 'events_competitions', label: 'Events & Competitions' },
  { key: 'certificates', label: 'Certificates' },
  { key: 'paths', label: 'Learning Paths' },
  { key: 'analytics', label: 'Advanced Analytics' },
  { key: 'sso', label: 'SSO Integration' },
  { key: 'support', label: 'Support Level' },
]

interface PlanComparisonTableProps {
  plans: Plan[]
  billingCycle: BillingCycle
  currentPlanCode?: string
  onSelect?: (plan: Plan) => void
}

export function PlanComparisonTable({
  plans,
  billingCycle,
  currentPlanCode,
  onSelect,
}: PlanComparisonTableProps) {
  const sorted = [...plans].sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 pr-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground w-36">
              Feature
            </th>
            {sorted.map((plan) => (
              <th key={plan.id} className="py-3 px-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-semibold">{plan.name}</span>
                  <span className="text-muted-foreground text-xs">
                    {formatCurrencyINR(billingCycle === 'annual' ? plan.pricing.annual : plan.pricing.monthly)}
                    /{billingCycle === 'annual' ? 'yr' : 'mo'}
                  </span>
                  {plan.code === currentPlanCode ? (
                    <Badge variant="outline" className="text-[10px] border-emerald-500 text-emerald-700">Current</Badge>
                  ) : onSelect ? (
                    <button
                      className="text-[10px] text-primary hover:underline"
                      onClick={() => onSelect(plan)}
                    >
                      Select
                    </button>
                  ) : null}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {FEATURE_ROWS.map((row) => (
            <tr key={row.key} className="hover:bg-muted/20">
              <td className="py-2 pr-4 text-xs text-muted-foreground">{row.label}</td>
              {sorted.map((plan) => {
                const val = plan.features[row.key]
                return (
                  <td key={plan.id} className="py-2 px-3 text-center">
                    {typeof val === 'boolean' ? (
                      val
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" aria-label="Included" />
                        : <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" aria-label="Not included" />
                    ) : typeof val === 'number' ? (
                      <span className="text-xs font-medium">{val.toLocaleString('en-IN')}</span>
                    ) : typeof val === 'string' ? (
                      <span className="text-xs capitalize">{val}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground/40">—</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
