import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, RefreshCw, CheckCircle2, XCircle, Flag } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useFlaggedSubmissions, useReviewFlagged } from '@/hooks/useSubmissions'
import { reviewFlaggedSchema, type ReviewFlaggedFormValues } from '@/lib/schemas/assessment.schemas'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { VerdictBadge } from '@/components/assessment/VerdictBadge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatRelativeTime } from '@/lib/utils/format'
import type { FlaggedSubmission } from '@/types/assessment.types'

function ReviewDialog({
  flagged,
  onClose,
}: {
  flagged: FlaggedSubmission
  onClose: () => void
}) {
  const { mutateAsync: review, isPending } = useReviewFlagged()
  const form = useForm<ReviewFlaggedFormValues>({
    resolver: zodResolver(reviewFlaggedSchema),
    defaultValues: { decision: 'cleared', note: '' },
  })

  const onSubmit = async (values: ReviewFlaggedFormValues) => {
    try {
      await review({ id: flagged.id, dto: values })
      toast.success('Review saved.')
      onClose()
    } catch {
      toast.error('Review failed.')
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Review Flagged Submission</DialogTitle>
          <DialogDescription>
            Submission from{' '}
            <span className="font-mono text-xs">{flagged.submissionId.slice(0, 12)}…</span>
            {flagged.suspicionScore != null && (
              <> · Suspicion score: <strong>{flagged.suspicionScore}</strong></>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Signal summary */}
        {flagged.signals && (
          <div className="rounded-md border bg-muted/20 px-3 py-2 text-xs grid grid-cols-2 gap-1">
            <span className="text-muted-foreground">Time on task:</span>
            <span>
              {flagged.signals.timeOnTaskMs != null
                ? `${Math.round(flagged.signals.timeOnTaskMs / 1000)}s`
                : '—'}
            </span>
            <span className="text-muted-foreground">Paste events:</span>
            <span>{flagged.signals.pasteEventCount ?? 0}</span>
            <span className="text-muted-foreground">Tab blurs:</span>
            <span>{flagged.signals.tabBlurCount ?? 0}</span>
            <span className="text-muted-foreground">Window blurs:</span>
            <span>{flagged.signals.windowBlurCount ?? 0}</span>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="decision"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Decision</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="cleared">Cleared — no issue</SelectItem>
                      <SelectItem value="flagged">Flagged — needs further review</SelectItem>
                      <SelectItem value="invalidated">Invalidated — result discarded</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Review Note (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Notes for audit trail…"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : 'Save Decision'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export function FlaggedSubmissionsPage() {
  const navigate = useNavigate()
  const [reviewing, setReviewing] = useState<FlaggedSubmission | null>(null)

  const {
    data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch,
  } = useFlaggedSubmissions()

  const flagged = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flagged Submissions"
        description="Review submissions with suspicious anti-cheat signals."
        actions={
          <Button variant="ghost" size="icon" onClick={() => refetch()} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Failed to load flagged submissions"
          action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
        />
      ) : flagged.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="h-8 w-8 text-emerald-500/50" />}
          title="No flagged submissions"
          description="All clear — no submissions are flagged for review."
        />
      ) : (
        <div className="rounded-lg border divide-y">
          {flagged.map((item) => (
            <div key={item.id} className="flex items-start gap-4 px-4 py-4">
              <div className="mt-0.5 shrink-0">
                {item.decision ? (
                  item.decision === 'cleared' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden="true" />
                  ) : item.decision === 'invalidated' ? (
                    <XCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                  ) : (
                    <Flag className="h-5 w-5 text-amber-500" aria-hidden="true" />
                  )
                ) : (
                  <AlertTriangle
                    className="h-5 w-5 text-amber-500 animate-pulse"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium">
                    {item.assessmentTitle ?? 'Unknown assessment'}
                  </p>
                  {item.suspicionScore != null && (
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        item.suspicionScore > 70
                          ? 'border-red-400 text-red-600'
                          : 'border-amber-400 text-amber-600'
                      }`}
                    >
                      Suspicion: {item.suspicionScore}
                    </Badge>
                  )}
                  {item.submission?.verdict && (
                    <VerdictBadge verdict={item.submission.verdict} />
                  )}
                  {item.decision && (
                    <Badge variant="secondary" className="text-xs capitalize">
                      {item.decision}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Submission{' '}
                  <button
                    className="underline hover:text-foreground"
                    onClick={() => navigate(`/submissions/${item.submissionId}`)}
                  >
                    {item.submissionId.slice(0, 12)}…
                  </button>{' '}
                  · {formatRelativeTime(item.createdAt)}
                </p>
                {/* Signal summary */}
                {item.signals && (
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span>Pastes: {item.signals.pasteEventCount ?? 0}</span>
                    <span>Tab blurs: {item.signals.tabBlurCount ?? 0}</span>
                    <span>Window blurs: {item.signals.windowBlurCount ?? 0}</span>
                  </div>
                )}
              </div>

              {!item.decision && (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => setReviewing(item)}
                >
                  Review
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Load more
          </Button>
        </div>
      )}

      {reviewing && (
        <ReviewDialog flagged={reviewing} onClose={() => setReviewing(null)} />
      )}
    </div>
  )
}
