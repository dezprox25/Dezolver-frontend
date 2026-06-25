import { useState, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface SearchInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
  debounceMs?: number
}

export function SearchInput({
  placeholder = 'Search...',
  value,
  onChange,
  className,
  debounceMs = 300,
}: SearchInputProps) {
  const [internal, setInternal] = useState(value ?? '')
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      setInternal(v)
      if (timer) clearTimeout(timer)
      const t = setTimeout(() => onChange?.(v), debounceMs)
      setTimer(t)
    },
    [timer, onChange, debounceMs]
  )

  const handleClear = () => {
    setInternal('')
    onChange?.('')
  }

  const displayed = value !== undefined ? value : internal

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={displayed}
        onChange={handleChange}
        className="pl-9 pr-9"
      />
      {displayed && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
          onClick={handleClear}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
