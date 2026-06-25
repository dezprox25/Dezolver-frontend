/**
 * EventLivePage — competition workspace.
 *
 * Layout: Top bar → Left sidebar (problems + leaderboard) → Right (editor + results)
 * - Joins `event:{id}` and `event:{id}/leaderboard` WS channels on mount
 * - Submits via POST /events/:id/submissions
 * - Real-time verdict via existing useSubmissionUpdates hook
 * - Real-time leaderboard via useLeaderboardUpdates hook
 * - Server-synced countdown via GET /time
 */
import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Send, Trophy, ChevronRight, ChevronLeft, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useEvent, useServerTime } from '@/hooks/useEvents'
import { useSubmission, useSubmissionUpdates } from '@/hooks/useSubmissions'
import { useEventLeaderboard, useLeaderboardUpdates } from '@/hooks/useLeaderboard'
import { CodeEditor } from '@/components/assessment/CodeEditor'
import { LanguageSelector } from '@/components/assessment/LanguageSelector'
import { VerdictPanel } from '@/components/assessment/VerdictPanel'
import { EventCountdown } from '@/components/events/EventCountdown'
import { EventStatusBadge } from '@/components/events/EventStatusBadge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { joinChannel, leaveChannel } from '@/services/websocket/client'
import { eventService } from '@/services/api/event.service'
import { SUPPORTED_LANGUAGES, LANGUAGE_TEMPLATES, isTerminalVerdict } from '@/types/assessment.types'
import type { CompetitionProblem } from '@/types/event.types'
import { saveDraft, loadDraft } from '@/lib/codeDrafts'

