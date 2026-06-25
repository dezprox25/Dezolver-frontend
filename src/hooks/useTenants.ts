import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query'
import { tenantsService } from '@/services/api/tenants.service'
import type { ListTenantsParams } from '@/services/api/tenants.service'
import type { CreateTenantDto, UpdateTenantDto, TransitionTenantDto } from '@/types/tenancy.types'
import { QUERY_KEYS } from '@/lib/constants'

// ─── Platform admin: tenant list ──────────────────────────────────────────────

export function useTenants(params: Omit<ListTenantsParams, 'cursor'> = {}) {
  return useInfiniteQuery({
    queryKey: [...QUERY_KEYS.TENANTS, params],
    queryFn: ({ pageParam }) =>
      tenantsService.list({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.pagination.hasMore ? last.pagination.nextCursor ?? undefined : undefined),
    staleTime: 2 * 60 * 1000,
  })
}

// ─── Tenant detail ────────────────────────────────────────────────────────────

export function useTenant(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.TENANTS, id],
    queryFn: () => tenantsService.getById(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })
}

// ─── Self tenant (college-admin) ─────────────────────────────────────────────

export function useSelfTenant() {
  return useQuery({
    queryKey: [...QUERY_KEYS.TENANTS, 'self'],
    queryFn: () => tenantsService.getById('self'),
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Tenant config ────────────────────────────────────────────────────────────

export function useTenantConfig(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.TENANTS, id, 'config'],
    queryFn: () => tenantsService.getConfig(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateTenant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateTenantDto) => tenantsService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TENANTS })
    },
  })
}

export function useUpdateTenant(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: UpdateTenantDto) => tenantsService.update(id, dto),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEYS.TENANTS, id], updated)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TENANTS })
    },
  })
}

export function useTransitionTenant(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: TransitionTenantDto) => tenantsService.transition(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.TENANTS, id] })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TENANTS })
    },
  })
}

export function useUpdateTenantConfig(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (config: Record<string, unknown>) =>
      tenantsService.updateConfig(id, config),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEYS.TENANTS, id, 'config'], updated)
    },
  })
}
