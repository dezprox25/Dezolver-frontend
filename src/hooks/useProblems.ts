import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { contentService, type ListProblemsParams } from '@/services/api/content.service'
import type { CreateProblemDto, AddTestCaseDto } from '@/types/content.types'
import { QUERY_KEYS } from '@/lib/constants'

export function useProblems(params: Omit<ListProblemsParams, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.PROBLEMS, params],
    queryFn: ({ pageParam }) =>
      contentService.listProblems({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.nextCursor ?? undefined : undefined,
    staleTime: 2 * 60 * 1000,
  })
}

export function useProblem(slug: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PROBLEMS, slug],
    queryFn: () => contentService.getProblem(slug!),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateProblem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateProblemDto) => contentService.createProblem(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.PROBLEMS }),
  })
}

export function useAddTestCase() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ problemId, dto }: { problemId: string; dto: AddTestCaseDto }) =>
      contentService.addTestCase(problemId, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.PROBLEMS }),
  })
}

// ─── Problem publish mutation ─────────────────────────────────────────────────
//
// ID and slug are passed at mutateAsync() call-time to prevent capturing
// empty strings before the problem query has resolved.

export function usePublishProblem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ problemId }: { problemId: string; slug: string }) =>
      contentService.publishProblem(problemId),
    onSuccess: (_, { slug }) => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.PROBLEMS, slug] })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PROBLEMS })
    },
  })
}
