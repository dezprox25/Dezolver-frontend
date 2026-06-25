import type { FilterConfig } from '@/types/common.types'
import { SearchInput } from './SearchInput'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface FilterBarProps {
  filters: FilterConfig[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  onReset?: () => void
  className?: string
}

export function FilterBar({ filters, values, onChange, onReset, className }: FilterBarProps) {
  const hasActiveFilters = Object.values(values).some((v) => v !== '' && v !== undefined)

  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
      {filters.map((filter) => {
        if (filter.type === 'text') {
          return (
            <SearchInput
              key={filter.key}
              placeholder={filter.label}
              value={values[filter.key] ?? ''}
              onChange={(v) => onChange(filter.key, v)}
              className="w-48"
            />
          )
        }

        if (filter.type === 'select' && filter.options) {
          return (
            <Select
              key={filter.key}
              value={values[filter.key] ?? ''}
              onValueChange={(v) => onChange(filter.key, v)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                {filter.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }

        return null
      })}

      {hasActiveFilters && onReset && (
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground">
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  )
}
