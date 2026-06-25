import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrencyINR } from '@/types/billing.types'

interface RevenueCardProps {
  title: string
  amountInr: number
  subtitle?: string
  trend?: number
}

export function RevenueCard({ title, amountInr, subtitle, trend }: RevenueCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">{formatCurrencyINR(amountInr)}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {trend != null && (
            <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
              {trend >= 0 ? '+' : ''}{trend}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
