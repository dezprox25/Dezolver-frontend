import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { XCircle } from 'lucide-react'
import { TRIGGER_LABELS } from '@/types/certificate.types'
import type { IssuanceRule } from '@/types/certificate.types'

interface IssuanceRuleTableProps {
  rules: IssuanceRule[]
  onDeactivate?: (rule: IssuanceRule) => void
}

export function IssuanceRuleTable({ rules, onDeactivate }: IssuanceRuleTableProps) {
  if (rules.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No issuance rules configured.
      </p>
    )
  }

  return (
    <div className="rounded-lg border divide-y">
      {rules.map((rule) => (
        <div key={rule.id} className="flex items-center gap-4 px-4 py-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-medium">
                {rule.name ?? TRIGGER_LABELS[rule.triggerEventType]}
              </p>
              <Badge
                variant={rule.isActive ? 'default' : 'secondary'}
                className="text-[10px]"
              >
                {rule.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
              <span>Trigger: {TRIGGER_LABELS[rule.triggerEventType]}</span>
              {rule.templateName && <span>Template: {rule.templateName}</span>}
            </div>
          </div>
          {onDeactivate && rule.isActive && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive shrink-0"
              onClick={() => onDeactivate(rule)}
              aria-label={`Deactivate rule ${rule.name ?? rule.id}`}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
