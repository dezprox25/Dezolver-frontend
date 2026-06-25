import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDateTime } from '@/lib/utils/format'
import type { JudgeRun } from '@/types/assessment.types'

interface JudgeRunCardProps {
  judgeRun: JudgeRun
}

export function JudgeRunCard({ judgeRun }: JudgeRunCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Judge Run #{judgeRun.attemptNumber}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-4">
          {judgeRun.startedAt && (
            <div>
              <dt className="text-xs text-muted-foreground">Started</dt>
              <dd>{formatDateTime(judgeRun.startedAt)}</dd>
            </div>
          )}
          {judgeRun.completedAt && (
            <div>
              <dt className="text-xs text-muted-foreground">Completed</dt>
              <dd>{formatDateTime(judgeRun.completedAt)}</dd>
            </div>
          )}
        </dl>
        <Separator className="mb-4" />
        <JudgeResultPanel judgeRun={judgeRun} />
      </CardContent>
    </Card>
  )
}

interface JudgeResultPanelProps {
  judgeRun: JudgeRun
}

export function JudgeResultPanel({ judgeRun }: JudgeResultPanelProps) {
  return (
    <ScrollArea className="h-60">
      <pre className="text-xs font-mono p-2 bg-muted/40 rounded whitespace-pre-wrap">
        {JSON.stringify(judgeRun.rawResponse ?? judgeRun.testCaseResults, null, 2)}
      </pre>
    </ScrollArea>
  )
}
