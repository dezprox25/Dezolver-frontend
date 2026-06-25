import { useNavigate } from 'react-router-dom'
import { Clock, ChevronRight, FileText } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AssessmentStatusBadge } from './AssessmentStatusBadge'
import { formatRelativeTime } from '@/lib/utils/format'
import { ASSESSMENT_KIND_LABELS } from '@/types/assessment.types'
import type { Assessment } from '@/types/assessment.types'

interface AssessmentTableProps {
  assessments: Assessment[]
}

export function AssessmentTable({ assessments }: AssessmentTableProps) {
  const navigate = useNavigate()

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden md:table-cell">Time Limit</TableHead>
            <TableHead className="hidden lg:table-cell">Created</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.map((a) => (
            <TableRow
              key={a.id}
              role="button"
              tabIndex={0}
              className="cursor-pointer hover:bg-muted/30"
              onClick={() => navigate(`/assessments/${a.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate(`/assessments/${a.id}`)
                }
              }}
            >
              <TableCell className="font-medium text-sm max-w-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" aria-hidden="true" />
                  <span className="truncate">{a.title}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-xs">
                  {ASSESSMENT_KIND_LABELS[a.kind]}
                </Badge>
              </TableCell>
              <TableCell>
                <AssessmentStatusBadge status={a.status ?? 'draft'} />
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                {a.timeLimitMinutes ?? a.config?.timeLimitMinutes ? (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {a.timeLimitMinutes ?? a.config?.timeLimitMinutes}m
                  </span>
                ) : '—'}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground whitespace-nowrap">
                {formatRelativeTime(a.createdAt)}
              </TableCell>
              <TableCell>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40" aria-hidden="true" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
