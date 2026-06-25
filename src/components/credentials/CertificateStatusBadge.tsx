import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { CertificateStatus } from '@/types/certificate.types'
import { CERTIFICATE_STATUS_LABELS } from '@/types/certificate.types'
import { Loader2 } from 'lucide-react'

const statusStyles: Record<CertificateStatus, string> = {
  pending: 'border-amber-400 text-amber-600',
  issued: 'border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20',
  revoked: 'border-red-400 text-red-600 line-through opacity-70',
  generation_failed: 'border-red-300 text-red-500',
}

interface CertificateStatusBadgeProps {
  status: CertificateStatus
  className?: string
}

export function CertificateStatusBadge({ status, className }: CertificateStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn('text-xs font-medium gap-1', statusStyles[status], className)}
    >
      {status === 'pending' && <Loader2 className="h-3 w-3 animate-spin" />}
      {CERTIFICATE_STATUS_LABELS[status]}
    </Badge>
  )
}
