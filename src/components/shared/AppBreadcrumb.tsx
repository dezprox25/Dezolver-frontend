import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import type { BreadcrumbItem } from '@/types/common.types'
import { cn } from '@/lib/utils/cn'

interface AppBreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function AppBreadcrumb({ items, className }: AppBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm', className)}>
      <Link
        to="/dashboard"
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          {item.href && i < items.length - 1 ? (
            <Link
              to={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
