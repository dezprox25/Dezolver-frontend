import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface LoadingStateProps {
  message?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export function LoadingState({ message = 'Loading...', className, size = 'md' }: LoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 py-12', className)}>
      <Loader2 className={cn('animate-spin text-muted-foreground', sizeMap[size])} />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  )
}
