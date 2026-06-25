import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils/cn'
import type { Difficulty, ProblemDifficulty } from '@/types/content.types'
import { DIFFICULTY_LABELS, PROBLEM_DIFFICULTY_LABELS } from '@/types/content.types'

const difficultyStyles: Record<Difficulty, string> = {
  beginner: 'bg-green-100 text-green-700 border-0 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-blue-100 text-blue-700 border-0 dark:bg-blue-900/30 dark:text-blue-400',
  advanced: 'bg-orange-100 text-orange-700 border-0 dark:bg-orange-900/30 dark:text-orange-400',
  expert: 'bg-red-100 text-red-700 border-0 dark:bg-red-900/30 dark:text-red-400',
}

const problemDifficultyStyles: Record<ProblemDifficulty, string> = {
  easy: 'bg-green-100 text-green-700 border-0 dark:bg-green-900/30 dark:text-green-400',
  medium: 'bg-amber-100 text-amber-700 border-0 dark:bg-amber-900/30 dark:text-amber-400',
  hard: 'bg-red-100 text-red-700 border-0 dark:bg-red-900/30 dark:text-red-400',
}

interface DifficultyBadgeProps {
  difficulty: Difficulty | ProblemDifficulty
  variant?: 'room' | 'problem'
  className?: string
}

export function DifficultyBadge({ difficulty, variant = 'room', className }: DifficultyBadgeProps) {
  const label =
    variant === 'problem'
      ? PROBLEM_DIFFICULTY_LABELS[difficulty as ProblemDifficulty]
      : DIFFICULTY_LABELS[difficulty as Difficulty]

  const style =
    variant === 'problem'
      ? problemDifficultyStyles[difficulty as ProblemDifficulty]
      : difficultyStyles[difficulty as Difficulty]

  return (
    <Badge className={cn('text-xs font-medium', style, className)}>
      {label}
    </Badge>
  )
}
