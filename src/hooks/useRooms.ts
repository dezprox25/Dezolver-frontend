import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { contentService, type ListRoomsParams } from '@/services/api/content.service'
import type { CreateRoomDto, UpdateRoomDto } from '@/types/content.types'
import { QUERY_KEYS } from '@/lib/constants'

export function useRooms(params: Omit<ListRoomsParams, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.ROOMS, params],
    queryFn: ({ pageParam }) =>
      contentService.listRooms({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.nextCursor ?? undefined : undefined,
    staleTime: 2 * 60 * 1000,
  })
}

export function useRoom(slug: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ROOMS, slug],
    queryFn: () => contentService.getRoom(slug!),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  })
}

export function useRoomVersions(slug: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ROOMS, slug, 'versions'],
    queryFn: () => contentService.getRoomVersions(slug!),
    enabled: !!slug,
    staleTime: 60 * 1000,
  })
}

export function useCreateRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateRoomDto) => contentService.createRoom(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS }),
  })
}

export function useUpdateRoom() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoomDto }) =>
      contentService.updateRoom(id, dto),
    onSuccess: (room) => {
      qc.setQueryData([...QUERY_KEYS.ROOMS, room.slug], room)
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS })
    },
  })
}

// ─── Room lifecycle mutations ─────────────────────────────────────────────────
//
// IDs are passed at mutateAsync() call-time, not at hook call-time.
// This prevents the previous bug where an empty-string ID was captured
// when the hook was called before room data had loaded.

export function useRoomLifecycle() {
  const qc = useQueryClient()

  const invalidateRoom = (slug: string) => {
    qc.invalidateQueries({ queryKey: [...QUERY_KEYS.ROOMS, slug] })
    qc.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS })
  }

  const submitForReview = useMutation({
    mutationFn: ({ id }: { id: string; slug: string }) =>
      contentService.submitRoomForReview(id),
    onSuccess: (_, { slug }) => invalidateRoom(slug),
  })

  const approve = useMutation({
    mutationFn: ({ id }: { id: string; slug: string }) =>
      contentService.approveRoom(id),
    onSuccess: (_, { slug }) => invalidateRoom(slug),
  })

  const archive = useMutation({
    mutationFn: ({ id }: { id: string; slug: string }) =>
      contentService.archiveRoom(id),
    onSuccess: (_, { slug }) => invalidateRoom(slug),
  })

  const rollback = useMutation({
    mutationFn: ({ id, versionId }: { id: string; slug: string; versionId: string }) =>
      contentService.rollbackRoom(id, versionId),
    onSuccess: (_, { slug }) => invalidateRoom(slug),
  })

  return { submitForReview, approve, archive, rollback }
}
