import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { ReactNode } from 'react'

interface BulkAction {
  label: string
  icon?: React.ElementType
  onClick: () => void
  variant?: 'default' | 'destructive' | 'outline'
  disabled?: boolean
}

interface BulkActionToolbarProps {
  selectedCount: number
  onClearSelection: () => void
  actions: BulkAction[]
  className?: string
  children?: ReactNode
}

export function BulkActionToolbar({
  selectedCount,
  onClearSelection,
  actions,
  className,
  children,
}: BulkActionToolbarProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-lg border bg-primary/5 border-primary/20 px-4 py-2',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClearSelection}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
        <span className="text-sm font-medium">
          {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        {children}
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Button
              key={action.label}
              variant={action.variant ?? 'outline'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {Icon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
              {action.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
