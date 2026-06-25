import { CreditCard, Smartphone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PaymentMethod } from '@/types/billing.types'

const METHOD_LABELS: Record<PaymentMethod, string> = {
  card: 'Card',
  upi: 'UPI',
  netbanking: 'Net Banking',
  wallet: 'Wallet',
  emi: 'EMI',
}

interface PaymentMethodCardProps {
  method: PaymentMethod
  detail?: string
  isDefault?: boolean
}

export function PaymentMethodCard({ method, detail, isDefault }: PaymentMethodCardProps) {
  const Icon = method === 'upi' ? Smartphone : CreditCard

  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{METHOD_LABELS[method]}</span>
            {isDefault && (
              <Badge variant="secondary" className="text-[10px]">Default</Badge>
            )}
          </div>
          {detail && <p className="text-xs text-muted-foreground">{detail}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
