import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useCallback } from 'react'
import { progressService } from '@/services/api/progress.service'
import { QUERY_KEYS } from '@/lib/constants'
import { getSocket } from '@/services/websocket/client'
import type { PathProgress } from '@/types/path.types'

// ─── My enrolled paths ────────────────────────────────────────────────────────

export function useMyPaths() {
  return useQuery({
    queryKey: QUERY_KEYS.MY_PATHS,
    queryFn: () => progressService.listMyPaths(),
    staleTime: 60 * 1000,
  })
}

// ─── Next step for a specific path ───────────────────────────────────────────

export function useNextStep(pathId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PATH_PROGRESS, pathId, 'next-step'],
    queryFn: () => progressService.getNextStep(pathId!),
    enabled: !!pathId,
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Path progress ────────────────────────────────────────────────────────────

export function usePathProgress(pathId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PATH_PROGRESS, pathId],
    queryFn: () => progressService.getPathProgress(pathId!),
    enabled: !!pathId,
    staleTime: 60 * 1000,
  })
}

// ─── Room progress mutations ──────────────────────────────────────────────────

export function useStartRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roomId: string) => progressService.startRoom(roomId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PATH_PROGRESS })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.MY_PATHS })
    },
  })
}

export function useCompleteRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roomId: string) => progressService.completeRoom(roomId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PATH_PROGRESS })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.MY_PATHS })
    },
  })
}

export function useSkipRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (roomId: string) => progressService.skipRoom(roomId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PATH_PROGRESS })
    },
  })
}

// ─── WebSocket: progress updates ─────────────────────────────────────────────

interface PathProgressUpdatedEvent {
  pathId: string
  percentageComplete: number
  stepsCompleted: number
  stepsTotal: number
}

interface PathCompletedEvent {
  pathId: string
}

export function useProgressUpdates(onCompleted?: (event: PathCompletedEvent) => void) {
  const qc = useQueryClient()

  const handleProgressUpdated = useCallback(
    (event: PathProgressUpdatedEvent) => {
      qc.setQueryData(
        [...QUERY_KEYS.PATH_PROGRESS, event.pathId],
        (old: PathProgress | undefined): PathProgress | undefined =>
          old
            ? {
                ...old,
                percentageComplete: event.percentageComplete,
                stepsCompleted: event.stepsCompleted,
                stepsTotal: event.stepsTotal,
              }
            : old
      )
      qc.invalidateQueries({ queryKey: QUERY_KEYS.MY_PATHS })
    },
    [qc]
  )

  const handleRoomCompleted = useCallback(() => {
    qc.invalidateQueries({ queryKey: QUERY_KEYS.PATH_PROGRESS })
  }, [qc])

  const handlePathCompleted = useCallback(
    (event: PathCompletedEvent) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.MY_PATHS })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PATH_PROGRESS })
      onCompleted?.(event)
    },
    [qc, onCompleted]
  )

  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    socket.on('path:progress_updated', handleProgressUpdated)
    socket.on('room:completed', handleRoomCompleted)
    socket.on('path:completed', handlePathCompleted)

    return () => {
      socket.off('path:progress_updated', handleProgressUpdated)
      socket.off('room:completed', handleRoomCompleted)
      socket.off('path:completed', handlePathCompleted)
    }
  }, [handleProgressUpdated, handleRoomCompleted, handlePathCompleted])
}
