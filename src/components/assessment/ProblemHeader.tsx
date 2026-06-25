import { Badge } from '@/components/ui/badge'
import { PROBLEM_DIFFICULTY_LABELS } from '@/types/content.types'
import type { Problem } from '@/types/content.types'

interface ProblemHeaderProps {
  problem: Problem
}

const difficultyClass: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400 border-0',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-0',
  hard: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400 border-0',
}

export function ProblemHeader({ problem }: ProblemHeaderProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-base font-semibold leading-snug">{problem.title}</h2>
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={`text-xs ${difficultyClass[problem.difficulty] ?? ''}`}>
          {PROBLEM_DIFFICULTY_LABELS[problem.difficulty] ?? problem.difficulty}
        </Badge>
        {problem.timeLimitMs && (
          <span className="text-xs text-muted-foreground">
            {problem.timeLimitMs}ms / {problem.memoryLimitMb}MB
          </span>
        )}
        {problem.topics.slice(0, 3).map((t) => (
          <Badge key={t} variant="outline" className="text-xs">
            {t}
          </Badge>
        ))}
      </div>
    </div>
  )
}
