import { useState } from 'react'
import { Plus, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AssessmentQuestion } from '@/types/assessment.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genId(): string {
  return crypto.randomUUID()
}

function emptyQuestion(kind: AssessmentQuestion['kind']): AssessmentQuestion {
  return {
    id: genId(),
    kind,
    text: '',
    options: kind !== 'short_answer' ? [{ id: genId(), text: '' }] : undefined,
    correctOptionId: undefined,
    correctOptionIds: kind === 'mcq_multi' ? [] : undefined,
    weight: 1,
  }
}

// ─── Single question editor ───────────────────────────────────────────────────

interface QuestionEditorProps {
  question: AssessmentQuestion
  index: number
  onChange: (updated: AssessmentQuestion) => void
  onRemove: () => void
  partialCredit?: boolean
}

function QuestionEditor({ question, index, onChange, onRemove, partialCredit }: QuestionEditorProps) {
  const update = (patch: Partial<AssessmentQuestion>) => onChange({ ...question, ...patch })

  const addOption = () => {
    const opts = [...(question.options ?? []), { id: genId(), text: '' }]
    update({ options: opts })
  }

  const removeOption = (optId: string) => {
    const opts = question.options?.filter((o) => o.id !== optId) ?? []
    // Clear correct references pointing to removed option
    const correctOptionId =
      question.correctOptionId === optId ? undefined : question.correctOptionId
    const correctOptionIds = question.correctOptionIds?.filter((id) => id !== optId)
    update({ options: opts, correctOptionId, correctOptionIds })
  }

  const updateOptionText = (optId: string, text: string) => {
    update({
      options: question.options?.map((o) => (o.id === optId ? { ...o, text } : o)),
    })
  }

  const toggleCorrectSingle = (optId: string) => {
    update({ correctOptionId: question.correctOptionId === optId ? undefined : optId })
  }

  const toggleCorrectMulti = (optId: string) => {
    const prev = question.correctOptionIds ?? []
    const next = prev.includes(optId) ? prev.filter((id) => id !== optId) : [...prev, optId]
    update({ correctOptionIds: next })
  }

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {index + 1}
          </span>
          <Select
            value={question.kind}
            onValueChange={(v) =>
              update({
                kind: v as AssessmentQuestion['kind'],
                options: v !== 'short_answer' ? (question.options ?? [{ id: genId(), text: '' }]) : undefined,
                correctOptionId: undefined,
                correctOptionIds: v === 'mcq_multi' ? [] : undefined,
              })
            }
          >
            <SelectTrigger className="h-7 w-36 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mcq_single">Single Choice</SelectItem>
              <SelectItem value="mcq_multi">Multiple Choice</SelectItem>
              <SelectItem value="short_answer">Short Answer</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Label className="text-xs text-muted-foreground">Points</Label>
            <Input
              type="number"
              className="h-7 w-16 text-xs"
              min={1}
              value={question.weight ?? 1}
              onChange={(e) => update({ weight: Number(e.target.value) || 1 })}
            />
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onRemove}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <Textarea
          placeholder="Question text…"
          rows={2}
          value={question.text}
          onChange={(e) => update({ text: e.target.value })}
          className="text-sm"
        />

        {/* MCQ options */}
        {question.kind !== 'short_answer' && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Options
              {question.kind === 'mcq_single'
                ? ' (click circle to mark correct)'
                : ' (click circles to mark correct — multiple allowed)'}
              {partialCredit && question.kind === 'mcq_multi' && (
                <span className="ml-1 text-blue-600">(partial credit enabled)</span>
              )}
            </p>
            {(question.options ?? []).map((opt) => {
              const isCorrectSingle = question.correctOptionId === opt.id
              const isCorrectMulti = question.correctOptionIds?.includes(opt.id) ?? false
              const isMarked = question.kind === 'mcq_single' ? isCorrectSingle : isCorrectMulti
              return (
                <div key={opt.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    className={`shrink-0 rounded-full transition-colors ${isMarked ? 'text-emerald-600' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() =>
                      question.kind === 'mcq_single'
                        ? toggleCorrectSingle(opt.id)
                        : toggleCorrectMulti(opt.id)
                    }
                    title={isMarked ? 'Mark as incorrect' : 'Mark as correct'}
                  >
                    {isMarked ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Circle className="h-4 w-4" />
                    )}
                  </button>
                  <Input
                    className="flex-1 h-8 text-sm"
                    placeholder={`Option ${opt.id.slice(0, 4)}…`}
                    value={opt.text}
                    onChange={(e) => updateOptionText(opt.id, e.target.value)}
                  />
                  {(question.options?.length ?? 0) > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => removeOption(opt.id)}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              )
            })}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={addOption}
            >
              <Plus className="h-3 w-3 mr-1" /> Add option
            </Button>
          </div>
        )}

        {/* Short answer hint */}
        {question.kind === 'short_answer' && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Expected answer (for grading)</Label>
            <Input
              className="text-sm"
              placeholder="Correct answer text…"
              value={question.correctOptionId ?? ''}
              onChange={(e) => update({ correctOptionId: e.target.value })}
            />
            <p className="text-[10px] text-muted-foreground">
              Backend grading uses trimmed exact match (or Levenshtein tolerance if configured).
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Question builder ─────────────────────────────────────────────────────────

interface QuestionBuilderProps {
  questions: AssessmentQuestion[]
  onChange: (questions: AssessmentQuestion[]) => void
  partialCredit?: boolean
  onPartialCreditChange?: (enabled: boolean) => void
  disabled?: boolean
}

export function QuestionBuilder({
  questions,
  onChange,
  partialCredit,
  onPartialCreditChange,
  disabled,
}: QuestionBuilderProps) {
  const [defaultKind, setDefaultKind] = useState<AssessmentQuestion['kind']>('mcq_single')

  const addQuestion = () => {
    onChange([...questions, emptyQuestion(defaultKind)])
  }

  const updateQuestion = (idx: number, updated: AssessmentQuestion) => {
    onChange(questions.map((q, i) => (i === idx ? updated : q)))
  }

  const removeQuestion = (idx: number) => {
    onChange(questions.filter((_, i) => i !== idx))
  }

  const hasMulti = questions.some((q) => q.kind === 'mcq_multi')

  return (
    <div className="space-y-4">
      {/* Partial credit toggle (only relevant if any mcq_multi) */}
      {hasMulti && onPartialCreditChange && (
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">Partial credit for multi-select</p>
            <p className="text-xs text-muted-foreground">
              Award points for each correct option selected (not all-or-nothing).
            </p>
          </div>
          <Switch
            checked={partialCredit ?? false}
            onCheckedChange={onPartialCreditChange}
            disabled={disabled}
          />
        </div>
      )}

      {/* Question list */}
      {questions.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No questions yet. Add your first question below.
          </p>
        </div>
      )}

      {questions.map((q, idx) => (
        <QuestionEditor
          key={q.id}
          question={q}
          index={idx}
          onChange={(updated) => updateQuestion(idx, updated)}
          onRemove={() => removeQuestion(idx)}
          partialCredit={partialCredit}
        />
      ))}

      {/* Add controls */}
      <div className="flex items-center gap-2">
        <Select
          value={defaultKind}
          onValueChange={(v) => setDefaultKind(v as AssessmentQuestion['kind'])}
          disabled={disabled}
        >
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mcq_single">Single Choice</SelectItem>
            <SelectItem value="mcq_multi">Multiple Choice</SelectItem>
            <SelectItem value="short_answer">Short Answer</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addQuestion}
          disabled={disabled}
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Question
        </Button>
        {questions.length > 0 && (
          <Badge variant="secondary" className="text-xs ml-auto">
            {questions.length} question{questions.length !== 1 ? 's' : ''} ·{' '}
            {questions.reduce((sum, q) => sum + (q.weight ?? 1), 0)} pts total
          </Badge>
        )}
      </div>
    </div>
  )
}
