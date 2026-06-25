import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ProblemHeader } from './ProblemHeader'
import { ProblemExamples } from './ProblemExamples'
import type { Problem } from '@/types/content.types'

interface ProblemPanelProps {
  problem: Problem
}

export function ProblemPanel({ problem }: ProblemPanelProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4">
        <ProblemHeader problem={problem} />

        <Separator />

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Problem Statement
            </p>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{problem.statementMd}</p>
          </div>

          {problem.inputFormat && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Input Format</p>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">{problem.inputFormat}</p>
            </div>
          )}

          {problem.outputFormat && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Output Format</p>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground">{problem.outputFormat}</p>
            </div>
          )}

          {problem.constraints && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Constraints</p>
              <pre className="text-xs font-mono bg-muted/40 rounded p-2 whitespace-pre-wrap">
                {problem.constraints}
              </pre>
            </div>
          )}

          {problem.testCases && problem.testCases.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Examples
              </p>
              <ProblemExamples testCases={problem.testCases} />
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  )
}
