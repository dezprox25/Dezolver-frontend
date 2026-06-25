import { CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'

interface CompletionBadgeProps {
  label?: string
  className?: string
}

export function CompletionBadge({
  label = 'Completed',
  className,
}: CompletionBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'text-xs font-medium gap-1.5 border-emerald-500 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20',
        className
      )}
    >
      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
      {label}
    </Badge>
  )
}
