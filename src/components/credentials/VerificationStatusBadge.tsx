import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Lock, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { VerificationStatus } from '@/types/certificate.types'
import { VERIFICATION_STATUS_LABELS } from '@/types/certificate.types'

const statusConfig: Record<
  VerificationStatus,
  { icon: typeof CheckCircle2; className: string }
> = {
  valid: {
    icon: CheckCircle2,
    className: 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20',
  },
  revoked: {
    icon: XCircle,
    className: 'border-red-400 text-red-600 bg-red-50 dark:bg-red-950/20',
  },
  private: {
    icon: Lock,
    className: 'border-slate-400 text-slate-600',
  },
  not_found: {
    icon: HelpCircle,
    className: 'border-slate-300 text-slate-500',
  },
  expired: {
    icon: XCircle,
    className: 'border-orange-400 text-orange-600',
  },
}

interface VerificationStatusBadgeProps {
  status: VerificationStatus
  className?: string
}

export function VerificationStatusBadge({ status, className }: VerificationStatusBadgeProps) {
  const config = statusConfig[status]
  const Icon = config.icon
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium gap-1.5', config.className, className)}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      {VERIFICATION_STATUS_LABELS[status]}
    </Badge>
  )
}
