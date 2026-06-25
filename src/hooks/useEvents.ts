import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { eventService, type ListEventsParams } from '@/services/api/event.service'
import type { CreateEventDto, UpdateEventDto, ExtendEventDto } from '@/types/event.types'
import { QUERY_KEYS } from '@/lib/constants'

export function useEvents(params: Omit<ListEventsParams, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.EVENTS, params],
    queryFn: ({ pageParam }) =>
      eventService.list({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.nextCursor ?? undefined : undefined,
    staleTime: 60 * 1000,
  })
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.EVENTS, id],
    queryFn: () => eventService.getById(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateEventDto) => eventService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.EVENTS }),
  })
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateEventDto }) =>
      eventService.update(id, dto),
    onSuccess: (updated) => {
      qc.setQueryData([...QUERY_KEYS.EVENTS, updated.id], updated)
      qc.invalidateQueries({ queryKey: QUERY_KEYS.EVENTS })
    },
  })
}

export function usePublishEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eventService.publish(id),
    onSuccess: (updated) => {
      qc.setQueryData([...QUERY_KEYS.EVENTS, updated.id], updated)
      qc.invalidateQueries({ queryKey: QUERY_KEYS.EVENTS })
    },
  })
}

export function useCancelEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => eventService.cancel(id),
    onSuccess: (updated) => {
      qc.setQueryData([...QUERY_KEYS.EVENTS, updated.id], updated)
      qc.invalidateQueries({ queryKey: QUERY_KEYS.EVENTS })
    },
  })
}

export function useExtendEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ExtendEventDto }) =>
      eventService.extend(id, dto),
    onSuccess: (updated) => {
      qc.setQueryData([...QUERY_KEYS.EVENTS, updated.id], updated)
    },
  })
}

export function useServerTime(eventId?: string) {
  return useQuery({
    queryKey: ['server-time', eventId],
    queryFn: () => eventService.getServerTime(),
    staleTime: 30 * 1000,
    refetchInterval: false,
  })
}
