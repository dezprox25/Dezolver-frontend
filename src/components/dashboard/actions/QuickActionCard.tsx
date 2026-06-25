import { useNavigate } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { QuickAction } from '@/types/dashboard.types'

interface QuickActionCardProps {
  action: QuickAction
}

export function QuickActionCard({ action }: QuickActionCardProps) {
  const navigate = useNavigate()
  const { label, description, icon: Icon, href, onClick, comingSoon } = action

  const handleClick = () => {
    if (comingSoon) return
    if (onClick) {
      onClick()
    } else if (href) {
      navigate(href)
    }
  }

  return (
    <Card
      role={comingSoon ? undefined : 'button'}
      tabIndex={comingSoon ? undefined : 0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className={cn(
        'group relative transition-all',
        comingSoon
          ? 'cursor-default opacity-60'
          : 'cursor-pointer hover:shadow-md hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50'
      )}
    >
      <CardContent className="flex items-start gap-3 pt-4 pb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
          <Icon className="h-4.5 w-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium leading-tight truncate">{label}</p>
            {comingSoon && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0 gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                Soon
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{description}</p>
        </div>
        {!comingSoon && (
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 mt-0.5 group-hover:text-primary transition-colors" />
        )}
      </CardContent>
    </Card>
  )
}
