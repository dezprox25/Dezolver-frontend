import { Badge } from '@/components/ui/badge'
import { OPERATION_TYPE_LABELS } from '@/types/curriculum.types'
import type { OperationType } from '@/types/curriculum.types'

const VARIANT_MAP: Record<OperationType, string> = {
  hide_node: 'border-red-300 text-red-600',
  rename_node: 'border-blue-300 text-blue-600',
  remap_content: 'border-purple-300 text-purple-600',
  reorder_children: 'border-amber-300 text-amber-600',
  add_child_node: 'border-emerald-300 text-emerald-600',
}

export function OperationTypeBadge({ type }: { type: OperationType }) {
  return (
    <Badge variant="outline" className={`text-xs ${VARIANT_MAP[type] ?? 'border-slate-300 text-slate-500'}`}>
      {OPERATION_TYPE_LABELS[type] ?? type}
    </Badge>
  )
}
