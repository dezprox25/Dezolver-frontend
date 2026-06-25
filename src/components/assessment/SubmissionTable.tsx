import { useNavigate } from 'react-router-dom'
import { ChevronRight, Clock, Cpu } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { VerdictBadge } from './VerdictBadge'
import { formatRelativeTime } from '@/lib/utils/format'
import type { Submission } from '@/types/assessment.types'

interface SubmissionTableProps {
  submissions: Submission[]
  showAssessment?: boolean
}

export function SubmissionTable({ submissions, showAssessment = true }: SubmissionTableProps) {
  const navigate = useNavigate()

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {showAssessment && <TableHead>Assessment</TableHead>}
            <TableHead>Verdict</TableHead>
            <TableHead className="hidden sm:table-cell">Score</TableHead>
            <TableHead className="hidden sm:table-cell">Language</TableHead>
            <TableHead className="hidden md:table-cell">Runtime</TableHead>
            <TableHead className="hidden md:table-cell">Memory</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((sub) => (
            <TableRow
              key={sub.id}
              role="button"
              tabIndex={0}
              className="cursor-pointer hover:bg-muted/30"
              onClick={() => navigate(`/submissions/${sub.id}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  navigate(`/submissions/${sub.id}`)
                }
              }}
            >
              {showAssessment && (
                <TableCell className="font-medium text-sm max-w-[160px]">
                  <span className="truncate block">
                    {sub.assessmentTitle ?? sub.assessmentId.slice(0, 8) + '…'}
                  </span>
                </TableCell>
              )}
              <TableCell>
                <VerdictBadge verdict={sub.verdict} />
              </TableCell>
              <TableCell className="hidden sm:table-cell text-sm">
                {sub.score != null ? `${sub.score}%` : '—'}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                {sub.language ? (
                  <Badge variant="secondary" className="text-xs">{sub.language}</Badge>
                ) : '—'}
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                {sub.executionTimeMs != null ? (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    {sub.executionTimeMs}ms
                  </span>
                ) : '—'}
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                {sub.memoryUsedKb != null ? (
                  <span className="flex items-center gap-1">
                    <Cpu className="h-3 w-3" aria-hidden="true" />
                    {(sub.memoryUsedKb / 1024).toFixed(1)}MB
                  </span>
                ) : '—'}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {formatRelativeTime(sub.submittedAt)}
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
