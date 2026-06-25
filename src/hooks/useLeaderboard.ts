import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useCallback } from 'react'
import { leaderboardService } from '@/services/api/leaderboard.service'
import { QUERY_KEYS } from '@/lib/constants'
import { getSocket } from '@/services/websocket/client'
import type { LeaderboardEntry } from '@/types/event.types'

// ─── Per-event leaderboard ────────────────────────────────────────────────────

export function useEventLeaderboard(eventId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EVENTS, eventId, 'leaderboard'],
    queryFn: () => leaderboardService.getEventLeaderboard(eventId!),
    enabled: !!eventId,
    staleTime: 10 * 1000,
    refetchInterval: false, // WebSocket drives real-time updates
  })
}

// ─── My standing ─────────────────────────────────────────────────────────────

export function useMyStanding(eventId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EVENTS, eventId, 'my-standing'],
    queryFn: () => leaderboardService.getMyStanding(eventId!),
    enabled: !!eventId,
    staleTime: 30 * 1000,
  })
}

// ─── Event results (after grading) ───────────────────────────────────────────

export function useEventResults(eventId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EVENTS, eventId, 'results'],
    queryFn: () => leaderboardService.getEventResults(eventId!),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Global platform rating ───────────────────────────────────────────────────

export function useGlobalLeaderboard() {
  return useQuery({
    queryKey: QUERY_KEYS.GLOBAL_LEADERBOARD,
    queryFn: () => leaderboardService.getGlobal({ limit: 100 }),
    staleTime: 5 * 60 * 1000,
  })
}

// ─── WebSocket: live leaderboard updates ─────────────────────────────────────
//
// Subscribes to `event:{eventId}/leaderboard` WS channel and updates the cache
// incrementally when a `leaderboard:updated` event arrives.

interface LeaderboardUpdatedEvent {
  topN: LeaderboardEntry[]
  yourRank?: number
}

export function useLeaderboardUpdates(
  eventId: string | undefined,
  onUpdate?: (event: LeaderboardUpdatedEvent) => void
) {
  const qc = useQueryClient()

  const handleUpdate = useCallback(
    (event: LeaderboardUpdatedEvent) => {
      if (!eventId) return
      // Replace the top-N entries in the cached leaderboard
      qc.setQueryData(
        [...QUERY_KEYS.EVENTS, eventId, 'leaderboard'],
        (old: { eventId: string; entries: LeaderboardEntry[] } | undefined) => {
          if (!old) return old
          return { ...old, entries: event.topN }
        }
      )
      // Update my standing rank if provided
      if (event.yourRank != null) {
        qc.setQueryData(
          [...QUERY_KEYS.EVENTS, eventId, 'my-standing'],
          (old: { rank: number } | undefined) =>
            old ? { ...old, rank: event.yourRank! } : old
        )
      }
      onUpdate?.(event)
    },
    [eventId, qc, onUpdate]
  )

  useEffect(() => {
    if (!eventId) return
    const socket = getSocket()
    if (!socket) return

    socket.on('leaderboard:updated', handleUpdate)
    return () => {
      socket.off('leaderboard:updated', handleUpdate)
    }
  }, [eventId, handleUpdate])
}
