import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { AssessmentStatus, AssessmentKind } from '@/types/assessment.types'

interface AssessmentFiltersProps {
  status: AssessmentStatus | 'all'
  kind: AssessmentKind | 'all'
  onStatusChange: (status: AssessmentStatus | 'all') => void
  onKindChange: (kind: AssessmentKind | 'all') => void
}

export function AssessmentFilters({
  status,
  kind,
  onStatusChange,
  onKindChange,
}: AssessmentFiltersProps) {
  return (
    <>
      <Select
        value={status}
        onValueChange={(v) => onStatusChange(v as AssessmentStatus | 'all')}
      >
        <SelectTrigger className="w-36" aria-label="Filter by status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={kind}
        onValueChange={(v) => onKindChange(v as AssessmentKind | 'all')}
      >
        <SelectTrigger className="w-36" aria-label="Filter by type">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="coding_problem">Coding</SelectItem>
          <SelectItem value="mcq_single">MCQ Single</SelectItem>
          <SelectItem value="mcq_multi">MCQ Multi</SelectItem>
          <SelectItem value="short_answer">Short Answer</SelectItem>
        </SelectContent>
      </Select>
    </>
  )
}