export function EventLivePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: event, isLoading, isError } = useEvent(id)
  const { data: serverTimeData } = useServerTime(id)
  const { data: leaderboard } = useEventLeaderboard(id)

  // Server time offset for accurate countdown
  const serverOffset = serverTimeData
    ? new Date(serverTimeData.serverNow).getTime() - Date.now()
    : 0

  // Problem selection
  const problems: CompetitionProblem[] = event?.config?.problems ?? []
  const [selectedProblemIdx, setSelectedProblemIdx] = useState(0)
  const selectedProblem = problems[selectedProblemIdx]

  // Code editor
  const [language, setLanguage] = useState('python')
  const [code, setCode] = useState(() => {
    if (!id || !selectedProblem) return LANGUAGE_TEMPLATES.python ?? ''
    return loadDraft(`${id}:${selectedProblem.problemId}`, language) ?? LANGUAGE_TEMPLATES[language] ?? ''
  })

  useEffect(() => {
    if (!id || !selectedProblem) return
    const restored = loadDraft(`${id}:${selectedProblem.problemId}`, language)
    setCode(restored ?? LANGUAGE_TEMPLATES[language] ?? '')
  }, [selectedProblemIdx, language, id, selectedProblem])

  // Auto-save
  useEffect(() => {
    if (!id || !selectedProblem) return
    const timer = setInterval(() => {
      saveDraft(`${id}:${selectedProblem.problemId}`, language, code)
    }, 30_000)
    return () => clearInterval(timer)
  }, [id, selectedProblem, language, code])

  // Submission
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null)
  const [verdictLoading, setVerdictLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { data: activeSubmission } = useSubmission(activeSubmissionId ?? undefined)

  useEffect(() => {
    if (activeSubmission && isTerminalVerdict(activeSubmission.verdict)) {
      setVerdictLoading(false)
    }
  }, [activeSubmission])

  useSubmissionUpdates(activeSubmissionId ?? undefined, (e) => {
    if (isTerminalVerdict(e.verdict as Parameters<typeof isTerminalVerdict>[0])) {
      setVerdictLoading(false)
    }
  })

  const handleSubmit = async () => {
    if (!id || !event || !selectedProblem) return
    if (!code.trim()) { toast.error('Write some code first.'); return }
    setSubmitting(true)
    try {
      const res = await eventService.submitSolution(id, {
        problemId: selectedProblem.problemId,
        language,
        code,
      })
      setActiveSubmissionId(res.submissionId)
      setVerdictLoading(true)
      toast.info('Submission received — judging…', { duration: 2000 })
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message
      toast.error(msg ?? 'Submission failed.')
    } finally {
      setSubmitting(false)
    }
  }

  // WebSocket channels
  useEffect(() => {
    if (!id) return
    joinChannel(`event:${id}`)
    joinChannel(`event:${id}/leaderboard`)
    return () => {
      leaveChannel(`event:${id}`)
      leaveChannel(`event:${id}/leaderboard`)
    }
  }, [id])

  // Leaderboard real-time
  useLeaderboardUpdates(id)

  // Event state changes
  const handlePaste = useCallback(() => {}, [])

  // Panel state
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [eventEnded, setEventEnded] = useState(false)

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col gap-4 p-4">
        <Skeleton className="h-10 w-full rounded" />
        <Skeleton className="flex-1 w-full rounded" />
      </div>
    )
  }

  if (isError || !event) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Event not found.{' '}
        <button className="underline" onClick={() => navigate('/events')}>Back</button>
      </div>
    )
  }

  if (event.status !== 'live') {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] gap-4">
        <EventStatusBadge status={event.status} />
        <p className="text-sm text-muted-foreground">{event.title}</p>
        {event.status === 'completed' ? (
          <Button onClick={() => navigate(`/events/${id}/results`)}>View Results</Button>
        ) : (
          <Button variant="outline" onClick={() => navigate(`/events/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Event
          </Button>
        )}
      </div>
    )
  }

  const leaderboardEntries = leaderboard?.entries ?? []
  const showLeaderboard = event.config?.leaderboardVisibleDuringEvent !== false

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b px-4 py-2 gap-3 shrink-0 bg-background">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => navigate(`/events/${id}`)}
            aria-label="Back to event"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm font-semibold truncate">{event.title}</p>
          <EventStatusBadge status={event.status} />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!eventEnded && (
            <EventCountdown
              targetDate={event.endsAt}
              serverTimeOffsetMs={serverOffset}
              onExpired={() => setEventEnded(true)}
            />
          )}
          {eventEnded && (
            <Badge variant="outline" className="text-rose-600 border-rose-400">
              Competition Ended
            </Badge>
          )}

          <LanguageSelector
            value={language}
            onChange={(l) => {
              saveDraft(`${id}:${selectedProblem?.problemId ?? ''}`, language, code)
              setLanguage(l)
            }}
            allowedLanguages={event.config?.allowedLanguages}
          />

          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={submitting || eventEnded || !selectedProblem}
            aria-label="Submit solution"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="mr-2 h-3.5 w-3.5" />
            )}
            Submit
          </Button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: Problem list + leaderboard */}
        {sidebarOpen && (
          <div className="w-72 xl:w-80 shrink-0 border-r flex flex-col min-h-0">
            <Tabs defaultValue="problems" className="flex flex-col flex-1 min-h-0">
              <TabsList className="rounded-none border-b shrink-0 mx-0 h-9">
                <TabsTrigger value="problems" className="flex-1 text-xs rounded-none">
                  Problems
                </TabsTrigger>
                {showLeaderboard && (
                  <TabsTrigger value="leaderboard" className="flex-1 text-xs rounded-none">
                    <Trophy className="h-3 w-3 mr-1" /> Board
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="problems" className="flex-1 overflow-y-auto mt-0">
                <div className="p-2 space-y-1">
                  {problems.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No problems configured.
                    </p>
                  )}
                  {problems
                    .sort((a, b) => a.order - b.order)
                    .map((p, i) => (
                      <button
                        key={p.problemId}
                        className={`w-full text-left rounded-md px-3 py-2.5 flex items-center gap-2 transition-colors ${
                          selectedProblemIdx === i
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedProblemIdx(i)}
                      >
                        <span className="text-xs font-mono font-semibold w-5 shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-xs truncate flex-1">
                          {p.title ?? p.problemId.slice(0, 20) + '…'}
                        </span>
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          {p.points}
                        </Badge>
                      </button>
                    ))}
                </div>
              </TabsContent>

              {showLeaderboard && (
                <TabsContent value="leaderboard" className="flex-1 overflow-y-auto mt-0 p-2">
                  {leaderboardEntries.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      No submissions yet.
                    </p>
                  ) : (
                    <div className="text-xs">
                      {leaderboardEntries.slice(0, 20).map((e) => (
                        <div
                          key={e.userId}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded ${
                            e.isCurrentUser ? 'bg-primary/5 font-medium' : ''
                          }`}
                        >
                          <span className="w-5 text-center text-muted-foreground">{e.rank}</span>
                          <span className="flex-1 truncate">
                            {e.displayName ?? e.userId.slice(0, 8)}
                          </span>
                          <span className="text-emerald-700 font-semibold">{e.acceptedCount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              )}
            </Tabs>

            {/* Collapse button */}
            <button
              className="flex items-center justify-center p-2 border-t text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(false)}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Expand sidebar */}
        {!sidebarOpen && (
          <div className="border-r flex flex-col items-center py-3 w-8 shrink-0">
            <button
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(true)}
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Editor + results */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 p-2">
            <CodeEditor
              value={code}
              language={SUPPORTED_LANGUAGES.find((l) => l.value === language)?.monacoLang ?? language}
              onChange={setCode}
              onPaste={handlePaste}
              height="100%"
              className="h-full"
            />
          </div>

          {/* Verdict panel */}
          {activeSubmissionId && (
            <div className="border-t" style={{ maxHeight: '38%' }}>
              <div className="px-4 py-2 border-b bg-muted/20 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Result
                </span>
              </div>
              <ScrollArea className="p-4" style={{ maxHeight: 'calc(38vh - 36px)' }}>
                <VerdictPanel
                  submission={activeSubmission ?? null}
                  isLoading={verdictLoading && !activeSubmission}
                />
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
