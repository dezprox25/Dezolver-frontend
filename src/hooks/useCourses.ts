import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { contentService, type ListCoursesParams } from '@/services/api/content.service'
import type { CreateCourseDto } from '@/types/content.types'
import { QUERY_KEYS } from '@/lib/constants'

export function useCourses(params: Omit<ListCoursesParams, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.COURSES, params],
    queryFn: ({ pageParam }) =>
      contentService.listCourses({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.nextCursor ?? undefined : undefined,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCourse(slug: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.COURSES, slug],
    queryFn: () => contentService.getCourse(slug!),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateCourseDto) => contentService.createCourse(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.COURSES }),
  })
}

export function useAddRoomToCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      courseId,
      roomId,
      position,
    }: {
      courseId: string
      roomId: string
      position?: number
    }) => contentService.addRoomToCourse(courseId, roomId, position),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.COURSES }),
  })
}

// ─── Remove room from course ──────────────────────────────────────────────────
//
// courseId and roomId are passed at mutateAsync() call-time so the mutation
// never captures an empty courseId from an unloaded query.

export function useRemoveRoomFromCourse() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ courseId, roomId }: { courseId: string; roomId: string }) =>
      contentService.removeRoomFromCourse(courseId, roomId),
    onSuccess: (_, { courseId }) => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.COURSES, courseId] })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.COURSES })
    },
  })
}
