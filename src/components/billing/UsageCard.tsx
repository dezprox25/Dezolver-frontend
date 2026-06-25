import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UsageMeter } from './UsageMeter'
import type { Plan, Subscription } from '@/types/billing.types'

interface UsageData {
  students: number
  faculty: number
  assessments?: number
  events?: number
}

interface UsageCardProps {
  subscription: Subscription
  plan: Plan | null
  usage: UsageData
}

export function UsageCard({ subscription, plan, usage }: UsageCardProps) {
  const limits = plan?.features

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Plan Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <UsageMeter
          label="Students"
          used={usage.students}
          limit={limits?.maxStudents ?? null}
        />
        <UsageMeter
          label="Faculty"
          used={usage.faculty}
          limit={limits?.maxFaculty ?? null}
        />
        {usage.assessments != null && (
          <UsageMeter
            label="Assessments"
            used={usage.assessments}
            limit={null}
          />
        )}
        {usage.events != null && (
          <UsageMeter
            label="Events"
            used={usage.events}
            limit={null}
          />
        )}
        <p className="text-xs text-muted-foreground">
          Plan: <strong>{subscription.planName ?? subscription.planCode}</strong>
        </p>
      </CardContent>
    </Card>
  )
}
