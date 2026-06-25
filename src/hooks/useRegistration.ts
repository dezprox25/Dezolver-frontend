import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { registrationService } from '@/services/api/registration.service'
import { QUERY_KEYS } from '@/lib/constants'

export function useRegisterEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) => registrationService.register(eventId),
    onSuccess: (_result, eventId) => {
      // Invalidate the event detail to refresh registration status
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.EVENTS, eventId] })
    },
  })
}

export function useUnregisterEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (eventId: string) => registrationService.unregister(eventId),
    onSuccess: (_result, eventId) => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.EVENTS, eventId] })
    },
  })
}

export function useEventParticipants(
  eventId: string | undefined,
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.EVENTS, eventId, 'participants'],
    queryFn: ({ pageParam }) =>
      registrationService.listParticipants(eventId!, {
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.nextCursor ?? undefined : undefined,
    enabled: !!eventId && enabled,
    staleTime: 30 * 1000,
  })
}

export function useMyRegistration(eventId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EVENTS, eventId, 'my-registration'],
    queryFn: () => registrationService.getMyRegistration(eventId!),
    enabled: !!eventId,
    staleTime: 30 * 1000,
  })
}
