import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query'
import { useEffect, useCallback } from 'react'
import {
  submissionService,
  type ListSubmissionsParams,
} from '@/services/api/submission.service'
import type { SubmitCodeDto, MCQSubmitDto, ReviewFlaggedDto } from '@/types/assessment.types'
import { QUERY_KEYS } from '@/lib/constants'
import { getSocket } from '@/services/websocket/client'

// ─── My submission history (paginated) ───────────────────────────────────────

export function useMySubmissions(params: Omit<ListSubmissionsParams, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.SUBMISSIONS, 'mine', params],
    queryFn: ({ pageParam }) =>
      submissionService.listMine({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.nextCursor ?? undefined : undefined,
    staleTime: 60 * 1000,
  })
}

// ─── Single submission ────────────────────────────────────────────────────────

export function useSubmission(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.SUBMISSIONS, id],
    queryFn: () => submissionService.getById(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  })
}

// ─── Judge run (faculty/admin) ─────────────────────────────────────────────────────

export function useJudgeRun(judgeRunId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.SUBMISSIONS, judgeRunId, 'judge-run'],
    queryFn: () => submissionService.getJudgeRun(judgeRunId!),
    enabled: !!judgeRunId,
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Submit code mutation ─────────────────────────────────────────────────────

export function useSubmitCode() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      assessmentId,
      dto,
    }: {
      assessmentId: string
      dto: SubmitCodeDto
    }) => submissionService.submit(assessmentId, dto),
    onSuccess: () => {
      // Invalidate the "mine" list so new submission appears in history
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.SUBMISSIONS, 'mine'] })
    },
  })
}

// ─── Submit MCQ (synchronous, 200 OK) ────────────────────────────────────────

export function useSubmitMCQ() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      assessmentId,
      dto,
    }: {
      assessmentId: string
      dto: MCQSubmitDto
    }) => submissionService.submitMCQ(assessmentId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.SUBMISSIONS, 'mine'] })
    },
  })
}

// ─── Rerun (faculty/admin) ────────────────────────────────────────────────────

export function useRerunSubmission() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string }) => submissionService.rerun(id),
    onSuccess: (updated) => {
      qc.setQueryData([...QUERY_KEYS.SUBMISSIONS, updated.id], updated)
    },
  })
}

// ─── Flagged submissions (faculty/college-admin) ──────────────────────────────

export function useFlaggedSubmissions() {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.FLAGGED,
    queryFn: ({ pageParam }) =>
      submissionService.listFlagged({ cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.nextCursor ?? undefined : undefined,
    staleTime: 60 * 1000,
  })
}

export function useReviewFlagged() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ReviewFlaggedDto }) =>
      submissionService.reviewFlagged(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.FLAGGED })
    },
  })
}

// ─── WebSocket: live verdict updates ─────────────────────────────────────────
//
// Subscribes to the `user:{userId}/submissions` WS channel and syncs graded
// verdicts into the TanStack Query cache so pages update without polling.

interface SubmissionGradedEvent {
  type: string
  submissionId: string
  verdict: string
  score?: number
}

export function useSubmissionUpdates(
  submissionId: string | undefined,
  onGraded?: (event: SubmissionGradedEvent) => void
) {
  const qc = useQueryClient()

  const handleGraded = useCallback(
    (event: SubmissionGradedEvent) => {
      if (!submissionId || event.submissionId !== submissionId) return

      // Optimistically update the cache with the new verdict
      qc.setQueryData(
        [...QUERY_KEYS.SUBMISSIONS, submissionId],
        (old: { verdict: string; status: string } | undefined) =>
          old
            ? { ...old, verdict: event.verdict, score: event.score, status: 'completed' }
            : old
      )

      // Invalidate to get the full submission detail
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.SUBMISSIONS, submissionId] })

      onGraded?.(event)
    },
    [submissionId, qc, onGraded]
  )

  useEffect(() => {
    if (!submissionId) return

    const socket = getSocket()
    if (!socket) return

    socket.on('submission:graded', handleGraded)
    socket.on('submission:executing', handleGraded)
    socket.on('submission:queued', handleGraded)

    return () => {
      socket.off('submission:graded', handleGraded)
      socket.off('submission:executing', handleGraded)
      socket.off('submission:queued', handleGraded)
    }
  }, [submissionId, handleGraded])
}
