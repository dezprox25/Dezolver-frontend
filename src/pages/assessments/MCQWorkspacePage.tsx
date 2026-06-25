import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Send, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAssessment } from '@/hooks/useAssessments'
import { useSubmitMCQ } from '@/hooks/useSubmissions'
import { AssessmentTimer } from '@/components/assessment/AssessmentTimer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { saveStartTime, loadStartTime } from '@/lib/codeDrafts'
import type { AssessmentQuestion, MCQAnswer, MCQSubmissionResult, ClientMetadata } from '@/types/assessment.types'
import { VERDICT_LABELS } from '@/types/assessment.types'

// ─── Answer state helpers ─────────────────────────────────────────────────────

function getAnswer(answers: Record<string, MCQAnswer>, questionId: string): MCQAnswer {
  return answers[questionId] ?? { questionId }
}

function isAnswered(answer: MCQAnswer, kind: AssessmentQuestion['kind']): boolean {
  if (kind === 'mcq_single') return !!answer.value
  if (kind === 'mcq_multi') return (answer.values?.length ?? 0) > 0
  if (kind === 'short_answer') return !!answer.value?.trim()
  return false
}

// ─── Question renderer ────────────────────────────────────────────────────────

interface QuestionCardProps {
  question: AssessmentQuestion
  answer: MCQAnswer
  onAnswer: (answer: MCQAnswer) => void
  submitted: boolean
  result?: { correct: boolean; points: number; maxPoints: number }
}

function QuestionCard({ question, answer, onAnswer, submitted, result }: QuestionCardProps) {
  const handleSingle = (optionId: string) => {
    if (submitted) return
    onAnswer({ questionId: question.id, value: optionId })
  }

  const handleMulti = (optionId: string) => {
    if (submitted) return
    const prev = answer.values ?? []
    const next = prev.includes(optionId)
      ? prev.filter((id) => id !== optionId)
      : [...prev, optionId]
    onAnswer({ questionId: question.id, values: next })
  }

  const handleShortAnswer = (value: string) => {
    if (submitted) return
    onAnswer({ questionId: question.id, value })
  }

  return (
    <div className="space-y-4">
      {/* Question text */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-[10px]">
            {question.kind === 'mcq_single'
              ? 'Single choice'
              : question.kind === 'mcq_multi'
              ? 'Multiple choice'
              : 'Short answer'}
          </Badge>
          {question.weight !== undefined && (
            <Badge variant="outline" className="text-[10px]">{question.weight} pt{question.weight !== 1 ? 's' : ''}</Badge>
          )}
          {submitted && result && (
            <Badge
              className={`text-[10px] ${result.correct ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-red-100 text-red-800 border-red-300'}`}
            >
              {result.correct ? `+${result.points}` : '0'} / {result.maxPoints} pts
            </Badge>
          )}
        </div>
        <p className="text-sm font-medium leading-relaxed">{question.text}</p>
      </div>

      {/* MCQ single choice */}
      {question.kind === 'mcq_single' && (
        <div className="space-y-2">
          {(question.options ?? []).map((opt) => {
            const isSelected = answer.value === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-border hover:bg-muted/50'
                } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                onClick={() => handleSingle(opt.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      isSelected ? 'border-primary' : 'border-muted-foreground/40'
                    }`}
                  >
                    {isSelected && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  {opt.text}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* MCQ multi choice */}
      {question.kind === 'mcq_multi' && (
        <div className="space-y-2">
          {(question.options ?? []).map((opt) => {
            const isSelected = answer.values?.includes(opt.id) ?? false
            return (
              <button
                key={opt.id}
                type="button"
                className={`w-full text-left rounded-lg border px-4 py-3 text-sm transition-colors ${
                  isSelected
                    ? 'border-primary bg-primary/5 text-primary font-medium'
                    : 'border-border hover:bg-muted/50'
                } ${submitted ? 'cursor-default' : 'cursor-pointer'}`}
                onClick={() => handleMulti(opt.id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center ${
                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                    }`}
                  >
                    {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                  </div>
                  {opt.text}
                </div>
              </button>
            )
          })}
          <p className="text-xs text-muted-foreground pl-1">Select all that apply.</p>
        </div>
      )}

      {/* Short answer */}
      {question.kind === 'short_answer' && (
        <Textarea
          placeholder="Type your answer here…"
          rows={3}
          value={answer.value ?? ''}
          onChange={(e) => handleShortAnswer(e.target.value)}
          disabled={submitted}
          className="text-sm"
        />
      )}
    </div>
  )
}

// ─── Result screen ────────────────────────────────────────────────────────────

