import { Badge } from '@/components/ui/badge'
import { OVERLAY_STATUS_LABELS } from '@/types/curriculum.types'
import type { OverlayStatus } from '@/types/curriculum.types'

const VARIANT_MAP: Record<OverlayStatus, string> = {
  draft: 'border-slate-300 text-slate-500',
  active: 'border-emerald-500 text-emerald-700',
  archived: 'border-slate-400 text-slate-500',
}

export function OverlayStatusBadge({ status }: { status: OverlayStatus }) {
  return (
    <Badge variant="outline" className={`text-xs ${VARIANT_MAP[status] ?? ''}`}>
      {OVERLAY_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
