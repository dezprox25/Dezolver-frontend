import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SUPPORTED_LANGUAGES } from '@/types/assessment.types'

interface LanguageSelectorProps {
  value: string
  onChange: (language: string) => void
  allowedLanguages?: string[]
  disabled?: boolean
  className?: string
}

export function LanguageSelector({
  value,
  onChange,
  allowedLanguages,
  disabled,
  className,
}: LanguageSelectorProps) {
  const options = allowedLanguages
    ? SUPPORTED_LANGUAGES.filter((l) => allowedLanguages.includes(l.value))
    : SUPPORTED_LANGUAGES

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className={className ?? 'w-36 h-8 text-xs'} aria-label="Select language">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((l) => (
          <SelectItem key={l.value} value={l.value}>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