interface ResultScreenProps {
  result: MCQSubmissionResult
  total: number
  onReview: () => void
  onBack: () => void
}

function ResultScreen({ result, total, onReview, onBack }: ResultScreenProps) {
  const maxPoints = result.perQuestion?.reduce((sum, q) => sum + q.maxPoints, 0) ?? total
  const pct = maxPoints > 0 ? Math.round((result.score / maxPoints) * 100) : 0
  const isPass = pct >= 70

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8 max-w-md mx-auto text-center">
      <div
        className={`flex h-20 w-20 items-center justify-center rounded-full text-4xl font-bold ${
          isPass ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
        }`}
      >
        {pct}%
      </div>
      <div>
        <p className="text-2xl font-bold">
          {VERDICT_LABELS[result.verdict] ?? result.verdict}
        </p>
        <p className="text-muted-foreground mt-1">
          {result.score} / {maxPoints} points
          {result.perQuestion && ` · ${result.perQuestion.filter((q) => q.correct).length} of ${result.perQuestion.length} correct`}
        </p>
      </div>
      <div className="w-full space-y-2">
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-3 rounded-full transition-all ${isPass ? 'bg-emerald-500' : 'bg-red-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <Button variant="outline" onClick={onReview}>Review Answers</Button>
        <Button onClick={onBack}>Back to Assessments</Button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function MCQWorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: assessment, isLoading, isError } = useAssessment(id)
  const { mutateAsync: submitMCQ, isPending: submitting } = useSubmitMCQ()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, MCQAnswer>>({})
  const [timerExpired, setTimerExpired] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)
  const [result, setResult] = useState<MCQSubmissionResult | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false)

  // Update fullscreen warning when assessment or fullscreen mode changes
  useEffect(() => {
    if (assessment) {
      setShowFullscreenWarning(!fullscreen && (assessment.collectAntiCheat ?? false))
    }
  }, [assessment, fullscreen])

  // Anti-cheat signals
  const signals = useRef<ClientMetadata>({
    timeOnTaskMs: 0,
    pasteEventCount: 0,
    tabBlurCount: 0,
    windowBlurCount: 0,
  })
  const workspaceOpenedAt = useRef(Date.now())
  const [currentSignals, setCurrentSignals] = useState(signals.current)

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        signals.current.tabBlurCount = (signals.current.tabBlurCount ?? 0) + 1
        toast.warning('Tab switched! This activity is being recorded for anti-cheat purposes.', { id: 'tab-blur' })
      }
    }
    const onWindowBlur = () => {
      signals.current.windowBlurCount = (signals.current.windowBlurCount ?? 0) + 1
      toast.warning('Window blurred! This activity is being recorded for anti-cheat purposes.', { id: 'window-blur' })
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('blur', onWindowBlur)
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('blur', onWindowBlur)
    }
  }, [])

  // Update signals display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSignals({ ...signals.current })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!id) return
    const stored = loadStartTime(id)
    if (stored) {
      setStartTime(stored)
    } else {
      const now = saveStartTime(id)
      setStartTime(now)
    }
  }, [id])

  const questions = assessment?.questions ?? []
  const currentQuestion = questions[currentIndex]
  const answeredCount = questions.filter((q) => isAnswered(getAnswer(answers, q.id), q.kind)).length
  const progressPct = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0

  const handleAnswer = (answer: MCQAnswer) => {
    setAnswers((prev) => ({ ...prev, [answer.questionId]: answer }))
  }

  const handleSubmit = async () => {
    if (!id || !assessment) return
    setConfirmOpen(false)
    try {
      signals.current.timeOnTaskMs = Date.now() - workspaceOpenedAt.current
      const dto = {
        answers: questions.map((q) => {
          const a = getAnswer(answers, q.id)
          return {
            questionId: q.id,
            value: q.kind !== 'mcq_multi' ? (a.value ?? '') : undefined,
            values: q.kind === 'mcq_multi' ? (a.values ?? []) : undefined,
          }
        }),
        clientMetadata: { ...signals.current },
      }
      const res = await submitMCQ({ assessmentId: id, dto })
      setResult(res)
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      toast.error(msg ?? 'Submission failed.')
    }
  }

  // Auto-submit when timer expires
  useEffect(() => {
    if (timerExpired && !result && !submitting) {
      toast.warning("Time's up — submitting automatically.")
      handleSubmit()
    }
  }, [timerExpired])

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] gap-4 p-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="flex-1 w-full rounded" />
      </div>
    )
  }

  if (isError || !assessment) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Assessment not found.{' '}
        <button className="underline" onClick={() => navigate('/assessments')}>Back</button>
      </div>
    )
  }

  if (result && !isReviewing) {
    return (
      <div className="h-[calc(100vh-4rem)]">
        <ResultScreen
          result={result}
          total={questions.length}
          onReview={() => setIsReviewing(true)}
          onBack={() => navigate('/assessments')}
        />
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col ${
        fullscreen ? 'fixed inset-0 z-50' : 'h-[calc(100vh-4rem)]'
      } bg-background`}
    >
      {/* Fullscreen Warning Banner */}
      {showFullscreenWarning && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between">
          <p className="text-amber-800 text-sm">
            ⚠️ This assessment uses anti-cheat monitoring. Please enter fullscreen mode for a smooth experience!
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFullscreenWarning(false)}
            >
              Dismiss
            </Button>
            <Button
              size="sm"
              onClick={() => setFullscreen(true)}
            >
              Enter Fullscreen
            </Button>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between border-b px-4 py-2 gap-3 shrink-0 bg-background">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate(`/assessments/${id}`)}
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm font-semibold truncate">{assessment.title}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {startTime && (assessment.timeLimitMinutes ?? assessment.config?.timeLimitMinutes) && !result && (
            <AssessmentTimer
              startTimeMs={startTime}
              timeLimitMinutes={(assessment.timeLimitMinutes ?? assessment.config?.timeLimitMinutes) as number}
              onExpired={() => setTimerExpired(true)}
            />
          )}

          {/* Anti-Cheat indicators */}
          {(assessment?.collectAntiCheat ?? false) && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span title="Paste events">{currentSignals.pasteEventCount} 📋</span>
              <span title="Tab blurs">{currentSignals.tabBlurCount} 🔄</span>
              <span title="Window blurs">{currentSignals.windowBlurCount} 🔲</span>
            </div>
          )}

          {isReviewing ? (
            <Button size="sm" variant="outline" onClick={() => navigate(`/submissions`)}>
              Done
            </Button>
          ) : !result ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setFullscreen((f) => !f)}
                aria-label={fullscreen ? 'Exit full screen' : 'Enter full screen'}
              >
                {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                onClick={() => setConfirmOpen(true)}
                disabled={submitting || timerExpired}
              >
                <Send className="mr-2 h-3.5 w-3.5" />
                Submit ({answeredCount}/{questions.length})
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Progress bar */}
      {!result && (
        <div className="border-b px-4 py-2 shrink-0">
          <div className="flex items-center gap-3">
            <Progress value={progressPct} className="flex-1 h-1.5" />
            <span className="text-xs text-muted-foreground shrink-0">
              {answeredCount} / {questions.length} answered
            </span>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar: question navigator */}
        <div className="w-52 shrink-0 border-r flex flex-col">
          <div className="p-3 border-b">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Questions
            </p>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {questions.map((q, idx) => {
                const answered = isAnswered(getAnswer(answers, q.id), q.kind)
                const isCurrent = idx === currentIndex
                let perQ = result?.perQuestion?.find((r) => r.questionId === q.id)
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-full text-left rounded-md px-3 py-2 text-xs flex items-center gap-2 transition-colors ${
                      isCurrent
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted/60'
                    }`}
                  >
                    <span className="font-mono font-bold shrink-0">
                      Q{idx + 1}
                    </span>
                    <span className="truncate flex-1">
                      {q.text.slice(0, 30)}{q.text.length > 30 ? '…' : ''}
                    </span>
                    {result && perQ ? (
                      <span
                        className={`shrink-0 h-1.5 w-1.5 rounded-full ${
                          perQ.correct ? 'bg-emerald-500' : 'bg-red-400'
                        }`}
                      />
                    ) : answered ? (
                      <span className="shrink-0 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Question area */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {currentQuestion ? (
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-2xl">
                <QuestionCard
                  question={currentQuestion}
                  answer={getAnswer(answers, currentQuestion.id)}
                  onAnswer={handleAnswer}
                  submitted={!!result}
                  result={result?.perQuestion?.find((r) => r.questionId === currentQuestion.id)}
                />
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              No questions in this assessment.
            </div>
          )}

          {/* Navigation */}
          <div className="border-t px-6 py-3 flex items-center justify-between shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              {currentIndex + 1} of {questions.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
              disabled={currentIndex === questions.length - 1}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Confirm submit dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Assessment?</DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} of {questions.length} questions.
              {answeredCount < questions.length && (
                <> <strong>{questions.length - answeredCount} questions are unanswered.</strong></>
              )}
              {' '}This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Review</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
