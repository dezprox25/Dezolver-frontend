import type { ProblemTestCase } from '@/types/content.types'

interface ProblemExamplesProps {
  testCases: ProblemTestCase[]
}

export function ProblemExamples({ testCases }: ProblemExamplesProps) {
  const samples = testCases.filter((tc) => tc.isSample)
  if (samples.length === 0) return null

  return (
    <div className="space-y-3">
      {samples.map((tc, i) => (
        <div key={tc.id} className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground">
            Example {i + 1}
            {tc.explanation && (
              <span className="font-normal ml-2 text-muted-foreground/70">
                {tc.explanation}
              </span>
            )}
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-muted-foreground mb-0.5">Input</p>
              <pre className="bg-muted/60 rounded px-2 py-1.5 font-mono overflow-x-auto whitespace-pre-wrap">
                {tc.input ?? '(empty)'}
              </pre>
            </div>
            <div>
              <p className="text-muted-foreground mb-0.5">Output</p>
              <pre className="bg-muted/60 rounded px-2 py-1.5 font-mono overflow-x-auto whitespace-pre-wrap">
                {tc.expectedOutput ?? '(empty)'}
              </pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
