import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

// ─── Grid Container ───────────────────────────────────────────────────────────

interface DashboardGridProps {
  /** Number of columns at the largest breakpoint. Default 4. */
  cols?: 1 | 2 | 3 | 4
  children: ReactNode
  className?: string
}

const colsClass: Record<NonNullable<DashboardGridProps['cols']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

export function DashboardGrid({ cols = 4, children, className }: DashboardGridProps) {
  return (
    <div className={cn('grid gap-4', colsClass[cols], className)}>
      {children}
    </div>
  )
}

// ─── Grid Item ────────────────────────────────────────────────────────────────

interface GridItemProps {
  /** Column span (1-4). Clamped to the parent grid's column count by CSS. */
  span?: 1 | 2 | 3 | 4
  children: ReactNode
  className?: string
}

const spanClass: Record<NonNullable<GridItemProps['span']>, string> = {
  1: 'col-span-1',
  2: 'col-span-1 sm:col-span-2',
  3: 'col-span-1 sm:col-span-2 lg:col-span-3',
  4: 'col-span-1 sm:col-span-2 lg:col-span-4',
}

export function GridItem({ span = 1, children, className }: GridItemProps) {
  return (
    <div className={cn(spanClass[span], className)}>
      {children}
    </div>
  )
}
