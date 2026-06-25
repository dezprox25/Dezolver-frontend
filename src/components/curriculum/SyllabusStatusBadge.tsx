import { Badge } from '@/components/ui/badge'
import { SYLLABUS_STATUS_LABELS } from '@/types/curriculum.types'
import type { SyllabusStatus } from '@/types/curriculum.types'

const VARIANT_MAP: Record<SyllabusStatus, string> = {
  draft: 'border-slate-300 text-slate-500',
  published: 'border-emerald-500 text-emerald-700',
  archived: 'border-slate-400 text-slate-500',
}

export function SyllabusStatusBadge({ status }: { status: SyllabusStatus }) {
  return (
    <Badge variant="outline" className={`text-xs ${VARIANT_MAP[status] ?? ''}`}>
      {SYLLABUS_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
