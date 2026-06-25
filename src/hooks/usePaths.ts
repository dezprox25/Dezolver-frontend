import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { pathService, type ListPathsParams } from '@/services/api/path.service'
import type {
  CreatePathDto, UpdatePathDto, AddPathStepDto, UpdatePathStepDto, ReorderStepsDto,
} from '@/types/path.types'
import { QUERY_KEYS } from '@/lib/constants'

export function usePaths(params: Omit<ListPathsParams, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.PATHS, params],
    queryFn: ({ pageParam }) =>
      pathService.list({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) =>
      last.pagination.hasMore ? last.pagination.nextCursor ?? undefined : undefined,
    staleTime: 2 * 60 * 1000,
  })
}

export function usePath(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.PATHS, id],
    queryFn: () => pathService.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreatePath() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreatePathDto) => pathService.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.PATHS }),
  })
}

export function useUpdatePath() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdatePathDto }) =>
      pathService.update(id, dto),
    onSuccess: (updated) => {
      qc.setQueryData([...QUERY_KEYS.PATHS, updated.id], updated)
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PATHS })
    },
  })
}

export function usePublishPath() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pathService.publish(id),
    onSuccess: (updated) => {
      qc.setQueryData([...QUERY_KEYS.PATHS, updated.id], updated)
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PATHS })
    },
  })
}

export function useArchivePath() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pathService.archive(id),
    onSuccess: (updated) => {
      qc.setQueryData([...QUERY_KEYS.PATHS, updated.id], updated)
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PATHS })
    },
  })
}

export function useForkPath() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => pathService.fork(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.PATHS })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.MY_PATHS })
    },
  })
}

export function useAddPathStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pathId, dto }: { pathId: string; dto: AddPathStepDto }) =>
      pathService.addStep(pathId, dto),
    onSuccess: (_r, { pathId }) => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.PATHS, pathId] })
    },
  })
}

export function useUpdatePathStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      pathId,
      stepId,
      dto,
    }: {
      pathId: string
      stepId: string
      dto: UpdatePathStepDto
    }) => pathService.updateStep(pathId, stepId, dto),
    onSuccess: (_r, { pathId }) => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.PATHS, pathId] })
    },
  })
}

export function useRemovePathStep() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pathId, stepId }: { pathId: string; stepId: string }) =>
      pathService.removeStep(pathId, stepId),
    onSuccess: (_r, { pathId }) => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.PATHS, pathId] })
    },
  })
}

export function useReorderPathSteps() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ pathId, dto }: { pathId: string; dto: ReorderStepsDto }) =>
      pathService.reorderSteps(pathId, dto),
    onSuccess: (_r, { pathId }) => {
      qc.invalidateQueries({ queryKey: [...QUERY_KEYS.PATHS, pathId] })
    },
  })
}
