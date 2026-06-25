import { Progress } from '@/components/ui/progress'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import type { Path } from '@/types/path.types'

interface ProgressRow {
  userId: string
  displayName?: string
  path: Pick<Path, 'title'>
  percentageComplete: number
  stepsCompleted: number
  stepsTotal: number
  lastActivityAt?: string | null
}

interface ProgressTableProps {
  rows: ProgressRow[]
}

export function ProgressTable({ rows }: ProgressTableProps) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">No progress data.</p>
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Learner</TableHead>
            <TableHead>Path</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead className="hidden sm:table-cell">Steps</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={`${row.userId}-${row.path.title}`}>
              <TableCell className="text-sm font-medium">
                {row.displayName ?? row.userId.slice(0, 8) + '…'}
              </TableCell>
              <TableCell className="text-sm max-w-[200px]">
                <span className="truncate block">{row.path.title}</span>
              </TableCell>
              <TableCell className="min-w-[140px]">
                <div className="flex items-center gap-2">
                  <Progress value={row.percentageComplete} className="h-1.5 flex-1" />
                  <span className="text-xs tabular-nums text-muted-foreground w-8">
                    {row.percentageComplete}%
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground hidden sm:table-cell">
                {row.stepsCompleted}/{row.stepsTotal}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
