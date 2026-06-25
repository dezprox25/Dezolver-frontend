import type { QuickAction } from '@/types/dashboard.types'
import { QuickActionCard } from './QuickActionCard'
import { cn } from '@/lib/utils/cn'

interface QuickActionGridProps {
  actions: QuickAction[]
  className?: string
}

export function QuickActionGrid({ actions, className }: QuickActionGridProps) {
  if (actions.length === 0) return null

  return (
    <div className={cn('grid gap-3 grid-cols-1 sm:grid-cols-2', className)}>
      {actions.map((action) => (
        <QuickActionCard key={action.id} action={action} />
      ))}
    </div>
  )
}
