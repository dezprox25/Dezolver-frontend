import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

interface StatCardProps {
  label: string
  value: number | string
  icon?: LucideIcon
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  description?: string
  href?: string
  className?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  description,
  className,
}: StatCardProps) {
  const changeColors = {
    positive: 'text-emerald-600 dark:text-emerald-400',
    negative: 'text-destructive',
    neutral: 'text-muted-foreground',
  }

  const ChangeIcon =
    changeType === 'positive'
      ? ArrowUpRight
      : changeType === 'negative'
      ? ArrowDownRight
      : Minus

  return (
    <Card className={cn('transition-shadow hover:shadow-sm', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {(change || description) && (
          <p className="mt-1 flex items-center gap-1 text-xs">
            {change && (
              <span className={cn('flex items-center gap-0.5 font-medium', changeColors[changeType])}>
                <ChangeIcon className="h-3 w-3" />
                {change}
              </span>
            )}
            {description && (
              <span className="text-muted-foreground">{description}</span>
            )}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
