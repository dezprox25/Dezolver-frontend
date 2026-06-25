import type { TableColumn } from '@/types/common.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from './EmptyState'
import { cn } from '@/lib/utils/cn'

interface DataTableProps<TData extends Record<string, unknown>> {
  columns: TableColumn<TData>[]
  data: TData[]
  isLoading?: boolean
  emptyTitle?: string
  emptyDescription?: string
  className?: string
  rowKey?: keyof TData
}

export function DataTable<TData extends Record<string, unknown>>({
  columns,
  data,
  isLoading = false,
  emptyTitle,
  emptyDescription,
  className,
  rowKey,
}: DataTableProps<TData>) {
  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key as string}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.key as string}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="p-0">
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  className="py-12"
                />
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIdx) => (
              <TableRow key={rowKey ? String(row[rowKey]) : rowIdx}>
                {columns.map((col) => (
                  <TableCell key={col.key as string}>
                    {col.render
                      ? col.render(row)
                      : String(row[col.key as keyof TData] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
