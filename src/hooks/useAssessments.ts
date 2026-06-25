import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import {
  assessmentService,
  type ListAssessmentsParams,
} from '@/services/api/assessment.service'
import type { CreateAssessmentDto, UpdateAssessmentDto } from '@/types/assessment.types'
import { QUERY_KEYS } from '@/lib/constants'

export function useAssessments(params: Omit<ListAssessmentsParams, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.ASSESSMENTS, params],
    queryFn: ({ pageParam }) =>
      assessmentService.list({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.nextCursor ?? undefined : undefined,
    staleTime: 2 * 60 * 1000,
  })
}

export function useAssessment(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.ASSESSMENTS, id],
    queryFn: () => assessmentService.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateAssessment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateAssessmentDto) => assessmentService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ASSESSMENTS }),
  })
}

export function useUpdateAssessment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAssessmentDto }) =>
      assessmentService.update(id, dto),
    onSuccess: (updated) => {
      qc.setQueryData([...QUERY_KEYS.ASSESSMENTS, updated.id], updated)
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ASSESSMENTS })
    },
  })
}

export function usePublishAssessment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      assessmentService.update(id, { status: 'published' }),
    onSuccess: (updated) => {
      qc.setQueryData([...QUERY_KEYS.ASSESSMENTS, updated.id], updated)
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ASSESSMENTS })
    },
  })
}

export function useArchiveAssessment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      assessmentService.update(id, { status: 'archived' }),
    onSuccess: (updated) => {
      qc.setQueryData([...QUERY_KEYS.ASSESSMENTS, updated.id], updated)
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ASSESSMENTS })
    },
  })
}
