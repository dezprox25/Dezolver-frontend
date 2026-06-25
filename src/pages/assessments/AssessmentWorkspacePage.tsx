/**
 * Assessment Workspace — the coding environment.
 *
 * Features:
 * - Monaco editor with language selector
 * - Split layout: problem panel left, editor right
 * - Assessment timer (countdown from timeLimitMinutes)
 * - Auto-save draft code to localStorage every 30s
 * - Restore code on page reload
 * - Anti-cheat signal collection (tab blur, paste, window blur)
 * - Real-time verdict via WebSocket (useSubmissionUpdates)
 * - Poll fallback for verdict if WS is unavailable
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Send, ChevronDown, ChevronUp, Maximize2, Minimize2, Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAssessment } from '@/hooks/useAssessments'
import { useSubmitCode, useSubmission, useSubmissionUpdates } from '@/hooks/useSubmissions'
import { CodeEditor } from '@/components/assessment/CodeEditor'
import { AssessmentTimer } from '@/components/assessment/AssessmentTimer'
import { VerdictPanel } from '@/components/assessment/VerdictPanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  saveDraft, loadDraft, saveStartTime, loadStartTime,
} from '@/lib/codeDrafts'
import {
  SUPPORTED_LANGUAGES, LANGUAGE_TEMPLATES, isTerminalVerdict,
} from '@/types/assessment.types'
import type { ClientMetadata } from '@/types/assessment.types'
import { QUERY_KEYS } from '@/lib/constants'

export function AssessmentWorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data: assessment, isLoading, isError } = useAssessment(id)

  // Redirect MCQ/quiz assessments to the quiz workspace
  useEffect(() => {
    if (assessment && assessment.kind !== 'coding_problem') {
      navigate(`/assessments/${assessment.id}/quiz`, { replace: true })
    }
  }, [assessment, navigate])

  // ── Language state ────────────────────────────────────────────────────────
  const [language, setLanguage] = useState('python')

  // ── Code editor state ────────────────────────────────────────────────────
  const [code, setCode] = useState(() => {
    if (!id) return LANGUAGE_TEMPLATES.python ?? ''
    return loadDraft(id, language) ?? LANGUAGE_TEMPLATES[language] ?? ''
  })

  // ── Timer state ───────────────────────────────────────────────────────────
  const [startTime, setStartTime] = useState<number | null>(null)
  const [timerExpired, setTimerExpired] = useState(false)

  // Restore or start timer on mount
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

  // ── UI toggle state ───────────────────────────────────────────────────────
  const [problemPanelOpen, setProblemPanelOpen] = useState(true)
  const [resultPanelOpen, setResultPanelOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  // ── Anti-cheat signals ────────────────────────────────────────────────────
  const signals = useRef<ClientMetadata>({
    timeOnTaskMs: 0,
    pasteEventCount: 0,
    tabBlurCount: 0,
    windowBlurCount: 0,
  })
  const workspaceOpenedAt = useRef(Date.now())
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false)

  // Update fullscreen warning when assessment or fullscreen mode changes
  useEffect(() => {
    if (assessment) {
      setShowFullscreenWarning(!fullscreen && (assessment.collectAntiCheat ?? false))
    }
  }, [assessment, fullscreen])

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

  const handlePaste = useCallback(() => {
    signals.current.pasteEventCount = (signals.current.pasteEventCount ?? 0) + 1
  }, [])

  // Display live anti-cheat signals
  const [currentSignals, setCurrentSignals] = useState(signals.current)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSignals({ ...signals.current })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // ── Auto-save draft every 30s + save indicator ────────────────────────────
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  useEffect(() => {
    if (!id) return
    const timer = setInterval(() => {
      saveDraft(id, language, code)
      setSavedAt(new Date())
    }, 30_000)
    return () => clearInterval(timer)
  }, [id, language, code])

  // Save on language change
  const handleLanguageChange = (newLang: string) => {
    if (id) saveDraft(id, language, code)
    setLanguage(newLang)
    const restored = loadDraft(id!, newLang)
    setCode(restored ?? LANGUAGE_TEMPLATES[newLang] ?? '')
  }

  // ── Submission state ──────────────────────────────────────────────────────
  const { mutateAsync: submitCode, isPending: submitting } = useSubmitCode()
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null)
  const [verdictLoading, setVerdictLoading] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { data: activeSubmission } = useSubmission(activeSubmissionId ?? undefined)

  // Stop polling when terminal verdict arrives
  useEffect(() => {
    if (
      activeSubmission &&
      isTerminalVerdict(activeSubmission.verdict) &&
      pollRef.current
    ) {
      clearInterval(pollRef.current)
      pollRef.current = null
      setVerdictLoading(false)
    }
  }, [activeSubmission])

  // WebSocket live updates
  useSubmissionUpdates(activeSubmissionId ?? undefined, (event) => {
    if (isTerminalVerdict(event.verdict as Parameters<typeof isTerminalVerdict>[0])) {
      setVerdictLoading(false)
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  })

  const handleSubmit = async () => {
    if (!id || !assessment) return
    if (timerExpired) {
      toast.error("Time's up — submission not allowed.")
      return
    }
    if (!code.trim()) {
      toast.error('Write some code before submitting.')
      return
    }

    signals.current.timeOnTaskMs = Date.now() - workspaceOpenedAt.current

    try {
      const resp = await submitCode({
        assessmentId: id,
        dto: {
          language,
          code,
          clientMetadata: { ...signals.current },
        },
      })

      setActiveSubmissionId(resp.submissionId)
      setVerdictLoading(true)
      setResultPanelOpen(true)

      toast.info('Submission received — judging…', { duration: 2000 })

      // Polling fallback (every 3s) — invalidates the submission query if WS unavailable
      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = setInterval(() => {
        qc.invalidateQueries({ queryKey: [...QUERY_KEYS.SUBMISSIONS, resp.submissionId] })
      }, 3000)
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      toast.error(msg ?? 'Submission failed.')
    }
  }

  // ── Allowed languages (filtered to assessment config) ─────────────────────
  const allowedLanguages = assessment?.config?.allowedLanguages
    ? SUPPORTED_LANGUAGES.filter((l) => assessment.config!.allowedLanguages!.includes(l.value))
    : SUPPORTED_LANGUAGES

  const monacoLang = SUPPORTED_LANGUAGES.find((l) => l.value === language)?.monacoLang ?? language

  // ── Problem data ──────────────────────────────────────────────────────────
  const problem = assessment?.problem

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-4">
        <Skeleton className="h-10 w-full rounded" />
        <Skeleton className="flex-1 w-full rounded" />
      </div>
    )
  }

  if (isError || !assessment) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Assessment not found.{' '}
        <button className="underline" onClick={() => navigate('/assessments')}>
          Back
        </button>
      </div>
    )
  }

  return (
    <div
      className={`flex flex-col bg-background ${
        fullscreen
          ? 'fixed inset-0 z-50'
          : 'h-[calc(100vh-4rem)]'
      }`}
    >
      {/* ── Fullscreen Warning Banner (Phase A) ───────────────────────────── */}
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

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b px-4 py-2 gap-3 shrink-0 bg-background">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate(`/assessments/${id}`)}
            aria-label="Back to assessment"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm font-semibold truncate">{assessment.title}</p>
          {problem && (
            <Badge variant="secondary" className="text-xs hidden sm:flex shrink-0">
              {problem.title}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Auto-save indicator */}
          {savedAt && (
            <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-500" />
              Saved
            </span>
          )}

          {/* Submission status chip */}
          {activeSubmissionId && activeSubmission && !isTerminalVerdict(activeSubmission.verdict) && (
            <Badge variant="secondary" className="text-xs">
              {activeSubmission.verdict === 'queued' ? 'In Queue' : 'Executing…'}
            </Badge>
          )}

          {/* Timer */}
          {startTime && (assessment.timeLimitMinutes ?? assessment.config?.timeLimitMinutes) && (
            <AssessmentTimer
              startTimeMs={startTime}
              timeLimitMinutes={(assessment.timeLimitMinutes ?? assessment.config?.timeLimitMinutes) as number}
              onExpired={() => setTimerExpired(true)}
            />
          )}

          {/* Anti-Cheat indicators (Phase A) */}
          {(assessment?.collectAntiCheat ?? false) && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span title="Paste events">{currentSignals.pasteEventCount} 📋</span>
              <span title="Tab blurs">{currentSignals.tabBlurCount} 🔄</span>
              <span title="Window blurs">{currentSignals.windowBlurCount} 🔲</span>
            </div>
          )}

          {/* Language selector */}
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-32 h-8 text-xs" aria-label="Select language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allowedLanguages.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Submit */}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || timerExpired}
            aria-label="Submit code"
          >
            <Send className="mr-2 h-3.5 w-3.5" />
            Submit
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setFullscreen((f) => !f)}
            aria-label={fullscreen ? 'Exit full screen' : 'Enter full screen'}
          >
            {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* ── Main content area ────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Problem panel */}
        {problem && problemPanelOpen && (
          <div className="w-80 xl:w-96 shrink-0 border-r flex flex-col min-h-0">
            <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/20 shrink-0">
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Problem
              </span>
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setProblemPanelOpen(false)}
                aria-label="Collapse problem panel"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <div>
                  <h2 className="text-base font-semibold">{problem.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      className={`text-xs border-0 ${
                        problem.difficulty === 'easy'
                          ? 'bg-green-100 text-green-700'
                          : problem.difficulty === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {problem.difficulty}
                    </Badge>
                    {problem.timeLimitMs && (
                      <span className="text-xs text-muted-foreground">
                        {problem.timeLimitMs}ms / {problem.memoryLimitMb}MB
                      </span>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Statement */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Problem Statement
                    </p>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {problem.statementMd}
                    </p>
                  </div>

                  {problem.inputFormat && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Input Format
                      </p>
                      <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                        {problem.inputFormat}
                      </p>
                    </div>
                  )}

                  {problem.outputFormat && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Output Format
                      </p>
                      <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                        {problem.outputFormat}
                      </p>
                    </div>
                  )}

                  {problem.constraints && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Constraints
                      </p>
                      <pre className="text-xs font-mono bg-muted/40 rounded p-2 whitespace-pre-wrap">
                        {problem.constraints}
                      </pre>
                    </div>
                  )}

                  {/* Sample test cases */}
                  {problem.testCases
                    ?.filter((tc) => tc.isSample)
                    .map((tc, i) => (
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
                            <pre className="bg-muted/60 rounded px-2 py-1.5 font-mono overflow-x-auto">
                              {tc.input ?? '(empty)'}
                            </pre>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-0.5">Output</p>
                            <pre className="bg-muted/60 rounded px-2 py-1.5 font-mono overflow-x-auto">
                              {tc.expectedOutput ?? '(empty)'}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Collapsed problem panel toggle */}
        {problem && !problemPanelOpen && (
          <div className="border-r flex flex-col items-center py-3 w-8 shrink-0">
            <button
              className="text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setProblemPanelOpen(true)}
              aria-label="Expand problem panel"
            >
              <ChevronDown className="h-4 w-4 rotate-[-90deg]" />
            </button>
          </div>
        )}

        {/* Editor + results column */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          {/* Code editor */}
          <div
            className={`flex-1 min-h-0 p-2 ${
              resultPanelOpen ? 'flex-[1_1_0]' : 'flex-1'
            }`}
          >
            <CodeEditor
              value={code}
              language={monacoLang}
              onChange={setCode}
              onPaste={handlePaste}
              height="100%"
              className="h-full"
            />
          </div>

          {/* Result panel */}
          {resultPanelOpen && (
            <div className="border-t flex flex-col shrink-0" style={{ maxHeight: '40%' }}>
              <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/20 shrink-0">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Result
                </span>
                <button
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setResultPanelOpen(false)}
                  aria-label="Collapse result panel"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
              <ScrollArea className="flex-1 p-4">
                <VerdictPanel
                  submission={activeSubmission ?? null}
                  isLoading={verdictLoading && !activeSubmission}
                />
              </ScrollArea>
            </div>
          )}

          {/* Show result panel toggle when it's collapsed and there's a submission */}
          {!resultPanelOpen && activeSubmissionId && (
            <div className="border-t px-4 py-2 bg-muted/10 flex items-center justify-between shrink-0">
              <span className="text-xs text-muted-foreground">
                {activeSubmission
                  ? `Last submission: ${activeSubmission.verdict.replace('_', ' ')}`
                  : 'Judging…'}
              </span>
              <button
                className="text-xs text-primary hover:underline flex items-center gap-1"
                onClick={() => setResultPanelOpen(true)}
                aria-label="Show result panel"
              >
                <ChevronUp className="h-3.5 w-3.5" />
                Show result
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
